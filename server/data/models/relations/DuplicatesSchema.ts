import { EntitySchema } from "@mikro-orm/core";
import { Duplicates, RequirementRelation } from "../../../../domain/relations/index.js";

export const DuplicatesSchema = new EntitySchema<Duplicates, RequirementRelation>({
    class: Duplicates,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})