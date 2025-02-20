import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationSchema.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.FOLLOWS })
export class FollowsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.FOLLOWS })
export class FollowsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: FollowsModel
}