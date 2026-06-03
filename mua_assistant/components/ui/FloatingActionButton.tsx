"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function FloatingActionButton() {
    const router = useRouter();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                size="lg"
                className="rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl bg-primary text-primary-foreground flex items-center justify-center text-3xl pb-1"
                onClick={() => router.push("/booking/new")}
                aria-label="Add New Lead"
            >
                +
            </Button>
        </div>
    );
}
