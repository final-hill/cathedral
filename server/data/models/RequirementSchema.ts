import { EntitySchema } from "@mikro-orm/core";
import { Requirement } from "../../domain/requirements/index.js";

export default new EntitySchema<Requirement>({
    class: Requirement,
    abstract: true,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', nullable: false },
        statement: { type: 'string', nullable: false },
        solution: { kind: 'm:1', entity: 'Solution', ref: true, nullable: false },
        lastModified: { type: 'datetime', nullable: false, onCreate: () => new Date(), onUpdate: () => new Date() },
        modifiedBy: {
            kind: 'm:1', entity: 'AppUser', ref: true, nullable: false,
            // System Admin is the default user for the initial migration
            // This can be removed in v0.14.0 or later
            default: 'ac594919-50e3-438a-b9bc-efb8a8654243'
        }
    }
})