import { Entity, Enum } from "@mikro-orm/core";
import { ConstraintCategory } from '../../../../shared/domain/requirements/enums.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => ConstraintCategory })
    readonly category?: ConstraintCategory;
}