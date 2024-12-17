import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementVersionsModel extends RequirementVersionsModel { }