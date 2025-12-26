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

                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* We will populate this with links to modules later */}
                    <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm p-6 hover:shadow-md transition-all">
                        <h3 className="font-semibold leading-none tracking-tight text-emerald-900">Attendance</h3>
                        <p className="text-sm text-emerald-700 mt-2">Manage daily attendance for classes.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/attendance">
                                <Button variant="outline" className="w-full bg-white/50 border-emerald-200 hover:bg-emerald-100 text-emerald-900">Go to Attendance</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 shadow-sm p-6 hover:shadow-md transition-all">
                        <h3 className="font-semibold leading-none tracking-tight text-blue-900">Students</h3>
                        <p className="text-sm text-blue-700 mt-2">Add, edit, or upload student records.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/students">
                                <Button variant="outline" className="w-full bg-white/50 border-blue-200 hover:bg-blue-100 text-blue-900">Manage Students</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 shadow-sm p-6 hover:shadow-md transition-all">
                        <h3 className="font-semibold leading-none tracking-tight text-amber-900">Exams & Results</h3>
                        <p className="text-sm text-amber-700 mt-2">Schedule exams and enter marks.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/exams">
                                <Button variant="outline" className="w-full bg-white/50 border-amber-200 hover:bg-amber-100 text-amber-900">View Exams</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm p-6 hover:shadow-md transition-all">
                        <h3 className="font-semibold leading-none tracking-tight text-purple-900">Reports</h3>
                        <p className="text-sm text-purple-700 mt-2">Generate report cards and analytics.</p>
                        <div className="mt-4">
                            <Link href="/dashboard/reports/report-cards">
                                <Button variant="outline" className="w-full bg-white/50 border-purple-200 hover:bg-purple-100 text-purple-900">View Reports</Button>
                            </Link>
                        </div>
                    </div>
                    {session?.user?.role === "admin" && (
                        <>
                            <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 shadow-sm p-6 hover:shadow-md transition-all">
                                <h3 className="font-semibold leading-none tracking-tight text-violet-900">Class Management</h3>
                                <p className="text-sm text-violet-700 mt-2">Create and manage classes & divisions.</p>
                                <div className="mt-4">
                                    <Link href="/dashboard/classes">
                                        <Button variant="outline" className="w-full bg-white/50 border-violet-200 hover:bg-violet-100 text-violet-900">Manage Classes</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-gradient-to-br from-rose-50 to-red-50 border-rose-100 shadow-sm p-6 hover:shadow-md transition-all">
                                <h3 className="font-semibold leading-none tracking-tight text-rose-900">Teachers</h3>
                                <p className="text-sm text-rose-700 mt-2">Create logins for teaching staff.</p>
                                <div className="mt-4">
                                    <Link href="/dashboard/teachers">
                                        <Button variant="outline" className="w-full bg-white/50 border-rose-200 hover:bg-rose-100 text-rose-900">Manage Staff</Button>
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
