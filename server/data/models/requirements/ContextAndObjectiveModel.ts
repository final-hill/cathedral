import { Collection, Entity } from '@mikro-orm/core';
import { OutcomeModel, OutcomeVersionsModel } from './OutcomeModel.js';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveModel extends OutcomeModel {
    declare readonly versions: Collection<OutcomeVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveVersionsModel extends OutcomeVersionsModel { }