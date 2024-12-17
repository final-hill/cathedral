import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationSchema.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.DISJOINS })
export class DisjoinsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.DISJOINS })
export class DisjoinsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: DisjoinsModel
}