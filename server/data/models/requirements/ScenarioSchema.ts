import { Collection, Entity, ManyToOne } from "@mikro-orm/core";
import { Scenario, ReqType } from '../../../../domain/requirements/index.js';
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
    readonly primaryActor!: Scenario['primaryActor'];

    @ManyToOne({ entity: () => OutcomeModel })
    readonly outcome!: Scenario['outcome'];
}