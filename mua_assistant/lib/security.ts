import { NextResponse } from "next/server";

// Simple in-memory sliding window rate limiter
// For multi-instance servers, replace this with a Redis store
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 100; // max requests
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export function rateLimiter(ip: string): { success: boolean; limit?: number; remaining?: number; reset?: number } {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > WINDOW_MS) {
    userData.count = 1;
    userData.lastReset = now;
    rateLimitMap.set(ip, userData);
    return { success: true, limit: LIMIT, remaining: LIMIT - 1, reset: userData.lastReset + WINDOW_MS };
  }

  userData.count += 1;
  rateLimitMap.set(ip, userData);

  if (userData.count > LIMIT) {
    return { success: false, limit: LIMIT, remaining: 0, reset: userData.lastReset + WINDOW_MS };
  }

  return { success: true, limit: LIMIT, remaining: LIMIT - userData.count, reset: userData.lastReset + WINDOW_MS };
}

// Input Sanitization Helper to prevent XSS payloads
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
