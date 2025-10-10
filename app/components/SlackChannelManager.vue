<script lang="tsx" setup>
import type { SlackChannelMetaType } from '#shared/domain/application'
import { SlackChannelMeta } from '#shared/domain/application'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { UButton, UTable, UIcon, UBadge, XConfirmModal } from '#components'
import { z } from 'zod'

interface Props {
    organizationSlug: string
    solutionSlug: string
    showManagement?: boolean
}

const props = withDefaults(defineProps<Props>(), {
        showManagement: false
    }),
    overlay = useOverlay(),
    confirmUnlinkModal = overlay.create(XConfirmModal, {}),
    { data: slackChannels, refresh: refreshSlackChannels } = await useApiRequest(
        `/api/solution/${props.solutionSlug}/slack-channels`,
        {
            schema: z.array(SlackChannelMeta),
            query: { organizationSlug: props.organizationSlug },
            transform: (data: SlackChannelMetaType[]): SlackChannelMetaType[] => {
            // Ensure dates are properly transformed
                return data?.map(channel => ({
                    ...channel,
                    creationDate: new Date(channel.creationDate),
                    lastNameRefresh: channel.lastNameRefresh ? new Date(channel.lastNameRefresh) : undefined
                })) || []
            },
            errorMessage: 'Failed to load Slack channels'
        }
    ),
    unlinkingChannels = ref<Set<string>>(new Set()),
    refreshingChannels = ref<Set<string>>(new Set()),
    unlinkSlackChannel = async (channelId: string, teamId: string) => {
        // Find the channel data to get the name for a better confirmation message
        const channelData = slackChannels.value?.find(ch => ch.channelId === channelId && ch.teamId === teamId),
            channelDisplayName = channelData?.channelName ? `#${channelData.channelName}` : channelId,

            result = await confirmUnlinkModal.open({
                title: `Are you sure you want to unlink Slack channel ${channelDisplayName}?`
            }).result

        if (!result)
            return

        const channelKey = `${channelId}:${teamId}`
        unlinkingChannels.value.add(channelKey)

        try {
            await useApiRequest(`/api/solution/${props.solutionSlug}/slack-channels`, {
                method: 'DELETE',
                schema: z.unknown(),
                body: {
                    organizationSlug: props.organizationSlug,
                    channelId,
                    teamId
                },
                showSuccessToast: true,
                successMessage: 'Slack channel unlinked successfully',
                errorMessage: 'Failed to unlink Slack channel'
            })

            await refreshSlackChannels()
        } finally {
            unlinkingChannels.value.delete(channelKey)
        }
    },
    refreshChannelNames = async (channelId: string, teamId: string) => {
        const channelKey = `${channelId}:${teamId}`
        refreshingChannels.value.add(channelKey)

        try {
            await useApiRequest(`/api/solution/${props.solutionSlug}/slack-channels/refresh`, {
                method: 'POST',
                schema: z.unknown(),
                body: {
                    organizationSlug: props.organizationSlug,
                    channelId,
                    teamId
                },
                showSuccessToast: true,
                successMessage: 'Channel names refreshed successfully',
                errorMessage: 'Failed to refresh channel names'
            })

            await refreshSlackChannels()
        } finally {
            refreshingChannels.value.delete(channelKey)
        }
    },
    slackChannelColumns: TableColumn<SlackChannelMetaType>[] = [
        {
            accessorKey: 'channelName',
            header: 'Channel',
            cell: ({ row }: { row: Row<SlackChannelMetaType> }) => {
                const channelName = row.original.channelName,
                    channelId = row.original.channelId,
                    isStale = row.original.isStale

                return (
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">
                                #
                                {channelName}
                            </span>
                            {isStale && (
                                <UBadge variant="outline" color="warning" size="xs">
                                    Might be outdated
                                </UBadge>
                            )}
                        </div>
                        <UBadge variant="outline" color="neutral" size="xs">{channelId}</UBadge>
                    </div>
                )
            }
        },
        {
            accessorKey: 'teamName',
            header: 'Workspace',
            cell: ({ row }: { row: Row<SlackChannelMetaType> }) => {
                const teamName = row.original.teamName,
                    teamId = row.original.teamId,
                    isStale = row.original.isStale

                return (
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{teamName}</span>
                            {isStale && (
                                <UBadge variant="outline" color="warning" size="xs">
                                    Might be outdated
                                </UBadge>
                            )}
                        </div>
                        <UBadge variant="outline" color="neutral" size="xs">{teamId}</UBadge>
                    </div>
                )
            }
        },
        {
            accessorKey: 'lastNameRefresh',
            header: 'Names Updated',
            cell: ({ row }: { row: Row<SlackChannelMetaType> }) => {
                const lastRefresh = row.original.lastNameRefresh
                if (!lastRefresh)
                    return <span class="text-muted text-sm">Never</span>

                const refreshDate = lastRefresh instanceof Date ? lastRefresh : new Date(lastRefresh)
                return <time datetime={refreshDate.toISOString()} class="text-sm">{refreshDate.toLocaleDateString()}</time>
            }
        },
        {
            accessorKey: 'creationDate',
            header: 'Linked Date',
            cell: ({ row }: { row: Row<SlackChannelMetaType> }) => {
                return row.original.creationDate.toLocaleDateString()
            }
        },
        {
            accessorKey: 'createdByName',
            header: 'Linked By'
        },
        ...(props.showManagement
            ? [{
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }: { row: Row<SlackChannelMetaType> }) => {
                        const channelId = row.original.channelId,
                            teamId = row.original.teamId,
                            channelKey = `${channelId}:${teamId}`

                        return (
                            <div class="flex gap-2">
                                <UButton
                                    icon="i-lucide-refresh-cw"
                                    color="primary"
                                    variant="ghost"
                                    size="sm"
                                    loading={refreshingChannels.value.has(channelKey)}
                                    disabled={refreshingChannels.value.has(channelKey) || unlinkingChannels.value.has(channelKey)}
                                    onClick={() => refreshChannelNames(channelId, teamId)}
                                    aria-label="Refresh channel names from Slack"
                                />
                                <UButton
                                    icon="i-lucide-unlink"
                                    color="error"
                                    variant="ghost"
                                    size="sm"
                                    loading={unlinkingChannels.value.has(channelKey)}
                                    disabled={unlinkingChannels.value.has(channelKey) || refreshingChannels.value.has(channelKey)}
                                    onClick={() => unlinkSlackChannel(channelId, teamId)}
                                    aria-label="Unlink channel from solution"
                                />
                            </div>
                        )
                    }
                }]
            : [])
    ]
