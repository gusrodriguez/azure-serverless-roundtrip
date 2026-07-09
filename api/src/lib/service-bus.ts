import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

let client: ServiceBusClient | undefined;
let sender: ServiceBusSender | undefined;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSender(): ServiceBusSender {
  if (!sender) {
    client = new ServiceBusClient(getRequiredEnv("SERVICE_BUS_CONNECTION"));
    sender = client.createSender(getRequiredEnv("SERVICE_BUS_QUEUE_NAME"));
  }
  return sender;
}

export async function sendToQueue(
  message: Record<string, unknown>,
  correlationId: string,
  traceParent?: string,
): Promise<void> {
  const applicationProperties: Record<string, string> = {};
  if (traceParent) {
    applicationProperties["Diagnostic-Id"] = traceParent;
  }

  await getSender().sendMessages({
    body: message,
    correlationId,
    applicationProperties,
  });
}
