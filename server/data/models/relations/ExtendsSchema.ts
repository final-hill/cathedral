import { EntitySchema } from "@mikro-orm/core";
import { Extends, RequirementRelation } from "../../../../domain/relations/index.js";

export const ExtendsSchema = new EntitySchema<Extends, RequirementRelation>({
    class: Extends,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})