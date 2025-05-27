import { OpenAIStream, StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const chat = model.startChat({
    history: messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });

  const result = await chat.sendMessageStream(messages[messages.length - 1].content);

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
}