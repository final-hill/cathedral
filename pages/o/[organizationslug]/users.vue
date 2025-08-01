<script setup lang="tsx">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { UButton, UCheckbox, UDropdownMenu, UIcon, XConfirmModal } from '#components'
import { AppUser } from '#shared/domain/application'
import type { z } from 'zod'
import { getSchemaFields } from '~/shared/utils'

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users', middleware: 'auth' })

const viewSchema = AppUser.pick({
    name: true,
    email: true,
    role: true
})
const editSchema = AppUser.pick({
    id: true,
    email: true,
    role: true
})
const createSchema = AppUser.pick({
    email: true,
    role: true
})

type SchemaType = z.infer<typeof AppUser>

const { $eventBus } = useNuxtApp(),
    overlay = useOverlay(),
    confirmDeleteModal = overlay.create(XConfirmModal, {}),
    confirmUnlinkSlackModal = overlay.create(XConfirmModal, {}),
    editModalOpenState = ref(false),
    editModalItem = ref<SchemaType | null>(null),
    toast = useToast(),
    { organizationslug: organizationSlug } = useRoute('Organization Users').params,
    { data: users, status, refresh, error: getUserError } = await useFetch('/api/appusers', {
        query: { organizationSlug, includeSlack: true }
    })

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

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
})

// Add Slack associations column
const slackColumn: TableColumn<SchemaType> = {
    header: 'Slack',
    accessorKey: 'slackAssociations',
    cell: ({ row }) => {
        const associations = row.original.slackAssociations || []

        if (associations.length === 0) {
            return (
                <span class="text-muted text-sm italic">
                    No Slack accounts linked
                </span>
            )
        }

        return (
            <ul class="space-y-1">
                {associations.map(assoc => (
                    <li key={`${assoc.teamId}-${assoc.slackUserId}`} class="text-sm">
                        <header class="font-medium">
                            <UIcon name="i-lucide-message-circle" class="mr-1 text-success" />
                            {assoc.teamName}
                        </header>
                        <p class="text-muted text-xs">
                            User ID:
                            {' '}
                            <data value={assoc.slackUserId}>{assoc.slackUserId}</data>
                        </p>
                        <p class="text-muted text-xs">
                            Linked:
                            {' '}
                            <time datetime={assoc.creationDate.toISOString()}>
                                {new Date(assoc.creationDate).toLocaleDateString()}
                            </time>
                        </p>
                    </li>
                ))}
            </ul>
        )
    }
}

const actionColumn: TableColumn<SchemaType> = {
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
}

const getActionItems = (item: SchemaType): DropdownMenuItem[] => {
    const items: DropdownMenuItem[] = [{
        label: 'Edit',
        icon: 'i-lucide-edit',
        onClick: () => {
            editModalItem.value = item
            editModalOpenState.value = true
        }
    }]

    // Add Slack management options if user has associations
    if (item.slackAssociations && item.slackAssociations.length > 0) {
        items.push({
            label: 'Manage Slack Accounts',
            icon: 'i-lucide-message-circle',
            onClick: () => {
                manageSlackModal.value = {
                    isOpen: true,
                    user: item
                }
            }
        })
    }

    items.push({
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        onClick: async () => {
            const result = await confirmDeleteModal.open({
                title: `Are you sure you want to delete '${item.name}'?`
            }).result

            if (result) {
                try {
                    await $fetch(`/api/appusers/${item.id}`, {
                        method: 'DELETE',
                        body: { organizationSlug }
                    })
                    toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'User removed successfully' })
                    refresh()
                } catch (error) {
                    toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing user: ${error}` })
                }
            }
        }
    })

    return items
}

const userColumns: TableColumn<SchemaType>[] = [...viewDataColumns, slackColumn, actionColumn]

const columnPinning = ref({
    left: [],
    right: ['Actions']
})

const manageSlackModal = ref<{
    isOpen: boolean
    user: SchemaType | null
}>({
    isOpen: false,
    user: null
})

const closeSlackModal = () => {
    manageSlackModal.value = {
        isOpen: false,
        user: null
    }
}

const unlinkSlackUser = async (slackUserId: string, teamId: string, teamName: string) => {
    if (!manageSlackModal.value.user) return

    const result = await confirmUnlinkSlackModal.open({
        title: `Are you sure you want to unlink the Slack account from "${teamName}"? The user will need to re-link their account to perform interactions from Slack.`
    }).result

    if (!result) return

    try {
        await $fetch('/api/slack/unlink-user', {
            method: 'POST' as const,
            body: {
                slackUserId,
                teamId
            }
        })

        toast.add({
            icon: 'i-lucide-check',
            title: 'Success',
            description: 'Slack account has been unlinked successfully.'
        })

        refresh()
    } catch (error) {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error unlinking Slack user: ${error}` })
    }
}

