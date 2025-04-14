import { Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceVersionsModel extends RequirementVersionsModel { }