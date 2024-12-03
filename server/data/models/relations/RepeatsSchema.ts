import { EntitySchema } from "@mikro-orm/core";
import { Repeats, RequirementRelation } from "../../../../domain/relations/index.js";

export const RepeatsSchema = new EntitySchema<Repeats, RequirementRelation>({
    class: Repeats,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})