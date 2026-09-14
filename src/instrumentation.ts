import { registerOTel } from "@vercel/otel";

export function register() {
  if (
    !process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT &&
    !process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  ) {
    return;
  }

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "tribel-frontend",
    attributes: {
      "deployment.environment": process.env.VERCEL_ENV ?? "development",
      "service.version": process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    },
  });
}
