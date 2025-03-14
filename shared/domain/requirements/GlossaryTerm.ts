import { Component } from "./Component.js";
import { z } from "zod";
import { ReqType } from "./ReqType.js";

export const GlossaryTerm = Component.extend({
    reqId: z.string().regex(/^E\.1\.\d+$/).optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqType: z.nativeEnum(ReqType).default(ReqType.GLOSSARY_TERM)
}).describe('A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.');