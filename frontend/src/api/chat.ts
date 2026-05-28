import { api } from "./client";

export type ChatApiResponse = {
  success: boolean;
  question: string;
  answer: string;
  sourcesUsed: number;
};

export async function sendQuestion(question: string): Promise<ChatApiResponse> {
  const { data } = await api.post<ChatApiResponse>("/chat", { question });
  return data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>("/health");
  return data;
}
