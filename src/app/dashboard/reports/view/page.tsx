import { getReportData } from "@/lib/actions/report";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";

// This page will be loaded in the main window.
// We can add a "Print" button that triggers window.print()

export default async function ReportViewPage({ searchParams }: { searchParams: { examId: string } }) {
    const { examId } = await searchParams;
    // We need to fetch exam to get classId to fetch students...
    // getReportData handles it.
    // But wait, getReportData needs classId? 
    // In my implementation `getReportData(examId, classId)`.
    // I should get classId from examId inside `getReportData`.
    // Let's refactor `getReportData` to find class from exam.

    // Actually, I can fix `getReportData` to assume ClassId from Exam.
    // Or fetch Exam first here.

    // Let's fix `getReportData` in `src/lib/actions/report.ts` to NOT require classId, but derive it.

    // I will call `getReportData` with just examId in a fix step.
    // For now let's assume I fix it. 

    // Wait, I already wrote `getReportData`. I need to start a NEW tool call to fix it if I want.
    // In the file I wrote: 
    // `export async function getReportData(examId: string, classId: string)`
    // It uses `StudentModel.find({ classId })`.

    // I should pass classId or fix the function!
    // I will fix the function in the NEXT Step.

    // For now, I will write this page assuming I will fix logic.
    // Or I can fetch exam here and pass classId.
    // I'll fetch exam here.

    const exam = await (await import("@/models/Exam")).default.findById(examId);
    // Need dbConnect?
    await (await import("@/lib/db")).default();

    if (!exam) return <div>Exam not found</div>;

    const data = await getReportData(examId, exam.classId.toString());

    if (data.error || !data.reports) return <div>Error: {data.error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8 print:hidden flex justify-between container mx-auto decoration-clone">
                <h1 className="text-2xl font-bold">Report Preview</h1>
                <Button onClick={() => { }}>Press Ctrl+P to Print / Save as PDF</Button>
                {/* We can add a client component for the print button or just tell user */}
            </div>

            <div className="container mx-auto">
                {data.reports.map((report: any) => (
                    <ReportCard
                        key={report.student._id}
                        data={report}
                        schoolName={data.schoolName}
                        examName={data.examName}
                        examDate={data.date}
                    />
                ))}
            </div>
        </div>
    );
}
