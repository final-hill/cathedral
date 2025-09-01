import { z } from 'zod'
import { Requirement } from './Requirement.js'
import { ReqType } from './ReqType.js'

export const InterfaceArtifact = Requirement.extend({
    reqType: z.nativeEnum(ReqType).default(ReqType.REQUIREMENT)
}).describe('Abstract base class for interface building blocks like operations, inputs, outputs, data types, and flows.')

export type InterfaceArtifactType = z.infer<typeof InterfaceArtifact>
