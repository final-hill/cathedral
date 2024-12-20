import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { BehaviorModel, BehaviorVersionsModel } from "./BehaviorSchema.js";

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleModel extends BehaviorModel {
    declare readonly versions: Collection<ExampleVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class ExampleVersionsModel extends BehaviorVersionsModel { }