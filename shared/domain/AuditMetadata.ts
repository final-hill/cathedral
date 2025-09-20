import { z } from 'zod'
import { AppUserReference } from './application/EntityReferences'

export const AuditMetadata = z.object({
    createdBy: AppUserReference
        .describe('The user who created the entity'),
    creationDate: z.date().readonly()
        .describe('The date and time when the entity was created'),
    isDeleted: z.boolean()
        .describe('Whether the entity is deleted'),
    lastModified: z.date()
        .describe('The date and time when the entity was last modified'),
    modifiedBy: AppUserReference
        .describe('The user who last modified the entity')
}).describe('Represents the metadata of an entity that is used to track the creation and modification of the entity')

export type AuditMetadataType = z.infer<typeof AuditMetadata>
