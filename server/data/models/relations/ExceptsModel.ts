import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationModel.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.EXCEPTS })
export class ExceptsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.EXCEPTS })
export class ExceptsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: ExceptsModel
}