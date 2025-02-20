import { Requirement } from "~/domain/requirements"
import { RequirementModel, RequirementVersionsModel } from "../models"
import { type Mapper } from "./Mapper"
import { Collection } from "@mikro-orm/core"

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel implements Mapper<RequirementModel & RequirementVersionsModel, Requirement> {
    async map<M extends RequirementModel & RequirementVersionsModel, R extends Requirement>(model: M): Promise<R> {
        const newProps = Object.entries(model).reduce((acc, [key, value]) => {
            if (['versions', 'latestVersion', 'req_type', 'requirement'].includes(key))
                return acc // skip
            else if (key === 'effectiveFrom')
                return { ...acc, lastModified: value }
            else if (value instanceof Collection)
                return { ...acc, [`${key}Ids`]: value.getItems().map(item => item.id) }
            else if (typeof value === 'object' && value !== null && 'id' in value)
                return { ...acc, [`${key}Id`]: value.id }
            else
                return { ...acc, [key]: value }
        }, {})

        return newProps as R
    }
}