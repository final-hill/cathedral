import { Component } from './Component.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'

export const GlossaryTerm = Component.extend({
    reqId: z.string().regex(/^E\.1\.\d+$/, 'Format must be E.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.1.').default('E.1.'),
    reqType: z.nativeEnum(ReqType).default(ReqType.GLOSSARY_TERM),
    uiBasePathTemplate: z.string().default(uiBasePathTemplates[ReqType.GLOSSARY_TERM])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe('A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.')

export type GlossaryTermType = z.infer<typeof GlossaryTerm>
