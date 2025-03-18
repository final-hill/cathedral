<script lang="ts" setup>
import { Obstacle } from '#shared/domain';
import { z } from 'zod';

useHead({ title: 'Situation' })
definePageMeta({ name: 'Situation' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Situation').params

const { data: situations, error: getSituationError } = await useFetch<z.infer<typeof Obstacle>[]>(`/api/obstacle`, {
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    })),
    query: { name: 'G.2', solutionSlug, organizationSlug }
});

if (getSituationError.value)
    $eventBus.$emit('page-error', getSituationError.value);

const situation = situations.value![0]

const formSchema = Obstacle.pick({
    description: true
});

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    description: situation.description
});

const updateSituation = async (data: FormSchema) => {
    await $fetch(`/api/obstacle/${situation.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            name: situation.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}

const { data: obstacles, refresh, status, error: getObstaclesError } = await useFetch<z.infer<typeof Obstacle>[]>(`/api/obstacle`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    })).filter((item) => item.reqId !== 'G.2.1')
})

const viewSchema = Obstacle.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = Obstacle.pick({
    name: true,
    description: true
})

const editSchema = Obstacle.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/obstacle`, {
        method: 'POST',
        body: {
            solutionSlug,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/obstacle/${data.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/obstacle/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <h1>G.2.1 Situation</h1>

    <p>
        The current state of affairs that need to be addressed by the system created by a project.
    </p>

    <XForm :schema="formSchema" :state="formState" :onSubmit="updateSituation" />

    <h2>Obstacles</h2>
    <p> {{ Obstacle.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="obstacles"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>