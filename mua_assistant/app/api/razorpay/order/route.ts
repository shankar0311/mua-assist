import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
    try {
        const { amount, currency = "INR", receipt } = await request.json();

        // Mock Mode if keys are missing
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Using Mock Mode.");
            return NextResponse.json({
                id: "order_mock_" + Math.random().toString(36).substring(7),
                currency: currency,
                amount: amount,
                status: "created"
            });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: currency,
            receipt: receipt,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }
}
