import { z } from "zod";
import { Component } from "./Component.js";
import { StakeholderCategory } from "./StakeholderCategory.js";
import { StakeholderSegmentation } from "./StakeholderSegmentation.js";
import { dedent } from "../../../shared/utils/dedent.js";
import { ReqType } from "./ReqType.js";

export const Stakeholder = Component.extend({
    reqId: z.string().regex(/^G\.7\.\d+$/, 'Format must be G.7.#')
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('G.7.').default('G.7.'),
    segmentation: z.nativeEnum(StakeholderSegmentation)
        .describe('The segmentation of the stakeholder'),
    category: z.nativeEnum(StakeholderCategory)
        .describe('The category of the stakeholder'),
    interest: z.number().int().min(0).max(100)
        .describe('The interest that the stakeholder has in the project; AKA "availability"'),
    influence: z.number().int().min(0).max(100)
        .describe('The influence of the stakeholder'),
    reqType: z.nativeEnum(ReqType).default(ReqType.STAKEHOLDER)
}).describe(dedent(`
    A Stakeholder is a human actor who may affect or be affected by a Project or its associated System.
    These are not individuals, but rather groups or roles.
    Example: instead of "Jane Doe", use "Project Manager".
`));