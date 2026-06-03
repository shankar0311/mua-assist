"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

export function SyncInitializer() {
    useEffect(() => {
        db.initSyncListener();
    }, []);

    return null;
}
