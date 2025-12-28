"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardNavButtons() {
    const router = useRouter();

    return (
        <div className="flex items-center gap-2 mb-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
                title="Go Back"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2" title="Dashboard Home">
                    <Home className="h-4 w-4" />
                    Home
                </Button>
            </Link>
        </div>
    );
}
