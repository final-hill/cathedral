<script setup lang="tsx">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { UButton, UCard, UCheckbox, UDropdownMenu, UIcon, XConfirmModal } from '#components'
import { AppUserWithRoleDto, AppUserWithRoleAndSlackDto } from '#shared/dto'
import type { AppUserWithRoleAndSlackDtoType } from '#shared/dto'
import { z } from 'zod'

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users', middleware: 'auth' })

const viewSchema = AppUserWithRoleDto.pick({
        name: true,
        email: true,
        role: true
    }),
    editSchema = AppUserWithRoleDto.pick({
        id: true,
        email: true,
        role: true
    }),
    createSchema = AppUserWithRoleDto.pick({
        email: true,
        role: true
    })

type SchemaType = AppUserWithRoleAndSlackDtoType

const { $eventBus } = useNuxtApp(),
    overlay = useOverlay(),
    confirmDeleteModal = overlay.create(XConfirmModal, {}),
    confirmUnlinkSlackModal = overlay.create(XConfirmModal, {}),
    editModalOpenState = ref(false),
    editModalItem = ref<SchemaType | null>(null),
    toast = useToast(),
    { organizationslug: organizationSlug } = useRoute('Organization Users').params,
    { data: users, status, refresh, error: getUserError } = await useApiRequest('/api/appusers', {
        schema: z.array(AppUserWithRoleAndSlackDto),
        query: { organizationSlug, includeSlack: true },
        errorMessage: 'Failed to load users'
    })

if (getUserError.value) $eventBus.$emit('page-error', getUserError.value)

const viewDataColumns = getSchemaFields(viewSchema).map(({ key, label }) => {
        const column: TableColumn<SchemaType> = {
            accessorKey: key,
            header: ({ column }) => {
                const isSorted = column.getIsSorted()

                return (
                    <UButton
                        label={label}
                        color="neutral"
                        variant="ghost"
                        icon={
                            isSorted
                                ? isSorted === 'asc'
                                    ? 'i-lucide-arrow-up-narrow-wide'
                                    : 'i-lucide-arrow-down-wide-narrow'
                                : 'i-lucide-arrow-up-down'
                        }
                        class="-mx-2.5"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    />
                )
            },
            cell: ({ row }) => {
                const cellValue = row.original[key as keyof SchemaType] as unknown

                switch (true) {
                    case typeof cellValue === 'string':
                    case typeof cellValue === 'number':
                        return cellValue
                    case cellValue instanceof Date:
                        return (
                            <time datetime={cellValue.toISOString()}>
                                {' '}
                                {cellValue.toLocaleString()}
                                {' '}
                            </time>
                        )
                    case typeof cellValue === 'boolean':
                        return <UCheckbox modelValue={cellValue} disabled />
                    case typeof cellValue === 'object' && cellValue !== null && 'id' in cellValue && 'name' in cellValue:
                        return cellValue.name
                    default:
                        return cellValue
                }
            }
        }
        return column
    }),
    slackColumn: TableColumn<SchemaType> = {
        header: 'Slack',
        cell: ({ row }) => {
            const associations = row.original.slackAssociations || []

            if (associations.length === 0) {
                return (
                    <span class="text-muted text-sm italic">
                        No accounts linked
                    </span>
                )
            }

            return (
                <div class="flex items-center gap-2">
                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-chevron-down"
                        size="xs"
                        square
                        aria-label="Expand Slack accounts"
                        ui={{
                            leadingIcon: [
                                'transition-transform',
                                row.getIsExpanded() ? 'duration-200 rotate-180' : ''
                            ]
                        }}
                        onClick={() => row.toggleExpanded()}
                    />
                    <div class="flex items-center gap-1">
                        <UIcon name="i-lucide-message-circle" class="text-success" />
                        <span class="text-sm font-medium">
                            {associations.length}
                            {' '}
                            account
                            {associations.length === 1 ? '' : 's'}
                        </span>
                    </div>
                </div>
            )
        }
    },
    actionColumn: TableColumn<SchemaType> = {
        header: 'Actions',
        cell: ({ row }) => {
            const item = row.original,
                actionItems = getActionItems(item)

            return (
                <div class="text-left">
                    <UDropdownMenu items={actionItems}>
                        <UButton
                            class="ml-auto"
                            icon="i-lucide-ellipsis-vertical"
                            color="neutral"
                            variant="ghost"
                            aria-label="Actions dropdown"
                        />
                    </UDropdownMenu>
                </div>
            )
        }
    },
    getActionItems = (item: SchemaType): DropdownMenuItem[] => {
        const items: DropdownMenuItem[] = [{
            label: 'Edit',
            icon: 'i-lucide-edit',
            onClick: () => {
                editModalItem.value = item
                editModalOpenState.value = true
            }
        }]

        items.push({
            label: 'Delete',
            icon: 'i-lucide-trash-2',
            onClick: async () => {
                const result = await confirmDeleteModal.open({
                    title: `Are you sure you want to delete '${item.name}'?`
                }).result

                if (result) {
                    await useApiRequest(`/api/appusers/${item.id}`, {
                        method: 'DELETE',
                        schema: z.unknown(),
                        body: { organizationSlug },
                        showSuccessToast: true,
                        successMessage: 'User removed successfully',
                        errorMessage: 'Failed to remove user'
                    })
                    refresh()
                }
            }
        })

        return items
    },
    userColumns: TableColumn<SchemaType>[] = [...viewDataColumns, slackColumn, actionColumn],
    columnPinning = ref({
        left: [],
        right: ['Actions']
    }),
    expanded = ref<Record<string, boolean>>({}),
    unlinkSlackUser = async (slackUserId: string, teamId: string, teamName: string) => {
        const result = await confirmUnlinkSlackModal.open({
            title: `Are you sure you want to unlink the Slack account from "${teamName}"? The user will need to re-link their account to perform interactions from Slack.`
        }).result

        if (!result) return

        await useApiRequest('/api/slack/unlink-user', {
            method: 'POST',
            schema: z.unknown(),
            body: {
                slackUserId,
                teamId
            },
            showSuccessToast: true,
            successMessage: 'Slack account has been unlinked successfully.',
            errorMessage: 'Failed to unlink Slack user'
        })

        refresh()
    },
    addUser = async (data: z.infer<typeof createSchema>) => {
        const { data: response } = await useApiRequest(`/api/appusers/`, {
            method: 'POST',
            schema: z.object({
                invited: z.boolean().optional()
            }),
            body: {
                email: data.email,
                organizationSlug,
                role: data.role
            },
            errorMessage: 'Failed to add/invite user'
        })

        refresh()

        // Show different success messages based on whether user was invited or added
        if (response.value?.invited) {
            toast.add({
                icon: 'i-lucide-mail',
                title: 'Invitation Sent',
                description: `Invitation sent to ${data.email}. They will receive an email to join the organization.`
            })
        } else {
            toast.add({
                icon: 'i-lucide-check',
                title: 'User Added',
                description: `${data.email} has been added to the organization.`
            })
        }

        refresh()
    },
    updateUser = async (data: z.infer<typeof editSchema>) => {
        await useApiRequest(`/api/appusers/${data.id}`, {
            method: 'PUT',
            schema: z.unknown(),
            body: {
                organizationSlug,
                role: data.role
            },
            showSuccessToast: true,
            successMessage: 'User updated successfully',
            errorMessage: 'Failed to update user'
        })
        refresh()

        closeEdit()
    },
    closeEdit = () => {
        editModalOpenState.value = false
        editModalItem.value = Object.create(null)
    },
    addModalOpenState = ref(false),
    addModalItem = ref<z.infer<typeof createSchema> | null>(null),
    openAddModal = () => {
        addModalItem.value = Object.create(null)
        addModalOpenState.value = true
    },
    closeAddModal = () => {
        addModalItem.value = Object.create(null)
        addModalOpenState.value = false
    },
    onAddModalSubmit = async (data: z.infer<typeof createSchema>) => {
        await addUser(data)
        closeAddModal()
    }
