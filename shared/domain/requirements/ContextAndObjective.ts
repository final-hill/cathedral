import { z } from 'zod';
import { Outcome } from './Outcome.js';
import { ReqType } from './ReqType.js';
import { dedent } from "../../../shared/utils/dedent.js";

export const ContextAndObjective = Outcome.extend({
    name: z.literal('Context And Objective')
        .describe('The name'),
    reqId: z.literal('G.1.0').default('G.1.0')
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.CONTEXT_AND_OBJECTIVE)
}).describe(dedent(`
    High-level view of the project: organizational context and reason for building the system
`));
