import type { ReqType } from '#shared/domain/requirements/ReqType'
import { pascalCaseToSnakeCase } from './pascalCaseToSnakeCase'

/**
 * Resolves the ReqType from a MikroORM RequirementModel instance.
 *
 * This utility works around a Single Table Inheritance (STI) issue where
 * the req_type discriminator property may be undefined even though the
 * correct subclass is instantiated.
 *
 * @param requirementModel - The RequirementModel instance
 * @returns The resolved ReqType
 * @throws Error if req_type cannot be resolved
 *
 * @example
 * const reqType = resolveReqTypeFromModel(parsedRequirementsModel);
 * // Returns ReqType.PARSED_REQUIREMENTS
 */
export function resolveReqTypeFromModel(requirementModel: { req_type?: ReqType, constructor: { name: string } }): ReqType {
    // Try the direct property first (might work in some cases)
    if (requirementModel.req_type)
        return requirementModel.req_type

    // Fallback: derive from constructor name using utilities
    const constructorName = requirementModel.constructor.name
    if (constructorName.endsWith('Model')) {
        const classNameWithoutModel = constructorName.slice(0, -5), // Remove "Model"
            snakeCaseType = pascalCaseToSnakeCase(classNameWithoutModel)
        return snakeCaseType as ReqType
    }

    throw new Error(`Unable to resolve req_type for ${constructorName}`)
}
