import { createFileRoute } from "@tanstack/react-router";
import { StatusPage } from "../features/status/StatusPage";

export const Route = createFileRoute("/status")({
  component: StatusPage,
});
