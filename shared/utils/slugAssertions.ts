import { slugify } from './slugify.js'
import { MismatchException } from '../domain/exceptions/index.js'

/**
 * Asserts that a slug matches the slugified version of the source name
 * @param params - The assertion parameters
 * @param params.name - The source name
 * @param params.slug - The slug to assert
 * @throws {MismatchException} If the slug doesn't match the slugified name
 */
export function assertSlugMatchesName({ name, slug }: { name: string, slug: string }): void {
    const expectedSlug = slugify(name)
    if (slug !== expectedSlug)
        throw new MismatchException(`The slug '${slug}' must be the slugified version of the name '${name}' (expected: '${expectedSlug}')`)
}

/**
 * Asserts that a slug is properly formatted
 * @param slug - The slug to assert
 * @throws {MismatchException} If the slug is not properly formatted
 */
export function assertSlugFormat(slug: string): void {
    const slugified = slugify(slug)
    if (slug !== slugified)
        throw new MismatchException(`The slug '${slug}' must be a properly slugified string (expected: '${slugified}')`)
}

/**
 * Asserts that a solution name doesn't slugify to a reserved value
 * @param name - The solution name to assert
 * @throws {MismatchException} If the name slugifies to a reserved value
 */
export function assertSolutionNameNotReserved(name: string): void {
    const RESERVED_SLUGS = ['new-solution', 'edit-entry', 'users'],
        slug = slugify(name)

    if (RESERVED_SLUGS.includes(slug))
        throw new MismatchException(`The name '${name}' cannot be used because it would create a reserved slug '${slug}'. Reserved slugs are: ${RESERVED_SLUGS.join(', ')}`)
}
