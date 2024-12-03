import { EntitySchema } from "@mikro-orm/core";
import { Responsibility, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const ResponsibilitySchema = new EntitySchema<Responsibility, Requirement>({
    class: Responsibility,
    discriminatorValue: ReqType.RESPONSIBILITY
})