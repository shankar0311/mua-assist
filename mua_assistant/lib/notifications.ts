import { format, parseISO } from "date-fns";
import { Booking } from "./storage";

export const getNotificationMessage = (type: 'advance_received' | 'booking_confirmed' | 'payment_reminder', data?: any) => {
    switch (type) {
        case 'advance_received':
            return {
                title: "Payment Received",
                body: "Advance payment recorded successfully."
            };
        case 'booking_confirmed':
            return {
                title: "Booking Confirmed! 🎉",
                body: "You're all set. The calendar has been updated."
            };
        case 'payment_reminder':
            return {
                title: "Reminder Sent",
                body: "WhatsApp opened with the reminder message."
            };
        default:
            return { title: "", body: "" };
    }
};

export const getWhatsAppReminder = (booking: Booking & { lead?: any }) => {
    if (!booking.lead) return "";

    const eventDate = format(parseISO(booking.lead.event_date), "MMM d, yyyy");
    const clientName = booking.lead.client_name;
    const advanceAmount = booking.advance_amount;

    // Calm, helpful, non-intrusive tone
    const message = `Hi ${clientName}, just a gentle reminder about the advance payment (₹${advanceAmount}) for your booking on ${eventDate}. 
    
This helps me block the date exclusively for you. Let me know if you have any questions!`;

    return `https://wa.me/${booking.lead.phone}?text=${encodeURIComponent(message)}`;
};
