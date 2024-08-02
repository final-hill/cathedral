import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";

export default () => {
    const config = useRuntimeConfig();

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
    return new ConfidentialClientApplication({
        auth: {
            clientId: config.authClientId,
            authority: config.authSignUpSignInAuthority,
            clientSecret: config.authClientSecret,
            knownAuthorities: [config.authAuthorityDomain]
        },
        system: {
            loggerOptions: {
                loggerCallback(loglevel, message, containsPii) {
                    console.log(message);
                },
                piiLoggingEnabled: false,
                logLevel: LogLevel.Info
            },
        },
    })
}