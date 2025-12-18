"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { updateExam } from "@/lib/actions/exam";
import { toast } from "sonner";
import { Edit2, Trash2, Calendar, BookOpen, Users, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditExamDialog({ exam, classes }: { exam: any, classes: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Helper: Get unique grades from all system classes
    const gradesWithDivisions = classes.reduce((acc: any, cls: any) => {
        if (!acc[cls.name]) {
            acc[cls.name] = [];
        }
        acc[cls.name].push(cls.division);
        return acc;
    }, {});

    const uniqueGradeNames = Object.keys(gradesWithDivisions).sort();

    // 1. Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        name: exam.name || "",
        academicYear: exam.academicYear || "",
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().split('T')[0] : "",
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().split('T')[0] : "",
    });

    // 2. Subject Pool State - Unique subjects from all classes in this exam
    const [subjectPool, setSubjectPool] = useState<any[]>([]);

    // 3. Grade Selection & Assignment State
    const [assignment, setAssignment] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            // Re-initialize when dialog opens
            setBasicInfo({
                name: exam.name || "",
                academicYear: exam.academicYear || "",
                startDate: exam.startDate ? new Date(exam.startDate).toISOString().split('T')[0] : "",
                endDate: exam.endDate ? new Date(exam.endDate).toISOString().split('T')[0] : "",
            });

            // Reconstruct Subject Pool & Assignments
            const pool: any[] = [];
            const gradeMap: Record<string, any> = {};

            exam.classes?.forEach((c: any) => {
                const gradeName = c.classId?.name || "Unknown";
                if (!gradeMap[gradeName]) {
                    gradeMap[gradeName] = {
                        gradeName,
                        subjects: c.subjects.map((s: any) => ({ name: s.name, totalMarks: s.totalMarks }))
                    };
                }

                // Add to pool if not exists
                c.subjects.forEach((s: any) => {
                    if (!pool.find(p => p.name === s.name)) {
                        pool.push({ name: s.name, totalMarks: s.totalMarks });
                    }
                });
            });

            setSubjectPool(pool.length > 0 ? pool : [{ name: "", totalMarks: 100 }]);
            setAssignment(Object.values(gradeMap));
        }
    }, [open, exam]);

    function addPoolSubject() {
        setSubjectPool([...subjectPool, { name: "", totalMarks: 100 }]);
    }

    function removePoolSubject(index: number) {
        if (subjectPool.length > 1) {
            const newPool = [...subjectPool];
            newPool.splice(index, 1);
            setSubjectPool(newPool);
        }
    }

    function updatePoolSubject(index: number, field: string, value: any) {
        const newPool = [...subjectPool];
        (newPool[index] as any)[field] = value;
        setSubjectPool(newPool);
    }

    function toggleGrade(gradeName: string) {
        setAssignment(prev => {
            const existing = prev.find(a => a.gradeName === gradeName);
            if (existing) {
                return prev.filter(a => a.gradeName !== gradeName);
            } else {
                const validPoolSubjects = subjectPool.filter(s => s.name.trim() !== "");
                return [...prev, {
                    gradeName: gradeName,
                    divisions: gradesWithDivisions[gradeName],
                    subjects: validPoolSubjects.map(s => ({ ...s }))
                }];
            }
        });
    }

    function toggleSubjectForGrade(gradeIndex: number, poolSubject: any) {
        const newAssignment = [...assignment];
        const currentSubjects = newAssignment[gradeIndex].subjects;
        const exists = currentSubjects.find((s: any) => s.name === poolSubject.name);

        if (exists) {
            newAssignment[gradeIndex].subjects = currentSubjects.filter((s: any) => s.name !== poolSubject.name);
        } else {
            newAssignment[gradeIndex].subjects = [...currentSubjects, { ...poolSubject }];
        }
        setAssignment(newAssignment);
    }

    async function handleSubmit() {
        if (!basicInfo.name || !basicInfo.academicYear || !basicInfo.startDate) {
            toast.error("Please fill in Basic Info");
            return;
        }
        if (assignment.length === 0) {
            toast.error("Please select at least one grade");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("name", basicInfo.name);
        formData.append("academicYear", basicInfo.academicYear);
        formData.append("startDate", basicInfo.startDate);
        formData.append("endDate", basicInfo.endDate);

        const gradeAssignments = assignment.map(a => ({
            gradeName: a.gradeName,
            subjects: a.subjects
        }));
        formData.append("gradeAssignments", JSON.stringify(gradeAssignments));

        const result = await updateExam(exam._id, formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Exam updated successfully");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Exam: {exam.name}</DialogTitle>
                    <DialogDescription>
                        Modify examination details and subject assignments.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">1. Details</TabsTrigger>
                        <TabsTrigger value="pool">2. Subject Pool</TabsTrigger>
                        <TabsTrigger value="assign">3. Set per Grade</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 py-4">
                        <div className="grid gap-4 border p-4 rounded-lg bg-muted/10 shadow-inner">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Exam Name *</Label>
                                    <Input
                                        placeholder="e.g. Mid-Term 2024"
                                        value={basicInfo.name}
                                        onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic Year *</Label>
                                    <Input
                                        placeholder="e.g. 2024-2025"
                                        value={basicInfo.academicYear}
                                        onChange={e => setBasicInfo({ ...basicInfo, academicYear: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={basicInfo.startDate}
                                        onChange={e => setBasicInfo({ ...basicInfo, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <Input
                                        type="date"
                                        value={basicInfo.endDate}
                                        onChange={e => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="pool" className="space-y-4 py-4">
                        <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-2">
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900">Define Master Subject List</h4>
                                <p className="text-xs text-blue-700">Add all subjects that will be used in this exam across any grade.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addPoolSubject} className="bg-white">
                                <Plus className="w-3 h-3 mr-1" /> Add Subject
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {subjectPool.map((sub, index) => (
                                <div key={index} className="flex gap-2 items-end border p-2 rounded bg-card shadow-sm">
                                    <div className="flex-1">
                                        <Label className="text-xs font-medium text-muted-foreground mr-1">Subject Name</Label>
                                        <Input
                                            value={sub.name}
                                            onChange={(e) => updatePoolSubject(index, 'name', e.target.value)}
                                            placeholder="e.g. Mathematics"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="w-[120px]">
                                        <Label className="text-xs font-medium text-muted-foreground mr-1">Max Marks</Label>
                                        <Input
                                            type="number"
                                            value={sub.totalMarks}
                                            onChange={(e) => updatePoolSubject(index, 'totalMarks', e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => removePoolSubject(index)} disabled={subjectPool.length === 1}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="assign" className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Users className="w-4 h-4" /> Select Grades
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-3 rounded-lg overflow-y-auto max-h-[150px] bg-muted/5">
                                {uniqueGradeNames.map((gradeName) => (
                                    <div key={gradeName} className="flex items-center space-x-2 p-1">
                                        <Checkbox
                                            id={`edit-grade-${gradeName}`}
                                            checked={assignment.some(a => a.gradeName === gradeName)}
                                            onCheckedChange={() => toggleGrade(gradeName)}
                                        />
                                        <label htmlFor={`edit-grade-${gradeName}`} className="text-xs font-medium cursor-pointer">
                                            {gradeName}
                                            <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                                                ({gradesWithDivisions[gradeName].join(",")})
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold flex items-center gap-2 text-primary">
                                <BookOpen className="w-4 h-4" /> Subjects for {assignment.length} selected grades
                            </Label>
                            <div className="space-y-4">
                                {assignment.length === 0 ? (
                                    <p className="text-sm text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                        Select grades above to assign subjects.
                                    </p>
                                ) : (
                                    assignment.map((a, idx) => (
                                        <div key={a.gradeName} className="border rounded-lg overflow-hidden shadow-sm">
                                            <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b">
                                                <h5 className="font-bold text-sm text-slate-800">{a.gradeName}</h5>
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {a.subjects.length} Subjects
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white">
                                                <div className="flex flex-wrap gap-2">
                                                    {subjectPool.filter(ps => ps.name.trim() !== "").map((ps, pi) => {
                                                        const isActive = a.subjects.some((s: any) => s.name === ps.name);
                                                        return (
                                                            <button
                                                                key={pi}
                                                                type="button"
                                                                onClick={() => toggleSubjectForGrade(idx, ps)}
                                                                className={`px-3 py-1.5 rounded-md text-xs border transition-all flex items-center gap-1.5 ${isActive
                                                                        ? "bg-slate-800 text-white border-slate-800 font-medium"
                                                                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                                                    }`}
                                                            >
                                                                {isActive && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                                                                {ps.name}
                                                                <span className="opacity-70 ml-1">({ps.totalMarks})</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6 border-t pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="min-w-[150px]">
                        {loading ? "Updating..." : "Update Exam"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
