import { EditTeacherDialog } from "@/components/teachers/edit-teacher-dialog";
import { getTeachers } from "@/lib/actions/user";
import { UploadTeachersDialog } from "@/components/teachers/upload-teachers-dialog";
import { AddTeacherDialog } from "@/components/teachers/add-teacher-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TeachersPage() {
    const session = await auth();

    if (session?.user?.role !== "admin") {
        redirect("/dashboard");
    }

    const teachers = await getTeachers();

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Teachers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create accounts for staff members</p>
                </div>
                <div className="flex gap-2">
                    <UploadTeachersDialog />
                    <AddTeacherDialog />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No teachers found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map((teacher: any) => (
                                    <TableRow key={teacher._id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            {teacher.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3 w-3" /> {teacher.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <ShieldCheck className="h-3 w-3 text-green-600" />
                                                <span className="capitalize">{teacher.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            <EditTeacherDialog teacher={teacher} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
