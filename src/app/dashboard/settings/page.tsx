"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchoolSettings, updateSchoolSettings } from "@/lib/actions/school";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    // const { toast } = useToast(); -> Removed
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        logo: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const data = await getSchoolSettings();
            if (data) {
                setFormData({
                    name: data.name || "",
                    address: data.address || "",
                    logo: data.logo || "",
                    email: data.email || "",
                    phone: data.phone || ""
                });
            }
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateSchoolSettings(formData);
        setSaving(false);

        if (result.success) {
            toast.success("Settings Saved", {
                description: "School information has been updated successfully.",
            });
        } else {
            toast.error("Error", {
                description: "Failed to update settings.",
            });
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">School Settings</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Information</CardTitle>
                        <CardDescription>This information will appear on all reports and documents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">School Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Madrasa Wadi Rahma"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Falaj Haza' Al Ain"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo URL</Label>
                                <Input
                                    id="logo"
                                    name="logo"
                                    value={formData.logo}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://example.com/logo.png"
                                />
                                <p className="text-xs text-muted-foreground">Provide a direct URL to your school logo image.</p>
                            </div>

                            {formData.logo && (
                                <div className="mt-4 p-4 border rounded bg-gray-50 flex flex-col items-center">
                                    <Label className="mb-2">Logo Preview</Label>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.logo}
                                        alt="School Logo Preview"
                                        className="max-h-24 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Error";
                                        }}
                                    />
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="info@school.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+971 55 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
