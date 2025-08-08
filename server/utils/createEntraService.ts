import { EntraService } from '../data/services/EntraService'
import { useRuntimeConfig } from '#imports'

/**
 * Create a properly configured EntraGroupService instance
 * with configuration loaded from runtime config
 */
export function createEntraService(): EntraService {
    const config = useRuntimeConfig()

    return new EntraService({
        clientId: config.oauth?.microsoft?.clientId as string,
        clientSecret: config.oauth?.microsoft?.clientSecret as string,
        tenantId: config.oauth?.microsoft?.tenant as string
    })
}
