import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { MetaRequirementModel, MetaRequirementVersionsModel } from "./MetaRequirementSchema.js";

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationModel extends MetaRequirementModel { }

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationVersionsModel extends MetaRequirementVersionsModel { }