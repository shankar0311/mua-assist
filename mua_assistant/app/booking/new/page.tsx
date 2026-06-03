"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { storage } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/components/LanguageContext";
import { db } from "@/lib/db";
import { addMinutes, parseISO, setHours, setMinutes } from "date-fns";

const SERVICES = [
    { id: "bridal", name: "Bridal Makeup", price: 15000 },
    { id: "party", name: "Party Makeup", price: 5000 },
    { id: "engagement", name: "Engagement", price: 8000 },
    { id: "reception", name: "Reception", price: 12000 },
];

const DURATIONS = [
    { label: "2 Hours", value: 120 },
    { label: "3 Hours", value: 180 },
    { label: "4 Hours", value: 240 },
    { label: "5 Hours", value: 300 },
];

export default function NewBookingPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        clientName: "",
        phone: "",
        date: "",
        time: "",
        duration: 180, // Default 3 hours
        location: "",
        services: [] as string[],
        advanceAmount: 0,
        notes: "",
        eventType: "Bridal", // Default
        buffer: 120, // Default 2 hours
    });
    const [availability, setAvailability] = useState<{ status: 'available' | 'warning' | 'blocked', message: string }>({ status: 'available', message: '' });

    // Check availability whenever date, time, duration, or buffer changes
    useEffect(() => {
        if (formData.date && formData.time) {
            const result = storage.checkAvailabilityStatus(formData.date, formData.time, formData.duration, formData.buffer);
            // Translate the message if it's a standard one
            let translatedMessage = result.message;
            if (result.message.includes("Date is available")) translatedMessage = t('dateAvailable');
            else if (result.message.includes("Tight schedule")) translatedMessage = t('tightSchedule');
            else if (result.message.includes("already have a booking")) translatedMessage = t('unavailable');

            setAvailability({ ...result, message: translatedMessage });
        }
    }, [formData.date, formData.time, formData.duration, formData.buffer, t]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleService = (serviceId: string) => {
        setFormData((prev) => {
            const services = prev.services.includes(serviceId)
                ? prev.services.filter((id) => id !== serviceId)
                : [...prev.services, serviceId];

            // Recalculate advance (50% default)
            const newTotal = services.reduce((total, sId) => {
                const service = SERVICES.find((s) => s.id === sId);
                return total + (service?.price || 0);
            }, 0);

            return { ...prev, services, advanceAmount: newTotal * 0.5 };
        });
    };

    const calculateTotal = () => {
        return formData.services.reduce((total, serviceId) => {
            const service = SERVICES.find((s) => s.id === serviceId);
            return total + (service?.price || 0);
        }, 0);
    };

    const generateWhatsAppMessage = () => {
        const selectedServices = SERVICES.filter((s) =>
            formData.services.includes(s.id)
        );
        const serviceList = selectedServices.map((s) => s.name).join(", ");
        const total = calculateTotal();

        return `*Booking Confirmation*
Hi ${formData.clientName},
Thank you for booking with me!

📅 Date: ${formData.date}
⏰ Time: ${formData.time}
📍 Location: ${formData.location}
💄 Services: ${serviceList}
💰 Total Estimate: ₹${total}

*Payment Terms:*
To confirm this booking, please pay an advance of *₹${formData.advanceAmount}* via UPI to [Your Number].

Please confirm once paid!`;
    };

    const handleSave = () => {
        // 1. Create Lead
        const newLead = storage.createLead({
            client_name: formData.clientName,
            event_date: new Date(`${formData.date}T${formData.time}`).toISOString(),
            event_type: formData.eventType,
            location: formData.location,
            notes: formData.notes,
            status: 'new',
            phone: formData.phone // Added to AppLead type
        });

        // 2. Create Booking (Linked to Lead)
        const newBooking = storage.createBooking({
            lead_id: newLead.id,
            advance_amount: formData.advanceAmount,
            payment_status: 'pending',
            booking_status: 'advance_requested' as any,
            buffer_time: formData.buffer
        });

        // 3. Trigger Sync
        db.sync();

        showToast(t('leadSaved'), "success");
        router.push(`/booking/${newBooking.id}`);
    };

    const handleNext = () => {
        console.log("handleNext called, current step:", step);
        setStep((prev) => prev + 1);
    };
    const handleBack = () => {
        console.log("handleBack called, current step:", step);
        setStep((prev) => prev - 1);
    };

    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => step === 1 ? router.push('/') : handleBack()}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">{t('newLead')}</h1>
            </header>

            {/* Progress Bar */}
            <div className="mb-8 flex gap-2">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"
                            }`}
                    />
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <Input
                            name="clientName"
                            placeholder={t('clientName')}
                            value={formData.clientName}
                            onChange={handleInputChange}
                            label={t('clientName')}
                            className="h-14 text-lg"
                        />

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 ml-1 block">{t('eventType')}</label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleInputChange}
                                className="w-full h-12 rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="Bridal">Bridal</option>
                                <option value="Reception">Reception</option>
                                <option value="Party">Party</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                label={t('eventDate')}
                                className={
                                    availability.status === 'blocked' ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" :
                                        availability.status === 'warning' ? "border-yellow-400 focus-visible:ring-yellow-400 bg-yellow-50/50" :
                                            formData.date ? "border-green-500 focus-visible:ring-green-500 bg-green-50/50" : ""
                                }
                            />
                            <Input
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                label={t('startTime')}
                                className={
                                    availability.status === 'blocked' ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50" :
                                        availability.status === 'warning' ? "border-yellow-400 focus-visible:ring-yellow-400 bg-yellow-50/50" :
                                            formData.time ? "border-green-500 focus-visible:ring-green-500 bg-green-50/50" : ""
                                }
                            />
                        </div>

                        {/* Availability Feedback */}
                        {formData.date && formData.time && (
                            <div className={`rounded-lg p-3 border ${availability.status === 'blocked' ? "bg-red-50 border-red-200" :
                                availability.status === 'warning' ? "bg-yellow-50 border-yellow-200" :
                                    "bg-green-50 border-green-200"
                                }`}>
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-lg">
                                        {availability.status === 'blocked' ? "⛔️" :
                                            availability.status === 'warning' ? "⚠️" : "✅"}
                                    </span>
                                    <div>
                                        <p className={`font-medium text-sm ${availability.status === 'blocked' ? "text-red-800" :
                                            availability.status === 'warning' ? "text-yellow-800" :
                                                "text-green-800"
                                            }`}>
                                            {availability.message}
                                        </p>
                                        {availability.status === 'warning' && (
                                            <p className="text-yellow-700 text-xs">{t('proceedAnyway')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Editable Buffer */}
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5">
                                    <label className="text-xs text-muted-foreground whitespace-nowrap">{t('travelBuffer')}:</label>
                                    <input
                                        type="number"
                                        name="buffer"
                                        value={formData.buffer}
                                        onChange={handleInputChange}
                                        className="w-16 h-8 text-xs px-2 rounded border border-input bg-background"
                                    />
                                </div>
                            </div>
                        )}

                        <Input
                            name="location"
                            placeholder="City / Venue"
                            value={formData.location}
                            onChange={handleInputChange}
                            label={t('location')}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground ml-1">{t('notes')}</label>
                            <textarea
                                name="notes"
                                placeholder="Any specific requirements..."
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <Input
                            name="phone"
                            type="tel"
                            placeholder="98765 43210"
                            value={formData.phone}
                            onChange={handleInputChange}
                            label={t('phoneNumber')}
                        />
                    </div>

                    {availability.status === 'blocked' && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                            <input
                                type="checkbox"
                                id="override"
                                className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setAvailability(prev => ({ ...prev, status: 'warning', message: 'Override: ' + prev.message }));
                                    } else {
                                        // Re-trigger check to reset to blocked
                                        const result = storage.checkAvailabilityStatus(formData.date, formData.time, formData.duration, formData.buffer);
                                        setAvailability(result);
                                    }
                                }}
                            />
                            <label htmlFor="override" className="text-sm font-medium text-red-800">
                                {t('proceedAnyway')} (Override Conflict)
                            </label>
                        </div>
                    )}

                    <Button
                        className="w-full h-14 text-lg mt-4 shadow-md"
                        onClick={handleNext}
                        disabled={!formData.clientName || !formData.date || !formData.time || availability.status === 'blocked'}
                    >
                        {t('checkAvailability')}
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-semibold">{t('services')}</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {SERVICES.map((service) => (
                            <div
                                key={service.id}
                                id={`service-${service.id}`}
                                onClick={() => toggleService(service.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.services.includes(service.id)
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{service.name}</span>
                                    <span className="text-muted-foreground">₹{service.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-8">
                        <Button variant="outline" className="flex-1" onClick={handleBack} type="button">
                            {t('back')}
                        </Button>
                        <Button className="flex-1" onClick={handleNext} disabled={formData.services.length === 0} type="button" id="next-button-step-2">
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-xl font-bold mb-4">{t('bookingSummary')}</h2>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">{t('clientName')}</span>
                                    <span className="font-medium">{formData.clientName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">{t('eventDate')}</span>
                                    <span className="font-medium">{formData.date}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">{t('startTime')}</span>
                                    <span className="font-medium">{formData.time}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">{t('duration')}</span>
                                    <span className="font-medium">{formData.duration / 60}h</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <span className="text-muted-foreground block mb-2">{t('services')}</span>
                                <div className="flex flex-wrap gap-2">
                                    {formData.services.map(id => (
                                        <span key={id} className="bg-secondary/20 px-2 py-1 rounded text-xs">
                                            {SERVICES.find(s => s.id === id)?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-bold">{t('totalAmount')}</span>
                                <span className="text-xl font-bold text-primary">₹{calculateTotal()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                            onClick={() => {
                                handleSave();
                                const url = `https://wa.me/?text=${encodeURIComponent(generateWhatsAppMessage())}`;
                                window.open(url, '_blank');
                            }}
                        >
                            Save & Share on WhatsApp
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleSave}>
                            Save Only
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}
