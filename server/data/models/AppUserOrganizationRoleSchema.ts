import { Cascade, EntitySchema } from "@mikro-orm/core";
import AppUserOrganizationRole from "../../domain/application/AppUserOrganizationRole.js";
import AppRole from "../../domain/application/AppRole.js";

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
            enum: true,
            items: () => AppRole,
            default: AppRole.ORGANIZATION_READER,
            primary: true
        }
    }
})