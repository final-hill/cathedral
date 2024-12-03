import { EntitySchema } from "@mikro-orm/core";
import { Disjoins, RequirementRelation } from "../../../../domain/relations/index.js";

export const DisjoinsSchema = new EntitySchema<Disjoins, RequirementRelation>({
    class: Disjoins,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})