import { EntitySchema } from "@mikro-orm/core";
import { Characterizes, RequirementRelation } from "../../../../domain/relations/index.js";

export const CharacterizesSchema = new EntitySchema<Characterizes, RequirementRelation>({
    class: Characterizes,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})