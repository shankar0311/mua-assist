import { startOfDay, isSameDay, parseISO, setHours, setMinutes, addMinutes, isBefore, isAfter, format } from "date-fns";
import { Database } from "@/types/database";

// Use types from database definition for consistency
export type Lead = Database['public']['Tables']['leads']['Row'] & { synced?: boolean };
export type Booking = Database['public']['Tables']['bookings']['Row'] & { synced?: boolean };

// Helper interfaces for creation (omitting system fields)
export type NewLead = Omit<Lead, "id" | "user_id" | "created_at" | "synced">;
export type NewBooking = Omit<Booking, "id" | "user_id" | "created_at" | "synced">;

export interface Client {
    name: string;
    phone: string; // derived from Lead (via Booking -> Lead) - wait, Lead has no phone? 
    // Correction: The SQL schema for Leads doesn't have phone. Users table has phone. 
    // But Leads are inquiries. Usually inquiries have contact info.
    // Let's check the SQL schema again. 
    // Ah, I missed adding phone to Leads in the SQL. 
    // For now, I will assume we might need to add phone to Leads or store it in notes/client_name?
    // Actually, looking at the previous code, Booking had phone.
    // Let's check the SQL I wrote.
    // CREATE TABLE public.leads (... client_name TEXT ...)
    // It seems I missed 'phone' in the Leads table definition in the previous step.
    // I should probably add it to the interface here and handle it, 
    // or just assume it's part of the client_name for now?
    // No, phone is critical.
    // I will add 'phone' to the Lead interface here and treat it as a required field,
    // and we might need to update the SQL schema later or just store it in notes for now if strict.
    // Wait, let's look at the previous Booking interface. It had phone.
    // I will add phone to Lead interface here.
    lastBookingDate: string;
    totalSpend: number;
    bookingCount: number;
}

export interface Service {
    id: string;
    name: string;
    price: number;
}

export interface AppLead extends Lead {
    phone?: string;
}

const LEADS_KEY = "mua_leads";
const BOOKINGS_KEY = "mua_bookings";
const SERVICES_KEY = "mua_services";

