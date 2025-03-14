import { DuplicateEntityException, MismatchException, NotFoundException, PermissionDeniedException } from "#shared/domain/exceptions";

/**
 * Create an HTTP error from a domain exception
 * @param error The domain exception
 * @throws {Error} The HTTP error
 */
export default function handleDomainException(error: Error) {
    if (error instanceof DuplicateEntityException)
        throw createError({ status: 409, statusMessage: `Conflict: ${error.message}`, ...error })
    else if (error instanceof NotFoundException)
        throw createError({ status: 404, statusMessage: `Not Found: ${error.message}`, ...error })
    else if (error instanceof PermissionDeniedException)
        throw createError({ status: 403, statusMessage: `Forbidden: ${error.message}`, ...error })
    else if (error instanceof MismatchException)
        throw createError({ status: 400, statusMessage: `Bad Request: ${error.message}`, ...error })
    else
        throw createError({ status: 500, statusMessage: `Internal Server Error: ${error.message}`, ...error })
}