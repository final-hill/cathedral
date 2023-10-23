import { Goals } from "~/domain/Goals";
import { type Mapper } from "~/usecases/Mapper";
import { type StakeholdersJson, StakeholdersJsonMapper } from "./StakeholdersJsonMapper";

export interface GoalsJson {
    description: string;
    id: string;
    name: string;
    objective: string;
    outcomes: string;
    stakeholders: StakeholdersJson
    situation: string
}

export class GoalsJsonMapper implements Mapper<Goals, GoalsJson> {
    private _stakeholdersMapper = new StakeholdersJsonMapper()

    mapFrom(item: Goals): GoalsJson {
        return {
            description: item.description,
            id: item.id,
            name: item.name,
            objective: item.objective,
            outcomes: item.outcomes,
            situation: item.situation,
            stakeholders: this._stakeholdersMapper.mapFrom(item.stakeholders)
        }
    }
    mapTo(item: GoalsJson): Goals {
        return new Goals({
            description: item.description,
            id: item.id,
            name: item.name,
            objective: item.objective,
            outcomes: item.outcomes,
            situation: item.situation,
            stakeholders: this._stakeholdersMapper.mapTo(item.stakeholders)
        })
    }
}