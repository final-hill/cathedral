import { Collection, Entity, ManyToOne } from "@mikro-orm/core";
import { Scenario } from '../../../../domain/requirements/index.js';
import { ReqType } from "./ReqType.js";
import { ExampleModel, ExampleVersionsModel } from "./ExampleSchema.js";
import { StakeholderModel } from "./StakeholderSchema.js";
import { OutcomeModel } from "./OutcomeSchema.js";

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioModel extends ExampleModel {
    declare readonly versions: Collection<ScenarioVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioVersionsModel extends ExampleVersionsModel {
    @ManyToOne({ entity: () => StakeholderModel })
    readonly primaryActor!: Scenario['primaryActorId'];

    @ManyToOne({ entity: () => OutcomeModel })
    readonly outcome!: Scenario['outcomeId'];
}