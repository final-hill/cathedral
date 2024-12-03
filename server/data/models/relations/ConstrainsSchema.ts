import { EntitySchema } from "@mikro-orm/core";
import { Constrains, RequirementRelation } from "../../../../domain/relations/index.js";

export const ConstrainsSchema = new EntitySchema<Constrains, RequirementRelation>({
    class: Constrains,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})