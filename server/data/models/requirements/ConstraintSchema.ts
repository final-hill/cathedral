import { Collection, Entity, Enum } from "@mikro-orm/core";
import { ConstraintCategory, ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintModel extends RequirementModel {
    declare readonly versions: Collection<ConstraintVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.CONSTRAINT })
export class ConstraintVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => ConstraintCategory })
    readonly category?: ConstraintCategory;
}