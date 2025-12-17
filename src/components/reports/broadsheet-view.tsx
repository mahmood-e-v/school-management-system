"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface BroadsheetViewProps {
    reportData: any;
    examName: string;
    className: string;
}

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

export function BroadsheetView({ reportData, examName, className }: BroadsheetViewProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${examName}_${className}_Marksheet`,
    });

    // Extract unique subjects from the first student's result
    // (Assuming all students have same subjects, or we find unique union)
    const subjects = reportData.length > 0 ? reportData[0].results.map((r: any) => r.subject) : [];

    const handleExport = () => {
        const wb = XLSX.utils.book_new();

        // Prepare data for export
        const exportData = reportData.map((d: any) => {
            const row: any = {
                "Roll No": d.student.rollNo,
                "Name": d.student.name,
                "Admission No": d.student.admissionNo,
            };

            // Add subject marks
            d.results.forEach((r: any) => {
                row[r.subject] = r.obtained; // Mark
                row[`${r.subject} Grade`] = r.grade; // Grade
            });

            // Add Summary
            row["Total Obtained"] = d.summary.totalObtained;
            row["Max Total"] = d.summary.maxTotal;
            row["Percentage"] = d.summary.percentage;
            row["Grade"] = d.summary.grade;
            row["Result"] = d.summary.result;
            row["Rank"] = d.summary.rank || "-";

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Marksheet");
        XLSX.writeFile(wb, `${examName}_${className}_Marksheet.xlsx`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold">Class Marksheet (Broadsheet)</h2>
                    <p className="text-sm text-muted-foreground">{examName} - {className}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handlePrint()}>
                        <Printer className="mr-2 h-4 w-4" /> Print / PDF
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden" ref={componentRef}>
                <div className="p-4 hidden print:block mb-4">
                    <h1 className="text-2xl font-bold text-center">SCHOOL NAME HERE</h1>
                    <h2 className="text-xl font-semibold text-center mt-2">{examName} - Marksheet</h2>
                    <p className="text-center text-muted-foreground">Class: {className}</p>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Roll</TableHead>
                                <TableHead className="w-[200px] sticky left-0 bg-card z-10 shadow-sm border-r">Name</TableHead>
                                {subjects.map((sub: string) => (
                                    <TableHead key={sub} className="min-w-[100px] text-center border-l bg-muted/50">
                                        {sub}
                                    </TableHead>
                                ))}
                                <TableHead className="text-center font-bold border-l bg-blue-50">Total</TableHead>
                                <TableHead className="text-center font-bold bg-blue-50">%</TableHead>
                                <TableHead className="text-center font-bold bg-blue-50">Rank</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((d: any) => (
                                <TableRow key={d.student._id}>
                                    <TableCell>{d.student.rollNo}</TableCell>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10 shadow-sm border-r">{d.student.name}</TableCell>
                                    {subjects.map((sub: string) => {
                                        const res = d.results.find((r: any) => r.subject === sub);
                                        return (
                                            <TableCell key={sub} className="text-center border-l bg-accent/5">
                                                {res ? (
                                                    <div className="flex flex-col items-center">
                                                        <span>{res.obtained}</span>
                                                        <span className="text-[10px] text-muted-foreground">{res.grade}</span>
                                                    </div>
                                                ) : "-"}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-bold border-l bg-blue-50/50">{d.summary.totalObtained}</TableCell>
                                    <TableCell className="text-center font-bold bg-blue-50/50">{d.summary.percentage}%</TableCell>
                                    <TableCell className="text-center font-bold bg-blue-50/50">{d.summary.rank || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
