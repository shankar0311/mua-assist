"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            showToast("You are back online! Syncing data...", "success");
        };

        const handleOffline = () => {
            setIsOffline(true);
            showToast("You are offline. Changes will be saved locally.", "info" as any);
        };

        // Set initial state
        setIsOffline(!navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [showToast]);

    if (!isOffline) return null;

    return (
        <div className="bg-yellow-500 text-white text-center text-xs font-bold py-1 px-4 fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
            You are currently offline.
        </div>
    );
}