</script>

<template>
    <!-- Summary view for non-management mode -->
    <NuxtLink
        v-if="!showManagement && slackChannels && slackChannels.length > 0"
        :to="{ name: 'Slack Channels' }"
    >
        <UIcon
            name="i-lucide-slack"
            class="text-lg"
        /> {{ slackChannels.length }} Slack channel{{
            slackChannels.length !== 1 ? 's' : '' }} linked
    </NuxtLink>

    <!-- Full management view -->
    <div v-else-if="showManagement">
        <div v-if="slackChannels && slackChannels.length > 0">
            <UTable
                :data="slackChannels"
                :columns="slackChannelColumns"
                :empty-state="{ icon: 'i-lucide-slack', label: 'No Slack channels linked' }"
            />
        </div>

        <div
            v-else
            class="text-center py-8"
        >
            <div class="flex flex-col items-center space-y-4">
                <UIcon
                    name="i-lucide-slack"
                    class="text-4xl text-muted"
                />
                <p class="text-muted">
                    No Slack channels are currently linked to this solution.
                </p>
                <p class="text-sm text-muted">
                    Use the <code class="bg-elevated px-2 py-1 rounded">"/cathedral-link-solution"</code>
                    command in
                    Slack to link
                    channels.
                </p>
            </div>
        </div>
    </div>
</template>
