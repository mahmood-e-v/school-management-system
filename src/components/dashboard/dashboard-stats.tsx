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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalStudents}</div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground mt-1">
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold">
                            {loading ? "..." : `${data.attendance.percentage}%`}
                        </div>
                        <Input
                            type="date"
                            className="h-6 w-[130px] text-xs px-2 py-0 ml-2"
                            value={attendanceDate}
                            onChange={handleDateChange}
                        />
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground mt-1">
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
                                                <TableCell className="text-right">{item.percentage}%</TableCell>
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
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => (window.location.href = '/dashboard/classes')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Mgmt</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.classData.length}</div>
                    <p className="text-xs text-muted-foreground">Active Classes & Divisions</p>
                </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => (window.location.href = '/dashboard/exams')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Exams</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalExams || 0}</div>
                    <p className="text-xs text-muted-foreground">Scheduled Exams</p>
                </CardContent>
            </Card>

        </div>
    );
}