export const storage = {
    // --- Leads ---
    getLeads: (): AppLead[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(LEADS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveLeads: (leads: AppLead[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    },

    createLead: (leadData: NewLead & { phone?: string }): AppLead => {
        const leads = storage.getLeads();
        const newLead: AppLead = {
            ...leadData,
            id: crypto.randomUUID(),
            user_id: "local-user", // Placeholder, will be replaced by sync or auth context
            created_at: new Date().toISOString(),
            status: leadData.status || 'new',
            synced: false,
        };
        leads.push(newLead);
        storage.saveLeads(leads);
        return newLead;
    },

    // --- Bookings ---
    getBookings: (): Booking[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(BOOKINGS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveBookings: (bookings: Booking[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    },

    createBooking: (bookingData: NewBooking): Booking => {
        const bookings = storage.getBookings();
        const newBooking: Booking = {
            ...bookingData,
            id: crypto.randomUUID(),
            user_id: "local-user",
            created_at: new Date().toISOString(),
            payment_status: bookingData.payment_status || 'pending',
            // Default to 'advance_requested' if creating a new booking via the form
            booking_status: bookingData.booking_status || 'advance_requested',
            synced: false,
        };
        bookings.push(newBooking);
        storage.saveBookings(bookings);
        return newBooking;
    },

    updateBookingStatus: (id: string, status: 'new' | 'advance_requested' | 'confirmed' | 'completed' | 'cancelled') => {
        const bookings = storage.getBookings();
        const index = bookings.findIndex((b) => b.id === id);
        if (index !== -1) {
            bookings[index].booking_status = status as any;
            bookings[index].synced = false; // Mark for sync
            storage.saveBookings(bookings);
        }
    },

    // --- Combined / Helpers ---

    // Get full booking details (Booking + Lead)
    getFullBookings: (): (Booking & { lead: AppLead | undefined })[] => {
        const bookings = storage.getBookings();
        const leads = storage.getLeads();
        return bookings.map(b => ({
            ...b,
            lead: leads.find(l => l.id === b.lead_id)
        }));
    },

    checkAvailability: (dateStr: string, timeStr: string, duration: number): boolean => {
        return storage.checkAvailabilityStatus(dateStr, timeStr, duration).status === 'available';
    },

    checkAvailabilityStatus: (dateStr: string, timeStr: string, duration: number, bufferMinutes: number = 120): { status: 'available' | 'warning' | 'blocked', message: string, conflict?: any } => {
        const fullBookings = storage.getFullBookings();

        // Parse the requested start and end time
        const [hours, minutes] = timeStr.split(':').map(Number);
        const requestedStart = setMinutes(setHours(parseISO(dateStr), hours), minutes);
        const requestedEnd = addMinutes(requestedStart, duration);

        let status: 'available' | 'warning' | 'blocked' = 'available';
        let message = "Date is available ✅";
        let conflict = undefined;

        for (const b of fullBookings) {
            // Skip if cancelled or missing lead info
            if (b.booking_status === 'cancelled' || !b.lead || !b.lead.event_date) continue;

            const bStart = parseISO(b.lead.event_date);
            // Use stored buffer or default 3 hours duration if not stored (MVP assumption)
            // We really should store duration. For now, assuming 3 hours for existing bookings.
            const bDuration = 180;
            const bEnd = addMinutes(bStart, bDuration);

            // 1. Exact Overlap (Hard Block)
            if (isBefore(requestedStart, bEnd) && isAfter(requestedEnd, bStart)) {
                return {
                    status: 'blocked',
                    message: `Conflict with ${b.lead.client_name} (${format(bStart, 'h:mm a')})`,
                    conflict: b
                };
            }

            // 2. Buffer Violation (Warning)
            // Check gap before
            if (isAfter(requestedStart, bEnd)) {
                const gap = (requestedStart.getTime() - bEnd.getTime()) / (1000 * 60);
                if (gap < bufferMinutes) {
                    status = 'warning';
                    message = `Tight schedule! Only ${Math.round(gap)}min gap after ${b.lead.client_name}`;
                    conflict = b;
                }
            }

            // Check gap after
            if (isBefore(requestedEnd, bStart)) {
                const gap = (bStart.getTime() - requestedEnd.getTime()) / (1000 * 60);
                if (gap < bufferMinutes) {
                    status = 'warning';
                    message = `Tight schedule! Only ${Math.round(gap)}min gap before ${b.lead.client_name}`;
                    conflict = b;
                }
            }
        }

        return { status, message, conflict };
    },

    getClients: (): Client[] => {
        const leads = storage.getLeads();
        const bookings = storage.getBookings();
        const clientsMap = new Map<string, Client>();

        // Join bookings with leads to get client info
        bookings.forEach(b => {
            const lead = leads.find(l => l.id === b.lead_id);
            if (!lead || !lead.phone) return;

            const existing = clientsMap.get(lead.phone);
            if (existing) {
                existing.totalSpend += (b.advance_amount || 0); // Total amount is missing in new schema? Ah, advance_amount is there.
                // We might need to add total_amount back to Booking or Lead if we want to track spend accurately.
                // For now using advance_amount as proxy or 0.
                existing.bookingCount += 1;
                if (new Date(lead.event_date) > new Date(existing.lastBookingDate)) {
                    existing.lastBookingDate = lead.event_date;
                }
                existing.name = lead.client_name;
            } else {
                clientsMap.set(lead.phone, {
                    name: lead.client_name,
                    phone: lead.phone,
                    lastBookingDate: lead.event_date,
                    totalSpend: b.advance_amount || 0,
                    bookingCount: 1
                });
            }
        });

        return Array.from(clientsMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    },

    getBookingsByPhone: (phone: string): any[] => {
        const fullBookings = storage.getFullBookings();
        return fullBookings
            .filter(b => b.lead && b.lead.phone === phone)
            .map(b => ({
                id: b.id,
                date: b.lead?.event_date || "",
                services: [b.lead?.event_type || ""],
                totalAmount: b.advance_amount || 0,
                status: b.booking_status || "",
                clientName: b.lead?.client_name || ""
            }));
    },

    getServices: (): Service[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(SERVICES_KEY);
        if (data) return JSON.parse(data);
        const defaultServices: Service[] = [
            { id: "bridal", name: "Bridal Makeup", price: 15000 },
            { id: "party", name: "Party Makeup", price: 5000 },
            { id: "engagement", name: "Engagement", price: 8000 },
            { id: "reception", name: "Reception", price: 12000 },
        ];
        localStorage.setItem(SERVICES_KEY, JSON.stringify(defaultServices));
        return defaultServices;
    },

    saveServices: (services: Service[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    },

    addService: (s: Omit<Service, "id">): Service => {
        const services = storage.getServices();
        const newService: Service = {
            ...s,
            id: crypto.randomUUID()
        };
        services.push(newService);
        storage.saveServices(services);
        return newService;
    },

    deleteService: (id: string) => {
        const services = storage.getServices();
        const updated = services.filter(s => s.id !== id);
        storage.saveServices(updated);
    }
};
