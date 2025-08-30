import { z } from 'zod'
import type { RequirementType } from '#shared/domain/requirements'
import * as req from '#shared/domain/requirements'
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { RequirementVersionsModel } from '../models'
import { RequirementModel } from '../models'
import type { Mapper } from './Mapper'
import { Collection } from '@mikro-orm/core'

const objectSchema = z.object({
        id: z.string().uuid(),
        name: z.string(),
        reqType: z.nativeEnum(ReqType),
        workflowState: z.string(),
        lastModified: z.date()
    }),
    getReqIdPrefixForType = (reqType: ReqType): string | undefined => {
        const reqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            requirementSchema = req[reqTypePascal],
            directValue = (requirementSchema as z.ZodObject<z.ZodRawShape>)?.shape?.reqIdPrefix?._def?.defaultValue?.(),
            innerValue = (requirementSchema as z.ZodEffects<z.ZodObject<z.ZodRawShape>>)?.innerType?.()?.shape?.reqIdPrefix?._def?.defaultValue?.()

        return directValue || innerValue
    }

async function replaceReferenceMembers<M extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>>(model: M): Promise<M> {
    const updatedModel = { ...model }

    for (const [key, value] of Object.entries(model)) {
        if (value instanceof RequirementModel) {
            const latestVersion = await value.getLatestVersion(new Date()),
                reqType = resolveReqTypeFromModel(value)
            Reflect.set(updatedModel, key, {
                id: value.id,
                name: latestVersion?.name,
                reqType,
                workflowState: latestVersion?.workflowState,
                lastModified: latestVersion?.effectiveFrom,
                reqIdPrefix: getReqIdPrefixForType(reqType)
            })
        }
    }

    return updatedModel
}

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel<
    From extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>,
    To extends RequirementType
> implements Mapper<From, To> {
    async map(model: From): Promise<To> {
        const updatedModel = await replaceReferenceMembers(model),

            entries = await Promise.all(Object.entries(updatedModel).map(async ([key, value]) => {
                if (['req_type', 'requirement', 'versions'].includes(key)) return [key, undefined] // skip
                else if (key === 'effectiveFrom') return ['lastModified', value]
                else if (key === 'createdById') return ['createdBy', { id: value, name: 'Unknown User' }] // Will be enriched by interactor
                else if (key === 'modifiedById') return ['modifiedBy', { id: value, name: 'Unknown User' }] // Will be enriched by interactor
                else if (value instanceof Collection) {
                    const items = await value.loadItems(),
                        processedItems = await Promise.all(items.map(async (item) => {
                            if (item instanceof RequirementModel) {
                                const latestVersion = await item.getLatestVersion(new Date()),
                                    reqType = resolveReqTypeFromModel(item)
                                return {
                                    id: item.id,
                                    name: latestVersion?.name,
                                    reqType,
                                    workflowState: latestVersion?.workflowState,
                                    lastModified: latestVersion?.effectiveFrom,
                                    reqIdPrefix: getReqIdPrefixForType(reqType)
                                }
                            }
                            // This should not happen if all model types are handled
                            throw new Error(`Unhandled model type in collection: ${item.constructor.name}`)
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
