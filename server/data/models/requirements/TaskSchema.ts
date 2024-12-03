import { EntitySchema } from "@mikro-orm/core";
import { Task, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const TaskSchema = new EntitySchema<Task, Requirement>({
    class: Task,
    discriminatorValue: ReqType.TASK
})