const addUser = async (data: z.infer<typeof createSchema>) => {
    try {
        const response = await $fetch(`/api/appusers/`, {
            method: 'POST',
            body: {
                email: data.email,
                organizationSlug,
                role: data.role
            }
        })

        refresh()

        // Show different success messages based on whether user was invited or added
        if (response.invited) {
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
    } catch (error) {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error adding/inviting user: ${error}` })
    }
}

const updateUser = async (data: z.infer<typeof editSchema>) => {
    try {
        await $fetch(`/api/appusers/${data.id}`, {
            method: 'PUT',
            body: {
                organizationSlug,
                role: data.role
            }
        })
        refresh()

        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'User updated successfully' })

        closeEdit()
    } catch (error) {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error updating user: ${error}` })
    }
}

const closeEdit = () => {
    editModalOpenState.value = false
    editModalItem.value = Object.create(null)
}

const addModalOpenState = ref(false),
    addModalItem = ref<z.infer<typeof createSchema> | null>(null)

const openAddModal = () => {
    addModalItem.value = Object.create(null)
    addModalOpenState.value = true
}

const closeAddModal = () => {
    addModalItem.value = Object.create(null)
    addModalOpenState.value = false
}

const onAddModalSubmit = async (data: z.infer<typeof createSchema>) => {
    await addUser(data)
    closeAddModal()
}
</script>

<template>
    <h1>Application Users</h1>

    <p>{{ AppUser.description }}</p>
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
        sticky
        :data="users || []"
        :columns="userColumns as any"
        :loading="status === 'pending'"
        :empty-state="{ icon: 'i-lucide-database', label: 'No items.' }"
    />

    <UModal
        v-model:open="addModalOpenState"
        title="Add/Invite User"
    >
        <template #body>
            <XForm
                :state="addModalItem as any"
                :schema="createSchema"
                :on-submit="onAddModalSubmit"
                :on-cancel="closeAddModal"
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
                :on-submit="updateUser"
                :on-cancel="closeEdit"
            />
        </template>
    </UModal>

    <UModal
        v-model:open="manageSlackModal.isOpen"
        title="Manage Slack Accounts"
    >
        <template #body>
            <div
                v-if="manageSlackModal.user"
                class="space-y-4"
            >
                <div>
                    <h3 class="text-lg font-medium mb-2">
                        Slack Accounts for {{ manageSlackModal.user.name }}
                    </h3>
                    <p class="text-sm text-muted mb-4">
                        {{ manageSlackModal.user.email }}
                    </p>
                </div>

                <div v-if="!manageSlackModal.user.slackAssociations || manageSlackModal.user.slackAssociations.length === 0">
                    <p class="text-muted italic">
                        This user has no Slack accounts linked.
                    </p>
                </div>

                <div
                    v-else
                    class="space-y-3"
                >
                    <div
                        v-for="assoc in manageSlackModal.user.slackAssociations"
                        :key="`${assoc.teamId}-${assoc.slackUserId}`"
                        class="border rounded-lg p-4 space-y-2"
                    >
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-medium flex items-center">
                                    <UIcon
                                        name="i-lucide-message-circle"
                                        class="mr-2 text-success"
                                    />
                                    {{ assoc.teamName }}
                                </div>
                                <div class="text-sm text-muted">
                                    Slack User ID: {{ assoc.slackUserId }}
                                </div>
                                <div class="text-sm text-muted">
                                    Team ID: {{ assoc.teamId }}
                                </div>
                                <div class="text-sm text-muted">
                                    Linked: {{ new Date(assoc.creationDate).toLocaleString() }}
                                </div>
                            </div>
                            <UButton
                                color="error"
                                variant="ghost"
                                size="sm"
                                icon="i-lucide-unlink"
                                @click="unlinkSlackUser(assoc.slackUserId, assoc.teamId, assoc.teamName)"
                            >
                                Unlink
                            </UButton>
                        </div>
                    </div>
                </div>

                <div class="border-t pt-4 mt-4">
                    <h4 class="font-medium mb-2">
                        How to Link/Unlink Slack Accounts
                    </h4>
                    <div class="text-sm text-muted space-y-1">
                        <p>• Users can link their Slack account using: <code>/cathedral-link-user</code></p>
                        <p>• Users can unlink their Slack account using: <code>/cathedral-unlink-user</code></p>
                        <p>• These commands must be run in a Slack workspace with the Cathedral app installed</p>
                    </div>
                </div>

                <div class="flex justify-end pt-4">
                    <UButton
                        variant="outline"
                        @click="closeSlackModal"
                    >
                        Close
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
