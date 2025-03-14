import { Collection, Entity } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from './RequirementSchema.js';

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseModel extends RequirementModel {
    declare readonly versions: Collection<TestCaseVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCaseVersionsModel extends RequirementVersionsModel { }