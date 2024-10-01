import { z } from "zod";

export default z.object({
    type: z.literal('Stakeholder'),
    name: z.string(),
    segmentation: z.union([z.literal('Client'), z.literal('Vendor')])
        .describe('The role of the stakeholder in the project'),
    category: z.union([
        z.literal('Key Stakeholder')
            .describe('High availability and influence'),
        z.literal('Shadow Influencer')
            .describe('High influence, low availability'),
        z.literal('Fellow Traveler')
            .describe('High availability, low influence'),
        z.literal('Observer')
            .describe('Low availability and influence')
    ])
        .describe('The level of influence and availability the stakeholder has over the project. Default is "Observer"'),
    availability: z.number().int()
        .describe('The % of time the stakeholder is available to the project'),
    influence: z.number().int()
        .describe('The % of influence the stakeholder has over the project'),
}).describe('A human actor who may affect or be affected by a project or its associated system. This is a role, not a specific person')