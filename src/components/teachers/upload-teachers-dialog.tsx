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
import { uploadTeachers } from "@/lib/actions/user";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function UploadTeachersDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<string[]>([]);

    // Explicitly re-set open state handling to clear errors
    function handleOpenChange(val: boolean) {
        setOpen(val);
        if (!val) setErrors([]);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await uploadTeachers(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            if (result.errors && result.errors.length > 0) {
                toast.warning(`Uploaded ${result.inserted} teachers with ${result.errors.length} errors.`);
                setErrors(result.errors);
            } else {
                toast.success(`Successfully uploaded ${result.inserted} teachers.`);
                setOpen(false);
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Teachers</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file (.xlsx) with columns: Name, Email.
                    </DialogDescription>
                </DialogHeader>

                {errors.length > 0 ? (
                    <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 text-sm">
                        <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                            ⚠️ Upload Issues ({errors.length})
                        </h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2">
                            {errors.map((err, i) => (
                                <p key={i} className="text-destructive-foreground border-b border-destructive/10 pb-1 last:border-0">{err}</p>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setErrors([])} className="mt-4 w-full">
                            Try Again
                        </Button>
                    </div>
                ) : (
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
                                    <li>Email</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
