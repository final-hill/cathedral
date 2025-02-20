import { Entity } from "@mikro-orm/core";
import { RelType } from "./RelType.js";
import { RepeatsModel, RepeatsVersionsModel } from "./RepeatsSchema.js";

@Entity({ discriminatorValue: RelType.DUPLICATES })
export class DuplicatesModel extends RepeatsModel { }

@Entity({ discriminatorValue: RelType.DUPLICATES })
export class DuplicatesVersionsModel extends RepeatsVersionsModel {
    declare readonly requirementRelation: DuplicatesModel
}