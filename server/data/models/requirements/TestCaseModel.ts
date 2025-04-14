import { Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from './RequirementModel.js';

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseVersionsModel extends RequirementVersionsModel { }