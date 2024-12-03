import { EntitySchema } from "@mikro-orm/core";
import { Role, Responsibility, ReqType } from '../../../../domain/requirements/index.js';

export const RoleSchema = new EntitySchema<Role, Responsibility>({
    class: Role,
    discriminatorValue: ReqType.ROLE
})