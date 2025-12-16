"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteClass } from "@/lib/actions/class";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteClassButtonProps {
    classId: string;
    className: string;
}

export function DeleteClassButton({ classId, className }: DeleteClassButtonProps) {
    const [open, setOpen] = useState(false);

    async function handleDelete() {
        const res = await deleteClass(classId);
        if (res.success) {
            toast.success("Class deleted");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to delete class");
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {className}? This action cannot be undone.
                        You cannot delete a class that has students.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
