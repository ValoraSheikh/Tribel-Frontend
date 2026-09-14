import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { resourceFromAttributes } from "@opentelemetry/resources";

const endpoint = process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT;
const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

if (endpoint) {
  const apiUrlPattern = new RegExp(apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const exporterUrlPattern = new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      "service.name": process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "tribel-web",
    }),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter({ url: endpoint })),
    ],
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [apiUrlPattern],
        ignoreUrls: [exporterUrlPattern],
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [apiUrlPattern],
        ignoreUrls: [exporterUrlPattern],
      }),
    ],
  });
}
