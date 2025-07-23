import { EntraGroupService } from '../data/services/EntraGroupService'
import { useRuntimeConfig } from '#imports'

/**
 * Create a properly configured EntraGroupService instance
 * with configuration loaded from runtime config
 */
export function createEntraGroupService(): EntraGroupService {
    const config = useRuntimeConfig()

    return new EntraGroupService({
        clientId: config.oauth?.microsoft?.clientId as string,
        clientSecret: config.oauth?.microsoft?.clientSecret as string,
        tenantId: config.oauth?.microsoft?.tenant as string
    })
}
