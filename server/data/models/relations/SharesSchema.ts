import { Entity } from "@mikro-orm/core";
import { RelType } from "./RelType.js";
import { RepeatsModel, RepeatsVersionsModel } from "./RepeatsSchema.js";

@Entity({ discriminatorValue: RelType.SHARES })
export class SharesModel extends RepeatsModel { }

@Entity({ discriminatorValue: RelType.SHARES })
export class SharesVersionsModel extends RepeatsVersionsModel {
    declare readonly requirementRelation: SharesModel
}