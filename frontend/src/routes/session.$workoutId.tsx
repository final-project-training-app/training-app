import { createFileRoute } from "@tanstack/react-router";
import { SessionPage } from "../features/session/SessionPage";

export const Route = createFileRoute("/session/$workoutId")({
  component: SessionPage,
});
