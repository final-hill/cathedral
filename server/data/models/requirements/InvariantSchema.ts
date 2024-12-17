import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantVersionsModel extends RequirementVersionsModel { }