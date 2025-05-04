<script setup lang="tsx">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { UButton, UCheckbox, UDropdownMenu, XConfirmModal } from '#components'
import { AppUser } from '#shared/domain/application'
import type { z } from 'zod'
import { getSchemaFields } from '~/shared/utils'

useHead({ title: 'Users' })
definePageMeta({ name: 'Organization Users', middleware: 'auth' })

const viewSchema = AppUser.pick({
    name: true,
    email: true,
    role: true,
    isSystemAdmin: true,
    creationDate: true,
    lastLoginDate: true
})
const editSchema = AppUser.pick({
    id: true,
    email: true,
    role: true,
    isSystemAdmin: true
})
const createSchema = AppUser.pick({
    email: true,
    role: true
})

type SchemaType = z.infer<typeof AppUser>

const { $eventBus } = useNuxtApp(),
    overlay = useOverlay(),
    confirmDeleteModal = overlay.create(XConfirmModal, {}),
    editModalOpenState = ref(false),
    editModalItem = ref<SchemaType | null>(null),
    toast = useToast(),
    { organizationslug: organizationSlug } = useRoute('Organization Users').params,
    { data: users, status, refresh, error: getUserError } = await useFetch('/api/appusers', {
        query: { organizationSlug },
        transform: (data) => data.map((user) => ({
            ...user,
            creationDate: new Date(user.creationDate),
            lastLoginDate: user.lastLoginDate ? new Date(user.lastLoginDate) : undefined,
            lastModified: new Date(user.lastModified)
        }))
    })

if (getUserError.value)
    $eventBus.$emit('page-error', getUserError.value)

const viewDataColumns = getSchemaFields(viewSchema).map(({ key, label }) => {
    const column: TableColumn<SchemaType> = {
        accessorKey: key,
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

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
            );
        },
        cell: ({ row }) => {
            const cellValue = row.original[key as keyof SchemaType] as any;

            switch (true) {
                case typeof cellValue === 'string':
                case typeof cellValue === 'number':
                    return cellValue;
                case cellValue instanceof Date:
                    return <time datetime={cellValue.toISOString()}> {cellValue.toLocaleString()} </time>;
                case typeof cellValue === 'boolean':
                    return <UCheckbox modelValue={cellValue} disabled />;
                case typeof cellValue === 'object' && cellValue !== null && 'id' in cellValue && 'name' in cellValue:
                    return cellValue.name;
                default:
                    return cellValue;
            }
        }
    };
    return column;
})

const actionColumn: TableColumn<SchemaType> = {
    header: 'Actions',
    cell: ({ row }) => {
        const item = row.original,
            actionItems = getActionItems(item);

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
        );
    }
};

const getActionItems = (item: SchemaType): DropdownMenuItem[] => {
    const items: DropdownMenuItem[] = [{
        label: 'Edit',
        icon: 'i-lucide-edit',
        onClick: () => {
            editModalItem.value = item;
            editModalOpenState.value = true;
        }
    }, {
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        onClick: async () => {
            const result = await confirmDeleteModal.open({
                title: `Are you sure you want to delete '${item.name}'?`,
            }).result;

            if (result) {
                try {
                    await $fetch(`/api/appusers/${item.id}`, {
                        method: 'DELETE',
                        body: { organizationSlug }
                    });
                    toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'User removed successfully' });
                    refresh();
                } catch (error) {
                    toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error removing user: ${error}` });
                }
            }
        }
    }];

    return items;
}

const userColumns: TableColumn<SchemaType>[] = [...viewDataColumns, actionColumn]

const columnPinning = ref({
    left: [],
    right: ['Actions']
})

const addUser = async (data: z.infer<typeof createSchema>) => {
    try {
        await $fetch(`/api/appusers/`, {
            method: 'POST',
            body: {
                email: data.email,
                organizationSlug,
                role: data.role
            }
        });
        refresh();
    } catch (error) {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error creating user: ${error}` });
    }
}

const updateUser = async (data: z.infer<typeof editSchema> & { id: string }) => {
    try {
        await $fetch(`/api/appusers/${data.id}`, {
            method: 'PUT',
            body: {
                organizationSlug,
                role: data.role
            }
        });
        refresh();

        toast.add({ icon: 'i-lucide-check', title: 'Success', description: 'User updated successfully' });

        closeEdit();
    } catch (error) {
        toast.add({ icon: 'i-lucide-alert-circle', title: 'Error', description: `Error updating user: ${error}` });
    }
}

const closeEdit = () => {
    editModalOpenState.value = false
    editModalItem.value = Object.create(null);
}

const addModalOpenState = ref(false),
    addModalItem = ref<z.infer<typeof createSchema> | null>(null);

const openAddModal = () => {
    addModalItem.value = Object.create(null);
    addModalOpenState.value = true;
};

const closeAddModal = () => {
    addModalItem.value = Object.create(null);
    addModalOpenState.value = false;
};

const onAddModalSubmit = async () => {
    if (addModalItem.value) {
        await addUser(addModalItem.value);
        closeAddModal();
    }
};
</script>

<template>
    <h1>Application Users</h1>

    <p> {{ AppUser.description }} </p>

    <section>
        <UButton label="Add User" color="success" @click="openAddModal" size="xl" />
    </section>

    <UTable sticky :data="users" :columns="userColumns" v-model:column-pinning="columnPinning"
        :loading="status === 'pending'" :empty-state="{ icon: 'i-lucide-database', label: 'No items.' }" />

    <UModal v-model:open="addModalOpenState" title="Add User">
        <template #body>
            <XForm :state="addModalItem as any" :schema="createSchema" :onSubmit="onAddModalSubmit"
                :onCancel="closeAddModal" />
        </template>
    </UModal>

    <UModal v-model:open="editModalOpenState" title="Edit User">
        <template #body>
            <XForm :state="editModalItem as any" :schema="editSchema" :onSubmit="updateUser" :onCancel="closeEdit" />
        </template>
    </UModal>
</template>