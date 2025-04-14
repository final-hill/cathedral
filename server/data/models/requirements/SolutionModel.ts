import { Entity, ManyToOne, Property, type Ref, types } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from './RequirementModel.js';
import { OrganizationModel } from '../index.js';

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string

    /**
     * The organization that the solution belongs to
     */
    @ManyToOne({ entity: () => OrganizationModel })
    readonly organization!: Ref<OrganizationModel>;
}