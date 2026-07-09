import { CosmosClient, Container } from "@azure/cosmos";

export interface ProcessedItem {
  id: string; // correlationId -- also the partition key
  title: string;
  payload: string;
  submittedAt: string;
  processedAt: string;
  status: "processed";
}

let container: Container | undefined;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getContainer(): Container {
  if (!container) {
    const client = new CosmosClient({
      endpoint: getRequiredEnv("COSMOS_ENDPOINT"),
      key: getRequiredEnv("COSMOS_KEY"),
    });
    const database = client.database(getRequiredEnv("COSMOS_DATABASE"));
    container = database.container(getRequiredEnv("COSMOS_CONTAINER"));
  }
  return container;
}

export async function upsertItem(item: ProcessedItem): Promise<ProcessedItem> {
  const { resource } = await getContainer().items.upsert<ProcessedItem>(item);
  if (!resource) {
    throw new Error(`Upsert returned no resource for id: ${item.id}`);
  }
  return resource;
}
