import { EntitySchema } from "@mikro-orm/core";
import AppUser from "../../domain/application/AppUser.js";

export default new EntitySchema<AppUser>({
    class: AppUser,
    properties: {
        // email address: https://stackoverflow.com/a/574698
        id: { type: 'character varying', primary: true, length: 254 },
        name: { type: 'character varying', nullable: false, length: 254 },
        // ISO date
        creationDate: { type: 'datetime', nullable: false },
        isSystemAdmin: { type: 'boolean', nullable: false }
    }
})