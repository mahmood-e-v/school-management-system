"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAttendanceSheetData, saveAttendance } from "@/lib/actions/attendance";
import { toast } from "sonner";

interface ClassType {
    _id: string;
    name: string;
    division: string;
}

export function AttendanceForm({ classes }: { classes: ClassType[] }) {
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load students when class or date changes
    useEffect(() => {
        if (selectedClass && date) {
            loadData();
        } else {
            setStudents([]);
        }
    }, [selectedClass, date]);

    async function loadData() {
        setLoading(true);
        const data = await getAttendanceSheetData(selectedClass, date);
        if (data.students) {
            setStudents(data.students);
        } else if (data.error) {
            toast.error(data.error);
        }
        setLoading(false);
    }

    const handleStatusChange = (studentId: string, checked: boolean) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, status: checked ? "Present" : "Absent" } : s
        ));
    };

    const handleRemarkChange = (studentId: string, value: string) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId ? { ...s, remark: value } : s
        ));
    };

    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setStatusMsg(null);

        const formData = new FormData(event.currentTarget);
        formData.append("classId", selectedClass);
        formData.append("date", date); // Required because input is outside form 

        // Since we are now using controlled state, the FormData might not capture unchecked checkboxes correctly 
        // depending on how ShadCN Checkbox works with hidden inputs. 
        // But better: manual construction or rely on hidden inputs if ShadCN provides them.
        // ShadCN Checkbox puts a hidden input with the name if 'name' is provided.
        // And it only sends value if checked.

        // ISSUE: If I uncheck a box, FormData sends NOTHING for that name. 
        // My server action expects "on" or nothing.
        // Server logic: const isPresent = formData.get(...) === "on";
        // If nothing sent -> isPresent = false -> Absent.
        // This matches server logic! 
        // Server: status: isPresent ? "Present" : "Absent"
        // So Unchecked -> Nothing -> Absent.
        // Checked -> "on" -> Present.
        // LIMITATION: What if I want to mark "Late"? 
        // Current Server logic binary (Present/Absent).

        // Let's verify hidden input behavior. 
        // We will just use the form submission as before, but with controlled UI.

        const result = await saveAttendance(formData);
        setSaving(false);

        if (result.success) {
            const msg = "Attendance saved successfully!";
            toast.success(msg, { duration: 3000 });
            setStatusMsg({ type: 'success', text: msg });

            // Clear inline message after 3 seconds
            setTimeout(() => setStatusMsg(null), 3000);
        } else {
            const msg = result.error || "Failed to save";
            toast.error(msg, { duration: 3000 });
            setStatusMsg({ type: 'error', text: msg });
            setTimeout(() => setStatusMsg(null), 3000);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-lg border">
                <div className="w-[200px]">
                    <Label>Class</Label>
                    <Select onValueChange={setSelectedClass} value={selectedClass}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
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
                <div>
                    <Label>Date</Label>
                    <Input
                        type="date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <Button onClick={loadData} disabled={!selectedClass || loading}>
                    Reload
                </Button>
            </div>

            {students.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <div className="bg-card rounded-lg border shadow-sm items-center">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold">Attendance Sheet</h2>
                        </div>

                        {/* Status Message Area */}
                        <div className="px-4 pt-4">
                            {/* We will track status in local state for visibility */}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Roll No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="w-[100px]">Present</TableHead>
                                    <TableHead>Reason of Absence</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.rollNo}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>
                                            {/* We need to be careful with Checkbox inside form. 
                          ShadCN Checkbox doesn't use native input by default but uses Radix.
                          Radix Checkbox needs name prop or hidden input.
                          ShadCN Checkbox accepts name.
                      */}
                                            <Checkbox
                                                name={`status-${student._id}`}
                                                checked={student.status === "Present"}
                                                onCheckedChange={(checked) =>
                                                    handleStatusChange(student._id, checked as boolean)
                                                }
                                            />
                                            {/* Hidden input to ensure FormData gets the value even if checked (Redundancy fix) */}
                                            {/* Actually, for "Absent" (unchecked), we rely on missing key. 
                                                But for "Present" (checked), we rely on specific key.
                                                React Checkbox might not render a hidden input with name attribute in some versions.
                                                Let's allow the native checkbox behavior by ensuring the Checkbox component from shadcn forwards name.
                                                It does. But let's add a hidden input to be 100% sure we are submitting what we think.
                                            */}
                                            <input
                                                type="hidden"
                                                name={`status-${student._id}`}
                                                value={student.status === "Present" ? "on" : ""}
                                                disabled={student.status !== "Present"} // Disable if absent so no value is sent
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {student.status !== "Present" && (
                                                <Select
                                                    name={`remark-${student._id}`}
                                                    value={student.remark || ""}
                                                    onValueChange={(value) => handleRemarkChange(student._id, value)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select Reason" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sick">Sick</SelectItem>
                                                        <SelectItem value="Long Leave">Long Leave</SelectItem>
                                                        <SelectItem value="Excused Absence">Excused Absence</SelectItem>
                                                        <SelectItem value="Family Function">Family Function</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="p-4 border-t flex justify-end items-center gap-4">
                            {statusMsg && (
                                <div className={`text-sm font-bold ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {statusMsg.text}
                                </div>
                            )}

                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save Attendance"}
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {selectedClass && !loading && students.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No students found in this class.
                </div>
            )}
        </div>
    );
}
