"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithOtp: async () => ({ error: null }),
    verifyOtp: async () => ({ error: null }),
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Sync session token to cookie for server-side middleware access
            if (session) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in || 3600}; SameSite=Lax; Secure`;
            } else {
                document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure`;
            }

            // Ensure user profile exists in public.users
            if (session?.user) {
                const { error } = await supabase.from('users').upsert({
                    id: session.user.id,
                    phone: session.user.phone,
                    // We can add default name or other fields if we had them
                }, { onConflict: 'id' }); // Don't overwrite if exists, just ensure

                if (error) console.error("Error creating user profile:", error);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithOtp = async (phone: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
        });
        return { error };
    };

    const verifyOtp = async (phone: string, token: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: "sms",
        });

        if (!error && data.session) {
            router.push("/");
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{ user, session, loading, signInWithOtp, verifyOtp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
