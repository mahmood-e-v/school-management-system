import { getActiveAcademicYear, getAvailableAcademicYears } from "@/lib/actions/school";
import { AcademicYearSelectorClient } from "./academic-year-selector-client";

export async function AcademicYearBadge() {
    const activeYear = await getActiveAcademicYear();
    const availableYears = await getAvailableAcademicYears();

    // The name is kept 'AcademicYearBadge' to minimize refactoring multiple page.tsx files,
    // but its behavior is now an interactive selector!
    return (
        <AcademicYearSelectorClient 
            activeYear={activeYear} 
            availableYears={availableYears} 
        />
    );
}
