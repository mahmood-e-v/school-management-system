"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { saveExamMarks } from "@/lib/actions/result";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageSquare } from "lucide-react";
import { ExcelMarksUpload } from "@/components/results/excel-marks-upload";
import { Loader2, Save } from "lucide-react"; // Added for the new button

interface MarksEntryTableProps {
    exam: any;
    sheet: any[];
    subjects: any[];
    remarksList: any[];
}

export function MarksEntryTable({ exam, sheet, subjects, remarksList }: MarksEntryTableProps) {
    const [saving, setSaving] = useState(false);
    // Initialize marks, remarks, and classRemarks states from the sheet prop
    const initialMarks = sheet.reduce((acc, student) => {
        acc[student.studentId] = subjects.reduce((subAcc, sub) => {
            if (student.marks[sub.name]?.obtained !== undefined) {
                subAcc[sub.name] = student.marks[sub.name].obtained;
            }
            return subAcc;
        }, {});
        return acc;
    }, {});

    const initialRemarks = sheet.reduce((acc, student) => {
        acc[student.studentId] = subjects.reduce((subAcc, sub) => {
            if (student.marks[sub.name]?.remarks !== undefined) {
                subAcc[sub.name] = student.marks[sub.name].remarks;
            }
            return subAcc;
        }, {});
        return acc;
    }, {});

    const initialClassRemarks = sheet.reduce((acc, student) => {
        if (student.classTeacherRemark !== undefined) {
            acc[student.studentId] = student.classTeacherRemark;
        }
        return acc;
    }, {});

    const [marks, setMarks] = useState<Record<string, Record<string, number>>>(initialMarks);
    const [remarks, setRemarks] = useState<Record<string, Record<string, string>>>(initialRemarks);
    const [classRemarks, setClassRemarks] = useState<Record<string, string>>(initialClassRemarks);


    // Helper to get subject remark (assuming stored in nested object or just handle form submission)
    // The sheet passes marks[subject] = { obtained: number, remarks: string }

    // Function to handle Excel data import
    const handleExcelUpload = (data: any[]) => {
        const newMarks = { ...marks };
        const newRemarks = { ...remarks };
        const newClassRemarks = { ...classRemarks };

        data.forEach((row) => {
            const studentId = row["Student ID"];
            if (!studentId) return;

            // Update Class Remark
            if (row["Class Teacher Remark"]) {
                newClassRemarks[studentId] = row["Class Teacher Remark"];
            }

            // Update Subject Marks and Remarks
            subjects.forEach((sub) => {
                const markVal = row[sub.name];
                const remarkVal = row[`${sub.name} Remark`];

                if (markVal !== undefined && markVal !== "") {
                    if (!newMarks[studentId]) newMarks[studentId] = {};
                    newMarks[studentId][sub.name] = markVal;
                }

                if (remarkVal !== undefined && remarkVal !== "") {
                    if (!newRemarks[studentId]) newRemarks[studentId] = {};
                    if (!newRemarks[studentId][sub.name]) newRemarks[studentId][sub.name] = ""; // Init if needed
                    newRemarks[studentId][sub.name] = remarkVal;
                }
            });
        });

        setMarks(newMarks);
        setRemarks(newRemarks);
        setClassRemarks(newClassRemarks);
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Manually trigger the submit logic or just call handleSave
        handleSubmit2();
    };

    // We need a version of handleSubmit that doesn't expect a form event because we are moving the button outside or changing interaction
    async function handleSubmit2() {
        setSaving(true);
        const formData = new FormData();

        // Append list of student IDs
        const studentIds = sheet.map(s => s.studentId);
        formData.append("studentIds", JSON.stringify(studentIds));

        // Append marks and remarks from state
        studentIds.forEach(studentId => {
            // Subject marks and remarks
            subjects.forEach(sub => {
                const mark = marks[studentId]?.[sub.name];
                if (mark !== undefined) {
                    formData.append(`marks-${studentId}-${sub.name}`, String(mark));
                }
                const remark = remarks[studentId]?.[sub.name];
                if (remark !== undefined) {
                    formData.append(`remark-${studentId}-${sub.name}`, remark);
                }
            });
            // Class teacher remark
            const classRemark = classRemarks[studentId];
            if (classRemark !== undefined) {
                formData.append(`classRemark-${studentId}`, classRemark);
            }
        });

        // We pass the currentClassId to the server action
        // exam.currentClassId is an object here because of populate in getExamSheetSafe
        const classIdStr = typeof exam.currentClassId === 'string' ? exam.currentClassId : exam.currentClassId._id;
        const result = await saveExamMarks(exam._id, classIdStr, formData);
        setSaving(false);

        if (result.success) {
            toast.success("Marks saved successfully");
        } else {
            toast.error(result.error);
        }
    }


    return (
        <div className="space-y-4 pb-10">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">Marks Entry Sheet</h2>
                    <p className="text-sm text-muted-foreground">
                        {exam.name} - {exam.currentClassId?.name} {exam.currentClassId?.division}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExcelMarksUpload
                        subjects={subjects}
                        students={sheet.map(s => ({ studentId: s.studentId, name: s.name, rollNo: s.rollNo }))}
                        onUpload={handleExcelUpload}
                    />
                    <Button onClick={handleSaveClick} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Marks
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Roll</TableHead>
                                <TableHead className="w-[200px] sticky left-0 bg-card z-10 shadow-sm border-r">Name</TableHead>
                                {subjects.map((sub: any) => (
                                    <TableHead key={sub._id} className="min-w-[140px] text-center border-l">
                                        <div className="font-semibold">{sub.name}</div>
                                        <div className="text-xs text-muted-foreground">Max: {sub.totalMarks}</div>
                                    </TableHead>
                                ))}
                                <TableHead className="min-w-[200px] border-l">Class Teacher Remark</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sheet.map((student) => (
                                <TableRow key={student.studentId}>
                                    <TableCell>{student.rollNo}</TableCell>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10 shadow-sm border-r">
                                        {student.name}
                                    </TableCell>
                                    {subjects.map((sub: any) => {
                                        const currentMark = marks[student.studentId]?.[sub.name] ?? "";
                                        const currentRemark = remarks[student.studentId]?.[sub.name] ?? "";

                                        return (
                                            <TableCell key={sub._id} className="border-l bg-accent/5 p-2">
                                                <div className="flex items-center gap-1 justify-center">
                                                    <Input
                                                        type="number"
                                                        value={currentMark}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setMarks(prev => ({
                                                                ...prev,
                                                                [student.studentId]: {
                                                                    ...prev[student.studentId],
                                                                    [sub.name]: Number(val)
                                                                }
                                                            }));
                                                        }}
                                                        min={0}
                                                        max={sub.totalMarks}
                                                        className="w-16 text-right h-8"
                                                        placeholder="-"
                                                    />
                                                    {/* Subject Remark Popover */}
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`h-8 w-8 ${currentRemark ? 'text-blue-600 bg-blue-50' : 'text-muted-foreground'}`}
                                                                type="button"
                                                                tabIndex={-1}
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-2">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-xs">Remark for {sub.name}</h4>
                                                                <Select
                                                                    value={currentRemark || " "}
                                                                    onValueChange={(val) => {
                                                                        setRemarks(prev => ({
                                                                            ...prev,
                                                                            [student.studentId]: {
                                                                                ...prev[student.studentId],
                                                                                [sub.name]: val === " " ? "" : val
                                                                            }
                                                                        }));
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8">
                                                                        <SelectValue placeholder="Select..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value=" ">None</SelectItem>
                                                                        {remarksList.filter(r => r.type === 'Subject' || r.type === 'General').map(r => (
                                                                            <SelectItem key={r._id} value={r.text}>{r.text}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {/* Custom remark input could go here */}
                                                                <Input
                                                                    placeholder="Custom remark..."
                                                                    className="h-7 text-xs"
                                                                    value={currentRemark && !remarksList.find(r => r.text === currentRemark) ? currentRemark : ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setRemarks(prev => ({
                                                                            ...prev,
                                                                            [student.studentId]: {
                                                                                ...prev[student.studentId],
                                                                                [sub.name]: val
                                                                            }
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="border-l p-2">
                                        <Select
                                            value={classRemarks[student.studentId] || " "}
                                            onValueChange={(val) => {
                                                setClassRemarks(prev => ({
                                                    ...prev,
                                                    [student.studentId]: val === " " ? "" : val
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-full min-w-[150px]">
                                                <SelectValue placeholder="Select remark..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=" ">None</SelectItem>
                                                {remarksList.filter(r => r.type === 'ClassTeacher' || r.type === 'General').map(r => (
                                                    <SelectItem key={r._id} value={r.text}>{r.text}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
