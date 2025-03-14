import { dedent } from "#shared/utils/dedent.js";
import { Component } from "./Component.js";
import { z } from 'zod';
import { ReqType } from "./ReqType.js";

export const SystemComponent = Component.extend({
    reqId: z.string().regex(/^S\.1\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.SYSTEM_COMPONENT)
}).describe(dedent(`
    A System Component is a self-contained part of a system.
    These are often hierarchical and can be used to describe the structure of a System.
`));