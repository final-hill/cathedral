import { EntitySchema } from "@mikro-orm/core";
import { SystemComponent, ReqType, Component } from '../../../../domain/requirements/index.js';

export const SystemComponentSchema = new EntitySchema<SystemComponent, Component>({
    class: SystemComponent,
    discriminatorValue: ReqType.SYSTEM_COMPONENT
})