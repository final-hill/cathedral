import type { SlackService, NaturalLanguageToRequirementService } from '~~/server/data/services'
import { SlackRepository, SlackWorkspaceRepository } from '~~/server/data/repositories'
import { PermissionInteractor } from '~~/server/application'
import { SlackWorkspaceInteractor, SlackChannelInteractor, SlackUserInteractor, SlackEventInteractor } from '.'
import type { SqlEntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql'
import type { UserSession } from '#auth-utils'

/**
 * Factory for creating a fully configured SlackEventInteractor with all dependencies
 * This simplifies the setup in API endpoints and ensures consistent configuration
 */
export function createSlackEventInteractor(props: {
    em: SqlEntityManager<PostgreSqlDriver>
    session: UserSession
    slackService: SlackService
    nlrService: NaturalLanguageToRequirementService
}): SlackEventInteractor {
    const { em, session, slackService, nlrService } = props,
        repository = new SlackRepository({ em }),
        permissionInteractor = new PermissionInteractor({
            session,
            entraService: createEntraService()
        })

    return new SlackEventInteractor({
        repository,
        nlrService,
        permissionInteractor,
        slackService,
        workspaceInteractor: new SlackWorkspaceInteractor({
            repository: new SlackWorkspaceRepository({ em }),
            permissionInteractor
        }),
        channelInteractor: new SlackChannelInteractor({
            repository,
            permissionInteractor,
            slackService
        }),
        userInteractor: new SlackUserInteractor({
            repository,
            permissionInteractor,
            slackService
        })
    })
}

/**
 * Factory for creating a SlackWorkspaceInteractor with all dependencies
 */
export function createSlackWorkspaceInteractor(props: {
    em: SqlEntityManager<PostgreSqlDriver>
    session: UserSession
}): SlackWorkspaceInteractor {
    const { em, session } = props,
        repository = new SlackWorkspaceRepository({ em })

    return new SlackWorkspaceInteractor({
        repository,
        permissionInteractor: new PermissionInteractor({
            session,
            entraService: createEntraService()
        })
    })
}
