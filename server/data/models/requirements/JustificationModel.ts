import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { MetaRequirementModel, MetaRequirementVersionsModel } from "./MetaRequirementModel.js";

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationModel extends MetaRequirementModel { }

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationVersionsModel extends MetaRequirementVersionsModel { }