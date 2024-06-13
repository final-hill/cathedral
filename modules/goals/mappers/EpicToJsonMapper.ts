import type { ScenarioJson } from "~/mappers/ScenarioToJsonMapper";
import Epic from "../domain/Epic";
import ScenarioToJsonMapper from "~/mappers/ScenarioToJsonMapper";

export interface EpicJson extends ScenarioJson { }

export default class EpicToJsonMapper extends ScenarioToJsonMapper {
    mapFrom(target: EpicJson): Epic {
        return new Epic({
            id: target.id,
            parentId: target.parentId,
            primaryActorId: target.primaryActorId,
            name: target.name,
            property: target.property,
            statement: target.statement
        })
    }

    mapTo(source: Epic): EpicJson {
        return {
            ...super.mapTo(source as any),
        }
    }
}