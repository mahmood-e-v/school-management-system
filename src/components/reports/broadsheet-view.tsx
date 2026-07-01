"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface BroadsheetViewProps {
    reportData: any;
    examName: string;
    className: string;
    schoolSettings?: any;
}

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

export function BroadsheetView({ reportData, examName, className, schoolSettings }: BroadsheetViewProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const schoolInfo = schoolSettings || {
        name: "Madrasa Wadi Rahma",
        address: "Falaj Haza' Al Ain",
        logo: "https://placehold.co/80x80?text=Logo"
    };

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
        const exportData = reportData.map((d: any, idx: number) => {
            const row: any = {
                "S.No.": idx + 1,
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
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm print:hidden">
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

            <div className="rounded-md border bg-card overflow-hidden print-broadsheet" ref={componentRef}>
                {/* Scoped style for landscape print and fitting the width */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 10mm;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact;
                            background: white;
                        }
                        /* Container changes */
                        .print-broadsheet {
                            border: none !important;
                            box-shadow: none !important;
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                        .print-broadsheet .overflow-x-auto {
                            overflow: visible !important;
                        }
                        /* Table scaling */
                        .print-broadsheet table {
                            width: 100% !important;
                            table-layout: fixed !important; /* Forces columns to fit within 100% width */
                            border-collapse: collapse !important;
                        }
                        /* Table headers and cell styles for print */
                        .print-broadsheet th,
                        .print-broadsheet td {
                            font-size: 8px !important;
                            padding: 3px 2px !important;
                            border: 1px solid #000000 !important;
                            text-align: center !important;
                            word-wrap: break-word !important;
                            overflow: hidden !important;
                        }
                        /* Reset sticky styling during print */
                        .print-broadsheet th.sticky,
                        .print-broadsheet td.sticky {
                            position: static !important;
                            background: transparent !important;
                            box-shadow: none !important;
                            border-right: 1px solid #000000 !important;
                        }
                        /* Specific column alignments for print */
                        .print-broadsheet th.text-left,
                        .print-broadsheet td.text-left {
                            text-align: left !important;
                        }
                        .print-broadsheet .bg-muted\\/50 {
                            background-color: #f9fafb !important;
                        }
                        .print-broadsheet .bg-blue-50 {
                            background-color: #eff6ff !important;
                        }
                        .print-broadsheet .bg-blue-50\\/50 {
                            background-color: #f8fafc !important;
                        }
                    }
                `}} />

                <div className="p-4 hidden print:block mb-4 text-center">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        {schoolInfo.logo && <img src={schoolInfo.logo} alt="School Logo" className="h-16 w-16 object-contain" />}
                        <div className="text-left">
                            <h1 className="text-2xl font-bold uppercase">{schoolInfo.name}</h1>
                            <p className="text-sm font-medium">{schoolInfo.address}</p>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mt-2">{examName} - Marksheet</h2>
                    <p className="text-muted-foreground text-sm">Class: {className}</p>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[45px] text-center">S.No.</TableHead>
                                <TableHead className="w-[50px] text-center">Roll</TableHead>
                                <TableHead className="w-[120px] md:w-[200px] sticky left-0 bg-card z-10 shadow-sm border-r text-left">Name</TableHead>
                                {subjects.map((sub: string) => (
                                    <TableHead key={sub} className="min-w-[60px] md:min-w-[100px] text-center border-l bg-muted/50 text-[10px] md:text-xs">
                                        {sub}
                                    </TableHead>
                                ))}
                                <TableHead className="w-[60px] text-center font-bold border-l bg-blue-50">Total</TableHead>
                                <TableHead className="w-[50px] text-center font-bold bg-blue-50">%</TableHead>
                                <TableHead className="w-[50px] text-center font-bold bg-blue-50">Rank</TableHead>
                                <TableHead className="w-[70px] text-center font-bold bg-blue-50">Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((d: any, idx: number) => (
                                <TableRow key={d.student._id}>
                                    <TableCell className="text-center">{idx + 1}</TableCell>
                                    <TableCell className="text-center">{d.student.rollNo}</TableCell>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10 shadow-sm border-r text-left text-xs md:text-sm">{d.student.name}</TableCell>
                                    {subjects.map((sub: string) => {
                                        const res = d.results.find((r: any) => r.subject === sub);
                                        return (
                                            <TableCell key={sub} className="text-center border-l bg-accent/5">
                                                {res ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-xs md:text-sm ${res.isFail ? 'text-red-600 underline decoration-black decoration-2' : ''}`}>{res.obtained}</span>
                                                        <span className="text-[9px] md:text-[10px] text-muted-foreground">{res.grade}</span>
                                                    </div>
                                                ) : "-"}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-bold border-l bg-blue-50/50">{d.summary.totalObtained}</TableCell>
                                    <TableCell className="text-center font-bold bg-blue-50/50">{d.summary.percentage}%</TableCell>
                                    <TableCell className="text-center font-bold bg-blue-50/50">{d.summary.rank || "-"}</TableCell>
                                    <TableCell className={`text-center font-bold bg-blue-50/50 text-xs md:text-sm ${d.summary.result === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                                        {d.summary.result}
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
