import { EntitySchema } from "@mikro-orm/core";
import { RequirementRelation, Shares } from "../../../../domain/relations/index.js";

export const SharesSchema = new EntitySchema<Shares, RequirementRelation>({
    class: Shares,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})