import { EntitySchema } from "@mikro-orm/core";
import { Contradicts, RequirementRelation } from "../../../../domain/relations/index.js";

export const ContradictsSchema = new EntitySchema<Contradicts, RequirementRelation>({
    class: Contradicts,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})