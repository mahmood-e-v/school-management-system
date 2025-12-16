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
import { uploadClasses } from "@/lib/actions/class";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function UploadClassesDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        const result = await uploadClasses(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            const message = `Added ${result.inserted} classes. Updated ${result.updated || 0} classes.`;
            if (result.errors && result.errors.length > 0) {
                // Show partial success/warning
                toast.warning(`${message} ${result.errors.length} skipped.`);
                console.log("Upload errors:", result.errors);
            } else {
                toast.success(message);
            }
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-2">
                    <Upload className="mr-2 h-4 w-4" /> Upload Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Classes</DialogTitle>
                    <DialogDescription>
                        Upload Excel (.xlsx) with columns: <b>Name</b>, <b>Division</b>, <b>Teacher</b> (optional).
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
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            <p className="font-semibold mb-1">Example Format:</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>Name</div><div>Division</div><div>Teacher</div>
                                <div>Grade 10</div><div>A</div><div>Mr. Smith</div>
                                <div>Grade 10</div><div>B</div><div>Mrs. Jones</div>
                            </div>
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
