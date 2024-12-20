import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { BehaviorModel, BehaviorVersionsModel } from "./BehaviorSchema.js";

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityModel extends BehaviorModel {
    declare readonly versions: Collection<FunctionalityVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityVersionsModel extends BehaviorVersionsModel { }