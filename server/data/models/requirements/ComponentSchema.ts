import { EntitySchema } from "@mikro-orm/core";
import { Component, ReqType, Actor } from '../../../../domain/requirements/index.js';

export const ComponentSchema = new EntitySchema<Component, Actor>({
    class: Component,
    discriminatorValue: ReqType.COMPONENT
})
