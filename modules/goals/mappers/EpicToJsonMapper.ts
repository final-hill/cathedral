import ScenarioToJsonMapper, { type ScenarioJson } from "~/modules/system/mappers/ScenarioToJsonMapper";
import Epic from "../domain/Epic";

export interface EpicJson extends ScenarioJson { }

export default class EpicToJsonMapper extends ScenarioToJsonMapper {
    mapFrom(target: EpicJson): Epic {
        return new Epic({ ...target })
    }

    mapTo(source: Epic): EpicJson {
        return {
            ...super.mapTo(source as any),
        }
    }
}