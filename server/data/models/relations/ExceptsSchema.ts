import { EntitySchema } from "@mikro-orm/core";
import { Excepts, RequirementRelation } from "../../../../domain/relations/index.js";

export const ExceptsSchema = new EntitySchema<Excepts, RequirementRelation>({
    class: Excepts,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})