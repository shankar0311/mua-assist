"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, storage } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setClients(storage.getClients());
    }, []);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => router.push('/')}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">Clients</h1>
            </header>

            <div className="mb-6">
                <Input
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <Link href={`/clients/${client.phone}`} key={client.phone}>
                            <Card className="hover:bg-accent/5 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{client.name}</h3>
                                        <p className="text-muted-foreground text-sm">{client.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-lg">₹{client.totalSpend}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {client.bookingCount} booking{client.bookingCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {searchTerm ? "No clients found." : "No clients yet. Add a lead to get started!"}
                    </p>
                )}
            </div>
        </main>
    );
}
