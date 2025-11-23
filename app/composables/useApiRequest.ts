import type { UseFetchOptions } from 'nuxt/app'
import { z } from 'zod'

interface ApiRequestOptions<TSchema extends z.ZodType> extends Omit<UseFetchOptions<z.infer<TSchema>>, 'transform'> {
    /**
     * Zod schema to parse and validate the response data
     */
    schema: TSchema
    /**
     * Custom transform function to apply after schema parsing (if provided)
     */
    transform?: (input: z.infer<TSchema>) => z.infer<TSchema> | Promise<z.infer<TSchema>>
    /**
     * Whether to show success toast on successful requests
     * @default false
     */
    showSuccessToast?: boolean
    /**
     * Custom success message for the toast
     * @default 'Request completed successfully'
     */
    successMessage?: string
    /**
     * Whether to show error toast on failed requests
     * @default true
     */
    showErrorToast?: boolean
    /**
     * Custom error message for the toast (will be used as fallback if server doesn't provide one)
     * @default 'Request failed. Please try again.'
     */
    errorMessage?: string
    /**
     * Whether to log errors to console for debugging
     * @default true in development, false in production
     */
    logErrors?: boolean
}

/**
 * Enhanced useFetch wrapper with comprehensive error handling, toast notifications, and schema validation
 *
 * Designed specifically for /api/ endpoints with required Zod schema validation for type safety.
 * Handles both client-side errors (network issues) and server-side errors (HTTP status codes).
 *
 * @param url - The API URL or request to fetch
 * @param options - Configuration options with required schema for type inference
 * @returns Promise<AsyncData> with enhanced error handling and automatic type inference
 *
 * @example
 * // Basic usage with automatic type inference from schema
 * const { data, error, status } = await useApiRequest('/api/users', {
 *   schema: z.array(UserSchema),
 *   showSuccessToast: true,
 *   successMessage: 'Users loaded successfully'
 * })
 *
 * @example
 * // With custom transform and error handling
 * const { data, refresh } = await useApiRequest('/api/requirements/person', {
 *   query: { solutionSlug, organizationSlug },
 *   schema: z.array(PersonSchema),
 *   transform: (data) => data.map(item => ({ ...item, displayName: item.name })),
 *   showErrorToast: true,
 *   errorMessage: 'Failed to load personnel data'
 * })
 */
export function useApiRequest<TSchema extends z.ZodType>({ url, options }: {
    url: string | Request | Ref<string | Request> | (() => string | Request)
    options: ApiRequestOptions<TSchema>
}) {
    const toast = useToast(),
        {
            schema,
            transform: customTransform,
            showSuccessToast = false,
            successMessage = 'Request completed successfully',
            showErrorToast = true,
            errorMessage = 'Request failed. Please try again.',
            logErrors = process.env.NODE_ENV === 'development',
            ...fetchOptions
        } = options,
        combinedTransform = schema || customTransform
            ? async (input: unknown) => {
                try {
                    let result = schema.parse(input)

                    if (customTransform)
                        result = await customTransform(result)

                    return result
                } catch (transformError) {
                    if (logErrors)
                        console.error('Transform error:', transformError)

                    if (showErrorToast) {
                        toast.add({
                            icon: 'i-lucide-alert-triangle',
                            title: 'Data Processing Error',
                            description: transformError instanceof z.ZodError
                                ? 'Invalid data format received from server'
                                : 'Failed to process server response',
                            color: 'error'
                        })
                    }

                    throw transformError
                }
            }
            : undefined,
        // Handle client-side request errors (network issues, timeouts, etc.)
        onRequestError = (context: { error: Error }) => {
            const { error } = context

            if (logErrors) {
                console.error('API Request error (client-side):', {
                    url: typeof url === 'string' ? url : '[dynamic]',
                    error: error.message,
                    stack: error.stack
                })
            }

            if (showErrorToast) {
                let displayMessage = errorMessage

                if (error.message.includes('fetch'))
                    displayMessage = 'Network error. Please check your connection and try again.'
                else if (error.message.includes('timeout'))
                    displayMessage = 'Request timed out. Please try again.'
                else if (error.message.includes('abort'))
                    displayMessage = 'Request was cancelled. Please try again.'
                else
                    displayMessage = 'Connection failed. Please check your network and try again.'

                toast.add({
                    icon: 'i-lucide-wifi-off',
                    title: 'Connection Error',
                    description: displayMessage,
                    color: 'error'
                })
            }
        },
        onResponseError = (context: { response: { status: number, statusText: string, _data: unknown } }) => {
            const { response } = context

            if (logErrors) {
                console.error('API Request failed:', {
                    url: typeof url === 'string' ? url : '[dynamic]',
                    status: response.status,
                    statusText: response.statusText,
                    data: response._data
                })
            }

            if (showErrorToast) {
                // Try to extract error message from server response
                let displayMessage = errorMessage

                if (response._data) {
                    // Common server error response patterns
                    if (typeof response._data === 'string')
                        displayMessage = response._data
                    else if (response._data && typeof response._data === 'object') {
                        const dataObj = response._data as Record<string, unknown>
                        if (dataObj.message && typeof dataObj.message === 'string')
                            displayMessage = dataObj.message
                        else if (dataObj.error && typeof dataObj.error === 'string')
                            displayMessage = dataObj.error
                        else if (dataObj.details && typeof dataObj.details === 'string')
                            displayMessage = dataObj.details
                    }
                }

                // Provide specific error messages for common HTTP status codes
                if (response.status === 401)
                    displayMessage = 'Authentication required. Please log in.'
                else if (response.status === 403)
                    displayMessage = 'Access denied. You do not have permission to perform this action.'
                else if (response.status === 404)
                    displayMessage = 'The requested resource was not found.'
                else if (response.status === 422)
                    displayMessage = 'Invalid data provided. Please check your input.'
                else if (response.status >= 500)
                    displayMessage = 'Server error. Please try again later.'

                toast.add({
                    icon: 'i-lucide-alert-circle',
                    title: 'Request Failed',
                    description: displayMessage,
                    color: 'error'
                })
            }
        },
        onResponse = (context: { response: { status: number } }) => {
            const { response } = context

            if (showSuccessToast && response.status >= 200 && response.status < 300) {
                toast.add({
                    icon: 'i-lucide-check',
                    title: 'Success',
                    description: successMessage,
                    color: 'primary'
                })
            }
        }

    return useFetch(url, {
        ...fetchOptions,
        transform: combinedTransform,
        onRequestError,
        onResponseError,
        onResponse
    })
}
