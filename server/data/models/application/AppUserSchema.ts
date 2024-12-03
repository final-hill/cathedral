import { EntitySchema } from "@mikro-orm/core";
import { AppUser, AppRole } from "../../../../domain/application/index.js";

export const AppUserSchema = new EntitySchema<AppUser>({
    class: AppUser,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', length: 254 },
        // email address: https://stackoverflow.com/a/574698
        email: { type: 'string', length: 254 },
        creationDate: { type: 'datetime' },
        lastLoginDate: { type: 'datetime', nullable: true },
        isSystemAdmin: { type: 'boolean' },
        // FIXME: This is populated in the API layer. It's a design smell that needs to be addressed.
        role: { enum: true, items: () => AppRole, nullable: true, persist: false }
    }
});