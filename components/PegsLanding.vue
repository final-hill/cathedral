<script lang="ts" setup>
type Card = {
    name: string
    icon: string
    label: string
    reqId: string
    disabled?: boolean
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
        <template
            v-for="card in props.cards"
            :key="card.name"
        >
            <!-- Enabled card -->
            <NuxtLink
                v-if="!card.disabled"
                :to="{
                    name: card.name as any,
                    params: {
                        solutionslug: props.solutionslug,
                        organizationslug: props.organizationslug
                    }
                }"
            >
                <UCard variant="subtle">
                    <template #header>
                        <UIcon
                            :name="card.icon"
                            class="size-7"
                        />
                    </template>

                    {{ card.reqId }}. {{ card.label }}
                </UCard>
            </NuxtLink>

            <!-- Disabled card -->
            <div
                v-else
                class="cursor-not-allowed"
            >
                <UCard
                    variant="subtle"
                    class="border-dashed border-gray-300 opacity-70"
                >
                    <template #header>
                        <UIcon
                            :name="card.icon"
                            class="size-7 text-gray-400"
                        />
                    </template>

                    <div>
                        {{ card.reqId }}. {{ card.label }}
                        <div class="text-red-500 text-sm mt-2 font-medium">
                            Coming Soon
                        </div>
                    </div>
                </UCard>
            </div>
        </template>
    </section>
</template>
