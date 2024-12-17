import { Entity, Property } from '@mikro-orm/core';
import { Solution, ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from './RequirementSchema.js';

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends RequirementVersionsModel {
    @Property({ type: 'string' })
    readonly slug!: Solution['slug'];
}