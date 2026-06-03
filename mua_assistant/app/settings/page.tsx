"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import {
    User,
    Globe,
    Bell,
    Shield,
    LogOut,
    ArrowLeft,
    ChevronRight,
    HelpCircle,
    Info,
    Moon
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { language, setLanguage } = useLanguage();
    const { user, signOut } = useAuth();
    const router = useRouter();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModePlaceholder, setDarkModePlaceholder] = useState(false);

    useEffect(() => {
        // Load notifications state
        const storedNotify = localStorage.getItem("mua_settings_notifications");
        if (storedNotify !== null) {
            setNotificationsEnabled(storedNotify === "true");
        }
    }, []);

    const handleToggleNotifications = () => {
        const nextState = !notificationsEnabled;
        setNotificationsEnabled(nextState);
        localStorage.setItem("mua_settings_notifications", String(nextState));
    };

    const handleToggleDarkMode = () => {
        setDarkModePlaceholder(!darkModePlaceholder);
    };

    const isEn = language === "en";

    // Text localization dictionary specifically for settings
    const texts = {
        title: isEn ? "Settings" : "सेटिंग्स",
        back: isEn ? "Back" : "पीछे",
        profileTitle: isEn ? "Account Profile" : "खाता प्रोफ़ाइल",
        phone: isEn ? "Phone Number" : "फ़ोन नंबर",
        statusLabel: isEn ? "Account Status" : "खाता स्थिति",
        proMember: isEn ? "Pro Member" : "प्रो सदस्य",
        preferencesTitle: isEn ? "App Preferences" : "अनुप्रयोग प्राथमिकताएं",
        languageLabel: isEn ? "Language" : "भाषा",
        notificationsLabel: isEn ? "Booking Notifications" : "बुकिंग सूचनाएं",
        darkModeLabel: isEn ? "Dark Mode (Beta)" : "डार्क मोड (बीटा)",
        enabled: isEn ? "Enabled" : "सक्रिय",
        disabled: isEn ? "Disabled" : "निष्क्रिय",
        securityTitle: isEn ? "Security & Integrations" : "सुरक्षा और एकीकरण",
        n8nWebhook: isEn ? "n8n Webhook Integration" : "n8n वेबहुक एकीकरण",
        active: isEn ? "Active" : "सक्रिय",
        helpTitle: isEn ? "Support & Help" : "सहायता और सहायता",
        faq: isEn ? "FAQ & Documentation" : "अक्सर पूछे जाने वाले प्रश्न और दस्तावेज़",
        about: isEn ? "About MUA Assistant" : "MUA असिस्टेंट के बारे में",
        signOutBtn: isEn ? "Sign Out" : "साइन आउट",
        version: isEn ? "Version 2.0.0 (Production)" : "संस्करण 2.0.0 (उत्पादन)"
    };

    return (
        <main className="min-h-screen bg-background pb-28 relative font-sans">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                    aria-label={texts.back}
                >
                    <ArrowLeft className="h-6 w-6 text-foreground" />
                </button>
                <h1 className="font-bold text-xl leading-tight">{texts.title}</h1>
            </header>

            <div className="px-6 py-6 space-y-6 max-w-md mx-auto">
                {/* 1. Account Profile */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">{texts.profileTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{texts.phone}</p>
                            <p className="text-base font-medium text-foreground">{user?.phone || "+91 76250 35253"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{texts.statusLabel}</p>
                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 mt-1 rounded-full">
                                {texts.proMember}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. App Preferences */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                            <Globe className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">{texts.preferencesTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Language Selection */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium text-foreground">{texts.languageLabel}</p>
                                <p className="text-xs text-muted-foreground">{isEn ? "Select active interface language" : "सक्रिय इंटरफ़ेस भाषा चुनें"}</p>
                            </div>
                            <div className="flex bg-muted p-0.5 rounded-lg border border-border/40">
                                <button
                                    onClick={() => setLanguage("en")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                        isEn
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLanguage("hi")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                        !isEn
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    HI
                                </button>
                            </div>
                        </div>

                        <hr className="border-border/40" />

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium text-foreground">{texts.notificationsLabel}</p>
                                <p className="text-xs text-muted-foreground">{isEn ? "WhatsApp & SMS lead alerts" : "व्हाट्सएप और एसएमएस लीड अलर्ट"}</p>
                            </div>
                            <button
                                onClick={handleToggleNotifications}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    notificationsEnabled ? "bg-primary" : "bg-muted border border-border"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        notificationsEnabled ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        <hr className="border-border/40" />

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium text-foreground">{texts.darkModeLabel}</p>
                                <p className="text-xs text-muted-foreground">{isEn ? "Toggle dark visual aesthetics" : "डार्क विजुअल सौंदर्य बदलें"}</p>
                            </div>
                            <button
                                onClick={handleToggleDarkMode}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    darkModePlaceholder ? "bg-primary" : "bg-muted border border-border"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        darkModePlaceholder ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Security & Integrations */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">{texts.securityTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium text-foreground">{texts.n8nWebhook}</p>
                                <p className="text-xs text-muted-foreground">{isEn ? "Secure API integration state" : "सुरक्षित एपीआई एकीकरण स्थिति"}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                {texts.active}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Support & Documentation */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold">{texts.helpTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                            <Link href="/n8n_integration_guide.md" className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-foreground">{texts.faq}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <div className="flex items-center justify-between px-6 py-4">
                                <span className="text-sm font-medium text-foreground">{texts.about}</span>
                                <span className="text-xs text-muted-foreground">{texts.version}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sign Out Button */}
                <div className="pt-2">
                    <Button
                        variant="destructive"
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-5 w-5" />
                        {texts.signOutBtn}
                    </Button>
                </div>
            </div>
        </main>
    );
}
