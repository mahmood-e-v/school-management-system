import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ClassSelector({ examId, classes }: { examId: string, classes: any[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((c: any) => (
                <Link key={c.classId._id} href={`/dashboard/exams/${examId}/marks?classId=${c.classId._id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle>{c.classId.name} - {c.classId.division}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{c.subjects.length} Subjects</p>
                            <Button className="mt-4 w-full" variant="outline">Enter Marks</Button>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
