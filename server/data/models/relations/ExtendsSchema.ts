import { Entity } from "@mikro-orm/core";
import { RequirementRelationModel, RequirementRelationVersionsModel } from "./RequirementRelationSchema.js";
import { RelType } from "./RelType.js";

@Entity({ discriminatorValue: RelType.EXTENDS })
export class ExtendsModel extends RequirementRelationModel { }

@Entity({ discriminatorValue: RelType.EXTENDS })
export class ExtendsVersionsModel extends RequirementRelationVersionsModel {
    declare readonly requirementRelation: ExtendsModel
}