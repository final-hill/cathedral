import { z } from "zod";
import { AuditMetadata } from "../AuditMetadata.js";

export const RequirementRelation = AuditMetadata.extend({
    left: z.object({
        id: z.string().uuid(),
        name: z.string()
    }).describe('The left-hand side of the relation'),
    right: z.object({
        id: z.string().uuid(),
        name: z.string()
    }).describe('The right-hand side of the relation')
}).describe('Relations between requirements')