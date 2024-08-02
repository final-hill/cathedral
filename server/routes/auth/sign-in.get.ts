import { type AuthorizationCodeRequest, type AuthorizationUrlRequest, CryptoProvider } from "@azure/msal-node";
import AuthStage from "~/server/AuthStage";
import msalClient from "~/server/msalClient";

const cryptoProvider = new CryptoProvider();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        msal = msalClient(),
        csrfToken = cryptoProvider.createNewGuid()

    const session = await useSession(event, { password: config.sessionPassword })

    const state = cryptoProvider.base64Encode(
        JSON.stringify({
            csrfToken,
            authStage: AuthStage.SIGN_IN
        })
    );

    // Generate PKCE Codes before starting the authorization flow
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes(),
        challengeMethod = 'S256'

    const authCodeUrlRequestParams: AuthorizationUrlRequest = {
        authority: config.authSignUpSignInAuthority,
        codeChallenge: challenge,
        codeChallengeMethod: challengeMethod,
        redirectUri: config.authRedirectUri,
        responseMode: 'form_post',
        state,
        scopes: ["openid"],
    }

    const authCodeRequestParams: AuthorizationCodeRequest = {
        authority: config.authSignUpSignInAuthority,
        code: '',
        redirectUri: config.authRedirectUri,
        state,
        scopes: ["openid"],
    }

    await session.update({
        authCodeRequest: authCodeRequestParams,
        authCodeUrlRequest: authCodeUrlRequestParams,
        csrfToken,
        pkceCodes: {
            challengeMethod,
            verifier,
            challenge
        },
    })

    try {
        const authCodeUrlResponse = await msal.getAuthCodeUrl(authCodeUrlRequestParams)
        sendRedirect(event, authCodeUrlResponse)
    } catch (error) {
        console.error(error)
        throw createError({
            statusCode: 500,
            message: 'Login could not be initiated',
            data: error
        })
    }
})