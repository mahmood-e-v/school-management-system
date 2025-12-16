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
import { uploadStudents } from "@/lib/actions/student";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function UploadStudentsDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await uploadStudents(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            const insertedCount = result.inserted || 0;
            const skippedList = result.skipped || [];

            let msg = `Successfully uploaded ${insertedCount} new students.`;

            if (skippedList.length > 0) {
                // Show a persistent warning for skipped duplicates
                toast.warning(`Skipped ${skippedList.length} existing students:`, {
                    description: skippedList.slice(0, 5).join(", ") + (skippedList.length > 5 ? ` and ${skippedList.length - 5} more` : ""),
                    duration: 8000, // Longer duration
                });
                msg += `\n(See warning for skipped list)`;
            }

            if (insertedCount > 0) {
                toast.success(msg);
            } else if (skippedList.length > 0) {
                // If only skipped, show info
                toast.info("No new students added. All were duplicates.");
            }

            if (result.errors && result.errors.length > 0) {
                toast.warning(`Total Errors: ${result.errors.length}. Check console for details.`);
                console.log("Upload errors:", result.errors);
            }

            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Students</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file (.xlsx) with columns: Name, RollNo, Class, Division.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-4">
                            <Label htmlFor="file">Excel File</Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept=".xlsx, .xls"
                                required
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Template Format:</p>
                            <ul className="list-disc pl-4 mt-1">
                                <li>Name</li>
                                <li>RollNo</li>
                                <li>Class (e.g. Grade 10)</li>
                                <li>Division (e.g. A)</li>
                                <li>Parent Name (Optional)</li>
                                <li>Parent ID (Optional)</li>
                                <li>Phone (Optional)</li>
                                <li>Transport (Bus/Car...)</li>
                                <li>Bus Number (Optional)</li>
                                <li>Parent Email (Optional)</li>
                                <li>Student Email (Optional)</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
