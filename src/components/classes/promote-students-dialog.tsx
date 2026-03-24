"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getStudents, promoteStudents } from "@/lib/actions/student";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";

interface PromoteStudentsDialogProps {
    classes: any[];
    allClasses?: any[];
}

export function PromoteStudentsDialog({ classes, allClasses = [] }: PromoteStudentsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    
    const [sourceClassId, setSourceClassId] = useState("");
    const [destClassId, setDestClassId] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    useEffect(() => {
        if (sourceClassId) {
            setFetchingStudents(true);
            getStudents(sourceClassId).then((data) => {
                setStudents(data || []);
                setSelectedStudentIds((data || []).map((s: any) => s._id));
                setFetchingStudents(false);
            }).catch(() => {
                toast.error("Failed to load students");
                setFetchingStudents(false);
            });
        } else {
            setStudents([]);
            setSelectedStudentIds([]);
        }
    }, [sourceClassId]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(students.map((s) => s._id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds((prev) => [...prev, studentId]);
        } else {
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
        }
    };

    const handleSubmit = async () => {
        if (!sourceClassId || !destClassId) {
            toast.error("Please select both source and destination classes");
            return;
        }
        if (sourceClassId === destClassId) {
            toast.error("Source and destination classes cannot be the same");
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error("Please select at least one student to promote");
            return;
        }

        setLoading(true);
        const result = await promoteStudents(selectedStudentIds, destClassId);
        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`Successfully promoted ${selectedStudentIds.length} students`);
            setOpen(false);
            // Reset state
            setSourceClassId("");
            setDestClassId("");
            setStudents([]);
            setSelectedStudentIds([]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Year Shifting
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Year Shifting / Promote Students</DialogTitle>
                    <DialogDescription>
                        Select a source class, choose students, and select the destination class to promote them to.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Source Class</Label>
                            <Select value={sourceClassId} onValueChange={setSourceClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(allClasses.length > 0 ? allClasses : classes).map((cls) => (
                                        <SelectItem key={cls._id} value={cls._id}>
                                            {cls.name} - {cls.division} ({cls.academicYear})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Destination Class</Label>
                            <Select value={destClassId} onValueChange={setDestClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
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
                    </div>

                    {sourceClassId && (
                        <div className="mt-4 border rounded-md p-4">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <Label className="font-semibold text-base">Select Students</Label>
                                {students.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="select-all" 
                                            checked={selectedStudentIds.length === students.length && students.length > 0} 
                                            onCheckedChange={handleSelectAll} 
                                        />
                                        <label htmlFor="select-all" className="text-sm cursor-pointer">
                                            Select All ({selectedStudentIds.length}/{students.length})
                                        </label>
                                    </div>
                                )}
                            </div>
                            
                            {fetchingStudents ? (
                                <div className="text-center py-4 text-sm text-muted-foreground">Loading students...</div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-4 text-sm text-muted-foreground">No students found in this class.</div>
                            ) : (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {students.map((student) => (
                                        <div key={student._id} className="flex items-center space-x-3">
                                            <Checkbox 
                                                id={`student-${student._id}`} 
                                                checked={selectedStudentIds.includes(student._id)}
                                                onCheckedChange={(checked) => handleSelectStudent(student._id, !!checked)}
                                            />
                                            <label 
                                                htmlFor={`student-${student._id}`} 
                                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                            >
                                                {student.name} <span className="text-muted-foreground font-normal ml-2">Roll No: {student.rollNo}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !sourceClassId || !destClassId || selectedStudentIds.length === 0}>
                        {loading ? "Promoting..." : "Promote Selected"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
