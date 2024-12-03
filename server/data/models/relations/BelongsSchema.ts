import { EntitySchema } from "@mikro-orm/core";
import { Belongs, RequirementRelation } from "../../../../domain/relations/index.js";

export const BelongsSchema = new EntitySchema<Belongs, RequirementRelation>({
    class: Belongs,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})