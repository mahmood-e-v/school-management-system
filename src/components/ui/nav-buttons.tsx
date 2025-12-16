"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BackButton() {
    const router = useRouter();
    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Button>
    );
}

export function HomeButton() {
    return (
        <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
            </Button>
        </Link>
    );
}
