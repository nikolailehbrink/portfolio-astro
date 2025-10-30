import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  type ToolSet,
  type UIMessage,
} from "ai";
import { llamaindex } from "@llamaindex/vercel";
import { LlamaCloudIndex } from "llama-cloud-services";
import { track } from "@vercel/analytics/server";
import type { APIRoute } from "astro";
import { AI_CHAT_MESSAGE_LIMIT } from "@/consts";

export const maxDuration = 30;
export const prerender = false;

const openai = createOpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

function getTools() {
  // Wrap in function because top level constantiation lead to index not being loaded in dev
  // and thus the tool was not called. Don't know if that would have happened in Prod aswell
  // Needed to get the type of the tools in order to type MyUIMessage, that's why it's outside the POST
  const index = new LlamaCloudIndex({
    name: "ai-chat",
    projectName: "website",
    organizationId: "fab19a52-2da6-43e7-b2cb-6ea2e721faa7",
    apiKey: import.meta.env.LLAMA_CLOUD_API_KEY,
  });

  return {
    queryTool: llamaindex({
      index,
      model: openai("gpt-4o-mini"),
      description:
        "The tool to query the knowledge base about Nikolai Lehbrink.",
    }),
  } satisfies ToolSet;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const { messages }: { messages: Array<UIMessage> } = await request.json();
  const messageCount = cookies.get("message_count")?.number();
  await track("submit-ai-message");

  if (messageCount !== undefined && messageCount >= AI_CHAT_MESSAGE_LIMIT) {
    return new Response("Message limit reached", { status: 403 });
  }

  try {
    const result = streamText({
      onError: (error) => {
        console.error("Error:", error);
      },
      experimental_transform: smoothStream(),
      model: openai("gpt-4o-mini"),
      system: `You are an AI assistant for the personal website of Nikolai Lehbrink. You have access to the knowledge base about Nikolai Lehbrink via the provided "queryTool" tool.
      ALWAYS use this tool to answer user questions about Nikolai. Write as if you are Nikolai. When people refer to "you" they mean Nikolai and expect you to answer as him.
      If you don't know the answer, respond that you don't know. Do not make up answers. If you are asked inappropriate questions, respond that you cannot answer that.`,
      messages: convertToModelMessages(messages),
      tools: getTools(),
      stopWhen: stepCountIs(3),
    });

    // cookies.set("message_count", String(messageCount ? messageCount + 1 : 1), {
    //   // expires: new Date(Date.now() + 100000000),
    //   maxAge: SECONDS_TO_CHAT_AGAIN,
    //   httpOnly: true,
    //   secure: import.meta.env.PROD,
    //   sameSite: "lax",
    //   path: "/",
    // });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
