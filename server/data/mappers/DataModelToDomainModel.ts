import { z } from "zod"
import { Requirement } from "#shared/domain/requirements"
import { ReqType } from "#shared/domain/requirements/ReqType"
import { AppUserModel, RequirementModel, RequirementVersionsModel, StaticAuditModel } from "../models"
import { type Mapper } from "./Mapper"

const objectSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    reqType: z.nativeEnum(ReqType).optional() // AppUserModel does not have reqType
});

async function replaceReferenceMembers<M extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>>(model: M): Promise<M> {
    const updatedModel = { ...model };

    for (const [key, value] of Object.entries(model)) {
        if (value instanceof RequirementModel || value instanceof AppUserModel) {
            const latestVersion = await value.getLatestVersion(new Date());
            Reflect.set(updatedModel, key, { id: value.id, name: latestVersion?.name });
        }
    }

    return updatedModel;
}

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel<
    From extends Partial<Omit<RequirementModel, 'getLatestVersion'> & RequirementVersionsModel>,
    To extends z.infer<typeof Requirement>
> implements Mapper<From, To> {
    async map(model: From): Promise<To> {
        const updatedModel = await replaceReferenceMembers(model);

        const entries = Object.entries(updatedModel).map(([key, value]) => {
            if (['req_type', 'requirement', 'versions'].includes(key))
                return [key, undefined]; // skip
            else if (key === 'effectiveFrom')
                return ['lastModified', value];
            else if (objectSchema.safeParse(value).success)
                return [key, objectSchema.parse(value)];
            else if (value === null)
                return [key, undefined]; // convert null to undefined
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