import { Collection, Entity, ManyToOne } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { ScenarioModel, ScenarioVersionsModel } from "./ScenarioSchema.js";
import { FunctionalBehaviorModel } from "./FunctionalBehaviorSchema.js";

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicModel extends ScenarioModel {
    declare readonly versions: Collection<EpicVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}