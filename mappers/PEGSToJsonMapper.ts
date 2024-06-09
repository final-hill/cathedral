import type { Uuid } from "~/domain/Uuid";
import PEGS from "~/domain/PEGS";
import EntityToJsonMapper, { type EntityJson } from "./EntityToJsonMapper";
import SemVer from "~/domain/SemVer";

export interface PEGSJson extends EntityJson {
    componentIds: Uuid[]
    limitationIds: Uuid[]
    solutionId: Uuid
}

export default class PEGSToJsonMapper extends EntityToJsonMapper {
    mapFrom(target: PEGSJson): PEGS {
        const version = new SemVer(target.serializationVersion);

        return new PEGS(target);
    }

    mapTo(source: PEGS): PEGSJson {
        return {
            serializationVersion: this.serializationVersion,
            id: source.id,
            solutionId: source.solutionId,
            componentIds: source.componentIds,
            limitationIds: source.limitationIds
        };
    }
}