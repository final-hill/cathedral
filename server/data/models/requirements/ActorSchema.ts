import { Collection, Entity } from "@mikro-orm/core";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";
import { ReqType } from "./ReqType.js";

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorModel extends RequirementModel {
    declare readonly versions: Collection<ActorVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorVersionsModel extends RequirementVersionsModel { }