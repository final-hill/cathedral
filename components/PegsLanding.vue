<script lang="ts" setup>

type Card = {
    name: string,
    icon: string,
    label: string,
    reqId: string
}

const props = defineProps<{
    cards: Card[]
    solutionslug: string
    organizationslug: string
}>()
</script>

<template>
    <slot name="header" />

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
        <NuxtLink v-for="card in props.cards" :key="card.name" :to="{
            name: card.name as any,
            params: {
                solutionslug: props.solutionslug,
                organizationslug: props.organizationslug
            }
        }">
            <UCard variant="subtle">
                <template #header>
                    <UIcon :name="card.icon" class="size-7" />
                </template>

                {{ card.reqId }}. {{ card.label }}
            </UCard>
        </NuxtLink>
    </section>
</template>