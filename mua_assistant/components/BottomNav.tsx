"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/calendar", icon: Calendar, label: "Calendar" },
        { href: "/clients", icon: Users, label: "Clients" },
        { href: "/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-50">
            <div className="flex justify-between items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-16 transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            {/* <span className="text-[10px] font-medium">{item.label}</span> */}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
