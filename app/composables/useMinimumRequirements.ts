import { ReqType } from '#shared/domain'
import { MINIMUM_REQUIREMENT_TYPES } from '#shared/domain/requirements/minimumRequirements'
import * as req from '#shared/domain/requirements'
import { snakeCaseToPascalCase } from '#shared/utils'
import { z } from 'zod'

/**
 * Get UI metadata for a requirement type from its domain schema
 */
function getRequirementMetadata(reqType: ReqType) {
    const ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
        RequirementSchema = req[ReqTypePascal]

    if (!RequirementSchema)
        throw new Error(`Requirement schema not found for: ${reqType}`)

    const shape = RequirementSchema.shape,
        // Extract label from name field (either literal value or fallback to schema description)
        nameField = shape.name,
        label = nameField instanceof z.ZodLiteral
            ? nameField._def.value
            : snakeCaseToPascalCase(reqType),
        // Extract reqIdPrefix default value
        reqIdPrefixField = shape.reqIdPrefix,
        reqIdPrefix = reqIdPrefixField instanceof z.ZodDefault
            ? reqIdPrefixField._def.defaultValue()
            : '',
        code = reqIdPrefix.replace(/\./g, ''),
        // Extract uiBasePathTemplate default value
        uiPathField = shape.uiBasePathTemplate,
        path = uiPathField instanceof z.ZodDefault
            ? uiPathField._def.defaultValue()
            : ''

    return { reqType, label, code, path }
}

/**
 * Group requirements by their section based on the ReqType enum structure
 */
function getRequirementSection(reqType: ReqType): string {
    // Map requirement types to their logical sections
    const sectionMap: Record<string, string> = {
        [ReqType.CONTEXT_AND_OBJECTIVE]: 'Goals',
        [ReqType.OUTCOME]: 'Goals',
        [ReqType.STAKEHOLDER]: 'Goals',
        [ReqType.SYSTEM_COMPONENT]: 'System',
        [ReqType.FUNCTIONAL_BEHAVIOR]: 'System',
        [ReqType.CONSTRAINT]: 'Environment',
        [ReqType.MILESTONE]: 'Project',
        [ReqType.TASK]: 'Project'
    }

    return sectionMap[reqType] || 'Other'
}

/**
 * Composable for working with minimum requirements validation
 * This composable delegates business logic to the API layer following Clean Architecture
 */
export function useMinimumRequirements() {
    /**
     * Check if a requirement type is one of the minimum requirements
     */
    const isMinimumRequirementType = (reqType: ReqType): boolean => {
            return MINIMUM_REQUIREMENT_TYPES.includes(reqType)
        },
        getMissingRequirements = async (params: {
            organizationSlug: string
            solutionSlug: string
        }): Promise<ReqType[]> => {
            const data = await $fetch('/api/requirements/minimum-requirements', {
                query: { organizationSlug: params.organizationSlug, solutionSlug: params.solutionSlug }
            })

            return data as ReqType[]
        },
        isRequirementMissing = async (params: {
            reqType: ReqType
            organizationSlug: string
            solutionSlug: string
        }): Promise<boolean> => {
            if (!isMinimumRequirementType(params.reqType))
                return false

            const data = await $fetch(`/api/requirements/minimum-requirements/${params.reqType}`, {
                query: { organizationSlug: params.organizationSlug, solutionSlug: params.solutionSlug }
            })

            return data as boolean
        },
        getMissingRequirementsBySection = async (params: {
            organizationSlug: string
            solutionSlug: string
        }): Promise<Record<string, { reqType: ReqType, label: string, section: string, code: string, path: string }[]>> => {
            const missingReqTypes = await getMissingRequirements({ organizationSlug: params.organizationSlug, solutionSlug: params.solutionSlug }),
                enrichedMissing = missingReqTypes.map((reqType: ReqType) => {
                    const metadata = getRequirementMetadata(reqType),
                        section = getRequirementSection(reqType)

                    return {
                        reqType,
                        label: metadata.label,
                        section,
                        code: metadata.code,
                        path: metadata.path.replace('[org]', params.organizationSlug).replace('[solutionslug]', params.solutionSlug)
                    }
                })

            // eslint-disable-next-line max-params
            return enrichedMissing.reduce((acc: Record<string, { reqType: ReqType, label: string, section: string, code: string, path: string }[]>, requirement) => {
                if (!acc[requirement.section])
                    acc[requirement.section] = []

                acc[requirement.section]!.push(requirement)
                return acc
            }, {})
        }

    return {
        MINIMUM_REQUIREMENT_TYPES,
        isMinimumRequirementType,
        getMissingRequirements,
        isRequirementMissing,
        getMissingRequirementsBySection
    }
}
