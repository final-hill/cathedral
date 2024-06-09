import SemVer from "~/domain/SemVer";
import GoalToJsonMapper, { type GoalJson } from "./GoalToJsonMapper";
import Obstacle from "../domain/Obstacle";

export interface ObstacleJson extends GoalJson { }

export default class ObstacleToJsonMapper extends GoalToJsonMapper {
    override mapFrom(target: ObstacleJson): Obstacle {
        const version = new SemVer(target.serializationVersion);

        return new Obstacle(target);
    }

    override mapTo(source: Obstacle): ObstacleJson {
        return {
            ...super.mapTo(source as any)
        };
    }
}