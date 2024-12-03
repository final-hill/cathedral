import { EntitySchema } from "@mikro-orm/core";
import { EnvironmentComponent, ReqType, Component } from '../../../../domain/requirements/index.js';

export const EnvironmentComponentSchema = new EntitySchema<EnvironmentComponent, Component>({
    class: EnvironmentComponent,
    discriminatorValue: ReqType.ENVIRONMENT_COMPONENT
})