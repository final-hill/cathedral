import { Collection, Entity, ManyToOne } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ExampleModel, ExampleVersionsModel } from "./ExampleModel.js";
import { StakeholderModel } from "./StakeholderModel.js";
import { OutcomeModel } from "./OutcomeModel.js";

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioModel extends ExampleModel {
    declare readonly versions: Collection<ScenarioVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SCENARIO })
export class ScenarioVersionsModel extends ExampleVersionsModel {
    @ManyToOne({ entity: () => StakeholderModel })
    readonly primaryActor!: StakeholderModel;

    @ManyToOne({ entity: () => OutcomeModel })
    readonly outcome!: OutcomeModel;
}