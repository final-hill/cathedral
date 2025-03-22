import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationModel.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.CHARACTERIZES })
export class CharacterizesModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.CHARACTERIZES })
export class CharacterizesVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: CharacterizesModel
}