import { Cascade, EntitySchema } from "@mikro-orm/core";
import AppUserOrganizationRole from "../../domain/application/AppUserOrganizationRole.js";

export default new EntitySchema<AppUserOrganizationRole>({
    class: AppUserOrganizationRole,
    properties: {
        appUser: {
            kind: 'm:1',
            entity: 'AppUser',
            primary: true,
            ref: true,
            cascade: [Cascade.REMOVE]
        },
        organization: {
            kind: 'm:1',
            entity: 'Organization',
            ref: true,
            primary: true,
            cascade: [Cascade.REMOVE]
        },
        role: {
            kind: 'm:1',
            entity: 'AppRole',
            ref: true,
            primary: true,
            cascade: [Cascade.REMOVE]
        }
    }
})