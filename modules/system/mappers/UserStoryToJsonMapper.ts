import ScenarioToJsonMapper from "~/mappers/ScenarioToJsonMapper";
import type UserStory from "../domain/UserStory";

export interface UserStoryToJson extends ScenarioToJsonMapper {

}

export default class UserStoryToJsonMapper extends ScenarioToJsonMapper {
    override mapFrom(target: UserStoryToJson): UserStory {
        return new UserStory({

        });
    }

    override mapTo(source: UserStory): UserStoryToJson {
        return {
            ...super.mapTo(source),

        };
    }
}