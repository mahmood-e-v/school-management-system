"use client";

import dynamic from "next/dynamic";

const CreateExamDialog = dynamic(
    () => import("./create-exam-dialog").then((mod) => mod.CreateExamDialog),
    { ssr: false }
);

export function CreateExamWrapper({ classes }: { classes: any[] }) {
    return <CreateExamDialog classes={classes} />;
}
