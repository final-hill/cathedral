import { z } from 'zod'
import type { Requirement } from '#shared/domain/requirements'
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { RequirementVersionsModel } from '../models'
import { AppUserModel, AppCredentialsModel, RequirementModel } from '../models'
import type { Mapper } from './Mapper'
import { Collection } from '@mikro-orm/core'
import { resolveReqTypeFromModel } from '~/shared/utils'

const objectSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    reqType: z.nativeEnum(ReqType).optional() // AppUserModel does not have reqType
})

async function replaceReferenceMembers<M extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>>(model: M): Promise<M> {
    const updatedModel = { ...model }

    for (const [key, value] of Object.entries(model)) {
        if (value instanceof RequirementModel) {
            const latestVersion = await value.getLatestVersion(new Date())
            Reflect.set(updatedModel, key, { id: value.id, name: latestVersion?.name })
        } else if (value instanceof AppUserModel) {
            Reflect.set(updatedModel, key, { id: value.id, name: value.name })
        } else if (value instanceof AppCredentialsModel) {
            Reflect.set(updatedModel, key, {
                id: value.id,
                appUser: {
                    id: value.appUser.id,
                    name: value.appUser.name,
                    email: value.appUser.email
                },
                publicKey: value.publicKey,
                counter: value.counter,
                backedUp: value.backedUp,
                transports: value.transports || []
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
    To extends z.infer<typeof Requirement>
> implements Mapper<From, To> {
    async map(model: From): Promise<To> {
        const updatedModel = await replaceReferenceMembers(model)

        const entries = await Promise.all(Object.entries(updatedModel).map(async ([key, value]) => {
            if (['req_type', 'requirement', 'versions'].includes(key))
                return [key, undefined] // skip
            else if (key === 'effectiveFrom')
                return ['lastModified', value]
            else if (value instanceof Collection) {
                const items = await value.loadItems()
                const processedItems = await Promise.all(items.map(async (item) => {
                    if (item instanceof RequirementModel) {
                        const latestVersion = await item.getLatestVersion(new Date()),
                            reqType = resolveReqTypeFromModel(item)
                        return { id: item.id, name: latestVersion?.name, reqType }
                    } else if (item instanceof AppUserModel) {
                        return { id: item.id, name: item.name }
                    } else if (item instanceof AppCredentialsModel) {
                        return {
                            id: item.id,
                            appUser: {
                                id: item.appUser.id,
                                name: item.appUser.name,
                                email: item.appUser.email
                            },
                            publicKey: item.publicKey,
                            counter: item.counter,
                            backedUp: item.backedUp,
                            transports: item.transports || []
                        }
                    }
                    // This should not happen if all model types are handled
                    throw new Error(`Unhandled model type in collection: ${item.constructor.name}`)
                }))
                // Filter out any undefined/null values
                return [key, processedItems.filter(Boolean)]
            } else if (value instanceof AppUserModel)
                return [key, { id: value.id, name: value.name }]
            else if (value instanceof AppCredentialsModel)
                return [key, {
                    id: value.id,
                    appUser: {
                        id: value.appUser.id,
                        name: value.appUser.name,
                        email: value.appUser.email
                    },
                    publicKey: value.publicKey,
                    counter: value.counter,
                    backedUp: value.backedUp,
                    transports: value.transports || []
                }]
            else if (objectSchema.safeParse(value).success)
                return [key, objectSchema.parse(value)]
            else if (value == null)
                return [key, undefined] // convert null to undefined
            else
                return [key, value]
        }))

        const newProps = entries.reduce((acc, [key, value]) => {
            if (value !== undefined)
                acc[key as string] = value
            return acc
        }, {} as Record<string, unknown>)

        return newProps as To
    }
}
