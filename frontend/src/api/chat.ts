import { api } from "./client";

export type ChatApiResponse = {
  success: boolean;
  question: string;
  answer: string;
  sourcesUsed: number;
};

export type StreamCallbacks = {
  onToken: (token: string) => void;
  onReplace?: (answer: string) => void;
  onDone?: (meta: { sourcesUsed: number; answer?: string }) => void;
  onError?: (message: string) => void;
};

type SsePayload = {
  token?: string;
  replace?: boolean;
  answer?: string;
  done?: boolean;
  sourcesUsed?: number;
  error?: string;
};

function getApiBase(): string {
  return api.defaults.baseURL ?? "http://localhost:3000";
}

/** Legacy non-streaming endpoint */
export async function sendQuestion(question: string): Promise<ChatApiResponse> {
  const { data } = await api.post<ChatApiResponse>("/chat", { question });
  return data;
}

/**
 * Stream tokens via Server-Sent Events (SSE) — same UX as ChatGPT typing.
 */
export async function streamQuestion(
  question: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${getApiBase()}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
    callbacks.onError?.(body.details ?? body.error ?? `Request failed (${res.status})`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError?.("Streaming not supported in this browser.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      let payload: SsePayload;
      try {
        payload = JSON.parse(raw) as SsePayload;
      } catch {
        continue;
      }

      if (payload.error) {
        callbacks.onError?.(payload.error);
        return;
      }
      if (payload.token) callbacks.onToken(payload.token);
      if (payload.replace && payload.answer) callbacks.onReplace?.(payload.answer);
      if (payload.done) {
        callbacks.onDone?.({
          sourcesUsed: payload.sourcesUsed ?? 0,
          answer: payload.answer,
        });
      }
    }
  }
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>("/health");
  return data;
}
