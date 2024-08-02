import { z } from "zod"
import { CryptoProvider } from "@azure/msal-node";
import AuthStage from "~/server/AuthStage";
import msalClient from "~/server/msalClient";

const bodySchema = z.object({
    state: z.string(),
    client_info: z.string().optional(),
    code: z.string().optional()
})

const cryptoProvider = new CryptoProvider();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        msal = msalClient(),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = await useSession(event, { password: config.sessionPassword })

    if (!body.success) {
        console.error(body.error.errors)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })
    }

    type AuthState = {
        csrfToken: string,
        authStage: AuthStage
    }

    const state: AuthState = JSON.parse(cryptoProvider.base64Decode(body.data.state))

    if (state.csrfToken !== session.data.csrfToken) {
        console.error('CSRF Token mismatch')
        throw createError({
            statusCode: 401,
            message: 'CSRF Token mismatch'
        })
    }

    const { authCodeRequest } = session.data

    switch (state.authStage) {
        case AuthStage.SIGN_IN:
            try {
                const tokenResponse = await msal.acquireTokenByCode(authCodeRequest);

                console.log('AuthStage.SIGN_IN tokenResponse', tokenResponse)

                await session.update({
                    account: tokenResponse.account,
                    authCodeRequest: {
                        ...authCodeRequest,
                        code: body.data.code,
                        codeVerifier: session.data.pkceCodes.verifier
                    },
                    isAuthenticated: true
                })

                sendRedirect(event, '/')
            } catch (error) {
                console.error(error)
                throw createError({
                    statusCode: 500,
                    message: 'Login could not be completed',
                    data: error
                })
            }
            break
        case AuthStage.ACQUIRE_TOKEN:
            try {
                const tokenResponse = await msal.acquireTokenByCode(authCodeRequest);

                await session.update({
                    accessToken: tokenResponse.accessToken,
                    authCodeRequest: {
                        ...authCodeRequest,
                        code: body.data.code,
                        codeVerifier: session.data.pkceCodes.verifier
                    }
                })

                sendRedirect(event, '/auth/call-api')
            } catch (error) {
                console.error(error)
                throw createError({
                    statusCode: 500,
                    message: 'Token acquisition could not be completed',
                    data: error
                })
            }
            break;
        case AuthStage.PASSWORD_RESET:
        case AuthStage.EDIT_PROFILE:
            sendRedirect(event, '/auth/sign-in')
            break;
        default:
            console.error('Invalid auth stage')
            throw createError({
                statusCode: 401,
                message: 'Invalid auth stage'
            })
    }
})