import { getStudents } from "@/lib/actions/student";
import { getClasses } from "@/lib/actions/class";
import { UploadStudentsDialog } from "@/components/students/upload-students-dialog";
import { StudentsTable } from "@/components/students/students-table";
import { ManageStudentDialog } from "@/components/students/manage-student-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";

export default async function StudentsPage() {
    const students = await getStudents();
    const classes = await getClasses();
    const session = await auth();
    const canManage = session?.user?.role === "admin" || session?.user?.permissions?.includes("manage_students");

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Students</h1>
                    <p className="text-sm text-muted-foreground">View and manage all students across classes</p>
                </div>
                <div className="flex gap-2">
                    {canManage && <ManageStudentDialog mode="add" classes={classes} />}
                    {canManage && <UploadStudentsDialog />}
                </div>
            </div>

            <StudentsTable
                initialStudents={students}
                classes={classes}
                canManage={!!canManage}
            />
        </div>
    );
}
