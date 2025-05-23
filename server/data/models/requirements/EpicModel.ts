import { Entity, ManyToOne } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ScenarioModel, ScenarioVersionsModel } from "./ScenarioModel.js";
import { FunctionalBehaviorModel } from "./FunctionalBehaviorModel.js";

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.EPIC })
export class EpicVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}