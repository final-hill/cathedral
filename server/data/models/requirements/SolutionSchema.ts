import { Collection, Entity, Property } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from './RequirementSchema.js';

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends RequirementModel {
    declare readonly versions: Collection<SolutionVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends RequirementVersionsModel {
    @Property()
    readonly slug!: string
}