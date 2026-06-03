"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { signInWithOtp } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation for Indian numbers
        let formattedPhone = phone.trim();
        if (!formattedPhone.startsWith("+")) {
            formattedPhone = "+91" + formattedPhone;
        }

        const { error } = await signInWithOtp(formattedPhone);

        if (error) {
            showToast(error.message, "error");
        } else {
            showToast("OTP Sent. Check your phone.", "success");
            // Pass phone to verify page via query param or state
            // For simplicity, we'll just navigate and ask user to confirm or re-enter if needed
            // Ideally, use a context or URL param. Let's use URL param.
            router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}`);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-off-white">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-charcoal">Welcome Back</h1>
                    <p className="mt-2 text-taupe">Sign in to manage your bookings</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-charcoal">
                            Phone Number
                        </label>
                        <div className="mt-1">
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="text-lg"
                            />
                        </div>
                        <p className="mt-1 text-xs text-taupe">
                            We'll send you a One Time Password (OTP).
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={loading}
                    >
                        Send OTP
                    </Button>
                </form>
            </div>
        </div>
    );
}
