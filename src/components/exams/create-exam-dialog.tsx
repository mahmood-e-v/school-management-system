"use client";

import { useState } from "react";
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
import { createExam } from "@/lib/actions/exam";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, BookOpen, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CreateExamDialog({ classes }: { classes: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        name: "",
        academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1), // Default current-next
        startDate: "",
        endDate: "",
    });
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [subjects, setSubjects] = useState([{ name: "", totalMarks: 100 }]);

    function toggleClass(id: string) {
        setSelectedClassIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    }

    function addSubject() {
        setSubjects([...subjects, { name: "", totalMarks: 100 }]);
    }

    function removeSubject(index: number) {
        if (subjects.length > 1) {
            const newSubjects = [...subjects];
            newSubjects.splice(index, 1);
            setSubjects(newSubjects);
        }
    }

    function updateSubject(index: number, field: string, value: any) {
        const newSubjects = [...subjects];
        (newSubjects[index] as any)[field] = value;
        setSubjects(newSubjects);
    }

    async function handleSubmit() {
        if (!basicInfo.name || !basicInfo.academicYear || !basicInfo.startDate) {
            toast.error("Please fill in Basic Info (Name, Year, Start Date)");
            return;
        }
        if (selectedClassIds.length === 0) {
            toast.error("Please select at least one class");
            return;
        }
        if (subjects.some(s => !s.name || s.totalMarks <= 0)) {
            toast.error("Please ensure all subjects have names and valid marks");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("name", basicInfo.name);
        formData.append("academicYear", basicInfo.academicYear);
        formData.append("startDate", basicInfo.startDate);
        formData.append("endDate", basicInfo.endDate);
        formData.append("classIds", JSON.stringify(selectedClassIds));
        formData.append("subjects", JSON.stringify(subjects));

        const result = await createExam(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Exam created successfully");
            setOpen(false);
            // Reset
            setBasicInfo({
                name: "",
                academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
                startDate: "",
                endDate: ""
            });
            setSelectedClassIds([]);
            setSubjects([{ name: "", totalMarks: 100 }]);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Exam
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>
                        Set up a new examination for one or multiple classes.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">1. Basic Info</TabsTrigger>
                        <TabsTrigger value="classes">2. Classes ({selectedClassIds.length})</TabsTrigger>
                        <TabsTrigger value="subjects">3. Subjects ({subjects.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 py-4">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Exam Name *</Label>
                                    <Input
                                        placeholder="e.g. Mid Term"
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

                    <TabsContent value="classes" className="space-y-4 py-4">
                        <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {classes.map((cls) => (
                                    <div key={cls._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={cls._id}
                                            checked={selectedClassIds.includes(cls._id)}
                                            onCheckedChange={() => toggleClass(cls._id)}
                                        />
                                        <label
                                            htmlFor={cls._id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {cls.name} - {cls.division}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Select all classes that will take this exam.</p>
                    </TabsContent>

                    <TabsContent value="subjects" className="space-y-4 py-4">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="font-bold">Common Subjects</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                                <Plus className="w-3 h-3 mr-1" /> Add Subject
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {subjects.map((sub, index) => (
                                <div key={index} className="flex gap-2 items-end border p-2 rounded bg-muted/20">
                                    <div className="flex-1">
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                            value={sub.name}
                                            onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                            required
                                            placeholder="e.g. Math"
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="w-[100px]">
                                        <Label className="text-xs">Max Marks</Label>
                                        <Input
                                            type="number"
                                            value={sub.totalMarks}
                                            onChange={(e) => updateSubject(index, 'totalMarks', e.target.value)}
                                            required
                                            className="h-8"
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeSubject(index)} disabled={subjects.length === 1}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">These subjects will be assigned to all selected classes.</p>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                        {loading ? "Creating Exam..." : "Create Exam"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
