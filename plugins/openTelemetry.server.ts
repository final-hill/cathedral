// ref: https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable?tabs=nodejs
import { useAzureMonitor } from '@azure/monitor-opentelemetry'
import type { AzureMonitorOpenTelemetryOptions } from '@azure/monitor-opentelemetry'

export default defineNuxtPlugin(async (_nuxtApp) => {
    if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
        return

    // https://www.npmjs.com/package/@azure/monitor-opentelemetry
    const options: AzureMonitorOpenTelemetryOptions = {
        samplingRatio: 1,
        azureMonitorExporterOptions: {
            connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
        },
        instrumentationOptions: {
            http: { enabled: true }
        },
        enableLiveMetrics: true,
        enableStandardMetrics: true
    }

    useAzureMonitor(options)
})
