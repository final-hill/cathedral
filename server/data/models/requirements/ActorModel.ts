import { Entity } from "@mikro-orm/core";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ACTOR })
export class ActorVersionsModel extends RequirementVersionsModel { }