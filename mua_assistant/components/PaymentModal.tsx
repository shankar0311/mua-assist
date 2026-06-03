"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number; // in rupees
    bookingId: string;
    onSuccess: (paymentId: string) => void;
    onFailure: (error: string) => void;
}

export function PaymentModal({ isOpen, onClose, amount, bookingId, onSuccess, onFailure }: PaymentModalProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsLoading(true);

        const res = await loadRazorpay();

        if (!res) {
            showToast("Razorpay SDK failed to load. Are you online?", "error");
            setIsLoading(false);
            return;
        }

        // 1. Create Order
        const orderRes = await fetch("/api/razorpay/order", {
            method: "POST",
            body: JSON.stringify({ amount: amount, receipt: bookingId }),
        });

        if (!orderRes.ok) {
            showToast("Error creating order", "error");
            setIsLoading(false);
            return;
        }

        const orderData = await orderRes.json();

        // Check for Mock Mode
        if (orderData.id.startsWith("order_mock_")) {
            // Simulate Payment Flow
            setTimeout(async () => {
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    body: JSON.stringify({
                        razorpay_order_id: orderData.id,
                        razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
                        razorpay_signature: "mock_signature",
                    }),
                });

                if (verifyRes.ok) {
                    onSuccess("pay_mock_success");
                    onClose();
                } else {
                    onFailure("Mock verification failed");
                }
                setIsLoading(false);
            }, 1000); // Fake delay
            return;
        }

        // Real Razorpay Flow
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
            amount: orderData.amount,
            currency: orderData.currency,
            name: "MUA Assistant",
            description: "Booking Advance",
            image: "/app_icon.png", // Use app icon if available
            order_id: orderData.id,
            handler: async function (response: any) {
                // Verify Payment
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }),
                });

                if (verifyRes.ok) {
                    onSuccess(response.razorpay_payment_id);
                    onClose();
                } else {
                    onFailure("Payment verification failed");
                }
            },
            prefill: {
                name: "Client Name", // We could pass this in props
                email: "client@example.com",
                contact: "9999999999",
            },
            notes: {
                address: "Razorpay Corporate Office",
            },
            theme: {
                color: "#84A98C", // Primary color
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold mb-2">Pay Advance</h3>
                <p className="text-muted-foreground mb-6">
                    Secure your booking by paying the advance amount of <span className="font-bold text-primary">₹{amount}</span>.
                </p>

                <div className="space-y-3">
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handlePayment}
                        isLoading={isLoading}
                    >
                        Pay Now
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
