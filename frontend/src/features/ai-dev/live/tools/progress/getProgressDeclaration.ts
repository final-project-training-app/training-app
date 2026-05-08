import { Type } from "@google/genai";

export const getProgressDeclaration = {
  name: "get_user_progress",
  description:
    "Fetch workout progress for a user from the existing deployed backend progress endpoint.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      userId: {
        type: Type.NUMBER,
        description: "MVP user id. Use 1 if the user does not specify another id.",
      },
    },
  },
};
