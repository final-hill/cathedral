import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalModel extends RequirementModel {
    declare readonly versions: Collection<GoalVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalVersionsModel extends RequirementVersionsModel { }