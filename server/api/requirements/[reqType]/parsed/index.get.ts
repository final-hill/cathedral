import { WorkflowState } from '#shared/domain'
import getLatestByType from '~/server/utils/workflowHttpHandlers/getLatestByType'

export default getLatestByType(WorkflowState.Parsed)
