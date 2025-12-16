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
import { editClass } from "@/lib/actions/class";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditClassDialogProps {
    classId: string;
    className: string;
    division: string;
    currentTeacher: string;
}

export function EditClassDialog({ classId, className, division, currentTeacher }: EditClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        formData.append("id", classId);

        const result = await editClass(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Class updated successfully");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                    <DialogDescription>
                        Update details for {className} - {division}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="classTeacher" className="text-right">
                                Teacher
                            </Label>
                            <Input
                                id="classTeacher"
                                name="classTeacher"
                                defaultValue={currentTeacher === "Not Assigned" ? "" : currentTeacher}
                                placeholder="Mr. Smith"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
