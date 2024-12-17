import { Entity } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { MetaRequirementModel, MetaRequirementVersionsModel } from './MetaRequirementSchema.js';

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirementModel extends MetaRequirementModel { }

@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirementVersionsModel extends MetaRequirementVersionsModel { }