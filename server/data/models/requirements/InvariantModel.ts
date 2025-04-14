import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantVersionsModel extends RequirementVersionsModel { }