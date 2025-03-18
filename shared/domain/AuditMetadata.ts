import { z } from 'zod';

export const AuditMetadata = z.object({
    createdBy: z.object({
        id: z.string().uuid()
            .describe('The user who created the entity'),
        name: z.string()
            .describe('The name of the user who created the entity')
    }).readonly().describe('The user who created the entity'),
    creationDate: z.date().readonly()
        .describe('The date and time when the entity was created'),
    isDeleted: z.boolean()
        .describe('Whether the entity is deleted'),
    lastModified: z.date()
        .describe('The date and time when the entity was last modified'),
    modifiedBy: z.object({
        id: z.string().uuid()
            .describe('The user who last modified the entity'),
        name: z.string()
            .describe('The name of the user who last modified the entity')
    })
}).describe('Represents the metadata of an entity that is used to track the creation and modification of the entity');