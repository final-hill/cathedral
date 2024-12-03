import { EntitySchema } from "@mikro-orm/core";
import { Organization, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const OrganizationSchema = new EntitySchema<Organization, Requirement>({
    class: Organization,
    discriminatorValue: ReqType.ORGANIZATION,
    properties: {
        slug: { type: 'string', unique: true }
    }
})