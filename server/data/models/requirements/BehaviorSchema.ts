import { Collection, Entity, Enum } from "@mikro-orm/core";
import { MoscowPriority } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";
import { ReqType } from "./ReqType.js";

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorModel extends RequirementModel {
    declare readonly versions: Collection<BehaviorVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => MoscowPriority })
    readonly priority!: MoscowPriority;
}