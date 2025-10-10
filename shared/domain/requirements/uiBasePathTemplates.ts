import { ReqType } from './ReqType.js'

/**
 * The UI path templates for navigating to this requirement in the web interface
 */
export const uiBasePathTemplates = {
    [ReqType.ACTOR]: '/o/[org]/[solutionslug]',
    [ReqType.ASSUMPTION]: '/o/[org]/[solutionslug]/environment/assumption',
    [ReqType.CONSTRAINT]: '/o/[org]/[solutionslug]/environment/constraint',
    [ReqType.COMPONENT]: '/o/[org]/[solutionslug]',
    [ReqType.CONTEXT_AND_OBJECTIVE]: '/o/[org]/[solutionslug]/goals/context-and-objective',
    [ReqType.EFFECT]: '/o/[org]/[solutionslug]/environment/effect',
    [ReqType.ENVIRONMENT]: '/o/[org]/[solutionslug]/environment',
    [ReqType.ENVIRONMENT_COMPONENT]: '/o/[org]/[solutionslug]/environment/environment-component',
    [ReqType.EPIC]: '/o/[org]/[solutionslug]/goals/epic',
    [ReqType.BEHAVIOR]: '/o/[org]/[solutionslug]',
    [ReqType.FUNCTIONAL_BEHAVIOR]: '/o/[org]/[solutionslug]/system/functional-behavior',
    [ReqType.FUNCTIONALITY]: '/o/[org]/[solutionslug]/goals/functionality',
    [ReqType.GLOSSARY_TERM]: '/o/[org]/[solutionslug]/environment/glossary-term',
    [ReqType.GOALS]: '/o/[org]/[solutionslug]/goals',
    // TODO: Interface will need subtyping to differentiate API, CLI, UI, etc and get more specific paths
    [ReqType.INTERFACE]: '/o/[org]/[solutionslug]/system/interface/api',
    [ReqType.INTERFACE_OPERATION]: '/o/[org]/[solutionslug]/system/interface-operation',
    [ReqType.INTERFACE_SCHEMA]: '/o/[org]/[solutionslug]/system/interface/interface-schema',
    [ReqType.INVARIANT]: '/o/[org]/[solutionslug]/environment/invariant',
    [ReqType.LIMIT]: '/o/[org]/[solutionslug]/goals/limit',
    [ReqType.MILESTONE]: '/o/[org]/[solutionslug]/project/milestone',
    [ReqType.NON_FUNCTIONAL_BEHAVIOR]: '/o/[org]/[solutionslug]/system/non-functional-behavior',
    [ReqType.OBSTACLE]: '/o/[org]/[solutionslug]/goals/obstacle',
    [ReqType.ORGANIZATION]: '/o/[org]',
    [ReqType.OUTCOME]: '/o/[org]/[solutionslug]/goals/outcome',
    [ReqType.PARSED_REQUIREMENTS]: '/o/[org]/[solutionslug]/project/parsed-requirements',
    [ReqType.PERSON]: '/o/[org]/[solutionslug]/project/person',
    [ReqType.PROJECT]: '/o/[org]/[solutionslug]/project',
    [ReqType.RESPONSIBILITY]: '/o/[org]/[solutionslug]/project/responsibility',
    [ReqType.SCENARIO]: '/o/[org]/[solutionslug]',
    [ReqType.SOLUTION]: '/o/[org]/[solutionslug]',
    [ReqType.STAKEHOLDER]: '/o/[org]/[solutionslug]/goals/stakeholder',
    [ReqType.SYSTEM]: '/o/[org]/[solutionslug]/system',
    [ReqType.SYSTEM_COMPONENT]: '/o/[org]/[solutionslug]/system/system-component',
    [ReqType.TASK]: '/o/[org]/[solutionslug]/project/task',
    [ReqType.USE_CASE]: '/o/[org]/[solutionslug]/system/use-case',
    [ReqType.USER_STORY]: '/o/[org]/[solutionslug]/system/user-story'
} as const
