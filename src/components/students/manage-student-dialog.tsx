"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addStudent, updateStudent } from "@/lib/actions/student";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface ManageStudentDialogProps {
    mode: "add" | "edit";
    student?: any; // If edit mode
    classId?: string; // If add mode (optional if we allow selecting class)
    classes?: any[]; // For global add
    onSuccess?: () => void;
}

export function ManageStudentDialog({ mode, student, classId: preSelectedClassId, classes, onSuccess }: ManageStudentDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(preSelectedClassId || "");
    const [warningMsg, setWarningMsg] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        // Pre-handle warning if confirmed
        if (warningMsg) {
            formData.append("ignoreWarning", "true");
        }

        if (mode === "add") {
            const finalClassId = preSelectedClassId || selectedClassId;
            if (!finalClassId) {
                toast.error("Please select a class");
                setLoading(false);
                return;
            }
            formData.append("classId", finalClassId);
            const result = await addStudent(formData);

            if (result.error) {
                toast.error(result.error);
                setWarningMsg(null); // Clear warning on strict error
            } else if (result.warning && !warningMsg) { // Only show warning if not already confirmed
                setWarningMsg(result.warning);
                setLoading(false); // Stop loading to let user decide
                return;
            } else {
                toast.success("Student added successfully", { duration: 2000 });
                setOpen(false);
                setWarningMsg(null);
                if (onSuccess) onSuccess();
            }
        } else {
            formData.append("id", student._id);
            const result = await updateStudent(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Student updated successfully", { duration: 2000 });
                setOpen(false);
                if (onSuccess) onSuccess();
            }
        }
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setWarningMsg(null); }}>
            <DialogTrigger asChild>
                {mode === "add" ? (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "add" ? "Add Student" : "Edit Student"}</DialogTitle>
                    <DialogDescription>
                        {mode === "add" ? "Add a new student to this class." : "Update student details."}
                    </DialogDescription>
                </DialogHeader>

                {warningMsg && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    {warningMsg}
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    Click "Add Anyway" below to proceed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {!preSelectedClassId && classes && classes.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="classSelect">Class *</Label>
                                <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls._id} value={cls._id}>
                                                {cls.name} - {cls.division}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" defaultValue={student?.name} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rollNo">Roll No *</Label>
                                <Input id="rollNo" name="rollNo" defaultValue={student?.rollNo} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="parentName">Parent Name</Label>
                                <Input id="parentName" name="parentName" defaultValue={student?.parentName} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parentPhone">Phone</Label>
                                <Input id="parentPhone" name="parentPhone" defaultValue={student?.parentPhone} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="parentCustomId">Parent ID</Label>
                                <Input id="parentCustomId" name="parentCustomId" defaultValue={student?.parentCustomId} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parentEmail">Parent Email</Label>
                                <Input id="parentEmail" name="parentEmail" type="email" defaultValue={student?.parentEmail || student?.details?.parentEmail} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="studentEmail">Student Email</Label>
                            <Input id="studentEmail" name="studentEmail" type="email" defaultValue={student?.studentEmail} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" defaultValue={student?.location} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="transportMode">Transport Mode</Label>
                                <Select name="transportMode" defaultValue={student?.transportMode || "Bus"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bus">Bus</SelectItem>
                                        <SelectItem value="Car">Car</SelectItem>
                                        <SelectItem value="Bike">Bike</SelectItem>
                                        <SelectItem value="Walk">Walk</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="busNumber">Bus Number (if Bus)</Label>
                            <Input id="busNumber" name="busNumber" defaultValue={student?.busNumber} placeholder="e.g. B-12" />
                        </div>
                    </div>
                    <DialogFooter>
                        {warningMsg && (
                            <Button type="button" variant="outline" onClick={() => setWarningMsg(null)}>Cancel</Button>
                        )}
                        <Button type="submit" disabled={loading} variant={warningMsg ? "destructive" : "default"}>
                            {loading ? "Saving..." : (warningMsg ? "Add Anyway" : "Save details")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
