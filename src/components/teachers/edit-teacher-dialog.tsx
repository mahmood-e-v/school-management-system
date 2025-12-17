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
import { updateUser } from "@/lib/actions/user";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditTeacherDialogProps {
    teacher: {
        _id: string;
        name: string;
        email: string;
        role: string;
        permissions?: string[];
    };
}

export function EditTeacherDialog({ teacher }: EditTeacherDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        formData.append("id", teacher._id);

        const result = await updateUser(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Teacher updated successfully");
            setOpen(false);
        }
    }

    const permissions = teacher.permissions || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Teacher</DialogTitle>
                    <DialogDescription>
                        Update teacher details and permissions.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-4">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={teacher.name}
                                required
                            />
                        </div>
                        <div className="grid items-center gap-4">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={teacher.email}
                                required
                            />
                        </div>

                        <div className="grid items-center gap-4">
                            <Label htmlFor="password">Change Password (Optional)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <div className="grid items-center gap-4">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                name="role"
                                defaultValue={teacher.role}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                                <option value="student">Student</option>
                                <option value="parent">Parent</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit_manage_classes"
                                        name="permissions"
                                        value="manage_classes"
                                        defaultChecked={permissions.includes("manage_classes")}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="edit_manage_classes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Manage Classes
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit_manage_students"
                                        name="permissions"
                                        value="manage_students"
                                        defaultChecked={permissions.includes("manage_students")}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="edit_manage_students" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Manage Students
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit_take_attendance"
                                        name="permissions"
                                        value="take_attendance"
                                        defaultChecked={permissions.includes("take_attendance")}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="edit_take_attendance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Take Attendance
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
