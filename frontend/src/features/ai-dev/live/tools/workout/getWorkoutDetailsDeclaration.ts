import { Type } from "@google/genai";

export const getWorkoutDetailsDeclaration = {
  name: "get_workout_details",
  description:
    "Fetch one workout from the existing deployed backend workout endpoint. Use this when the user asks about the workout only.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      workoutId: {
        type: Type.NUMBER,
        description: "Workout id. Use 1 if the user does not specify another id.",
      },
    },
  },
};
