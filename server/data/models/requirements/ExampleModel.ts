import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { BehaviorModel, BehaviorVersionsModel } from "./BehaviorModel.js";

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleModel extends BehaviorModel {
    declare readonly versions: Collection<ExampleVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleVersionsModel extends BehaviorVersionsModel { }