</script>

<template>
    <h1>Application Users</h1>

    <p>{{ AppUserWithRoleAndSlackDto.description }}</p>
    <p>
        <strong>Add/Invite Users:</strong> If the user already exists in the system, they will be added immediately to the organization.
        If they don't exist, an invitation will be sent to their email address.
    </p>

    <section>
        <UButton
            label="Add/Invite User"
            color="success"
            size="xl"
            @click="openAddModal"
        />
    </section>

    <UTable
        v-model:column-pinning="columnPinning"
        v-model:expanded="expanded"
        sticky
        :data="users || []"
        :columns="userColumns as any"
        :loading="status === 'pending'"
        :empty-state="{ icon: 'i-lucide-database', label: 'No items.' }"
        :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
    >
        <template #expanded="{ row }">
            <div
                v-if="row.original.slackAssociations && row.original.slackAssociations.length > 0"
                class="px-4 py-3 bg-subtle/50"
            >
                <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
                    <UIcon
                        name="i-lucide-message-circle"
                        class="text-success"
                    />
                    Slack Account Details
                </h4>
                <div class="grid gap-3">
                    <UCard
                        v-for="assoc in row.original.slackAssociations"
                        :key="`${assoc.teamId}-${assoc.slackUserId}`"
                        variant="subtle"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <UIcon
                                        name="i-lucide-building"
                                        class="text-primary"
                                    />
                                    <span class="font-medium">{{ assoc.teamName }}</span>
                                </div>
                                <UButton
                                    color="error"
                                    variant="ghost"
                                    size="xs"
                                    icon="i-lucide-unlink"
                                    @click="unlinkSlackUser(assoc.slackUserId, assoc.teamId, assoc.teamName)"
                                >
                                    Unlink
                                </UButton>
                            </div>
                        </template>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted">
                            <div>
                                <span class="font-medium">User ID:</span>
                                {{ assoc.slackUserId }}
                            </div>
                            <div>
                                <span class="font-medium">Team ID:</span>
                                {{ assoc.teamId }}
                            </div>
                            <div class="md:col-span-2">
                                <span class="font-medium">Linked:</span>
                                {{ new Date(assoc.creationDate).toLocaleString() }}
                            </div>
                        </div>
                    </UCard>
                </div>
                <div class="mt-4 pt-3 border-t border-accented">
                    <p class="text-xs text-muted">
                        <strong>Tip:</strong> Users can manage their Slack connections using
                        <code class="bg-elevated px-1 py-0.5 rounded text-xs">/cathedral-link-user</code> and
                        <code class="bg-elevated px-1 py-0.5 rounded text-xs">/cathedral-unlink-user</code> commands in Slack.
                    </p>
                </div>
            </div>
        </template>
    </UTable>

    <UModal
        v-model:open="addModalOpenState"
        title="Add/Invite User"
    >
        <template #body>
            <XForm
                :state="addModalItem as any"
                :schema="createSchema"
                @submit="onAddModalSubmit"
                @cancel="closeAddModal"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="editModalOpenState"
        title="Edit User"
    >
        <template #body>
            <XForm
                :state="editModalItem as any"
                :schema="editSchema"
                @submit="updateUser"
                @cancel="closeEdit"
            />
        </template>
    </UModal>
</template>
