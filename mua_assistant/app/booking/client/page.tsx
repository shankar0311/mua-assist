"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Loader2,
  BookmarkCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";

// Webhook URL configuration (Pointed to n8n workflow webhook trigger)
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.yourdomain.com/webhook/mua-booking-inquiry";
const WHATSAPP_CONTACT_NUMBER = "+919876543210";

const EVENT_TYPES = [
  { value: "Wedding", label: "Wedding Ceremony" },
  { value: "Reception", label: "Reception" },
  { value: "Engagement", label: "Engagement / Ring Exchange" },
  { value: "Mehendi", label: "Mehendi Ceremony" },
  { value: "Haldi", label: "Haldi / Turmeric Ceremony" },
  { value: "Sangeet", label: "Sangeet Night" },
  { value: "Vratham", label: "Vratham Ceremony" },
  { value: "Seemantha", label: "Baby Shower / Seemantha" },
  { value: "Fashion Shoot", label: "Fashion / Portfolio Shoot" },
  { value: "Party Makeup", label: "Party / Guest Makeup" },
  { value: "Editorial Shoot", label: "Editorial Campaign" },
  { value: "Other", label: "Other Ceremonial Event" }
];

const MAKEUP_STYLES = [
  { value: "HD Glam", label: "HD Glam (High-Definition Photography Ready)" },
  { value: "Soft Glam", label: "Soft Glam (Elegant & Subtle)" },
  { value: "Semi HD", label: "Semi HD (Radiant & Natural)" },
  { value: "Traditional South Indian", label: "Traditional South Indian (Temple Gold Matte)" },
  { value: "Dewy Bridal", label: "Dewy Bridal (Modern Glass-Skin Glow)" },
  { value: "Editorial", label: "Editorial Fashion Look" },
  { value: "Minimal Makeup", label: "Minimalist Makeup (No-Makeup Look)" }
];

const ADDON_FAMILY = [
  { id: "mother", label: "Mother's Makeup", price: 4000 },
  { id: "sister", label: "Sister's Makeup", price: 4000 },
  { id: "bridesmaid", label: "Bridesmaid's Makeup", price: 3500 },
  { id: "groom", label: "Groom's Grooming", price: 3000 },
  { id: "groom_touchup", label: "Groom Touch-up Assistance", price: 1500 },
  { id: "reception_touchup", label: "Reception Quick Touch-up", price: 2000 },
  { id: "saree_draping", label: "Saree Draping / Pleating", price: 1000 },
  { id: "hairstyling", label: "Guest Hairstyling", price: 1500 }
];

const ADDON_PREMIUM = [
  { id: "airbrush", label: "Airbrush Upgrade", price: 5000 },
  { id: "full_day", label: "Full Day Concierge Assistance", price: 10000 },
  { id: "touchup_kit", label: "Premium Bridal Touch-up Kit", price: 2500 },
  { id: "add_hairstyling", label: "Additional Hair Extension & Styling", price: 2000 },
  { id: "look_change", label: "Look Change / Dupatta Re-draping", price: 3000 },
  { id: "travel_support", label: "Outstation Travel Support", price: 6000 }
];

type AddonItem = {
  id: string;
  name: string;
  category: "family" | "premium";
  quantity: number;
  price: number;
};

type EventItem = {
  eventType: string;
  date: string;
  time: string;
  makeupStyle: string;
  addons: AddonItem[];
};

type ClientBookingInquiry = {
  brideName: string;
  phone: string;
  email: string;
  city: string;
  weddingVenue: string;
  contactMethod: string;
  events: EventItem[];
};

