import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { MetaRequirementModel, MetaRequirementVersionsModel } from './MetaRequirementModel.js';
import { RequirementModel } from '../index.js';

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENTS })
export class ParsedRequirementsModel extends MetaRequirementModel {
    @OneToMany(() => RequirementModel, (o) => o.parsedRequirements)
    readonly requirements = new Collection<RequirementModel>(this);
}

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENTS })
export class ParsedRequirementsVersionsModel extends MetaRequirementVersionsModel { }