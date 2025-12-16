"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function ReportSelector({ exams, classes }: any) {
    const router = useRouter();
    const [examId, setExamId] = useState("");
    const [classId, setClassId] = useState("");

    // Filter exams by class if class selected? 
    // Or just show all. Better to filter.
    // Actually, Exams are linked to Class. 
    // If we select Exam, we know the Class.
    // So we just need to select Exam.

    // Wait, if we want to print reports, we usually do it per exam.
    // And exam belongs to a class.
    // So just selecting Exam is enough.

    function handleGenerate() {
        if (examId) {
            router.push(`/dashboard/reports/view?examId=${examId}`);
        }
    }

    return (
        <div className="flex items-end gap-4">
            <div className="w-[300px]">
                <Label>Select Exam</Label>
                <Select onValueChange={setExamId} value={examId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an Exam" />
                    </SelectTrigger>
                    <SelectContent>
                        {exams.map((exam: any) => (
                            <SelectItem key={exam._id} value={exam._id}>
                                {exam.name} ({exam.classId?.name} {exam.classId?.division})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleGenerate} disabled={!examId}>Generate Reports</Button>
        </div>
    );
}
