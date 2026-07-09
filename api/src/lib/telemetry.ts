import appInsights from "applicationinsights";

export function trackEvent(
  name: string,
  properties: Record<string, string>,
): void {
  appInsights.defaultClient?.trackEvent({ name, properties });
}

export function trackException(
  error: Error,
  properties?: Record<string, string>,
): void {
  appInsights.defaultClient?.trackException({
    exception: error,
    properties,
  });
}
