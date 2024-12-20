import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorModel extends RequirementModel {
    declare readonly versions: Collection<ActorVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorVersionsModel extends RequirementVersionsModel { }