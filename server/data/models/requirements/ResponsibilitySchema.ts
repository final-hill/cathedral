import { Collection, Entity } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from './RequirementSchema.js';

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityModel extends RequirementModel {
    declare readonly versions: Collection<ResponsibilityVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class ResponsibilityVersionsModel extends RequirementVersionsModel { }