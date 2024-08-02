/**
 * Enum for the different stages of the authentication process.
 */
enum AuthStage {
    SIGN_IN = 'sign_in',
    PASSWORD_RESET = 'password_reset',
    EDIT_PROFILE = 'edit_profile',
    ACQUIRE_TOKEN = 'acquire_token'
}

export default AuthStage;