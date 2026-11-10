import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/health-profile")({ beforeLoad: () => { throw redirect({ to: "/profile" }); } });
