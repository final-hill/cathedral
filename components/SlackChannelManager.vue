<script lang="tsx" setup>
import { SlackChannelMeta } from '#shared/domain/application'
import type { z } from 'zod'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { UButton, UTable, UIcon, UBadge, XConfirmModal } from '#components'

interface Props {
    organizationSlug: string;
    solutionSlug: string;
    showManagement?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showManagement: false
});

const overlay = useOverlay();
const confirmUnlinkModal = overlay.create(XConfirmModal, {});
const toast = useToast();

const { data: slackChannels, refresh: refreshSlackChannels } = await useFetch<z.infer<typeof SlackChannelMeta>[]>(
    `/api/solution/${props.solutionSlug}/slack-channels`,
    {
        query: { organizationSlug: props.organizationSlug },
        transform: (data: any[]) => {
            // Ensure dates are properly transformed
            return data?.map(channel => ({
                ...channel,
                creationDate: new Date(channel.creationDate),
                lastNameRefresh: channel.lastNameRefresh ? new Date(channel.lastNameRefresh) : undefined
            })) || []
        }
    }
);

const unlinkingChannels = ref<Set<string>>(new Set());
const refreshingChannels = ref<Set<string>>(new Set());

const unlinkSlackChannel = async (channelId: string, teamId: string) => {
    // Find the channel data to get the name for a better confirmation message
    const channelData = slackChannels.value?.find(ch => ch.channelId === channelId && ch.teamId === teamId);
    const channelDisplayName = channelData?.channelName ? `#${channelData.channelName}` : channelId;

    const result = await confirmUnlinkModal.open({
        title: `Are you sure you want to unlink Slack channel ${channelDisplayName}?`,
    }).result;

    if (!result) {
        return;
    }

    const channelKey = `${channelId}:${teamId}`;
    unlinkingChannels.value.add(channelKey);

    try {
        await $fetch(`/api/solution/${props.solutionSlug}/slack-channels`, {
            method: 'DELETE',
            body: {
                organizationSlug: props.organizationSlug,
                channelId,
                teamId
            }
        });

        toast.add({
            icon: 'i-lucide-check',
            title: 'Success',
            description: 'Slack channel unlinked successfully'
        });

        await refreshSlackChannels();
    } catch (error: any) {
        toast.add({
            icon: 'i-lucide-alert-circle',
            title: 'Error',
            description: `Failed to unlink Slack channel: ${error.data?.message || error.message}`
        });
    } finally {
        unlinkingChannels.value.delete(channelKey);
    }
};

const refreshChannelNames = async (channelId: string, teamId: string) => {
    const channelKey = `${channelId}:${teamId}`;
    refreshingChannels.value.add(channelKey);

    try {
        const response = await fetch(`/api/solution/${props.solutionSlug}/slack-channels/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                organizationSlug: props.organizationSlug,
                channelId,
                teamId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to refresh: ${response.statusText}`);
        }

        toast.add({
            icon: 'i-lucide-check',
            title: 'Success',
            description: 'Channel names refreshed successfully'
        });

        await refreshSlackChannels();
    } catch (error: any) {
        toast.add({
            icon: 'i-lucide-alert-circle',
            title: 'Error',
            description: `Failed to refresh channel names: ${error.data?.message || error.message}`
        });
    } finally {
        refreshingChannels.value.delete(channelKey);
    }
};

const slackChannelColumns: TableColumn<z.infer<typeof SlackChannelMeta>>[] = [
    {
        accessorKey: 'channelName',
        header: 'Channel',
        cell: ({ row }: { row: Row<z.infer<typeof SlackChannelMeta>> }) => {
            const channelName = row.original.channelName;
            const channelId = row.original.channelId;
            const isStale = row.original.isStale;

            return (
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <span class="font-medium">#{channelName}</span>
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
        cell: ({ row }: { row: Row<z.infer<typeof SlackChannelMeta>> }) => {
            const teamName = row.original.teamName;
            const teamId = row.original.teamId;
            const isStale = row.original.isStale;

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
        cell: ({ row }: { row: Row<z.infer<typeof SlackChannelMeta>> }) => {
            const lastRefresh = row.original.lastNameRefresh;
            if (!lastRefresh) {
                return <span class="text-gray-400 text-sm">Never</span>
            }
            const refreshDate = lastRefresh instanceof Date ? lastRefresh : new Date(lastRefresh);
            return <time datetime={refreshDate.toISOString()} class="text-sm">{refreshDate.toLocaleDateString()}</time>
        }
    },
    {
        accessorKey: 'creationDate',
        header: 'Linked Date',
        cell: ({ row }: { row: Row<z.infer<typeof SlackChannelMeta>> }) => {
            return row.original.creationDate.toLocaleDateString()
        }
    },
    {
        accessorKey: 'createdByName',
        header: 'Linked By'
    },
    ...(props.showManagement ? [{
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: { row: Row<z.infer<typeof SlackChannelMeta>> }) => {
            const channelId = row.original.channelId;
            const teamId = row.original.teamId;
            const channelKey = `${channelId}:${teamId}`;

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
    }] : [])
];
</script>

<template>
    <!-- Summary view for non-management mode -->
    <NuxtLink v-if="!showManagement && slackChannels && slackChannels.length > 0" :to='{ name: "Slack Channels" }'>
        <UIcon name="i-lucide-slack" class="text-lg" /> {{ slackChannels.length }} Slack channel{{
            slackChannels.length !== 1 ? 's' : '' }} linked
    </NuxtLink>

    <!-- Full management view -->
    <div v-else-if="showManagement">
        <div v-if="slackChannels && slackChannels.length > 0">
            <UTable :data="slackChannels" :columns="slackChannelColumns"
                :empty-state="{ icon: 'i-lucide-slack', label: 'No Slack channels linked' }" />
        </div>

        <div v-else class="text-center py-8">
            <div class="flex flex-col items-center space-y-4">
                <UIcon name="i-lucide-slack" class="text-4xl text-gray-400" />
                <p class="text-gray-500">No Slack channels are currently linked to this solution.</p>
                <p class="text-sm text-gray-400">
                    Use the <code class="bg-gray-100 px-2 py-1 rounded">/cathedral-link-solution</code> command in
                    Slack to link
                    channels.
                </p>
            </div>
        </div>
    </div>
</template>
