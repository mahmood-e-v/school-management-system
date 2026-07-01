import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
    data: any;
    schoolInfo: {
        name: string;
        address: string;
        logo: string; // URL
        classTeacherName?: string;
        classTeacherSignature?: string;
        sadarMuallimName?: string;
        sadarMuallimSignature?: string;
    };
}

export function ReportCard({ data, schoolInfo }: ReportCardProps) {
    const { student, results, summary } = data;

    return (
        <div className="w-[210mm] h-[297mm] flex flex-col justify-between bg-white text-black p-6 print:p-6 mx-auto border border-gray-200 shadow-sm print:shadow-none print:border-none mb-8 page-break-after-always print:m-0 print:h-[297mm]">
            {/* Scoped style for portrait print */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        background: white;
                    }
                }
            `}} />

            <div className="flex-grow flex flex-col justify-start">
                {/* Header */}
                <div className="border-b-2 border-black pb-2 mb-3">
                    {/* School Info Row */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                        {schoolInfo.logo && (
                            <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={schoolInfo.logo} alt="School Logo" className="h-full w-full object-contain" />
                            </div>
                        )}
                        <div className="text-center flex-grow">
                            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">{schoolInfo.name}</h1>
                            <p className="text-xs md:text-sm mt-0.5">{schoolInfo.address}</p>
                        </div>
                        {/* Spacer to keep title centered if logo is present */}
                        {schoolInfo.logo && <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0" />}
                    </div>

                    {/* Student Info Row */}
                    <div className="flex justify-between items-end text-sm mt-3 pb-1 border-t border-gray-100 pt-2">
                        <div className="text-left space-y-0.5">
                            <p className="font-bold text-xs md:text-sm">Name: <span className="font-normal text-gray-900">{student.name}</span></p>
                            <p className="font-bold text-xs md:text-sm">Class: <span className="font-normal text-gray-900">{student.class}</span></p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="font-bold text-xs md:text-sm">Roll No: <span className="font-normal text-gray-900">{student.rollNo}</span></p>
                            <p className="font-bold text-xs md:text-sm">Academic Year: <span className="font-normal text-gray-900">{data.academicYear}</span></p>
                        </div>
                    </div>

                    <div className="mt-2 bg-gray-100 py-1 rounded border border-gray-300 text-center">
                        <h2 className="font-bold text-lg md:text-xl">{data.examName}</h2>
                    </div>
                </div>

                {/* Marks Table */}
                <table className="w-full border-collapse border border-black mb-4 print:mb-2 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 print:py-1 print:px-2 text-left">Subject</th>
                            <th className="border border-black p-2 print:py-1 print:px-2 text-center">Max Marks</th>
                            <th className="border border-black p-2 print:py-1 print:px-2 text-center">Obtained</th>
                            <th className="border border-black p-2 print:py-1 print:px-2 text-center">Grade</th>
                            <th className="border border-black p-2 print:py-1 print:px-2 text-left">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((sub: any, idx: number) => (
                            <tr key={idx}>
                                <td className="border border-black p-2 print:py-1 print:px-2 font-medium">{sub.subject}</td>
                                <td className="border border-black p-2 print:py-1 print:px-2 text-center">{sub.total}</td>
                                <td className={`border border-black p-2 print:py-1 print:px-2 text-center ${sub.isFail ? 'text-red-600 underline decoration-black decoration-2' : ''}`}>
                                    {sub.obtained}
                                </td>
                                <td className="border border-black p-2 print:py-1 print:px-2 text-center font-bold">{sub.grade}</td>
                                <td className="border border-black p-2 print:py-1 print:px-2 text-xs italic">{sub.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 font-bold">
                            <td className="border border-black p-2 print:py-1 print:px-2 text-right">Total</td>
                            <td className="border border-black p-2 print:py-1 print:px-2 text-center">{summary.maxTotal}</td>
                            <td className="border border-black p-2 print:py-1 print:px-2 text-center">{summary.totalObtained}</td>
                            <td className="border border-black p-2 print:py-1 print:px-2 text-center">
                                {summary.percentage}%
                            </td>
                            <td className="border border-black p-2 print:py-1 print:px-2"></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-4 print:gap-3 mb-4 print:mb-2">
                    <div className="border border-black p-4 print:p-2.5">
                        <h3 className="font-bold border-b border-black pb-1.5 mb-1.5 text-sm">Performance Summary</h3>
                        <div className="grid grid-cols-2 gap-1 text-xs md:text-sm">
                            <span>Percentage:</span> <span className="font-bold text-right">{summary.percentage}%</span>
                            <span>Overall Grade:</span> <span className="font-bold text-right">{summary.grade}</span>
                            <span>Rank:</span> <span className="font-bold text-right">{summary.rank}</span>
                            <span>Result:</span>
                            <span className={`font-bold text-right ${summary.result === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                                {summary.result}
                            </span>
                        </div>
                    </div>
                    <div className="border border-black p-4 print:p-2.5 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold border-b border-black pb-1.5 mb-1.5 text-sm">Remarks</h3>
                            <p className="text-xs md:text-sm italic mb-1.5"><span className="font-semibold">Class Teacher:</span> {summary.classTeacherRemark || "No remarks"}</p>
                        </div>
                    </div>
                </div>

                {/* Grading Table */}
                {data.gradingTable && data.gradingTable.length > 0 && (
                    <div className="mb-4 print:mb-2">
                        <h3 className="font-bold border-b border-black pb-1 mb-1.5 text-xs md:text-sm">Grading System</h3>
                        <table className="w-full border-collapse border border-black text-[10px] md:text-xs text-center">
                            <tbody>
                                <tr className="bg-gray-100 font-bold">
                                    {data.gradingTable.map((g: any, idx: number) => (
                                        <td key={`name-${idx}`} className="border border-black p-1 print:p-0.5">{g.name}</td>
                                    ))}
                                </tr>
                                <tr>
                                    {data.gradingTable.map((g: any, idx: number) => (
                                        <td key={`range-${idx}`} className="border border-black p-1 print:p-0.5">{g.minPercentage}% - {g.maxPercentage}%</td>
                                    ))}
                                </tr>
                                <tr>
                                    {data.gradingTable.map((g: any, idx: number) => (
                                        <td key={`desc-${idx}`} className="border border-black p-1 print:p-0.5 text-[9px] md:text-xs">{g.description}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Signatures */}
                <div className="mt-6 print:mt-4 flex justify-between px-8">
                    <div className="text-center flex flex-col items-center justify-end h-16">
                        {schoolInfo.classTeacherSignature && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={schoolInfo.classTeacherSignature} alt="Class Teacher Signature" className="h-8 object-contain mb-1" />
                        )}
                        <div className="border-t border-black w-32"></div>
                        <p className="mt-0.5 font-bold text-xs md:text-sm">Class Teacher</p>
                        {schoolInfo.classTeacherName && <p className="text-[10px] md:text-xs">{schoolInfo.classTeacherName}</p>}
                    </div>
                    <div className="text-center flex flex-col items-center justify-end h-16">
                        {schoolInfo.sadarMuallimSignature && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={schoolInfo.sadarMuallimSignature} alt="Sadar Muallim Signature" className="h-8 object-contain mb-1" />
                        )}
                        <div className="border-t border-black w-32"></div>
                        <p className="mt-0.5 font-bold text-xs md:text-sm">Sadar Muallim</p>
                        {schoolInfo.sadarMuallimName && <p className="text-[10px] md:text-xs">{schoolInfo.sadarMuallimName}</p>}
                    </div>
                    <div className="text-center flex flex-col items-center justify-end h-16">
                        <div className="border-t border-black w-32"></div>
                        <p className="mt-0.5 font-bold text-xs md:text-sm">Parent</p>
                    </div>
                </div>
            </div>

            <div className="text-center text-[10px] md:text-xs text-gray-500 pt-4 print:pt-2">
                Generated by School Management System
            </div>
        </div>
    );
}
