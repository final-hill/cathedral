import { Entity, ManyToOne, Property, type Ref, types } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { MetaRequirementModel, MetaRequirementVersionsModel } from './MetaRequirementModel.js';
import { OrganizationModel } from '../index.js';

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionModel extends MetaRequirementModel { }

@Entity({ discriminatorValue: ReqType.SOLUTION })
export class SolutionVersionsModel extends MetaRequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string

    /**
     * The organization that the solution belongs to
     */
    @ManyToOne({ entity: () => OrganizationModel })
    readonly organization!: Ref<OrganizationModel>;
}