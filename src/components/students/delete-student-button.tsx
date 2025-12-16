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
import { deleteStudent } from "@/lib/actions/student";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteStudentButtonProps {
    studentId: string;
    studentName: string;
    onDeleteSuccess?: () => void;
}

export function DeleteStudentButton({ studentId, studentName, onDeleteSuccess }: DeleteStudentButtonProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        const res = await deleteStudent(studentId);
        if (res.success) {
            toast.success("Student deleted");
            setOpen(false);
            if (onDeleteSuccess) {
                onDeleteSuccess();
            } else {
                router.refresh();
            }
        } else {
            toast.error(res.error || "Failed to delete student");
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
                    <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {studentName}? This action cannot be undone.
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
