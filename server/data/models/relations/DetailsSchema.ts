import { EntitySchema } from "@mikro-orm/core";
import { Details, RequirementRelation } from "../../../../domain/relations/index.js";

export const DetailsSchema = new EntitySchema<Details, RequirementRelation>({
    class: Details,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})