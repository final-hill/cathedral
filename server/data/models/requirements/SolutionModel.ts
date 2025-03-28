import { Collection, Entity, Property, types } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from './RequirementModel.js';

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends RequirementModel {
    declare readonly versions: Collection<SolutionVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string
}