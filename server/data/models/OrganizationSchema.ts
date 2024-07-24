import { EntitySchema } from "@mikro-orm/core";
import Organization from "../../domain/application/Organization.js";

export default new EntitySchema<Organization>({
    class: Organization,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', nullable: false, length: 100 },
        description: { type: 'string', nullable: false },
        slug: { type: 'string', unique: true }
    }
})