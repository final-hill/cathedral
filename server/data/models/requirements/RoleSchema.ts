import { Collection, Entity } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { ResponsibilityModel, ResponsibilityVersionsModel } from './ResponsibilitySchema.js';

@Entity({ discriminatorValue: ReqType.ROLE })
export class Role extends ResponsibilityModel {
    declare readonly versions: Collection<RoleVersions, object>;
}

@Entity({ discriminatorValue: ReqType.ROLE })
export class RoleVersions extends ResponsibilityVersionsModel { }