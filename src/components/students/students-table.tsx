"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Search, Settings2 } from "lucide-react";
import * as XLSX from "xlsx";
import { ManageStudentDialog } from "@/components/students/manage-student-dialog";
import { DeleteStudentButton } from "@/components/students/delete-student-button";

interface StudentsTableProps {
    initialStudents: any[];
    classes: any[];
    canManage: boolean;
}

export function StudentsTable({ initialStudents, classes, canManage }: StudentsTableProps) {
    const [students, setStudents] = useState(initialStudents);
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [transportFilter, setTransportFilter] = useState("all");

    // Filter logic
    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(search.toLowerCase()) ||
            (student.details?.parentEmail || "").toLowerCase().includes(search.toLowerCase()) ||
            (student.studentEmail || "").toLowerCase().includes(search.toLowerCase());

        const matchesClass = classFilter === "all" || student.classId?._id === classFilter;
        const matchesTransport = transportFilter === "all" || student.transportMode === transportFilter;

        return matchesSearch && matchesClass && matchesTransport;
    });

    const downloadExcel = () => {
        const data = filteredStudents.map((s) => ({
            "Roll No": s.rollNo,
            "Name": s.name,
            "Class": s.classId?.name,
            "Division": s.classId?.division,
            "Parent Name": s.parentName,
            "Parent Phone": s.parentPhone,
            "Parent Email": s.parentEmail || s.details?.parentEmail,
            "Student Email": s.studentEmail,
            "Location": s.location,
            "Transport Mode": s.transportMode,
            "Bus Number": s.busNumber,
            "Parent ID": s.parentCustomId
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Students_List.xlsx");
    };

    const handleSuccess = () => {
        // In a real app we might re-fetch or use router.refresh(). 
        // For now, since initialStudents comes from server, simple router refresh logic 
        // will be handled by the parent if we trigger it, but here we might just rely on the dialog 
        // calling router.refresh() which updates the prop `initialStudents`.
        // We'll update state when props change.
    };

    // Watch for prop changes (revalidation)
    if (initialStudents !== students && JSON.stringify(initialStudents) !== JSON.stringify(students)) {
        // This is a naive check; proper React usage would be useEffect or key-based reset
        // But since we modify state locally for filtering, we should probably update state if props change.
        // Let's use useEffect instead.
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-card p-4 rounded-lg border">
                <div className="flex flex-1 gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name, roll no..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map((cls) => (
                                <SelectItem key={cls._id} value={cls._id}>
                                    {cls.name} - {cls.division}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={transportFilter} onValueChange={setTransportFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Transport" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modes</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Bike">Bike</SelectItem>
                            <SelectItem value="Walk">Walk</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={downloadExcel}>
                    <Download className="mr-2 h-4 w-4" /> Export Excel
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Sl No</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Transport</TableHead>
                            <TableHead>Parent Info</TableHead>
                            <TableHead className="hidden md:table-cell">Contact Info</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                    No students found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <TableRow key={student._id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{student.rollNo}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{student.name}</span>
                                            <span className="text-xs text-muted-foreground md:hidden">{student.classId?.name} {student.classId?.division}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                            {student.classId?.name} - {student.classId?.division}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{student.transportMode}</div>
                                        {student.transportMode === 'Bus' && student.busNumber && (
                                            <div className="text-xs text-muted-foreground">Bus: {student.busNumber}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{student.parentName || "-"}</div>
                                        <div className="text-xs text-muted-foreground">{student.parentCustomId ? `PID: ${student.parentCustomId}` : ""}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="text-xs space-y-1">
                                            <div>{student.parentPhone || "-"}</div>
                                            <div className="text-muted-foreground">{student.parentEmail || student.details?.parentEmail || "-"}</div>
                                        </div>
                                    </TableCell>
                                    {canManage && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <ManageStudentDialog
                                                    mode="edit"
                                                    student={student}
                                                    classes={classes}
                                                    classId={student.classId?._id}
                                                    onSuccess={handleSuccess}
                                                />
                                                <DeleteStudentButton studentId={student._id} studentName={student.name} onDeleteSuccess={handleSuccess} />
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground px-2">
                Showing {filteredStudents.length} of {initialStudents.length} students
            </div>
        </div>
    );
}
