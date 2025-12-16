"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ExcelUploadProps {
    subjects: { name: string; totalMarks: number }[];
    students: { studentId: string; name: string; rollNo: string }[];
    onUpload: (data: any[]) => void;
}

export function ExcelMarksUpload({ subjects, students, onUpload }: ExcelUploadProps) {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        // Create template data
        const templateData = students.map(student => {
            const row: any = {
                "Roll No": student.rollNo,
                "Student Name": student.name,
                "Student ID": student.studentId, // Hidden column equivalent, key for mapping
            };
            subjects.forEach(sub => {
                row[sub.name] = ""; // Empty slot for marks
                row[`${sub.name} Remark`] = ""; // Empty slot for remarks
            });
            row["Class Teacher Remark"] = "";
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Entry");
        XLSX.writeFile(workbook, "Marks_Entry_Template.xlsx");
        toast.success("Template downloaded");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Validate and process data
                const processedData = data.map((row: any) => {
                    return row;
                });

                onUpload(processedData);
                setOpen(false);
                toast.success("Excel data loaded! Please review and save.");
            } catch (error) {
                console.error("Excel parse error:", error);
                toast.error("Failed to parse Excel file");
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Import form Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Marks from Excel</DialogTitle>
                    <DialogDescription>
                        Download the template, fill in the marks, and upload it back.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button onClick={handleDownloadTemplate} variant="secondary" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download Template
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or Upload</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Click to upload .xlsx file</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                            />
                        </label>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
