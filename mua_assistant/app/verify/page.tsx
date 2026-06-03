"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

function VerifyForm() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const { verifyOtp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const phone = searchParams.get("phone");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) {
            showToast("Phone number missing", "error");
            return;
        }

        setLoading(true);
        const { error } = await verifyOtp(phone, otp);

        if (error) {
            showToast("Invalid Code. Please try again.", "error");
        } else {
            showToast("Success! You are logged in.", "success");
            // Redirect handled in AuthContext, but safe to do here too
            router.push("/");
        }
        setLoading(false);
    };

    if (!phone) {
        return (
            <div className="text-center">
                <p className="text-red-500">Error: No phone number provided.</p>
                <Button variant="link" onClick={() => router.push('/login')}>Go to Login</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-off-white">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-charcoal">Verify OTP</h1>
                    <p className="mt-2 text-taupe">Enter the code sent to {phone}</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-charcoal">
                            6-Digit Code
                        </label>
                        <div className="mt-1">
                            <Input
                                id="otp"
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                className="text-lg tracking-widest text-center"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={loading}
                    >
                        Verify & Login
                    </Button>

                    <div className="text-center">
                        <Button variant="link" onClick={() => router.push('/login')} className="text-sm text-taupe">
                            Wrong number? Go back
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyForm />
        </Suspense>
    )
}
