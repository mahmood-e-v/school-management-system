
import { getExamSheetDebug } from "@/lib/actions/result-debug";
import { MarksEntryTable } from "@/components/results/marks-entry-table";
import { ClassSelector } from "@/components/results/class-selector";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRemarksSafe } from "@/lib/actions/settings";
import { BackButton, HomeButton } from "@/components/ui/nav-buttons";

export default async function MarksEntryPage({ params, searchParams }: { params: { examId: string }, searchParams: { classId?: string } }) {
    const { examId } = await params;
    const { classId } = await searchParams;

    const data = await getExamSheetDebug(examId, classId);
    // Fetch generic remarks for the dropdown
    const remarksList = await getRemarksSafe();

    if (data.error) {
        return <div className="p-6 text-red-500">Error: {data.error}</div>;
    }

    if (data.requiresClassSelection) {
        return (
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <HomeButton />
                        <div>
                            <h1 className="text-2xl font-bold">Select Class for {data.exam.name}</h1>
                        </div>
                    </div>
                </div>
                <ClassSelector examId={examId} classes={data.availableClasses} />
            </div>
        );
    }

    if (!data.exam || !data.sheet) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <HomeButton />
                    <div>
                        <h1 className="text-2xl font-bold">{data.exam.name}</h1>
                        <p className="text-muted-foreground">Marks Entry</p>
                    </div>
                </div>
                <p className="text-muted-foreground">
                    Class: {data.exam.currentClassId?.name} {data.exam.currentClassId?.division} | Date: {new Date(data.exam.startDate).toLocaleDateString()}
                </p>
            </div>

            <MarksEntryTable
                exam={data.exam}
                sheet={data.sheet}
                subjects={data.exam.currentSubjects}
                remarksList={remarksList}
            />
        </div>
    );
}
