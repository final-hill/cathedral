import { Requirement } from "#shared/domain/requirements"
import { z } from "zod"
import { RequirementModel, RequirementVersionsModel } from "../models"
import { type Mapper } from "./Mapper"
import { Collection } from "@mikro-orm/core"

/**
 * Converts a data model to a domain model
 */
export class DataModelToDomainModel implements Mapper<RequirementModel & RequirementVersionsModel, z.infer<typeof Requirement>> {
    async map<M extends RequirementModel & RequirementVersionsModel, R extends z.infer<typeof Requirement>>(model: M): Promise<R> {
        const entries = Object.entries(model).map(async ([key, value]) => {
            if (['versions', 'latestVersion', 'req_type', 'requirement'].includes(key)) {
                return [key, undefined]; // skip
            } else if (key === 'effectiveFrom') {
                return ['lastModified', value];
            } else if (value instanceof Collection) {
                const items = await Promise.all(value.getItems().map(async item => {
                    const name = (await item.latestVersion)?.name ?? '{unknown}';
                    return { name, id: item.id };
                }));
                return [key, items];
            } else if (typeof value === 'object' && value !== null && 'id' in value) {
                const name = (await value.latestVersion)?.name ?? '{unknown}';
                return [key, { name, id: value.id }];
            } else if (key === 'reqId' && value === null) {
                return [key, undefined];
            } else {
                return [key, value];
            }
        });

        const resolvedEntries = await Promise.all(entries);
        const newProps = resolvedEntries.reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);

        return newProps as R;
    }
}