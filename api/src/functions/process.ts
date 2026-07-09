import { app, InvocationContext } from "@azure/functions";
import { ProcessedItem, upsertItem } from "../lib/cosmos";
import { trackEvent, trackException } from "../lib/telemetry";

interface TaskMessage {
  correlationId: string;
  title: string;
  payload: string;
  submittedAt: string;
}

async function handler(
  message: unknown,
  context: InvocationContext,
): Promise<void> {
  const { correlationId, title, payload, submittedAt } = message as TaskMessage;

  context.log("Processing task", { correlationId, title });
  trackEvent("TaskProcessing", { correlationId });

  try {
    const processedItem: ProcessedItem = {
      id: correlationId,
      title,
      payload,
      submittedAt,
      processedAt: new Date().toISOString(),
      status: "processed",
    };

    await upsertItem(processedItem);

    trackEvent("TaskPersisted", { correlationId });
    context.log("Task persisted", { correlationId });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    trackException(err, { correlationId });
    context.error("Failed to process task", { correlationId, error: err.message });
    // Re-throw so the runtime handles retries / DLQ
    throw err;
  }
}

app.serviceBusQueue("process", {
  connection: "SERVICE_BUS_CONNECTION",
  queueName: "%SERVICE_BUS_QUEUE_NAME%",
  handler,
});
