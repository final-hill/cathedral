import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import SemVer from "~/domain/SemVer";
import Limit from "~/domain/Limit";

export interface LimitJson extends RequirementJson { }

export default class LimitToJsonMapper extends RequirementToJsonMapper {
    mapFrom(target: LimitJson): Limit {
        return new Limit(target)
    }

    mapTo(source: Limit): LimitJson {
        return { ...super.mapTo(source as any) }
    }
}