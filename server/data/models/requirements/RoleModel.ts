import { Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ResponsibilityModel, ResponsibilityVersionsModel } from './ResponsibilityModel.js';

@Entity({ discriminatorValue: ReqType.ROLE })
export class RoleModel extends ResponsibilityModel { }

@Entity({ discriminatorValue: ReqType.ROLE })
export class RoleVersionsModel extends ResponsibilityVersionsModel { }