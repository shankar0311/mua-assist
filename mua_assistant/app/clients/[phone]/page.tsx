"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Booking, storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function ClientProfilePage() {
    const router = useRouter();
    const params = useParams();
    const [bookings, setBookings] = useState<any[]>([]);
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        if (params.phone) {
            const clientBookings = storage.getBookingsByPhone(decodeURIComponent(params.phone as string));
            setBookings(clientBookings);
            if (clientBookings.length > 0) {
                setClientName(clientBookings[0].clientName);
            }
        }
    }, [params.phone]);

    const totalSpend = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => router.back()}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">Client Profile</h1>
            </header>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary">{clientName}</h2>
                <p className="text-muted-foreground text-lg">{decodeURIComponent(params.phone as string)}</p>
                <div className="mt-4 inline-block bg-accent/20 px-4 py-2 rounded-lg border border-accent">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider block">Total Value</span>
                    <span className="text-2xl font-bold text-primary">₹{totalSpend}</span>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Booking History</h3>
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <Link href={`/booking/${booking.id}`} key={booking.id}>
                        <Card className="hover:bg-accent/5 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{format(parseISO(booking.date), "MMM d, yyyy")}</p>
                                    <p className="text-sm text-muted-foreground">{booking.services.join(", ")}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold">₹{booking.totalAmount}</span>
                                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full ${booking.status === "confirmed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
    );
}
