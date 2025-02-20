import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationSchema.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.CONTRADICTS })
export class ContradictsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.CONTRADICTS })
export class ContradictsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: ContradictsModel
}