"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getAttendanceSummary } from "@/lib/actions/summary";
import * as XLSX from "xlsx";

export function SummaryView({ classes }: { classes: any[] }) {
    const [selectedClass, setSelectedClass] = useState("");
    const [month, setMonth] = useState(new Date().getMonth().toString());
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    async function loadSummary() {
        if (!selectedClass) return;
        setLoading(true);
        const result = await getAttendanceSummary(selectedClass, parseInt(month), parseInt(year));
        if (result.summary) {
            setData(result.summary);
        }
        setLoading(false);
    }

    function exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(data.map(s => ({
            "Roll No": s.rollNo,
            "Name": s.name,
            "Present Days": s.present,
            "Total Days": s.total,
            "Percentage": s.percentage + "%"
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_Summary_${year}_${parseInt(month) + 1}.xlsx`);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
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
                            <Label>Month</Label>
                            <Select onValueChange={setMonth} value={month}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Year</Label>
                            <Select onValueChange={setYear} value={year}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={loadSummary} disabled={!selectedClass || loading}>
                            {loading ? "Loading..." : "Get Summary"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {data.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={exportToExcel}>Export to Excel</Button>
                    </div>
                    <div className="border rounded-lg bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Present</TableHead>
                                    <TableHead>Absent</TableHead>
                                    <TableHead>Percentage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map(student => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.rollNo}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell className="text-green-600 font-bold">{student.present}</TableCell>
                                        <TableCell className="text-red-500">{student.absent}</TableCell>
                                        <TableCell className={student.percentage < 75 ? "text-red-500" : ""}>
                                            {student.percentage}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
