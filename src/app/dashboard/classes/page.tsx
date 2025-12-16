import { getClasses } from "@/lib/actions/class";
import { AddClassDialog } from "@/components/classes/add-class-dialog";
import { ViewStudentsDialog } from "@/components/classes/view-students-dialog";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import { UploadClassesDialog } from "@/components/classes/upload-classes-dialog";
import { DeleteClassButton } from "@/components/classes/delete-class-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School } from "lucide-react";
import { auth } from "@/auth";

export default async function ClassesPage() {
    const classes = await getClasses();
    const session = await auth();
    const canManageClasses = session?.user?.role === "admin" || session?.user?.permissions?.includes("manage_classes");
    const canManageStudents = session?.user?.role === "admin" || session?.user?.permissions?.includes("manage_students");

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Classes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create classes and view student lists</p>
                </div>
                {canManageClasses && (
                    <div className="flex gap-2">
                        <UploadClassesDialog />
                        <AddClassDialog />
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {classes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg text-muted-foreground">
                        <School className="h-12 w-12 mb-4 opacity-20" />
                        <p>No classes found. Add your first class!</p>
                    </div>
                ) : (
                    classes.map((cls: any) => (
                        <Card key={cls._id} className="relative overflow-hidden">
                            <CardHeader className="pb-2 bg-muted/20">
                                <CardTitle className="text-lg flex justify-between items-center">
                                    <span>{cls.name} <span className="text-sm font-normal text-muted-foreground">({cls.division})</span></span>
                                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                        {cls.studentCount} Students
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground mb-4">
                                    <div className="flex justify-between py-1 border-b border-border/50 items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs">Teacher:</span>
                                            <span className="font-medium text-foreground">{cls.classTeacher || "Not Assigned"}</span>
                                        </div>
                                        {canManageClasses && (
                                            <EditClassDialog
                                                classId={cls._id}
                                                className={cls.name}
                                                division={cls.division}
                                                currentTeacher={cls.classTeacher || ""}
                                            />
                                        )}
                                        {canManageClasses && (
                                            <DeleteClassButton
                                                classId={cls._id}
                                                className={`${cls.name}-${cls.division}`}
                                            />
                                        )}
                                    </div>
                                </div>
                                <ViewStudentsDialog
                                    classId={cls._id}
                                    className={cls.name}
                                    division={cls.division}
                                    canManageStudents={canManageStudents}
                                />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
