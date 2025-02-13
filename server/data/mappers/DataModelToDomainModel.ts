import { Requirement } from "~/domain/requirements"
import { RequirementModel } from "../models"
import { type Mapper } from "./Mapper"
import { Collection } from "@mikro-orm/core"

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel implements Mapper<RequirementModel, Requirement> {
    async map<M extends RequirementModel, R extends Requirement>(model: M): Promise<R> {
        const staticProps = Object.entries(model).reduce((acc, [key, value]) => {
            if (typeof value === 'object' && value !== null && 'id' in value)
                return { ...acc, [`${key}Id`]: value.id }
            else if (key === 'versions' || key === 'latestVersion')
                return acc // skip
            else
                return { ...acc, [key]: value }
        }, {})

        const version = (await model.latestVersion)!

        const versionProps = Object.entries(version).reduce((acc, [key, value]) => {
            if (key === 'requirement')
                return acc // skip
            else if (typeof value === 'object' && value !== null && 'id' in value)
                return { ...acc, [`${key}Id`]: value.id }
            else if (key === 'effectiveFrom')
                return { ...acc, lastModified: value }
            else if (value instanceof Collection)
                return { ...acc, [`${key}Ids`]: value.getItems().map(item => item.id) }
            else
                return { ...acc, [key]: value }
        }, {})

        return await ({ ...staticProps, ...versionProps } as R)
    }
}