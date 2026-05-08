import { createFileRoute } from "@tanstack/react-router";
import { AiDevPage } from "../features/ai-dev/AiDevPage";

export const Route = createFileRoute("/ai-dev")({
  component: AiDevPage,
});