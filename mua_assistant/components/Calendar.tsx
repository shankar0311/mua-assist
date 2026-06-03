"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/style.css";
import { Booking, storage } from "@/lib/storage";
import { parseISO } from "date-fns";

export function Calendar({
    selected,
    onSelect,
}: {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
}) {
    // Define FullBooking type locally or import if available
    type FullBooking = Booking & { lead?: import("@/lib/storage").AppLead };
    const [bookings, setBookings] = React.useState<FullBooking[]>([]);

    React.useEffect(() => {
        setBookings(storage.getFullBookings());
    }, []);

    const confirmedDays = bookings
        .filter(b => b.booking_status === "confirmed")
        .map((b) => {
            if (!b.lead || typeof b.lead.event_date !== 'string') return null;
            try {
                return parseISO(b.lead.event_date);
            } catch (e) {
                return null;
            }
        })
        .filter((date): date is Date => date !== null);

    const pendingDays = bookings
        .filter(b => b.booking_status !== "confirmed")
        .map((b) => {
            if (!b.lead || typeof b.lead.event_date !== 'string') return null;
            try {
                return parseISO(b.lead.event_date);
            } catch (e) {
                return null;
            }
        })
        .filter((date): date is Date => date !== null);

    const modifiers = {
        confirmed: confirmedDays,
        pending: pendingDays,
    };

    const modifiersStyles = {
        confirmed: {
            color: "white",
            backgroundColor: "var(--primary)", // Green/Primary for confirmed
            borderRadius: "50%",
        },
        pending: {
            color: "var(--yellow-800)",
            backgroundColor: "var(--yellow-200)", // Yellow for pending
            borderRadius: "50%",
        },
    };

    return (
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex justify-center">
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                showOutsideDays
                className="p-3"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
            />
        </div>
    );
}
