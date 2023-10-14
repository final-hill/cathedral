import { Goals } from "~/domain/Goals";
import { Mapper } from "~/usecases/Mapper";
import { StakeholdersJson, StakeholdersJsonMapper } from "./StakeholdersJsonMapper";

export interface GoalsJson {
    id: string;
    name: string;
    description: string;
    stakeholders: StakeholdersJson
}

export class GoalsJsonMapper implements Mapper<Goals, GoalsJson> {
    private _stakeholdersMapper = new StakeholdersJsonMapper()

    mapFrom(item: Goals): GoalsJson {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            stakeholders: this._stakeholdersMapper.mapFrom(item.stakeholders)
        }
    }
    mapTo(item: GoalsJson): Goals {
        return new Goals({
            id: item.id,
            name: item.name,
            description: item.description,
            stakeholders: this._stakeholdersMapper.mapTo(item.stakeholders)
        })
    }
}