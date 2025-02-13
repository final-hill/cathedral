import { DuplicateEntityException, MismatchException, NotFoundException, PermissionDeniedException } from "~/domain/exceptions";

/**
 * Create an HTTP error from a domain exception
 * @param error The domain exception
 * @throws {Error} The HTTP error
 */
export default function handleDomainException(error: Error) {
    if (error instanceof DuplicateEntityException)
        throw createError({ status: 409, statusMessage: "Conflict", ...error })
    else if (error instanceof NotFoundException)
        throw createError({ status: 404, statusMessage: "Not Found", ...error })
    else if (error instanceof PermissionDeniedException)
        throw createError({ status: 403, statusMessage: "Forbidden", ...error })
    else if (error instanceof MismatchException)
        throw createError({ status: 400, statusMessage: "Bad Request", ...error })
    else
        throw createError({ status: 500, statusMessage: "Internal Server Error", ...error })
}