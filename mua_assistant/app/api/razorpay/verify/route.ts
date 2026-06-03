import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        // Mock Mode Verification
        if (razorpay_order_id.startsWith("order_mock_")) {
            return NextResponse.json({ success: true, message: "Mock payment verified" });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ success: false, message: "Razorpay secret missing" }, { status: 500 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
        }
    } catch (error) {
        console.error("Razorpay Verification Error:", error);
        return NextResponse.json({ error: "Error verifying payment" }, { status: 500 });
    }
}