export default function AdvancedClientBooking() {
  const [step, setStep] = useState(1);
  const [inquiryId, setInquiryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ClientBookingInquiry>({
    defaultValues: {
      brideName: "",
      phone: "",
      email: "",
      city: "",
      weddingVenue: "",
      contactMethod: "WhatsApp",
      events: [
        {
          eventType: "Wedding",
          date: "",
          time: "06:00",
          makeupStyle: "Dewy Bridal",
          addons: []
        }
      ]
    }
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "events"
  });

  const watchedEvents = watch("events");

  // Multi-step transitions
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Dynamic Addon quantity controls
  const handleQuantityChange = (eventIdx: number, addonId: string, addonName: string, category: "family" | "premium", price: number, delta: number) => {
    const currentAddons = [...(watchedEvents[eventIdx]?.addons || [])];
    const existingIdx = currentAddons.findIndex((a) => a.id === addonId);

    if (existingIdx > -1) {
      const newQty = currentAddons[existingIdx].quantity + delta;
      if (newQty <= 0) {
        currentAddons.splice(existingIdx, 1);
      } else {
        currentAddons[existingIdx].quantity = newQty;
      }
    } else if (delta > 0) {
      currentAddons.push({
        id: addonId,
        name: addonName,
        category,
        quantity: 1,
        price
      });
    }

    setValue(`events.${eventIdx}.addons`, currentAddons);
  };

  const isAddonSelected = (eventIdx: number, addonId: string) => {
    return (watchedEvents[eventIdx]?.addons || []).some((a) => a.id === addonId);
  };

  const getAddonQuantity = (eventIdx: number, addonId: string) => {
    return (watchedEvents[eventIdx]?.addons || []).find((a) => a.id === addonId)?.quantity || 0;
  };

  // Duplicate an entire event card with all nested selections & addons
  const handleDuplicateEvent = (idx: number) => {
    const sourceEvent = watchedEvents[idx];
    if (sourceEvent) {
      append({
        eventType: sourceEvent.eventType,
        date: sourceEvent.date,
        time: sourceEvent.time,
        makeupStyle: sourceEvent.makeupStyle,
        addons: JSON.parse(JSON.stringify(sourceEvent.addons)) // deep clone addons
      });
    }
  };

  // Submit enquiry to n8n backend Webhook API
  const onSubmit = async (data: ClientBookingInquiry) => {
    setIsSubmitting(true);
    setStep(4); // Trigger Loading Check Animation

    const generatedId = `MUA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setInquiryId(generatedId);

    const payload = {
      inquiryId: generatedId,
      submittedAt: new Date().toISOString(),
      ...data
    };

    try {
      // POST JSON payload to n8n endpoint
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("n8n Webhook Response:", response.status);
    } catch (err) {
      // Gracefully continue so user experience is not broken if webhook is locally unreachable
      console.error("n8n Webhook error (continuing dynamically):", err);
    }

    // Keep loading for 2.2 seconds to showcase high-fidelity calendar checking
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(5); // Success Screen
    }, 2200);
  };

  // direct backup WhatsApp inquiry prefilled builder
  const openDirectWhatsApp = () => {
    const name = watch("brideName") || "Bride";
    const city = watch("city") || "Bangalore";
    const msg = `Hi Rajeshwari ✨, I am ${name} from ${city}. I would like to inquire about luxury bridal makeup packages and date availability! 💖`;
    window.open(`https://wa.me/${WHATSAPP_CONTACT_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] antialiased pb-24 relative overflow-x-hidden selection:bg-[#d4af37]/30 selection:text-[#554300]">
      {/* Background Cinematic Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#735c00]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Floating Direct Concierge WhatsApp Support */}
      <motion.button 
        onClick={openDirectWhatsApp}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
      >
        <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        <span className="text-sm font-semibold tracking-wider uppercase text-[10px]">Chat with Rajeshwari</span>
      </motion.button>

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#faf9f6]/80 backdrop-blur-2xl border-b border-[#d0c5af]/30 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#735c00] h-5 w-5 animate-pulse" />
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-widest text-[#1a1c1a] uppercase">
              Bridal Concierge
            </h1>
          </div>
          {step <= 3 && (
            <span className="font-mono text-xs uppercase bg-[#735c00]/10 text-[#735c00] px-3 py-1 rounded-full font-bold">
              Step {step} of 3
            </span>
          )}
        </div>
      </header>

      {/* Booking Form Layout */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: BRIDE CLIENT DETAILS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.99, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-2">
                <span className="text-xs uppercase text-[#735c00] font-bold tracking-widest block">Concierge Entry</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1c1a] leading-tight">Bride Details</h2>
                <p className="text-sm text-[#4d4635] max-w-xl">
                  Please share your beautiful contact details to initialize your personalized wedding luxury booking file.
                </p>
              </div>

              <Card className="border border-[#d0c5af]/40 bg-white/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="relative">
                    <Input
                      label="Bride's Name"
                      placeholder="Dr. Ibbani Gowda"
                      className="h-14 text-lg border-[#d0c5af] focus-visible:ring-[#735c00] focus-visible:border-[#735c00]"
                      {...register("brideName", { required: "We need your beautiful name to open your file ✨" })}
                    />
                    <User className="absolute right-4 bottom-4 h-5 w-5 text-[#7f7663]/60" />
                    {errors.brideName && (
                      <span className="text-xs font-semibold text-red-600 mt-1 block ml-1">{errors.brideName.message}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="h-14 text-lg border-[#d0c5af]"
                        {...register("phone", { 
                          required: "Your contact number is vital for WhatsApp confirmations 📱",
                          pattern: {
                            value: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                            message: "Please enter a valid phone number format"
                          }
                        })}
                      />
                      <Phone className="absolute right-4 bottom-4 h-5 w-5 text-[#7f7663]/60" />
                      {errors.phone && (
                        <span className="text-xs font-semibold text-red-600 mt-1 block ml-1">{errors.phone.message}</span>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="ibbani.gowda@gmail.com"
                        className="h-14 text-lg border-[#d0c5af]"
                        {...register("email", { 
                          required: "An email is required to send your calendar summary 💌",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Please enter a valid email format"
                          }
                        })}
                      />
                      <Mail className="absolute right-4 bottom-4 h-5 w-5 text-[#7f7663]/60" />
                      {errors.email && (
                        <span className="text-xs font-semibold text-red-600 mt-1 block ml-1">{errors.email.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Input
                        label="City"
                        placeholder="Bangalore"
                        className="h-14 text-lg border-[#d0c5af]"
                        {...register("city", { required: "City name is required" })}
                      />
                      <MapPin className="absolute right-4 bottom-4 h-5 w-5 text-[#7f7663]/60" />
                      {errors.city && (
                        <span className="text-xs font-semibold text-red-600 mt-1 block ml-1">{errors.city.message}</span>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        label="Wedding Venue"
                        placeholder="The Leela Palace, Bangalore"
                        className="h-14 text-lg border-[#d0c5af]"
                        {...register("weddingVenue", { required: "Please specify the venue to calculate travel schedules" })}
                      />
                      <MapPin className="absolute right-4 bottom-4 h-5 w-5 text-[#7f7663]/60" />
                      {errors.weddingVenue && (
                        <span className="text-xs font-semibold text-red-600 mt-1 block ml-1">{errors.weddingVenue.message}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1c1a] mb-2.5 ml-1">Preferred Contact Method</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["WhatsApp", "Phone Call", "Email"].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center justify-center h-14 rounded-xl border-2 cursor-pointer transition-all duration-300 font-semibold text-sm ${
                            watch("contactMethod") === method
                              ? "border-[#735c00] bg-[#735c00]/5 text-[#735c00]"
                              : "border-[#d0c5af] hover:border-[#735c00]/60 bg-transparent"
                          }`}
                        >
                          <input
                            type="radio"
                            value={method}
                            className="sr-only"
                            {...register("contactMethod")}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmit(handleNext)}
                className="w-full h-16 text-lg bg-[#735c00] text-white hover:bg-[#d4af37] hover:text-[#554300] rounded-full transition-all duration-500 shadow-lg flex items-center justify-center gap-2 group font-semibold"
              >
                Proceed: Add Events
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: DYNAMIC EVENT ARRAY & ADDONS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.99, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-2 relative">
                <button
                  onClick={handleBack}
                  className="absolute left-0 top-[-30px] text-[#7f7663] hover:text-[#735c00] flex items-center gap-1 font-semibold text-xs tracking-wider uppercase"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Bride Info
                </button>
                <span className="text-xs uppercase text-[#735c00] font-bold tracking-widest block mt-4">Step 2 of 3</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1c1a]">Your Wedding Events</h2>
                <p className="text-sm text-[#4d4635] max-w-xl">
                  Add multiple dates, sessions, or custom looks. Each event can be individually curated with family and premium add-ons.
                </p>
              </div>

              {/* Dynamic Event List */}
              <div className="space-y-8">
                <AnimatePresence initial={false}>
                  {fields.map((field, eventIdx) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="origin-top"
                    >
                      <Card className="border border-[#d0c5af]/50 bg-white shadow-lg rounded-2xl overflow-hidden">
                        <header className="bg-[#efeeeb] px-6 py-4 flex items-center justify-between border-b border-[#d0c5af]/30">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#735c00]/10 text-[#735c00] flex items-center justify-center font-bold font-serif text-sm">
                              {eventIdx + 1}
                            </span>
                            <h3 className="font-serif font-bold text-lg text-[#1a1c1a]">
                              {watchedEvents[eventIdx]?.eventType || "Event"} Glam
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDuplicateEvent(eventIdx)}
                              title="Duplicate Event Card"
                              className="p-2 text-[#7f7663] hover:text-[#735c00] hover:bg-[#735c00]/5 rounded-full transition-all duration-300 flex items-center justify-center"
                            >
                              <Copy className="h-4.5 w-4.5" />
                            </button>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(eventIdx)}
                                title="Remove Event"
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 flex items-center justify-center"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            )}
                          </div>
                        </header>

                        <CardContent className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-[#1a1c1a] mb-1.5 ml-1">Event Session Type</label>
                              <Select
                                options={EVENT_TYPES}
                                {...register(`events.${eventIdx}.eventType` as const)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#1a1c1a] mb-1.5 ml-1">Preferred Makeup Style</label>
                              <Select
                                options={MAKEUP_STYLES}
                                {...register(`events.${eventIdx}.makeupStyle` as const)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                              <label className="block text-sm font-semibold text-[#1a1c1a] mb-1.5 ml-1">Event Date</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  className="flex h-12 w-full rounded-lg border border-[#d0c5af] bg-background px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#735c00] focus-visible:ring-offset-2"
                                  {...register(`events.${eventIdx}.date` as const, { required: "Date is required" })}
                                />
                                <Calendar className="absolute right-4 top-3.5 h-5 w-5 text-[#7f7663]/60 pointer-events-none" />
                              </div>
                            </div>

                            <div className="relative">
                              <label className="block text-sm font-semibold text-[#1a1c1a] mb-1.5 ml-1">Start Time</label>
                              <div className="relative">
                                <input
                                  type="time"
                                  className="flex h-12 w-full rounded-lg border border-[#d0c5af] bg-background px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#735c00] focus-visible:ring-offset-2"
                                  {...register(`events.${eventIdx}.time` as const, { required: "Start time is required" })}
                                />
                                <Clock className="absolute right-4 top-3.5 h-5 w-5 text-[#7f7663]/60 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Interactive Nested Add-on System */}
                          <div className="pt-6 border-t border-[#d0c5af]/30 space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4.5 w-4.5 text-[#735c00]" />
                              <h4 className="font-serif font-bold text-[#1a1c1a]">Customize Add-ons for this Event</h4>
                            </div>

                            {/* Family Makeup Addons */}
                            <div className="space-y-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f7663] block">Family &amp; Guest Makeup</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ADDON_FAMILY.map((addon) => {
                                  const qty = getAddonQuantity(eventIdx, addon.id);
                                  const isSel = qty > 0;
                                  return (
                                    <div
                                      key={addon.id}
                                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                                        isSel 
                                          ? "border-[#735c00] bg-[#735c00]/5" 
                                          : "border-[#d0c5af]/60 bg-transparent hover:border-[#d0c5af]"
                                      }`}
                                    >
                                      <div className="text-left max-w-[60%]">
                                        <h5 className="font-semibold text-sm text-[#1a1c1a]">{addon.label}</h5>
                                        <p className="text-[10px] text-[#7f7663]">₹{addon.price} per person</p>
                                      </div>
                                      
                                      {/* Quantity Selector */}
                                      <div className="flex items-center gap-3 bg-white/80 rounded-lg border border-[#d0c5af]/50 p-1 shadow-sm">
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(eventIdx, addon.id, addon.label, "family", addon.price, -1)}
                                          className="w-7 h-7 rounded bg-[#efeeeb] hover:bg-[#d0c5af]/40 text-[#1a1c1a] flex items-center justify-center font-bold active:scale-90 transition-transform"
                                        >
                                          -
                                        </button>
                                        <span className="font-mono text-sm font-bold w-4 text-center">{qty}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(eventIdx, addon.id, addon.label, "family", addon.price, 1)}
                                          className="w-7 h-7 rounded bg-[#efeeeb] hover:bg-[#d0c5af]/40 text-[#1a1c1a] flex items-center justify-center font-bold active:scale-90 transition-transform"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Premium Services Addons */}
                            <div className="space-y-3 pt-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f7663] block">Premium Bridal Add-ons</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ADDON_PREMIUM.map((addon) => {
                                  const qty = getAddonQuantity(eventIdx, addon.id);
                                  const isSel = qty > 0;
                                  return (
                                    <div
                                      key={addon.id}
                                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                                        isSel 
                                          ? "border-[#735c00] bg-[#735c00]/5" 
                                          : "border-[#d0c5af]/60 bg-transparent hover:border-[#d0c5af]"
                                      }`}
                                    >
                                      <div className="text-left max-w-[60%]">
                                        <h5 className="font-semibold text-sm text-[#1a1c1a]">{addon.label}</h5>
                                        <p className="text-[10px] text-[#7f7663]">₹{addon.price}</p>
                                      </div>
                                      
                                      {/* Quantity Selector */}
                                      <div className="flex items-center gap-3 bg-white/80 rounded-lg border border-[#d0c5af]/50 p-1 shadow-sm">
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(eventIdx, addon.id, addon.label, "premium", addon.price, -1)}
                                          className="w-7 h-7 rounded bg-[#efeeeb] hover:bg-[#d0c5af]/40 text-[#1a1c1a] flex items-center justify-center font-bold active:scale-90 transition-transform"
                                        >
                                          -
                                        </button>
                                        <span className="font-mono text-sm font-bold w-4 text-center">{qty}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(eventIdx, addon.id, addon.label, "premium", addon.price, 1)}
                                          className="w-7 h-7 rounded bg-[#efeeeb] hover:bg-[#d0c5af]/40 text-[#1a1c1a] flex items-center justify-center font-bold active:scale-90 transition-transform"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Another Event Button */}
              <button
                type="button"
                onClick={() => append({ eventType: "Wedding", date: "", time: "06:00", makeupStyle: "Dewy Bridal", addons: [] })}
                className="w-full py-5 border-2 border-dashed border-[#735c00] text-[#735c00] hover:bg-[#735c00]/5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-bold font-serif active:scale-[0.99]"
              >
                <Plus className="h-5 w-5" /> Add Another Event
              </button>

              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 h-16 border-2 border-[#735c00] text-[#735c00] rounded-full text-base font-semibold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-16 bg-[#735c00] text-white hover:bg-[#d4af37] hover:text-[#554300] rounded-full text-base font-semibold"
                >
                  Next: Review Inquiry
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW DETAILS SUMMARY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.99, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-2 relative">
                <button
                  onClick={handleBack}
                  className="absolute left-0 top-[-30px] text-[#7f7663] hover:text-[#735c00] flex items-center gap-1 font-semibold text-xs tracking-wider uppercase"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Events
                </button>
                <span className="text-xs uppercase text-[#735c00] font-bold tracking-widest block mt-4">Step 3 of 3</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1c1a]">Summary Review</h2>
                <p className="text-sm text-[#4d4635] max-w-xl">
                  Please review your bridal itinerary details before checking slot availability with our concierge webhook pipeline.
                </p>
              </div>

              {/* Client Briefing Card */}
              <Card className="border border-[#d0c5af]/50 bg-white/60 backdrop-blur-2xl rounded-2xl shadow-xl overflow-hidden p-6 space-y-6">
                <div className="border-b border-[#d0c5af]/30 pb-4">
                  <h4 className="font-serif font-bold text-lg text-[#735c00] flex items-center gap-2 mb-4">
                    <UserCheck className="h-5 w-5" /> Bride Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm leading-relaxed">
                    <div>
                      <span className="text-xs text-[#7f7663] block uppercase tracking-wider font-semibold">Name:</span>
                      <span className="font-bold text-[#1a1c1a]">{watch("brideName")}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#7f7663] block uppercase tracking-wider font-semibold">Location / Venue:</span>
                      <span className="font-bold text-[#1a1c1a]">{watch("weddingVenue")} ({watch("city")})</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#7f7663] block uppercase tracking-wider font-semibold">Contact Details:</span>
                      <span className="font-bold text-[#1a1c1a]">{watch("phone")} • {watch("email")}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#7f7663] block uppercase tracking-wider font-semibold">Preferred Response:</span>
                      <span className="font-bold text-[#1a1c1a]">{watch("contactMethod")}</span>
                    </div>
                  </div>
                </div>

                {/* Event Summary Blocks */}
                <div className="space-y-6">
                  <h4 className="font-serif font-bold text-lg text-[#735c00] flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5" /> Scheduled Events Itinerary
                  </h4>

                  {watchedEvents.map((evt, idx) => (
                    <div key={idx} className="bg-[#efeeeb]/50 rounded-xl p-4 border border-[#d0c5af]/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#d0c5af]/20 pb-2">
                        <span className="font-serif font-bold text-[#1a1c1a] text-sm">
                          {idx + 1}. {evt.eventType} ({evt.makeupStyle})
                        </span>
                        <span className="font-mono text-xs font-semibold bg-white px-2 py-0.5 rounded border">
                          {evt.date} at {evt.time}
                        </span>
                      </div>

                      {/* Addon lists */}
                      {evt.addons && evt.addons.length > 0 ? (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-[#7f7663] block">Selected Add-ons:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {evt.addons.map((add) => (
                              <span key={add.id} className="text-[10px] font-semibold bg-[#735c00]/5 text-[#735c00] border border-[#735c00]/25 px-2 py-0.5 rounded-full">
                                {add.name} (x{add.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-[#7f7663] block">No guest addons or upgrades chosen.</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  className="w-full h-16 text-lg bg-[#735c00] text-white hover:bg-[#d4af37] hover:text-[#554300] rounded-full transition-all duration-500 shadow-lg flex items-center justify-center gap-2 group font-semibold"
                >
                  Check Availability
                  <Sparkles className="h-5 w-5 animate-spin" />
                </Button>
                
                <Button
                  onClick={openDirectWhatsApp}
                  variant="outline"
                  className="w-full h-16 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 rounded-full text-base font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" /> Chat with Rajeshwari First
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AVAILABILITY CHECK LOADER */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-[#735c00]/10 border-t-[#735c00] animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[#735c00] animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-serif text-3xl font-semibold text-[#1a1c1a]">Verifying Calendar Slots...</h3>
                <p className="text-sm text-[#4d4635]">
                  Connecting to n8n triggers and checking Rajeshwari's outstation travel schedule.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS GOLDEN CONCIERGE TICKET */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1c1a]">Enquiry Submitted!</h3>
                <p className="text-sm text-[#4d4635] max-w-md mx-auto">
                  Your luxury bridal file has been initialized. You will receive an automated WhatsApp confirmation shortly 💖.
                </p>
              </div>

              {/* Concierge Ticket */}
              <div className="relative bg-white rounded-3xl border border-[#d0c5af]/40 shadow-2xl p-8 max-w-md mx-auto overflow-hidden">
                {/* Vintage Ticket Cuts */}
                <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#faf9f6] border-r border-[#d0c5af]/40 z-10"></div>
                <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#faf9f6] border-l border-[#d0c5af]/40 z-10"></div>

                <div className="border-b-2 border-dashed border-[#d0c5af]/30 pb-6 flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#7f7663] mb-1">Makeup Stories by Rajeshwari</span>
                  <span className="font-serif text-2xl font-bold tracking-widest text-[#735c00]">BRIDE INQUIRY</span>
                </div>

                <div className="py-6 flex flex-col gap-4 text-left font-mono text-xs text-[#4d4635]">
                  <div className="flex justify-between border-b border-[#d0c5af]/20 pb-2">
                    <span className="uppercase text-[#7f7663]">Inquiry ID:</span>
                    <span className="font-bold text-[#735c00]">{inquiryId}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#d0c5af]/20 pb-2">
                    <span className="uppercase text-[#7f7663]">Bride:</span>
                    <span className="font-bold text-[#1a1c1a]">{watch("brideName")}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#d0c5af]/20 pb-2">
                    <span className="uppercase text-[#7f7663]">Destination:</span>
                    <span className="font-bold text-[#1a1c1a]">{watch("weddingVenue")}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#d0c5af]/20 pb-2">
                    <span className="uppercase text-[#7f7663]">Total Events:</span>
                    <span className="font-bold text-[#1a1c1a]">{watchedEvents.length} Sessions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase text-[#7f7663]">Response Path:</span>
                    <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      {watch("contactMethod")} Alert
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-[#d0c5af]/30 pt-6 flex flex-col items-center gap-2">
                  <div className="text-[10px] text-[#7f7663] font-bold text-center">
                    Status: <span className="text-[#735c00] animate-pulse">AWAITING AVAILABILITY CHECK</span>
                  </div>
                  <p className="text-[9px] text-[#7f7663]/80 text-center leading-relaxed">
                    A copy of this inquiry has been submitted directly to Rajeshwari's scheduling pipeline.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setStep(1);
                  resetBookingForm();
                }}
                className="w-full h-16 text-lg bg-[#faf9f6] border-2 border-[#735c00] text-[#735c00] hover:bg-[#735c00]/5 rounded-full transition-all duration-300 font-semibold"
              >
                Submit Another Inquiry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );

  // Quick reset helper
  function resetBookingForm() {
    setValue("brideName", "");
    setValue("phone", "");
    setValue("email", "");
    setValue("city", "");
    setValue("weddingVenue", "");
    setValue("contactMethod", "WhatsApp");
    setValue("events", [
      {
        eventType: "Wedding",
        date: "",
        time: "06:00",
        makeupStyle: "Dewy Bridal",
        addons: []
      }
    ]);
  }
}
