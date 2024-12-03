import { EntitySchema } from "@mikro-orm/core";
import { Follows, RequirementRelation } from "../../../../domain/relations/index.js";

export const FollowsSchema = new EntitySchema<Follows, RequirementRelation>({
    class: Follows,
    tableName: 'requirement_relation',
    discriminatorColumn: 'rel_type'
})