import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationModel.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.CONSTRAINS })
export class ConstrainsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.CONSTRAINS })
export class ConstrainsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: ConstrainsModel
}