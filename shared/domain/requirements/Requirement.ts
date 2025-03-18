import { z } from "zod";
import { AuditMetadata } from "../AuditMetadata.js";
import { ReqType } from "./ReqType.js";

export type ReqIdPrefix = `${'P' | 'E' | 'G' | 'S' | '0'}.${number}.`
export type ReqId = `${ReqIdPrefix}${number}`

export const Requirement = AuditMetadata.extend({
    id: z.string().uuid().readonly()
        .describe('The unique identifier'),
    name: z.string().max(100).nonempty()
        .describe('The name'),
    description: z.string().max(1000)
        .describe('A human-readable explanation of the Requirement'),
    isSilence: z.boolean()
        .describe('Whether the Requirement is a silence requirement; i.e. not included in the solution'),
    // This is optional because MetaRequirements, Silence, and Noise do not have a reqId
    // It may also be undefined if the requirement has not been added to a solution
    reqId: z.string().regex(/^0\.\d+\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    // see: https://github.com/final-hill/cathedral/issues/368
    // property: z.string().max(100).describe('A property is a Predicate formalizing its associated statement'),
    reqType: z.nativeEnum(ReqType).default(ReqType.REQUIREMENT)
}).describe('A Requirement is a statement that specifies a property.');