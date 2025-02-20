import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";
import { FunctionalityModel, FunctionalityVersionsModel } from "./FunctionalitySchema.js";

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorModel extends FunctionalityModel {
    declare readonly versions: Collection<FunctionalBehaviorVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorVersionsModel extends FunctionalityVersionsModel { }