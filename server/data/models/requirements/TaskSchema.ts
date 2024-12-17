import { Entity } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from './RequirementSchema.js';

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.TASK })
export class TaskVersionsModel extends RequirementVersionsModel { }