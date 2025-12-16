export function calculateGrade(obtained: number, total: number): string {
    if (total === 0) return "N/A";
    const percentage = (obtained / total) * 100;

    if (percentage >= 90) return "Top Plus";
    if (percentage >= 80) return "Distinction";
    if (percentage >= 70) return "First Class";
    if (percentage >= 60) return "Second Class";
    if (percentage >= 50) return "Third Class";
    if (percentage >= 35) return "Pass";
    return "Fail";
}

export function calculatePercentage(obtained: number, total: number): string {
    if (total === 0) return "0";
    return ((obtained / total) * 100).toFixed(2);
}
