import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    CalendarCheck,
    GraduationCap,
    FileText,
    LogOut,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";

export default async function DashboardPage() {
    const session = await auth();
    const stats = await getDashboardStats();

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Top Navigation */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                    School Admin
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {session?.user?.email} ({session?.user?.role || "User"})
                    </span>
                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <Button variant="ghost" size="icon" title="Sign Out">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <DashboardStats initialData={stats} />

                {/* Modules Grid */}
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* We will populate this with links to modules later */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Attendance</h3>
                        <p className="text-sm text-muted-foreground mt-2">Manage daily attendance for classes.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/attendance">
                                <Button variant="outline" className="w-full">Go to Attendance</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Students</h3>
                        <p className="text-sm text-muted-foreground mt-2">Add, edit, or upload student records.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/students">
                                <Button variant="outline" className="w-full">Manage Students</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Exams & Results</h3>
                        <p className="text-sm text-muted-foreground mt-2">Schedule exams and enter marks.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/exams">
                                <Button variant="outline" className="w-full">View Exams</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Reports</h3>
                        <p className="text-sm text-muted-foreground mt-2">Generate report cards and analytics.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/reports/report-cards">
                                <Button variant="outline" className="w-full">View Reports</Button>
                            </Link>
                        </div>
                    </div>
                    {session?.user?.role === "admin" && (
                        <>
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="font-semibold leading-none tracking-tight">Class Management</h3>
                                <p className="text-sm text-muted-foreground mt-2">Create and manage classes & divisions.</p>
                                <div className="mt-4">
                                    <Link href="/dashboard/classes">
                                        <Button variant="outline" className="w-full">Manage Classes</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="font-semibold leading-none tracking-tight">Teachers</h3>
                                <p className="text-sm text-muted-foreground mt-2">Create logins for teaching staff.</p>
                                <div className="mt-4">
                                    <Link href="/dashboard/teachers">
                                        <Button variant="outline" className="w-full">Manage Staff</Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
