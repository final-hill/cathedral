import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectVersionsModel extends RequirementVersionsModel { }