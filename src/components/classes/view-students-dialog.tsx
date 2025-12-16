"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, Download, Trash2, Plus } from "lucide-react";
import { getStudents, deleteStudent } from "@/lib/actions/student";
import { ManageStudentDialog } from "@/components/students/manage-student-dialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";


interface ViewStudentsDialogProps {
    classId: string;
    className: string;
    division: string;
    canManageStudents?: boolean;
}

export function ViewStudentsDialog({ classId, className, division, canManageStudents }: ViewStudentsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetchStudents();
        }
    }, [open]);

    async function fetchStudents() {
        setLoading(true);
        const data = await getStudents(classId);
        setStudents(data);
        setLoading(false);
    }

    function downloadExcel() {
        const sheetData = students.map(s => ({
            "Roll No": s.rollNo,
            "Name": s.name,
            "Class": className,
            "Division": division,
            "Parent Name": s.parentName || "",
            "Phone Number": s.parentPhone || "",
            "Parent ID": s.parentCustomId || "",
            "Parent Email": s.parentEmail || s.details?.parentEmail || "",
            "Student Email": s.studentEmail || "",
            "Location": s.location || "",
            "Transport": s.transportMode || "",
            "Bus Number": s.busNumber || ""
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, `${className}-${division}-Students.xlsx`);
    }

    async function handleDelete(id: string) {
        const res = await deleteStudent(id);
        if (res.success) {
            toast.success("Student deleted");
            fetchStudents();
        } else {
            toast.error("Failed to delete");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start mt-2">
                    <Users className="mr-2 h-4 w-4" /> View Students
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-8">
                        <div>
                            <DialogTitle>Students in {className} - {division}</DialogTitle>
                            <DialogDescription>
                                Total Students: {students.length}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={downloadExcel} disabled={students.length === 0}>
                                <Download className="mr-2 h-4 w-4" /> Export Excel
                            </Button>
                            {canManageStudents && (
                                <ManageStudentDialog
                                    mode="add"
                                    classId={classId}
                                    onSuccess={fetchStudents}
                                />
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No students found in this class.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Roll No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Parent Info</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Transport</TableHead>
                                    {canManageStudents && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-xs text-muted-foreground">ID: {student.parentCustomId || "-"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{student.parentName || "-"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">{student.parentPhone || "-"}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{student.details?.parentEmail}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{student.transportMode}</div>
                                            <div className="text-xs text-muted-foreground">{student.location}</div>
                                        </TableCell>
                                        {canManageStudents && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <ManageStudentDialog
                                                        mode="edit"
                                                        student={student}
                                                        classId={classId}
                                                        onSuccess={fetchStudents}
                                                    />

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete {student.name}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(student._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
