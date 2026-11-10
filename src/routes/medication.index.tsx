import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/medication/")({ beforeLoad: () => { throw redirect({ to: "/medication/dashboard" }); } });
