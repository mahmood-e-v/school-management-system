"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addGrade, deleteGrade } from "@/lib/actions/settings";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function GradesManagement({ initialGrades }: { initialGrades: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete(id: string) {
        if (confirm("Are you sure?")) {
            await deleteGrade(id);
            toast.success("Grade deleted");
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const res = await addGrade(formData);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Grade added");
            setOpen(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Grade</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add New Grade</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Grade Name</Label>
                                    <Input name="name" placeholder="A+" required />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input name="description" placeholder="Excellent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Min %</Label>
                                    <Input name="minPercentage" type="number" required />
                                </div>
                                <div>
                                    <Label>Max %</Label>
                                    <Input name="maxPercentage" type="number" required />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">Save Grade</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Grade</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialGrades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">No grades defined.</TableCell>
                            </TableRow>
                        ) : (
                            initialGrades.map((g) => (
                                <TableRow key={g._id}>
                                    <TableCell className="font-bold">{g.name}</TableCell>
                                    <TableCell>{g.minPercentage}% - {g.maxPercentage}%</TableCell>
                                    <TableCell>{g.description || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(g._id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
