import { z } from 'zod'
import type { RequirementType } from '#shared/domain/requirements'
import * as refs from '#shared/domain/requirements/EntityReferences'
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { RequirementVersionsModel } from '../models'
import { RequirementModel } from '../models'
import type { Mapper } from '#shared/types/Mapper'
import { Collection } from '@mikro-orm/core'
import { resolveReqTypeFromModel, snakeCaseToPascalCase } from '#shared/utils'

const objectSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    reqType: z.nativeEnum(ReqType),
    workflowState: z.string(),
    lastModified: z.date()
})

/**
 * Creates a domain EntityReference from a RequirementModel
 */
export async function createDomainReferenceFromModel(model: RequirementModel) {
    const latestVersion = await model.getLatestVersion(new Date()),
        reqType = resolveReqTypeFromModel(model),
        reqTypePascal = snakeCaseToPascalCase(reqType),
        refSchema = refs[`${reqTypePascal}Reference` as keyof typeof refs]

    if (!refSchema)
        throw new Error(`No reference schema found for requirement type: ${reqType}`)

    return refSchema.parse({
        id: model.id,
        name: latestVersion?.name,
        workflowState: latestVersion?.workflowState,
        lastModified: latestVersion?.effectiveFrom
    })
}

/**
 * Creates a domain RequirementVersionReference from a RequirementVersionsModel
 */
export async function createDomainVersionReferenceFromModel(versionModel: RequirementVersionsModel) {
    const reqType = resolveReqTypeFromModel(versionModel)

    return refs.RequirementVersionReference.parse({
        reqType,
        requirementId: versionModel.requirement.id,
        effectiveFrom: versionModel.effectiveFrom,
        name: versionModel.name,
        workflowState: versionModel.workflowState
    })
}

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel<
    From extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>,
    To extends RequirementType
> implements Mapper<From, To> {
    async map(model: From): Promise<To> {
        const entries = await Promise.all(Object.entries(model).map(async ([key, value]) => {
                if (['req_type', 'requirement', 'versions'].includes(key)) return [key, undefined] // skip
                else if (key === 'effectiveFrom') return ['lastModified', value]
                else if (key === 'appUserId') return ['appUser', value ? { id: value, name: 'Unknown User', entityType: 'app_user' } : undefined] // Convert appUserId to appUser reference
                else if (key === 'createdById') return ['createdBy', { id: value, name: 'Unknown User' }] // Will be enriched by interactor
                else if (key === 'modifiedById') return ['modifiedBy', { id: value, name: 'Unknown User' }] // Will be enriched by interactor
                else if (value instanceof RequirementModel)
                    return [key, await createDomainReferenceFromModel(value)]
                else if (value instanceof Collection) {
                    const items = await value.loadItems(),
                        processedItems = await Promise.all(items.map(async (item) => {
                            if (item instanceof RequirementModel)
                                return await createDomainReferenceFromModel(item)
                        }))
                    // Filter out any undefined/null values
                    return [key, processedItems.filter(Boolean)]
                } else if (objectSchema.safeParse(value).success) return [key, objectSchema.parse(value)]
                else if (value == null) return [key, undefined] // convert null to undefined
                else return [key, value]
            })),
            newProps = entries.reduce((acc, [key, value]) => {
                if (value !== undefined) acc[key as string] = value
                return acc
            }, {} as Record<string, unknown>)

        return newProps as To
    }
}
