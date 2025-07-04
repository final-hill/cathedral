import { SlackService, NaturalLanguageToRequirementService } from "~/server/data/services";
import { SlackRepository, PermissionRepository, SlackWorkspaceRepository } from "~/server/data/repositories";
import { PermissionInteractor } from "~/application";
import { SlackWorkspaceInteractor, SlackChannelInteractor, SlackUserInteractor, SlackEventInteractor } from ".";

/**
 * Factory for creating a fully configured SlackEventInteractor with all dependencies
 * This simplifies the setup in API endpoints and ensures consistent configuration
 */
export function createSlackEventInteractor(props: {
    em: any,
    userId: string,
    slackService: SlackService,
    nlrService: NaturalLanguageToRequirementService
}): SlackEventInteractor {
    const { em, userId, slackService, nlrService } = props,
        repository = new SlackRepository({ em }),
        permissionInteractor = new PermissionInteractor({
            userId,
            repository: new PermissionRepository({ em })
        });

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
    });
}

/**
 * Factory for creating a SlackWorkspaceInteractor with all dependencies
 */
export function createSlackWorkspaceInteractor(props: {
    em: any,
    userId: string
}): SlackWorkspaceInteractor {
    const { em, userId } = props,
        repository = new SlackWorkspaceRepository({ em });

    return new SlackWorkspaceInteractor({
        repository,
        permissionInteractor: new PermissionInteractor({
            userId,
            repository: new PermissionRepository({ em })
        })
    });
}
