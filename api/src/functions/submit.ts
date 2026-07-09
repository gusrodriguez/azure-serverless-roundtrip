import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { randomUUID } from "node:crypto";
import { taskInputSchema } from "../lib/validation";
import { sendToQueue } from "../lib/service-bus";
import { trackEvent, trackException } from "../lib/telemetry";

async function handler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = await request.json().catch(() => null);

  const parsed = taskInputSchema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 400,
      jsonBody: {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const correlationId = randomUUID();
  const submittedAt = new Date().toISOString();
  const { title, payload } = parsed.data;

  const enrichedMessage = { correlationId, title, payload, submittedAt };

  try {
    await sendToQueue(
      enrichedMessage,
      correlationId,
      context.traceContext?.traceParent,
    );

    trackEvent("TaskSubmitted", { correlationId });

    context.log("Task submitted", { correlationId, title });

    return {
      status: 202,
      jsonBody: { correlationId, status: "accepted" },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    trackException(err, { correlationId });
    context.error("Failed to submit task", { correlationId, error: err.message });

    return {
      status: 500,
      jsonBody: { error: "Failed to submit task" },
    };
  }
}

app.http("submit", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "submit",
  handler,
});
