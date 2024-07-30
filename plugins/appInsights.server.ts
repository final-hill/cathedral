import appInsights from 'applicationinsights';

export default defineNuxtPlugin(async nuxtApp => {
    if (!process.env.APPINSIGHTS_CONNECTIONSTRING)
        return;

    // https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs#telemetryclient-api
    appInsights.setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setAutoCollectPreAggregatedMetrics(true)
        .setSendLiveMetrics(false)
        .setInternalLogging(false, true)
        .enableWebInstrumentation(false)
        .start();
})