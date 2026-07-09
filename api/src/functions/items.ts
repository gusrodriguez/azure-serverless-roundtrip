import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../lib/cosmos";
import { trackException } from "../lib/telemetry";

async function handler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const limitParam = request.query.get("limit");
  let limit = 20;

  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 100);
    }
  }

  try {
    const { resources: items } = await getContainer().items
      .query({
        query: "SELECT TOP @limit * FROM c ORDER BY c.processedAt DESC",
        parameters: [{ name: "@limit", value: limit }],
      })
      .fetchAll();

    return {
      status: 200,
      jsonBody: { items },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    trackException(err);
    context.error("Failed to query items", { error: err.message });

    return {
      status: 500,
      jsonBody: { error: "Failed to retrieve items" },
    };
  }
}

app.http("items", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "items",
  handler,
});
