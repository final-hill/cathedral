<script lang="ts" setup>
import { Situation, Obstacle } from '#shared/domain';
import { z } from 'zod';

useHead({ title: 'Situation' })
definePageMeta({ name: 'Situation' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Situation').params

const { data: situations, error: getSituationError } = await useFetch<z.infer<typeof Situation>[]>(`/api/situation`, {
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    })),
    query: { solutionSlug, organizationSlug }
});

if (getSituationError.value)
    $eventBus.$emit('page-error', getSituationError.value);

const situation = situations.value![0]

const formSchema = Situation.pick({
    description: true
});

type SituationFormSchema = z.infer<typeof formSchema>;

const formState = reactive<SituationFormSchema>({
    description: situation.description
});

const updateSituation = async ({ ...data }: SituationFormSchema) => {
    await $fetch(`/api/situation/${situation.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            ...data
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

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await $fetch(`/api/obstacle/${id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            ...data
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
    <h1>G.2.0 Situation</h1>

    <p> {{ Situation.description }} </p>

    <XForm :schema="formSchema" :state="formState" :onSubmit="updateSituation" />

    <h2>Obstacles</h2>
    <p> {{ Obstacle.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="obstacles"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>