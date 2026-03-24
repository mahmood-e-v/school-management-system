"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSchoolSettings, updateSchoolSettings, getClassesForSignatures } from "@/lib/actions/school";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    // const { toast } = useToast(); -> Removed
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classesList, setClassesList] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        logo: "",
        email: "",
        phone: "",
        currentAcademicYear: "2025-26",
        academicYearStartDate: "",
        academicYearEndDate: "",
        classTeacherSignature: "",
        sadarMuallimSignature: "",
        sadarMuallimName: "",
        classTeacherSignatures: [] as { teacherName: string; signature: string }[]
    });

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const data = await getSchoolSettings();
            const classesResponse = await getClassesForSignatures();
            setClassesList(classesResponse);

            if (data) {
                setFormData({
                    name: data.name || "",
                    address: data.address || "",
                    logo: data.logo || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    currentAcademicYear: data.currentAcademicYear || "2025-26",
                    academicYearStartDate: data.academicYearStartDate ? new Date(data.academicYearStartDate).toISOString().split("T")[0] : "",
                    academicYearEndDate: data.academicYearEndDate ? new Date(data.academicYearEndDate).toISOString().split("T")[0] : "",
                    classTeacherSignature: data.classTeacherSignature || "",
                    sadarMuallimSignature: data.sadarMuallimSignature || "",
                    sadarMuallimName: data.sadarMuallimName || "",
                    classTeacherSignatures: data.classTeacherSignatures || []
                });
            }
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleClassTeacherSignatureChange = (e: React.ChangeEvent<HTMLInputElement>, targetTeacherName: string) => {
        const file = e.target.files?.[0];
        if (file && targetTeacherName) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => {
                    const existing = [...prev.classTeacherSignatures];
                    const idx = existing.findIndex(t => t.teacherName === targetTeacherName);
                    if (idx >= 0) {
                        existing[idx].signature = reader.result as string;
                    } else {
                        existing.push({ teacherName: targetTeacherName, signature: reader.result as string });
                    }
                    return { ...prev, classTeacherSignatures: existing };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
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

                                <div className="space-y-2">
                                    <Label htmlFor="currentAcademicYear">Current Academic Year</Label>
                                    <Input
                                        id="currentAcademicYear"
                                        name="currentAcademicYear"
                                        value={formData.currentAcademicYear}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. 2025-26"
                                    />
                                    <p className="text-xs text-muted-foreground">This dictates which exams and attendance records are currently active.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="academicYearStartDate">Academic Year Start Date</Label>
                                    <Input
                                        id="academicYearStartDate"
                                        name="academicYearStartDate"
                                        type="date"
                                        value={formData.academicYearStartDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="academicYearEndDate">Academic Year End Date</Label>
                                    <Input
                                        id="academicYearEndDate"
                                        name="academicYearEndDate"
                                        type="date"
                                        value={formData.academicYearEndDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo / Emblem</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="logoUrl"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleChange}
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <Label htmlFor="logoFile" className="cursor-pointer bg-slate-100 hover:bg-slate-200 border rounded flex items-center px-4 font-medium text-sm whitespace-nowrap">
                                        Upload Image
                                    </Label>
                                    <Input
                                        id="logoFile"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Provide a direct URL or upload an image from your device.</p>
                            </div>

                            {formData.logo && (
                                <div className="mt-4 p-4 border rounded bg-gray-50 flex flex-col items-center">
                                    <Label className="mb-2">Logo Preview</Label>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.logo}
                                        alt="School Logo Preview"
                                        className="max-h-24 object-contain"
                                    />
                                </div>
                            )}

                            <div className="space-y-4 border p-4 rounded bg-gray-50/50 mb-6">
                                <div>
                                    <Label className="text-base font-semibold border-b pb-2 block mb-4">Sadar Muallim Information</Label>
                                    
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 mb-4">
                                            <Label htmlFor="sadarMuallimName">Name</Label>
                                            <Input
                                                id="sadarMuallimName"
                                                name="sadarMuallimName"
                                                value={formData.sadarMuallimName}
                                                onChange={handleChange}
                                                placeholder="e.g. Sheikh Abdullah"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sadarMuallimSignatureFile" className="cursor-pointer bg-slate-100 hover:bg-slate-200 border rounded flex items-center justify-center py-2 px-4 font-medium text-sm w-fit">
                                                Upload Signature
                                            </Label>
                                            <Input
                                                id="sadarMuallimSignatureFile"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'sadarMuallimSignature')}
                                            />
                                            
                                            {formData.sadarMuallimSignature && (
                                                <div className="mt-2 p-2 border rounded bg-white flex justify-center w-fit min-w-[120px]">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={formData.sadarMuallimSignature}
                                                        alt="Sadar Muallim Preview"
                                                        className="h-[60px] object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border p-4 rounded bg-gray-50/50 mb-6">
                                <div>
                                    <Label className="text-base font-semibold border-b pb-2 block mb-4">Class Teacher Signatures</Label>
                                    
                                    <div className="rounded-md border bg-white overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="w-[200px]">Class</TableHead>
                                                    <TableHead>Class Teacher</TableHead>
                                                    <TableHead className="text-center w-[180px]">Signature Preview</TableHead>
                                                    <TableHead className="text-right w-[120px]">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {classesList.length > 0 ? classesList.map(c => {
                                                    const teacherName = c.classTeacher || 'Unassigned';
                                                    const signatureObj = formData.classTeacherSignatures.find(t => t.teacherName === teacherName);
                                                    
                                                    return (
                                                        <TableRow key={c._id}>
                                                            <TableCell className="font-medium whitespace-nowrap">{c.name} {c.division}</TableCell>
                                                            <TableCell className="whitespace-nowrap">{teacherName}</TableCell>
                                                            <TableCell className="text-center align-middle">
                                                                {signatureObj?.signature ? (
                                                                    <div className="flex justify-center items-center h-[50px]">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={signatureObj.signature} alt="Signature" className="h-[40px] max-w-[150px] object-contain" />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-xs italic">No Signature</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right align-middle">
                                                                {teacherName !== 'Unassigned' ? (
                                                                    <div>
                                                                        <Label htmlFor={`signatureFile_${c._id}`} className="cursor-pointer text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded px-3 py-1.5 font-medium transition-colors inline-block text-center whitespace-nowrap">
                                                                            Upload Signature
                                                                        </Label>
                                                                        <Input
                                                                            id={`signatureFile_${c._id}`}
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => handleClassTeacherSignatureChange(e, teacherName)}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-[11px] inline-block mt-2">Assign Teacher First</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                            No classes available. Add classes in the Classes tab.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Note: Uploading a signature for a class teacher will automatically apply it to all classes taught by that teacher.</p>
                                </div>
                            </div>

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
