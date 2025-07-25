<script lang="tsx" setup>
import type { SlackWorkspaceMeta } from '#shared/domain/application'
import type { z } from 'zod'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { UButton, UTable, UIcon, UBadge, XConfirmModal } from '#components'

interface Props {
    organizationSlug: string
    showManagement?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showManagement: false
})

const overlay = useOverlay(),
    confirmDisconnectModal = overlay.create(XConfirmModal, {}),
    toast = useToast(),
    router = useRouter(),
    route = useRoute()

if (route.query.slack_install === 'success') {
    toast.add({
        icon: 'i-lucide-check',
        title: 'Success',
        description: 'Successfully added Cathedral to your Slack workspace!'
    })
    // Remove query parameters from URL
    router.replace({ query: {} })
} else if (route.query.slack_install === 'error') {
    const errorMessage = route.query.error_message || 'Failed to add Cathedral to Slack workspace'
    toast.add({
        icon: 'i-lucide-alert-circle',
        title: 'Error',
        description: errorMessage as string
    })
    // Remove query parameters from URL
    router.replace({ query: {} })
}

const { data: slackWorkspaces, refresh: refreshSlackWorkspaces } = await useFetch<z.infer<typeof SlackWorkspaceMeta>[]>(
    `/api/slack/workspaces`,
    {
        query: { organizationSlug: props.organizationSlug },
        transform: (data: z.infer<typeof SlackWorkspaceMeta>[]): z.infer<typeof SlackWorkspaceMeta>[] => {
            return data?.map(workspace => ({
                ...workspace,
                installationDate: new Date(workspace.installationDate),
                lastRefreshDate: workspace.lastRefreshDate ? new Date(workspace.lastRefreshDate) : undefined
            })) || []
        }
    }
)

const disconnectingWorkspaces = ref<Set<string>>(new Set())
const refreshingWorkspaces = ref<Set<string>>(new Set())

const addAnotherUrl = `/api/slack/oauth/authorize?organizationSlug=${props.organizationSlug}`

const disconnectSlackWorkspace = async (teamId: string) => {
    // Find the workspace data to get the name for a better confirmation message
    const workspaceData = slackWorkspaces.value?.find(ws => ws.teamId === teamId)
    const workspaceDisplayName = workspaceData?.teamName || teamId

    const result = await confirmDisconnectModal.open({
        title: `Are you sure you want to disconnect workspace "${workspaceDisplayName}"? This will remove the app installation and all associated channel links.`
    }).result

    if (!result)
        return

    disconnectingWorkspaces.value.add(teamId)

    try {
        await $fetch(`/api/slack/workspaces/${teamId}`, {
            method: 'DELETE',
            body: {
                organizationSlug: props.organizationSlug
            }
        })

        toast.add({
            icon: 'i-lucide-check',
            title: 'Success',
            description: 'Slack workspace disconnected successfully'
        })

        await refreshSlackWorkspaces()
    } catch (error: unknown) {
        toast.add({
            icon: 'i-lucide-alert-circle',
            title: 'Error',
            description: `Failed to disconnect Slack workspace: ${(error as { data?: { message?: string }, message?: string })?.data?.message || (error as { message?: string })?.message}`
        })
    } finally {
        disconnectingWorkspaces.value.delete(teamId)
    }
}

const refreshWorkspaceTokens = async (teamId: string) => {
    refreshingWorkspaces.value.add(teamId)

    try {
        await $fetch(`/api/slack/workspaces/${teamId}/refresh`, {
            method: 'POST',
            body: {
                organizationSlug: props.organizationSlug
            }
        })

        toast.add({
            icon: 'i-lucide-check',
            title: 'Success',
            description: 'Workspace tokens refreshed successfully'
        })

        await refreshSlackWorkspaces()
    } catch (error: unknown) {
        toast.add({
            icon: 'i-lucide-alert-circle',
            title: 'Error',
            description: `Failed to refresh workspace tokens: ${(error as { data?: { message?: string }, message?: string })?.data?.message || (error as { message?: string })?.message}`
        })
    } finally {
        refreshingWorkspaces.value.delete(teamId)
    }
}

