"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CalendarCheck, BarChart3, ChevronRight, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { toast } from "sonner";
import Link from "next/link";

interface DashboardStatsProps {
    initialData: any;
}

export function DashboardStats({ initialData }: DashboardStatsProps) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(initialData.attendance.date);

    async function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newDate = e.target.value;
        setAttendanceDate(newDate);
        setLoading(true);
        const newData = await getDashboardStats(newDate);
        if (newData.error) {
            toast.error(newData.error);
        } else {
            setData(newData);
        }
        setLoading(false);
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Students Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{data.totalStudents}</div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs text-blue-600 mt-1 hover:text-blue-800">
                                View Class Breakdown
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Class Wise Breakdown</DialogTitle>
                                <DialogDescription>Student count and teacher in charge per division.</DialogDescription>
                            </DialogHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Division</TableHead>
                                        <TableHead>Teacher In Charge</TableHead>
                                        <TableHead className="text-right">Students</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.classData.map((cls: any) => (
                                        <TableRow key={cls._id}>
                                            <TableCell className="font-medium">{cls.name}</TableCell>
                                            <TableCell>{cls.division}</TableCell>
                                            <TableCell>{cls.classTeacher}</TableCell>
                                            <TableCell className="text-right">{cls.studentCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-900">Attendance</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold text-emerald-900">
                            {loading ? "..." : `${data.attendance.percentage}%`}
                        </div>
                        <Input
                            type="date"
                            className="h-6 w-[130px] text-xs px-2 py-0 ml-2 border-emerald-200 bg-white/50"
                            value={attendanceDate}
                            onChange={handleDateChange}
                        />
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs text-emerald-600 mt-1 hover:text-emerald-800">
                                View Details by Class
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Attendance Details ({attendanceDate})</DialogTitle>
                                <DialogDescription>Present count vs Total students for each class.</DialogDescription>
                            </DialogHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Present</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.attendance.details.length > 0 ? (
                                        data.attendance.details.map((item: any) => (
                                            <TableRow key={item.classId}>
                                                <TableCell className="font-medium">{item.className}</TableCell>
                                                <TableCell className="text-right">{item.total}</TableCell>
                                                <TableCell className="text-right">{item.present}</TableCell>
                                                <TableCell className="text-right">
                                                    {item.percentage === "-" ? "-" : `${item.percentage}%`}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No attendance records found for this date.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Modules Links (Replaced Static Cards with functionality if needed, keeping simple) */}
            <Card className="hover:bg-violet-100 transition-colors cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 shadow-sm" onClick={() => (window.location.href = '/dashboard/classes')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-violet-900">Class Mgmt</CardTitle>
                    <School className="h-4 w-4 text-violet-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-violet-900">{data.classData.length}</div>
                    <p className="text-xs text-violet-600">Active Classes & Divisions</p>
                </CardContent>
            </Card>

            <Card className="hover:bg-amber-100 transition-colors cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 shadow-sm" onClick={() => (window.location.href = '/dashboard/exams')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Exams</CardTitle>
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-900">{data.totalExams || 0}</div>
                    <p className="text-xs text-amber-600">Scheduled Exams</p>
                </CardContent>
            </Card>

        </div>
    );
}
