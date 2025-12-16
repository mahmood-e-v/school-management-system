import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
    data: any;
    schoolInfo: {
        name: string;
        address: string;
        logo: string; // URL
    };
}

export function ReportCard({ data, schoolInfo }: ReportCardProps) {
    const { student, results, summary } = data;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-black p-8 mx-auto border border-gray-200 shadow-sm print:shadow-none print:border-none mb-8 page-break-after-always">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wide">{schoolInfo.name}</h1>
                <p className="text-sm mt-1">{schoolInfo.address}</p>
                <div className="mt-4 flex justify-between items-end">
                    <div className="text-left">
                        <p className="font-bold">Name: <span className="font-normal">{student.name}</span></p>
                        <p className="font-bold">Class: <span className="font-normal">{student.class}</span></p> {/* Need to pass class name */}
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Roll No: <span className="font-normal">{student.rollNo}</span></p>
                        <p className="font-bold">Academic Year: <span className="font-normal">{data.academicYear}</span></p>
                    </div>
                </div>
                <div className="mt-4 bg-gray-100 py-1 rounded border border-gray-300">
                    <h2 className="font-bold text-xl">{data.examName}</h2>
                </div>
            </div>

            {/* Marks Table */}
            <table className="w-full border-collapse border border-black mb-6 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">Subject</th>
                        <th className="border border-black p-2 text-center">Max Marks</th>
                        <th className="border border-black p-2 text-center">Obtained</th>
                        <th className="border border-black p-2 text-center">Grade</th>
                        <th className="border border-black p-2 text-left">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((sub: any, idx: number) => (
                        <tr key={idx}>
                            <td className="border border-black p-2 font-medium">{sub.subject}</td>
                            <td className="border border-black p-2 text-center">{sub.total}</td>
                            <td className="border border-black p-2 text-center">{sub.obtained}</td>
                            <td className="border border-black p-2 text-center font-bold">{sub.grade}</td>
                            <td className="border border-black p-2 text-xs italic">{sub.remarks}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-50 font-bold">
                        <td className="border border-black p-2 text-right">Total</td>
                        <td className="border border-black p-2 text-center">{summary.maxTotal}</td>
                        <td className="border border-black p-2 text-center">{summary.totalObtained}</td>
                        <td className="border border-black p-2 text-center">
                            {summary.percentage}%
                        </td>
                        <td className="border border-black p-2"></td>
                    </tr>
                </tfoot>
            </table>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border border-black p-4">
                    <h3 className="font-bold border-b border-black pb-2 mb-2">Performance Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Percentage:</span> <span className="font-bold text-right">{summary.percentage}%</span>
                        <span>Overall Grade:</span> <span className="font-bold text-right">{summary.grade}</span>
                        <span>Rank:</span> <span className="font-bold text-right">{summary.rank}</span>
                        <span>Result:</span>
                        <span className={`font-bold text-right ${summary.result === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.result}
                        </span>
                    </div>
                </div>
                <div className="border border-black p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold border-b border-black pb-2 mb-2">Remarks</h3>
                        <p className="text-sm italic mb-2"><span className="font-semibold">Class Teacher:</span> {summary.classTeacherRemark || "No remarks"}</p>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-16 flex justify-between px-8">
                <div className="text-center">
                    <div className="border-t border-black w-40"></div>
                    <p className="mt-1 font-bold">Class Teacher</p>
                </div>
                <div className="text-center">
                    <div className="border-t border-black w-40"></div>
                    <p className="mt-1 font-bold">Principal</p>
                </div>
                <div className="text-center">
                    <div className="border-t border-black w-40"></div>
                    <p className="mt-1 font-bold">Parent</p>
                </div>
            </div>

            <div className="mt-auto text-center text-xs text-gray-500 pt-8">
                Generated by School Management System
            </div>
        </div>
    );
}
