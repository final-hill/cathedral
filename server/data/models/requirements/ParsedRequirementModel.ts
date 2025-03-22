import { Collection, Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { MetaRequirementModel, MetaRequirementVersionsModel } from './MetaRequirementModel.js';

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirementModel extends MetaRequirementModel {
    declare readonly versions: Collection<ParsedRequirementVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirementVersionsModel extends MetaRequirementVersionsModel { }