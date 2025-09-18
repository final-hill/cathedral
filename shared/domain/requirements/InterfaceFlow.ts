import { z } from 'zod'
import { InterfaceArtifact } from './InterfaceArtifact.js'
import { ReqType } from './ReqType.js'

export const InterfaceFlow = InterfaceArtifact.extend({
    flowName: z.string().describe('Name of the flow or navigation pattern'),
    states: z.array(z.string()).default([]).describe('List of states in the flow'),
    initialState: z.string().optional().describe('Starting state of the flow'),
    finalStates: z.array(z.string()).default([]).describe('Ending states of the flow'),
    transitions: z.string().optional().describe('State transition rules and conditions'),
    reqType: z.nativeEnum(ReqType).default(ReqType.INTERFACE_FLOW)
}).describe('An InterfaceFlow represents navigation, branching, or sequencing patterns within interface operations.')

export type InterfaceFlowType = z.infer<typeof InterfaceFlow>
