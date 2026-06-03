"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { storage, Booking } from "@/lib/storage";
import { useEffect, useState } from "react";
import { format, parseISO, isSameDay, isAfter, startOfDay } from "date-fns";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useLanguage } from "@/components/LanguageContext";

import { db } from "@/lib/db";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  // Define a type for Full Booking
  type FullBooking = Booking & { lead?: import("@/lib/storage").AppLead };

  const [bookings, setBookings] = useState<FullBooking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<FullBooking[]>([]);
  const [todayBookings, setTodayBookings] = useState<FullBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<FullBooking[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyGoal] = useState(50000); // Default goal

  useEffect(() => {
    // Trigger sync on load
    db.sync();

    // Use getFullBookings to get Booking + Lead data
    const allBookings = storage.getFullBookings();
    // Map to a compatible structure for the UI or update UI to use nested lead
    // For now, let's map it to a flat structure if possible, or just use the new type.
    // Since we defined Booking in storage.ts as the DB row, we need to be careful.
    // Let's update the state type.
    setBookings(allBookings);

    const today = startOfDay(new Date());

    // Filter Pending (Any date, status pending)
    // Note: event_date is on the LEAD, not the booking.
    const pending = allBookings.filter(b => b.payment_status === "pending").sort((a, b) => new Date(a.lead?.event_date || 0).getTime() - new Date(b.lead?.event_date || 0).getTime());
    setPendingBookings(pending);

    // Filter Today
    const todayList = allBookings.filter(b => b.lead && isSameDay(parseISO(b.lead.event_date), today)).sort((a, b) => (a.lead?.event_date || "").localeCompare(b.lead?.event_date || ""));
    setTodayBookings(todayList);

    // Filter Upcoming (Future dates)
    const upcoming = allBookings
      .filter(b => b.lead && isAfter(parseISO(b.lead.event_date), today) && !isSameDay(parseISO(b.lead.event_date), today))
      .sort((a, b) => new Date(a.lead?.event_date || 0).getTime() - new Date(b.lead?.event_date || 0).getTime());
    setUpcomingBookings(upcoming);

    // Calculate Monthly Revenue (Confirmed only)
    const currentMonth = new Date().getMonth();
    const revenue = allBookings
      .filter(b => b.booking_status === 'confirmed' && b.lead && parseISO(b.lead.event_date).getMonth() === currentMonth)
      .reduce((sum, b) => sum + (b.advance_amount || 0), 0);
    setMonthlyRevenue(revenue);

  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const goalPercentage = Math.min(Math.round((monthlyRevenue / monthlyGoal) * 100), 100);

  return (
    <main className="min-h-screen bg-background pb-24 relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Shreya Makeup</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">Pro Member</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-bold text-muted-foreground"
            onClick={toggleLanguage}
          >
            {language === 'en' ? 'HI' : 'EN'}
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <span className="text-xl">⚙️</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="px-6 py-6 space-y-8">
        {/* 1. Monthly Goal Widget */}
        <section className="flex flex-col items-center justify-center py-4">
          <div className="relative w-48 h-24 overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-secondary"></div>
            <div
              className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-primary border-b-transparent border-r-transparent transform rotate-[-45deg] transition-all duration-1000 ease-out"
              style={{ transform: `rotate(${45 + (goalPercentage * 1.8) - 180}deg)` }}
            ></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center mb-2">
              <span className="text-3xl font-bold text-foreground">{goalPercentage}%</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Goal</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-bold text-primary">₹{monthlyRevenue.toLocaleString()}</span> / ₹{monthlyGoal.toLocaleString()}
          </p>
        </section>

        {/* 2. Quick Stats Carousel */}
        <section className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {/* Pending Advances Card */}
            <div className="w-40 h-28 rounded-2xl bg-white p-4 shadow-sm border border-border/40 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('pendingAdvances')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingBookings.length}
                </p>
                <p className="text-xs text-muted-foreground">Clients Waiting</p>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="w-40 h-28 rounded-2xl bg-white p-4 shadow-sm border border-border/40 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  ₹{monthlyRevenue > 1000 ? `${(monthlyRevenue / 1000).toFixed(1)}k` : monthlyRevenue}
                </p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>

            {/* Upcoming Card */}
            <div className="w-40 h-28 rounded-2xl bg-white p-4 shadow-sm border border-border/40 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Upcoming</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingBookings.length}
                </p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Booking Pipeline (Active Bookings) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Booking Pipeline</h2>
            <Link href="/calendar">
              <span className="text-xs font-bold text-primary">View All</span>
            </Link>
          </div>

          <div className="space-y-3">
            {/* Combine Today, Pending, and Upcoming into one list for the pipeline view, prioritized and deduplicated */}
            {Array.from(new Map([...todayBookings, ...pendingBookings, ...upcomingBookings].map(b => [b.id, b])).values()).slice(0, 5).map((booking) => (
              <Link href={`/booking/${booking.id}`} key={booking.id}>
                <div className="group relative bg-white rounded-2xl p-4 shadow-sm border border-border/40 hover:border-primary/30 transition-all active:scale-[0.98]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Date Box */}
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl ${isSameDay(parseISO(booking.lead?.event_date || new Date().toISOString()), new Date()) ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                        <span className="text-xs font-bold uppercase">{format(parseISO(booking.lead?.event_date || new Date().toISOString()), "MMM")}</span>
                        <span className="text-lg font-bold leading-none">{format(parseISO(booking.lead?.event_date || new Date().toISOString()), "d")}</span>
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="font-bold text-foreground">{booking.lead?.client_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {booking.lead?.event_type} • {format(parseISO(booking.lead?.event_date || new Date().toISOString()), "h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.booking_status === 'confirmed'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                        }`}>
                        {booking.booking_status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {Array.from(new Map([...todayBookings, ...pendingBookings, ...upcomingBookings].map(b => [b.id, b])).values()).length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p>No active bookings</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <FloatingActionButton />
    </main>
  );
}
