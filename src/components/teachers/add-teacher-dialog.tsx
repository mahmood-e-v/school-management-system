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
import { createUser } from "@/lib/actions/user";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";

export function AddTeacherDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        formData.append("role", "teacher");

        const result = await createUser(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Teacher account created successfully");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Teacher
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Teacher</DialogTitle>
                    <DialogDescription>
                        Create a login account for a teacher.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-4">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Jane Doe"
                                required
                            />
                        </div>
                        <div className="grid items-center gap-4">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@school.com"
                                required
                            />
                        </div>
                        <div className="grid items-center gap-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="******"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="manage_classes" name="permissions" value="manage_classes" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <label htmlFor="manage_classes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Manage Classes (Create, Edit, Delete)
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="manage_students" name="permissions" value="manage_students" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <label htmlFor="manage_students" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Manage Students (Add, Edit, Delete)
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="take_attendance" name="permissions" value="take_attendance" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <label htmlFor="take_attendance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Take Attendance
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
