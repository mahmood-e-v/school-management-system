import { getClasses } from "@/lib/actions/class";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { AttendanceReports } from "@/components/attendance/attendance-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/auth";
import { DashboardNavButtons } from "@/components/common/dashboard-nav-buttons";

export default async function AttendancePage() {
    const classes = await getClasses();
    const session = await auth();
    const canTakeAttendance = session?.user?.role === "admin" || session?.user?.permissions?.includes("take_attendance");

    return (
        <div className="p-6 space-y-6">
            <DashboardNavButtons />
            <h1 className="text-2xl font-bold">Attendance Management</h1>

            <Tabs defaultValue={canTakeAttendance ? "mark" : "reports"}>
                <TabsList>
                    {canTakeAttendance && <TabsTrigger value="mark">Mark Attendance</TabsTrigger>}
                    <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
                </TabsList>
                {canTakeAttendance && (
                    <TabsContent value="mark" className="mt-4">
                        <AttendanceForm classes={classes} />
                    </TabsContent>
                )}
                <TabsContent value="reports" className="mt-4">
                    <AttendanceReports classes={classes} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
