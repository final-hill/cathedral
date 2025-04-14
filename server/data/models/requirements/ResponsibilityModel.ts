import { Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from './RequirementModel.js';

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityVersionsModel extends RequirementVersionsModel { }