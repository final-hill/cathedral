import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.GOAL })
export class GoalVersionsModel extends RequirementVersionsModel { }