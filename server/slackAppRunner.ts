import slackbolt from "@slack/bolt";
import { FileStateStore } from "@slack/oauth";
import boltHttpRunner from "@seratch_/bolt-http-runner";

const { App, LogLevel, FileInstallationStore } = slackbolt,
    { AppRunner } = boltHttpRunner;

const config = useAppConfig();

export const appRunner = new AppRunner({
    token: config.slackBotToken,
    signingSecret: config.slackSigningSecret,
    logLevel: LogLevel.DEBUG,
    scopes: ["commands", "app_mentions:read", "chat:write"],
    installationStore: new FileInstallationStore(),
    installerOptions: {
        stateStore: new FileStateStore({})
    }
})

const app = new App(appRunner.appOptions());

app.event("app_mention", async ({ say }) => {
    await say("Hello World. app_mention response");
});

appRunner.setup(app);