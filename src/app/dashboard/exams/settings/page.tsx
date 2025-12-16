import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGrades, getRemarksSafe } from "@/lib/actions/settings";
import { GradesManagement } from "@/components/exams/settings/grades-management";
import { RemarksManagement } from "@/components/exams/settings/remarks-management";

export default async function SettingsPage() {
    const grades = await getGrades();
    const remarks = await getRemarksSafe();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Exam Settings</h1>

            <Tabs defaultValue="grades" className="w-full">
                <TabsList>
                    <TabsTrigger value="grades">Grading System</TabsTrigger>
                    <TabsTrigger value="remarks">Remarks Bank</TabsTrigger>
                </TabsList>

                <TabsContent value="grades">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grading Logic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GradesManagement initialGrades={grades} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="remarks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Predefined Remarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RemarksManagement initialRemarks={remarks} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
