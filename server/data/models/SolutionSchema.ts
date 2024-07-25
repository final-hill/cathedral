import { Cascade, EntitySchema } from "@mikro-orm/core";
import Solution from "../../domain/application/Solution.js";

export default new EntitySchema<Solution>({
    class: Solution,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', nullable: false, length: 100 },
        description: { type: 'string', nullable: false },
        slug: { type: 'string', unique: true },
        organization: {
            kind: 'm:1', entity: 'Organization', ref: true, nullable: false, cascade: [Cascade.REMOVE]
        }
    }
})