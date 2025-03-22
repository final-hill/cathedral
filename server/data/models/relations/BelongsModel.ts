import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationModel.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.BELONGS })
export class BelongsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.BELONGS })
export class BelongsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: BelongsModel
}