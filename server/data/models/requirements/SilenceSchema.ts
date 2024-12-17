import { Entity } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceVersionsModel extends RequirementVersionsModel { }