const slackWorkspaceColumns: TableColumn<z.infer<typeof SlackWorkspaceMeta>>[] = [
    {
        accessorKey: 'teamName',
        header: 'Workspace',
        cell: ({ row }: { row: Row<z.infer<typeof SlackWorkspaceMeta>> }) => {
            const teamName = row.original.teamName
            const teamId = row.original.teamId

            return (
                <div class="flex flex-col">
                    <span class="font-medium">{teamName}</span>
                    <UBadge variant="outline" color="neutral" size="xs">{teamId}</UBadge>
                </div>
            )
        }
    },
    {
        accessorKey: 'installedByName',
        header: 'Installed By'
    },
    {
        accessorKey: 'installationDate',
        header: 'Installation Date',
        cell: ({ row }: { row: Row<z.infer<typeof SlackWorkspaceMeta>> }) => {
            const installDate = row.original.installationDate
            return <time datetime={installDate.toISOString()} class="text-sm">{installDate.toLocaleDateString()}</time>
        }
    },
    {
        accessorKey: 'lastRefreshDate',
        header: 'Last Refreshed',
        cell: ({ row }: { row: Row<z.infer<typeof SlackWorkspaceMeta>> }) => {
            const lastRefresh = row.original.lastRefreshDate
            if (!lastRefresh) {
                return <span class="text-muted text-sm">Never</span>
            }
            const refreshDate = lastRefresh
            return <time datetime={refreshDate.toISOString()} class="text-sm">{refreshDate.toLocaleDateString()}</time>
        }
    },
    ...(props.showManagement
        ? [{
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: Row<z.infer<typeof SlackWorkspaceMeta>> }) => {
                    const teamId = row.original.teamId

                    return (
                        <div class="flex gap-2">
                            <UButton
                                icon="i-lucide-refresh-cw"
                                color="primary"
                                variant="ghost"
                                size="sm"
                                loading={refreshingWorkspaces.value.has(teamId)}
                                disabled={refreshingWorkspaces.value.has(teamId) || disconnectingWorkspaces.value.has(teamId)}
                                onClick={() => refreshWorkspaceTokens(teamId)}
                                aria-label="Refresh workspace tokens"
                            />
                            <UButton
                                icon="i-lucide-unlink"
                                color="error"
                                variant="ghost"
                                size="sm"
                                loading={disconnectingWorkspaces.value.has(teamId)}
                                disabled={disconnectingWorkspaces.value.has(teamId) || refreshingWorkspaces.value.has(teamId)}
                                onClick={() => disconnectSlackWorkspace(teamId)}
                                aria-label="Disconnect workspace"
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
    <div v-if="!showManagement">
        <div
            v-if="slackWorkspaces && slackWorkspaces.length > 0"
            class="flex items-center justify-center gap-4"
        >
            <NuxtLink
                :to="{ name: 'Slack Workspaces', params: { organizationslug: organizationSlug } }"
                class="flex items-center gap-2 text-primary-600 hover:text-primary-800"
            >
                <UIcon
                    name="i-lucide-slack"
                    class="text-lg"
                />
                {{ slackWorkspaces.length }} Slack workspace{{ slackWorkspaces.length !== 1 ? 's' : '' }} connected
            </NuxtLink>
            <UButton
                :to="addAnotherUrl"
                :external="true"
                icon="i-lucide-plus"
                color="primary"
                variant="outline"
                size="sm"
                label="Add Another"
            />
        </div>
        <div
            v-else
            class="text-center"
        >
            <SlackAddButton :organization-slug="organizationSlug" />
        </div>
    </div>

    <!-- Full management view -->
    <div v-else-if="showManagement">
        <div class="mb-4 flex justify-between items-center">
            <div>
                <h2 class="text-xl font-semibold">
                    Connected Slack Workspaces
                </h2>
                <p class="text-muted text-sm">
                    Manage Slack workspaces connected to this
                    organization
                </p>
            </div>
            <SlackAddButton :organization-slug="organizationSlug" />
        </div>

        <div v-if="slackWorkspaces && slackWorkspaces.length > 0">
            <UTable
                :data="slackWorkspaces"
                :columns="slackWorkspaceColumns"
                :empty-state="{ icon: 'i-lucide-slack', label: 'No Slack workspaces connected' }"
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
                    No Slack workspaces are currently connected to this
                    organization.
                </p>
                <p class="text-sm text-muted">
                    Add Cathedral to your Slack workspace to enable slash commands and channel linking.
                </p>
                <SlackAddButton :organization-slug="organizationSlug" />
            </div>
        </div>
    </div>
</template>
