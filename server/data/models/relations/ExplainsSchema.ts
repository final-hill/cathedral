import { EntitySchema } from "@mikro-orm/core";
import { Explains, RequirementRelation } from "../../../../domain/relations/index.js";

export const ExplainsSchema = new EntitySchema<Explains, RequirementRelation>({
    class: Explains,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})