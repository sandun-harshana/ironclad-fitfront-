// src/data/chatbotReplies.ts
export type ChatbotReply = {
  id: number;
  keywords: string[];
  answer: string;
};

export const defaultReplies: ChatbotReply[] = [
  {
    id: 1,
    keywords: ["workout", "exercise", "training"],
    answer: "💪 Great question! Try mixing cardio with strength training for balance.",
  },
  {
    id: 2,
    keywords: ["nutrition", "food", "diet"],
    answer: "🥗 Eat clean: lean proteins, whole grains, and veggies are your best friends!",
  },
  {
    id: 3,
    keywords: ["meal", "recipe", "cook"],
    answer: "🍳 Try grilled chicken with quinoa and veggies. Quick & healthy!",
  },
  {
    id: 4,
    keywords: ["motivation", "tips", "fitness"],
    answer: "🔥 Stay consistent! Small steps daily lead to big results.",
  },
];
