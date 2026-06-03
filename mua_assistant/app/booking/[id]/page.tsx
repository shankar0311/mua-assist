"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Booking, storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/components/LanguageContext";
import { PaymentModal } from "@/components/PaymentModal";
import { getWhatsAppReminder } from "@/lib/notifications";

export default function BookingDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();
    const { t } = useLanguage();
    type FullBooking = Booking & { lead?: import("@/lib/storage").AppLead };
    const [booking, setBooking] = useState<FullBooking | undefined>(undefined);
    const [showRequestFlow, setShowRequestFlow] = useState(false);
    const [requestAmount, setRequestAmount] = useState(0);

    useEffect(() => {
        if (params.id) {
            const bookings = storage.getFullBookings();
            const found = bookings.find((b) => b.id === params.id);
            if (found) {
                setBooking(found);
                setRequestAmount(found.advance_amount);
            }
        }
    }, [params.id]);

    const handleConfirm = () => {
        if (!booking) return;
        storage.updateBookingStatus(booking.id, "confirmed");
        setBooking({ ...booking, booking_status: "confirmed" });
        showToast(t('bookingConfirmed'), "success");
    };

    const generateRequestMessage = () => {
        if (!booking || !booking.lead) return "";
        return `Hi ${booking.lead.client_name},
${t('requestPaymentMsg')}
Event: ${booking.lead.event_type} on ${format(parseISO(booking.lead.event_date), "MMM d, yyyy")}
Advance Amount: ₹${requestAmount}

Please pay via UPI to confirm.`;
    };

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(generateRequestMessage());
        showToast("Message copied!", "success");
    };

    const handleShareWhatsApp = () => {
        if (!booking || !booking.lead?.phone) return;
        const url = `https://wa.me/${booking.lead.phone}?text=${encodeURIComponent(generateRequestMessage())}`;
        window.open(url, '_blank');
    };

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const handlePaymentSuccess = (paymentId: string) => {
        if (!booking) return;
        storage.updateBookingStatus(booking.id, "confirmed");
        setBooking({ ...booking, booking_status: "confirmed", payment_status: "paid" }); // Optimistic update
        showToast("Payment Successful! Booking Confirmed.", "success");
        // We might want to store the paymentId in the booking or a separate payments table later
    };

    const handlePaymentFailure = (error: string) => {
        showToast(`Payment Failed: ${error}`, "error");
    };

    if (!booking) return <div className="p-4">Loading...</div>;

    // CONFIRMATION SCREEN (Celebratory)
    if (booking.booking_status === "confirmed") {
        return (
            <main className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <span className="text-5xl">✅</span>
                </div>

                <h1 className="text-3xl font-bold text-primary mb-2">{t('bookingConfirmed')}</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    {t('allSet')} <br />
                    {t('focusOnArt')}
                </p>

                <Card className="w-full max-w-sm mb-8 bg-card/50 border-dashed">
                    <CardContent className="p-4 text-left">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{t('bookingSummary')}</p>
                        <p className="font-bold text-lg">{booking.lead?.client_name}</p>
                        <p className="text-muted-foreground">{format(parseISO(booking.lead?.event_date || new Date().toISOString()), "MMMM d, yyyy")} • {format(parseISO(booking.lead?.event_date || new Date().toISOString()), "h:mm a")}</p>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={() => router.push('/')}
                    >
                        {t('viewCalendar')}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => router.push('/booking/new')}
                    >
                        {t('addAnotherLead')}
                    </Button>
                </div>
            </main>
        );
    }

    // PENDING / DETAILS SCREEN
    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => router.push('/')}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">{t('bookingDetails')}</h1>
            </header>

            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{booking.lead?.client_name}</h2>
                                <p className="text-muted-foreground">{booking.lead?.phone}</p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                {booking.payment_status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                            <div>
                                <span className="text-muted-foreground block">{t('eventDate')}</span>
                                <span className="font-medium">{format(parseISO(booking.lead?.event_date || new Date().toISOString()), "MMM d, yyyy")}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">{t('startTime')}</span>
                                <span className="font-medium">{format(parseISO(booking.lead?.event_date || new Date().toISOString()), "h:mm a")}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">{t('location')}</span>
                                <span className="font-medium">{booking.lead?.location}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">{t('totalAmount')}</span>
                                <span className="font-medium">₹{booking.advance_amount} (Adv)</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <span className="text-muted-foreground block mb-2">{t('notes')}</span>
                            <p className="text-sm whitespace-pre-wrap bg-secondary/10 p-3 rounded-md">
                                {booking.lead?.notes || "No notes"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-4">
                    {/* Pay Advance Button (New) */}
                    {((booking.booking_status as any) === 'new' || (booking.booking_status as any) === 'advance_requested') && (
                        <Button
                            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg animate-pulse"
                            onClick={() => setIsPaymentModalOpen(true)}
                        >
                            Pay Advance Now (₹{booking.advance_amount})
                        </Button>
                    )}

                    {!showRequestFlow ? (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-primary text-primary hover:bg-primary/5"
                                onClick={() => {
                                    const url = getWhatsAppReminder(booking);
                                    if (url) window.open(url, '_blank');
                                }}
                            >
                                {(t as any)('sendReminder') || "Send Reminder"}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-primary text-primary hover:bg-primary/5"
                                onClick={() => setShowRequestFlow(true)}
                            >
                                {t('requestAdvance')}
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleConfirm}
                            >
                                {t('markConfirmed')}
                            </Button>
                        </div>
                    ) : (
                        <Card className="animate-in slide-in-from-bottom-4 duration-300 border-primary/20 shadow-lg">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg">{t('requestAdvance')}</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setShowRequestFlow(false)}>✕</Button>
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground uppercase font-bold">{t('advanceAmount')}</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xl font-bold">₹</span>
                                        <Input
                                            type="number"
                                            value={requestAmount}
                                            onChange={(e) => setRequestAmount(Number(e.target.value))}
                                            className="text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="bg-secondary/20 p-3 rounded-md text-sm text-muted-foreground">
                                    <p className="font-bold text-xs uppercase mb-1">{t('messagePreview')}:</p>
                                    "{generateRequestMessage()}"
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={handleCopyMessage}>
                                        {t('copyText')}
                                    </Button>
                                    <Button className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={handleShareWhatsApp}>
                                        {t('shareWhatsApp')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showRequestFlow && (
                        <p className="text-center text-xs text-muted-foreground">
                            {t('clickWhenReceived')}
                        </p>
                    )}
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={booking.advance_amount || 0}
                bookingId={booking.id}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
            />
        </main>
    );
}
