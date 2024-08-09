import { EntitySchema } from "@mikro-orm/core";
import AppUser from "../../domain/application/AppUser.js";

export default new EntitySchema<AppUser>({
    class: AppUser,
    properties: {
        id: { type: 'character varying', primary: true, length: 254 },
        name: { type: 'character varying', nullable: false, length: 254 },
        creationDate: { type: 'datetime', nullable: false },
        lastLoginDate: { type: 'datetime', nullable: true },
        isSystemAdmin: { type: 'boolean', nullable: false },
        // email address: https://stackoverflow.com/a/574698
        email: { type: 'character varying', nullable: false, length: 254 }
    }
})