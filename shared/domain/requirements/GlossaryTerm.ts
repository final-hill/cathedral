import { Component } from './Component.js'
import { z } from 'zod'
import { ReqType } from './ReqType.js'
import { uiBasePathTemplates } from './uiBasePathTemplates.js'
import { dedent } from '../../utils/dedent.js'

export const GlossaryTerm = Component.extend({
    reqId: z.string().regex(/^E\.1\.\d+$/, 'Format must be E.1.#').optional()
        .describe('The user-friendly identifier of the requirement that is unique within its parent'),
    reqIdPrefix: z.literal('E.1.').prefault('E.1.'),
    reqType: z.enum(ReqType).prefault(ReqType.GLOSSARY_TERM),
    uiBasePathTemplate: z.string().prefault(uiBasePathTemplates[ReqType.GLOSSARY_TERM])
        .describe('The UI path template for navigating to this requirement in the web interface')
}).describe(dedent(`
    A Glossary Term defines a word, phrase, acronym, or technical concept used in the project.
    
    Content Guidelines:
    - Name: Should be the term, acronym, or concept being defined (e.g., "API", "User Session", "SLA")
    - Description: Should be a clear, concise definition explaining the meaning of the term
    - Should NOT contain requirements, constraints, or action items
    - Should focus on clarifying terminology and establishing shared vocabulary
`))

export type GlossaryTermType = z.infer<typeof GlossaryTerm>
