import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import SemVer from "~/domain/SemVer";
import Limit from "~/domain/Limit";

export interface LimitJson extends RequirementJson { }

export default class LimitToJsonMapper extends RequirementToJsonMapper {
    mapFrom(target: LimitJson): Limit {
        const version = new SemVer(target.serializationVersion);

        return new Limit({
            id: target.id,
            parentId: target.parentId,
            name: target.name,
            property: target.property,
            statement: target.statement
        })
    }

    mapTo(source: Limit): LimitJson {
        return {
            ...super.mapTo(source as any)
        }
    }
}