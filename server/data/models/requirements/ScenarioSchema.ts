import { Entity, ManyToOne } from "@mikro-orm/core";
import { Scenario, ReqType } from '../../../../domain/requirements/index.js';
import { ExampleModel, ExampleVersionsModel } from "./ExampleSchema.js";

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioModel extends ExampleModel { }

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioVersionsModel extends ExampleVersionsModel {
    @ManyToOne({ entity: 'Stakeholder' })
    readonly primaryActor!: Scenario['primaryActor'];

    @ManyToOne({ entity: 'Outcome' })
    readonly outcome!: Scenario['outcome'];
}