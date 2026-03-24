"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setSelectedAcademicYear } from "@/lib/actions/school";

interface Props {
    activeYear: string;
    availableYears: string[];
}

export function AcademicYearSelectorClient({ activeYear, availableYears }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleChange = (targetYear: string) => {
        startTransition(async () => {
            await setSelectedAcademicYear(targetYear);
            router.refresh(); // Refresh the page so server components reload with new cookie
        });
    };

    return (
        <div className="ml-4 flex items-center shadow-sm rounded-full overflow-hidden">
            <Select 
                value={activeYear} 
                onValueChange={handleChange}
                disabled={isPending}
            >
                <SelectTrigger className="h-[34px] border-blue-200 bg-blue-50 text-blue-700 font-semibold rounded-full gap-2 px-3 hover:bg-blue-100 transition-colors focus:ring-0 focus:ring-offset-0">
                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400"></span>
                            </span>
                        ) : (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                        )}
                        <CalendarDays className="h-4 w-4" />
                        <span className="hidden sm:inline">Year:</span>
                        <SelectValue placeholder="Select Year" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
