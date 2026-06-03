"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/Calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { Booking, storage } from "@/lib/storage";
import { format, parseISO, isSameDay } from "date-fns";

export default function CalendarPage() {
    const router = useRouter();
    // Define FullBooking type locally or import if available
    type FullBooking = Booking & { lead?: import("@/lib/storage").AppLead };
    const [bookings, setBookings] = useState<FullBooking[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        setBookings(storage.getFullBookings());
    }, []);

    const selectedBookings = selectedDate
        ? bookings.filter((b) => {
            if (!b.lead || typeof b.lead.event_date !== 'string') {
                // console.warn("Skipping booking due to missing lead or event_date:", b.id);
                return false;
            }
            try {
                const eventDate = parseISO(b.lead.event_date);
                return isSameDay(eventDate, selectedDate);
            } catch (e) {
                console.error("Invalid date format for booking", b.id, "date:", b.lead.event_date, e);
                return false;
            }
        })
        : [];

    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => router.push('/')}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">Calendar</h1>
            </header>

            <div className="space-y-6">
                <Calendar selected={selectedDate} onSelect={setSelectedDate} />

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </h2>

                    {selectedBookings.length > 0 ? (
                        selectedBookings.map((booking, index) => (
                            <div key={booking.id} onClick={() => router.push(`/booking/${booking.id}`)} className="cursor-pointer">
                                <Card className={`transition-all hover:shadow-md ${booking.booking_status === 'confirmed'
                                    ? 'border-l-4 border-l-green-500 bg-green-50/30'
                                    : 'border-l-4 border-l-yellow-400 bg-yellow-50/30'
                                    }`}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{booking.lead?.client_name}</h3>
                                                <p className="text-muted-foreground text-sm mb-1">
                                                    {format(parseISO(booking.lead?.event_date || new Date().toISOString()), "h:mm a")} • {booking.lead?.location}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className="text-xs bg-background border px-2 py-1 rounded-full">
                                                        {booking.lead?.event_type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`block font-bold ${booking.booking_status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'
                                                    }`}>
                                                    {booking.booking_status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ₹{booking.advance_amount} (Adv)
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No bookings for this date.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
