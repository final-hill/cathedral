import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseVersionsModel extends RequirementVersionsModel { }