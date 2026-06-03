import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimiter, sanitizeString } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Helper to get Supabase client under RLS or service role
function getSupabaseClient(token?: string) {
    if (token) {
        return createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper to authenticate user via Supabase
async function authenticateUser(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    try {
        const client = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await client.auth.getUser(token);
        if (error || !user) return null;
        return { user, token };
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimiter(ip);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // 2. Authentication Check
    const auth = await authenticateUser(req);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 3. Fetch data from Supabase
    // Using user-scoped client so RLS is automatically applied
    const client = getSupabaseClient(auth.token);
    const { data: bookings, error } = await client
        .from('bookings')
        .select(`
            id,
            advance_amount,
            payment_status,
            booking_status,
            buffer_time,
            created_at,
            lead:leads (
                id,
                client_name,
                phone,
                event_date,
                event_type,
                location,
                notes,
                status
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Database read error:", error);
        return NextResponse.json({ error: "Database error occurred" }, { status: 500 });
    }

    // Format output to match old API structure for dashboard compatibility
    const formattedData = (bookings || []).map((b: any) => ({
        inquiryId: b.lead?.id || b.id, // Fallback if needed
        submittedAt: b.created_at,
        brideName: b.lead?.client_name || "",
        phone: b.lead?.phone || "",
        email: "", // Not stored in schema, but keeps structure
        city: b.lead?.location || "",
        weddingVenue: b.lead?.location || "",
        contactMethod: "WhatsApp",
        booking_status: b.booking_status,
        events: [
            {
                eventType: b.lead?.event_type || "",
                date: b.lead?.event_date ? b.lead.event_date.split('T')[0] : "",
                time: b.lead?.event_date ? new Date(b.lead.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "06:00",
                makeupStyle: "",
                addons: []
            }
        ]
    }));

    return NextResponse.json(formattedData);
}

export async function POST(req: Request) {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimiter(ip);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // 2. Authenticate: either User (JWT) or Webhook (API Key)
    let userId = "";
    let isAuthorized = false;
    let token: string | undefined = undefined;

    const auth = await authenticateUser(req);
    if (auth) {
        userId = auth.user.id;
        token = auth.token;
        isAuthorized = true;
    } else {
        // Fallback to webhook API Key check
        const apiKey = req.headers.get("x-api-key");
        const expectedApiKey = process.env.N8N_API_KEY;
        if (expectedApiKey && apiKey === expectedApiKey) {
            isAuthorized = true;
            // Webhook inserts on behalf of the admin user (fetch first profile)
            const client = getSupabaseClient();
            const { data: profiles } = await client.from('users').select('id').limit(1);
            if (profiles && profiles.length > 0) {
                userId = profiles[0].id;
            }
        }
    }

    if (!isAuthorized || !userId) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    try {
        const payload = await req.json();

        // Basic validation
        if (!payload.brideName || !payload.phone || !payload.events) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Sanitize strings
        const clientName = sanitizeString(payload.brideName);
        const phone = sanitizeString(payload.phone);
        const event = payload.events[0];
        const eventType = sanitizeString(event?.eventType || "Wedding");
        const location = sanitizeString(payload.weddingVenue || payload.city || "");
        const notes = sanitizeString(payload.notes || "");
        
        // Combine date & time into ISO string
        let eventDate = new Date().toISOString();
        if (event && event.date) {
            const timeStr = event.time || "06:00";
            eventDate = new Date(`${event.date}T${timeStr}:00`).toISOString();
        }

        const client = getSupabaseClient(token);

        // 1. Insert Lead
        const { data: lead, error: leadError } = await client
            .from('leads')
            .insert({
                user_id: userId,
                client_name: clientName,
                phone: phone,
                event_date: eventDate,
                event_type: eventType,
                location: location,
                notes: notes,
                status: 'new'
            })
            .select()
            .single();

        if (leadError) throw new Error(leadError.message);

        // 2. Insert Booking
        const { data: booking, error: bookingError } = await client
            .from('bookings')
            .insert({
                lead_id: lead.id,
                user_id: userId,
                advance_amount: payload.advanceAmount || 0,
                payment_status: 'pending',
                booking_status: payload.booking_status || 'new',
                buffer_time: 120
            })
            .select()
            .single();

        if (bookingError) throw new Error(bookingError.message);

        return NextResponse.json({ success: true, inquiryId: lead.id });
    } catch (err: any) {
        console.error("Database write error:", err);
        return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimiter(ip);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const auth = await authenticateUser(req);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    try {
        const payload = await req.json();
        const { inquiryId, booking_status } = payload;

        if (!inquiryId || !booking_status) {
            return NextResponse.json({ error: "Missing inquiryId or booking_status" }, { status: 400 });
        }

        const client = getSupabaseClient(auth.token);

        // Update booking status. RLS will ensure the user can only update their own bookings.
        // We match by lead_id (which is inquiryId in the old format)
        const { data, error } = await client
            .from('bookings')
            .update({ booking_status })
            .eq('lead_id', inquiryId)
            .select()
            .single();

        if (error) {
            console.error("Database update error:", error);
            return NextResponse.json({ error: "Database error during status update" }, { status: 500 });
        }

        return NextResponse.json({ success: true, booking: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// CORS Support
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
    });
}
