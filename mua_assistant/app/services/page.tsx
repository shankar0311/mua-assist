"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Service, storage } from "@/lib/storage";
import { Trash2 } from "lucide-react";

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [newService, setNewService] = useState({ name: "", price: "" });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setServices(storage.getServices());
    }, []);

    const handleAdd = () => {
        if (!newService.name || !newService.price) return;
        const added = storage.addService({
            name: newService.name,
            price: Number(newService.price),
        });
        setServices((prev) => [...prev, added]);
        setNewService({ name: "", price: "" });
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this service?")) {
            storage.deleteService(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
        }
    };

    return (
        <main className="min-h-screen bg-background p-4 pb-20">
            <header className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-2 px-2" onClick={() => router.push('/')}>
                    ←
                </Button>
                <h1 className="text-xl font-bold">Manage Services</h1>
            </header>

            <div className="space-y-4">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <p className="text-primary font-medium">₹{service.price}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(service.id)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isAdding ? (
                <Card className="mt-4 border-primary/50 bg-primary/5">
                    <CardContent className="p-4 space-y-4">
                        <h3 className="font-bold">Add New Service</h3>
                        <Input
                            placeholder="Service Name (e.g. Haldi Look)"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        />
                        <Input
                            type="number"
                            placeholder="Price"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={handleAdd}>Save</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    className="fixed bottom-6 right-4 rounded-full h-14 w-14 shadow-lg text-2xl"
                    onClick={() => setIsAdding(true)}
                >
                    +
                </Button>
            )}
        </main>
    );
}
