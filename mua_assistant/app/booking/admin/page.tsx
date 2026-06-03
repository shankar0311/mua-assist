"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Calendar, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Phone, 
  Mail, 
  Filter,
  RefreshCw
} from "lucide-react";

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

type BookingInquiry = {
  inquiryId: string;
  submittedAt: string;
  brideName: string;
  phone: string;
  email: string;
  city: string;
  weddingVenue: string;
  contactMethod: string;
  booking_status: "pending" | "confirmed" | "cancelled";
  events: EventItem[];
};

export default function PremiumAdminDashboard() {
  const [bookings, setBookings] = useState<BookingInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactFilter, setContactFilter] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/booking", {
        headers: {
          Authorization: `Bearer ${token || ""}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (inquiryId: string, status: "confirmed" | "cancelled") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`
        },
        body: JSON.stringify({ inquiryId, booking_status: status })
      });
      if (res.ok) {
        setBookings(prev => 
          prev.map(b => b.inquiryId === inquiryId ? { ...b, booking_status: status } : b)
        );
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  // Helper to calculate total revenue for a single booking inquiry
  const getBookingTotal = (b: BookingInquiry) => {
    let total = 0;
    b.events.forEach(evt => {
      // Calculate realistic base price per session type
      let basePrice = 0;
      const type = evt.eventType.toLowerCase();
      if (type.includes("wedding")) basePrice = 15000;
      else if (type.includes("reception")) basePrice = 12000;
      else if (type.includes("engagement")) basePrice = 8000;
      else if (type.includes("party") || type.includes("guest") || type.includes("non-bridal")) basePrice = 4000;
      else if (type.includes("editorial") || type.includes("shoot") || type.includes("fashion")) basePrice = 10000;
      else basePrice = 5000;

      total += basePrice;

      // Add addons
      if (evt.addons) {
        evt.addons.forEach(add => {
          total += (add.price || 0) * (add.quantity || 1);
        });
      }
    });
    return total;
  };

  // Aggregated KPIs
  const totalInquiries = bookings.length;
  
  const activeSessionsCount = bookings
    .filter(b => b.booking_status !== "cancelled")
    .reduce((sum, b) => sum + b.events.length, 0);

  const estimatedConfirmedRevenue = bookings
    .filter(b => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + getBookingTotal(b), 0);

  // Search & Filters matching
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.weddingVenue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.inquiryId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.booking_status === statusFilter;
    const matchesContact = contactFilter === "all" || b.contactMethod === contactFilter;

    return matchesSearch && matchesStatus && matchesContact;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Prefilled WhatsApp contact dispatch
  const handleWhatsAppContact = (b: BookingInquiry) => {
    const cleanPhone = b.phone.replace(/[^0-9+]/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`;
    
    let eventBrief = "";
    b.events.forEach((evt, idx) => {
      eventBrief += `${idx + 1}. ${evt.eventType} (${evt.makeupStyle}) on ${evt.date} at ${evt.time}\n`;
    });

    const msg = `Hi ${b.brideName} ✨,\n\nThis is *Makeup Stories by Rajeshwari* 💖.\n\nWe have reviewed your Luxury Bridal Concierge Booking Inquiry (ID: *${b.inquiryId}*) and verified date availability against our destination wedding calendar.\n\n*Review Itinerary:*\n${eventBrief}\nWe are delighted to confirm slot availability! Let us connect to finalize booking locks and discuss advance payments. ✨`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] antialiased pb-24 relative selection:bg-[#d4af37]/30 selection:text-[#554300]">
      {/* Background Radial Glow Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#735c00]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#faf9f6]/80 backdrop-blur-2xl border-b border-[#d0c5af]/30 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#735c00] text-3xl animate-pulse">admin_panel_settings</span>
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-widest text-[#1a1c1a] uppercase">
              Rajeshwari Concierge Admin
            </h1>
          </div>
          
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 border border-[#735c00] text-[#735c00] px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#735c00]/5 transition-all duration-300"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Luxury KPIs Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Inquiries */}
          <div className="bg-white rounded-3xl border border-[#d0c5af]/40 shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-500">
            <div className="space-y-1 text-left">
              <span className="text-[10px] text-[#7f7663] uppercase tracking-wider font-extrabold block">Total Brides</span>
              <span className="text-3xl font-serif font-bold text-[#1a1c1a]">{totalInquiries}</span>
              <p className="text-[10px] text-[#7f7663]">Unique booking inquiries files</p>
            </div>
            <div className="w-12 h-12 bg-[#735c00]/10 text-[#735c00] rounded-full flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-3xl border border-[#d0c5af]/40 shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-500">
            <div className="space-y-1 text-left">
              <span className="text-[10px] text-[#7f7663] uppercase tracking-wider font-extrabold block">Scheduled Events</span>
              <span className="text-3xl font-serif font-bold text-[#1a1c1a]">{activeSessionsCount}</span>
              <p className="text-[10px] text-[#7f7663]">Active event sessions mapped</p>
            </div>
            <div className="w-12 h-12 bg-[#735c00]/10 text-[#735c00] rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>

          {/* Confirmed Revenue */}
          <div className="bg-white rounded-3xl border border-[#d0c5af]/40 shadow-xl p-6 flex items-center justify-between hover:shadow-2xl transition-all duration-500">
            <div className="space-y-1 text-left">
              <span className="text-[10px] text-[#7f7663] uppercase tracking-wider font-extrabold block">Confirmed Revenue</span>
              <span className="text-3xl font-serif font-bold text-[#735c00]">₹{estimatedConfirmedRevenue.toLocaleString()}</span>
              <p className="text-[10px] text-[#7f7663]">Aggregated from confirmed packages</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* Filters Controls Panel */}
        <section className="bg-white/50 backdrop-blur-xl border border-[#d0c5af]/30 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="Search bride, venue, phone or ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#d0c5af] bg-white text-sm text-[#1a1c1a] focus:ring-2 focus:ring-[#735c00] focus:border-[#735c00] shadow-sm transition-all"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#7f7663]/60" />
          </div>

          {/* Dropdown Filters */}
          <div className="flex gap-4 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 border border-[#d0c5af] bg-white px-4 py-2 rounded-xl shadow-sm">
              <Filter className="h-4 w-4 text-[#7f7663]" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#1a1c1a] focus:ring-0 focus:outline-none cursor-pointer pr-8"
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Awaiting Verification</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            {/* Contact Path Filter */}
            <div className="flex items-center gap-2 border border-[#d0c5af] bg-white px-4 py-2 rounded-xl shadow-sm">
              <MessageSquare className="h-4 w-4 text-[#7f7663]" />
              <select 
                value={contactFilter}
                onChange={e => setContactFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#1a1c1a] focus:ring-0 focus:outline-none cursor-pointer pr-8"
              >
                <option value="all">All Response Paths</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>
        </section>

        {/* Bookings Feed Pipeline */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1a1c1a] text-left">Incoming Booking Inquiries</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-70">
              <div className="w-12 h-12 rounded-full border-4 border-[#735c00]/20 border-t-[#735c00] animate-spin" />
              <span className="text-sm font-semibold tracking-wider uppercase text-[10px] text-[#7f7663]">Fetching Database Inquiries...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#d0c5af]/30 py-20 text-center text-[#7f7663] shadow-md">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
              <p className="text-sm font-semibold">No bridal inquiries matched your search or filters ✨</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => {
                const totalEstimatedAmount = getBookingTotal(booking);
                return (
                  <div 
                    key={booking.inquiryId}
                    className="bg-white rounded-3xl border border-[#d0c5af]/40 shadow-xl overflow-hidden hover:border-[#735c00]/30 transition-all duration-300 flex flex-col md:flex-row"
                  >
                    {/* Left details panel */}
                    <div className="p-6 md:p-8 md:w-1/3 bg-[#efeeeb]/30 border-r border-[#d0c5af]/20 flex flex-col justify-between text-left space-y-6">
                      <div className="space-y-4">
                        {/* Status + ID Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#735c00] bg-[#735c00]/10 px-3 py-1 rounded-full">{booking.inquiryId}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            booking.booking_status === "confirmed" 
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : booking.booking_status === "cancelled"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-100 animate-pulse"
                          }`}>
                            {booking.booking_status === "confirmed" 
                              ? "Confirmed"
                              : booking.booking_status === "cancelled"
                                ? "Cancelled"
                                : "Awaiting Lock"
                            }
                          </span>
                        </div>

                        {/* Client details */}
                        <div className="space-y-1 pt-2">
                          <h3 className="font-serif text-2xl font-bold text-[#1a1c1a]">{booking.brideName}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#7f7663]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{booking.weddingVenue} ({booking.city})</span>
                          </div>
                        </div>

                        {/* Contacts */}
                        <div className="space-y-1.5 text-xs text-[#1a1c1a]">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-[#7f7663]" />
                            <span className="font-mono">{booking.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-[#7f7663]" />
                            <span className="font-mono">{booking.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-[#7f7663]" />
                            <span>Preferred Path: <strong className="text-green-700">{booking.contactMethod}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="border-t border-[#d0c5af]/30 pt-4 flex items-center justify-between">
                        <span className="text-[10px] text-[#7f7663] uppercase tracking-wider font-bold">Estimated Quote:</span>
                        <span className="text-xl font-serif font-bold text-[#735c00]">₹{totalEstimatedAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Right Timeline details panel */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#735c00] border-b border-[#d0c5af]/20 pb-3">
                          <Calendar className="h-4.5 w-4.5" />
                          <h4 className="font-serif font-bold text-base">Scheduled Itinerary Timeline</h4>
                        </div>

                        {/* Events list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.events.map((evt, idx) => (
                            <div key={idx} className="bg-[#faf9f6] rounded-2xl border border-[#d0c5af]/30 p-4 space-y-3 shadow-inner">
                              <div className="flex justify-between items-center border-b border-[#d0c5af]/25 pb-2">
                                <span className="font-serif font-extrabold text-sm text-[#1a1c1a]">{idx + 1}. {evt.eventType}</span>
                                <span className="text-[9px] font-extrabold bg-[#735c00]/5 text-[#735c00] border border-[#735c00]/20 px-2 py-0.5 rounded-full">{evt.makeupStyle}</span>
                              </div>
                              <div className="flex gap-4 text-[10px] text-[#7f7663] font-mono font-semibold pt-1">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {evt.date}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {evt.time}</span>
                              </div>

                              {/* Addons inside timeline card */}
                              {evt.addons && evt.addons.length > 0 ? (
                                <div className="space-y-1.5 pt-2 border-t border-[#d0c5af]/15">
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#7f7663] block">Selected Customizations:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {evt.addons.map(add => (
                                      <span key={add.id} className="text-[9px] bg-white text-[#735c00] border border-[#735c00]/15 px-2 py-0.5 rounded-md font-semibold shadow-sm">
                                        {add.name} (x{add.quantity})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[9px] italic text-[#7f7663] block pt-2">No guest addons chosen.</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom action controls */}
                      <div className="border-t border-[#d0c5af]/20 pt-6 flex flex-wrap gap-3 justify-end items-center">
                        <button 
                          onClick={() => handleWhatsAppContact(booking)}
                          className="flex items-center gap-2 border border-[#25D366] text-[#25D366] px-5 py-3 rounded-full text-xs font-bold hover:bg-[#25D366]/5 transition-all duration-300"
                        >
                          <MessageSquare className="h-4 w-4" /> WhatsApp Contact
                        </button>
                        
                        {booking.booking_status !== "cancelled" && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.inquiryId, "cancelled")}
                            className="flex items-center gap-1.5 border border-red-500 text-red-500 px-5 py-3 rounded-full text-xs font-bold hover:bg-red-50 transition-all duration-300"
                          >
                            <X className="h-4 w-4" /> Cancel Booking
                          </button>
                        )}

                        {booking.booking_status !== "confirmed" && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.inquiryId, "confirmed")}
                            className="flex items-center gap-1.5 bg-[#735c00] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-[#d4af37] hover:text-[#554300] shadow-md transition-all duration-300"
                          >
                            <Check className="h-4 w-4" /> Approve & Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
