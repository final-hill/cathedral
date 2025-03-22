import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationModel.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.REPEATS })
export class RepeatsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.REPEATS })
export class RepeatsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: RepeatsModel
}