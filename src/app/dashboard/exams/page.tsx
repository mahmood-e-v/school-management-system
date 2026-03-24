import { getExams } from "@/lib/actions/exam";
import { getClasses } from "@/lib/actions/class";
import { getSchoolSettings } from "@/lib/actions/school";
import { CreateExamWrapper } from "@/components/exams/create-exam-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DeleteExamButton } from "@/components/exams/delete-exam-button";
import { EditExamDialog } from "@/components/exams/edit-exam-dialog";
import { BackButton, HomeButton } from "@/components/ui/nav-buttons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { AcademicYearBadge } from "@/components/ui/academic-year-badge";

import { auth } from "@/auth";

export default async function ExamsPage() {
    const exams = await getExams();
    const classes = await getClasses();
    const settings = await getSchoolSettings();
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <HomeButton />
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">Manage Exams</h1>
                        <AcademicYearBadge />
                    </div>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <>
                            <Link href="/dashboard/exams/settings">
                                <Button variant="outline" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                            <CreateExamWrapper classes={classes} currentAcademicYear={settings.currentAcademicYear} />
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Exams</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Exam Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Subjects</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No exams created.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                exams.map((exam: any) => (
                                    <TableRow key={exam._id}>
                                        <TableCell className="font-medium">
                                            <div>{exam.name}</div>
                                            <div className="text-xs text-muted-foreground">{exam.academicYear}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {exam.classes?.map((c: any) => (
                                                    <span key={c.classId._id} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                                        {c.classId?.name}-{c.classId?.division}
                                                    </span>
                                                ))}
                                                {(!exam.classes || exam.classes.length === 0) && <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{new Date(exam.startDate).toLocaleDateString()}</div>
                                            {exam.endDate && <div className="text-xs text-muted-foreground">to {new Date(exam.endDate).toLocaleDateString()}</div>}
                                        </TableCell>
                                        <TableCell>{exam.classes?.[0]?.subjects?.length || 0} Subjects</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <a href={`/dashboard/exams/${exam._id}/marks`} className="text-blue-600 hover:underline text-sm font-medium">
                                                    Enter Marks
                                                </a>
                                                {isAdmin && (
                                                    <>
                                                        <EditExamDialog exam={exam} classes={classes} />
                                                        <DeleteExamButton examId={exam._id} examName={exam.name} />
                                                    </>
                                                )}
                                            </div>
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
