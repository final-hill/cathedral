import ScenarioToJsonMapper, { type ScenarioJson } from "./ScenarioToJsonMapper";
import UserStory from "../domain/UserStory";
import type { Uuid } from "~/domain/Uuid";

export interface UserStoryJson extends ScenarioJson {
    behaviorId: Uuid
    epicId: Uuid
}

export default class UserStoryToJsonMapper extends ScenarioToJsonMapper {
    override mapFrom(target: UserStoryJson): UserStory {
        return new UserStory(target);
    }

    override mapTo(source: UserStory): UserStoryJson {
        return {
            ...super.mapTo(source),
            behaviorId: source.behaviorId,
            epicId: source.epicId
        };
    }
}