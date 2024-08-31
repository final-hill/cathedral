import { EntitySchema } from "@mikro-orm/core";
import { Requirement } from "../../domain/requirements/index.js";

export default new EntitySchema<Requirement>({
    class: Requirement,
    abstract: true,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', nullable: false },
        statement: { type: 'string', nullable: false },
        solution: { kind: 'm:1', entity: 'Solution', ref: true, nullable: false }
    }
})