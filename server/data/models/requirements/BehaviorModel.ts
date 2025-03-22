import { Collection, Entity, Enum } from "@mikro-orm/core";
import { MoscowPriority } from '../../../../shared/domain/requirements/enums.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorModel extends RequirementModel {
    declare readonly versions: Collection<BehaviorVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.BEHAVIOR })
export class BehaviorVersionsModel extends RequirementVersionsModel {
    @Enum({ items: () => MoscowPriority })
    readonly priority!: MoscowPriority;
}