import { z } from "zod"
import { Requirement } from "#shared/domain/requirements"
import { RequirementModel, RequirementVersionsModel } from "../models"
import { type Mapper } from "./Mapper"

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel<
    From extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>,
    To extends z.infer<typeof Requirement>
> implements Mapper<From, To> {
    map(model: From): To {
        const entries = Object.entries(model).map(([key, value]) => {
            if (['req_type', 'requirement', 'versions'].includes(key))
                return [key, undefined]; // skip
            else if (key === 'effectiveFrom')
                return ['lastModified', value];
            else if (typeof value === 'object' && value !== null && 'id' in value)
                return [key, { name: '{unknown}', id: value.id }];
            else if (typeof value === 'object' && value === null)
                return [key, undefined]; // convert null to undefined
            else if (key === 'id' && value === null)
                return [key, undefined];
            else if (key === 'reqId' && value === null)
                return [key, undefined];
            else
                return [key, value];
        });

        const newProps = entries.reduce((acc, [key, value]) => {
            if (value !== undefined)
                acc[key as string] = value;
            return acc;
        }, {} as Record<string, any>);

        return newProps as To;
    }
}