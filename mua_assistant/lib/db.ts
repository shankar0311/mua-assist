import { supabase } from './supabase';
import { storage, AppLead, Booking } from './storage';

export const db = {
    sync: async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return; // Can't sync without user

        // 1. Sync Leads
        const leads = storage.getLeads();
        const unsyncedLeads = leads.filter(l => !l.synced);

        if (unsyncedLeads.length > 0) {
            console.log(`Syncing ${unsyncedLeads.length} leads...`);

            // Prepare payload - remove local-only fields if any, and ensure user_id is set
            const leadsPayload = unsyncedLeads.map(({ synced, phone, ...l }) => ({
                ...l,
                user_id: user.id,
                // We are stripping 'phone' here because it's not in the SQL schema yet.
                // In a real app, we'd add the column. 
                // For now, we lose the phone on sync unless we put it in notes.
                // Let's append it to notes if not already there to preserve it.
                notes: l.notes ? (l.notes.includes(phone || '') ? l.notes : `${l.notes}\nPhone: ${phone}`) : `Phone: ${phone}`
            }));

            const { error: leadError } = await supabase
                .from('leads')
                .upsert(leadsPayload);

            if (leadError) {
                console.error("Sync error (Leads):", leadError);
            } else {
                // Mark leads as synced locally
                const updatedLeads = leads.map(l =>
                    unsyncedLeads.find(u => u.id === l.id) ? { ...l, synced: true } : l
                );
                storage.saveLeads(updatedLeads);
            }
        }

        // 2. Sync Bookings
        // Only sync bookings if their parent lead is synced (or we just synced it)
        // Since we generated UUIDs locally, the ID exists, so we can sync regardless 
        // as long as the Lead exists in Supabase.
        // If the Lead sync failed above, the Booking sync might fail on FK constraint.

        const bookings = storage.getBookings();
        const unsyncedBookings = bookings.filter(b => !b.synced);

        if (unsyncedBookings.length > 0) {
            console.log(`Syncing ${unsyncedBookings.length} bookings...`);

            const bookingsPayload = unsyncedBookings.map(({ synced, ...b }) => ({
                ...b,
                user_id: user.id
            }));

            const { error: bookingError } = await supabase
                .from('bookings')
                .upsert(bookingsPayload);

            if (bookingError) {
                console.error("Sync error (Bookings):", bookingError);
            } else {
                // Mark bookings as synced locally
                const updatedBookings = bookings.map(b =>
                    unsyncedBookings.find(u => u.id === b.id) ? { ...b, synced: true } : b
                );
                storage.saveBookings(updatedBookings);
            }
        }

        console.log("Sync complete!");
    },
    initSyncListener: () => {
        if(typeof window !== "undefined") {
    window.addEventListener("online", () => {
        console.log("Back online! Triggering sync...");
        db.sync();
    });
}
    }
};
