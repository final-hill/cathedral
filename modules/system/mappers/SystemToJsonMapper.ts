import PEGSToJsonMapper, { type PEGSJson } from "~/mappers/PEGSToJsonMapper";
import System from "../domain/System";
import type { Uuid } from "~/domain/Uuid";

export interface SystemToJson extends PEGSJson {
    componentIds: Uuid[]
}

export default class SystemToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: SystemToJson): System {
        return new System({
            componentIds: target.componentIds,
            id: target.id,
            limitationIds: target.limitationIds,
            solutionId: target.solutionId
        });
    }

    override mapTo(source: System): SystemToJson {
        return {
            ...super.mapTo(source),
            componentIds: source.componentIds
        };
    }
}