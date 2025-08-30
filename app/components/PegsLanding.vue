<script lang="ts" setup>
type Card = {
    icon: string
    label: string
    reqId: string
    path?: string
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
            :key="card.label"
        >
            <!-- Enabled card -->
            <NuxtLink
                v-if="!card.disabled"
                :to="card.path"
            >
                <UCard variant="subtle">
                    <template #header>
                        <UIcon
                            :name="card.icon"
                            class="size-7"
                        />
                    </template>

                    {{ card.reqId }} {{ card.label }}
                </UCard>
            </NuxtLink>

            <!-- Disabled card -->
            <div
                v-else
                class="cursor-not-allowed"
            >
                <UCard
                    variant="subtle"
                    class="border-dashed border-muted opacity-70"
                >
                    <template #header>
                        <UIcon
                            :name="card.icon"
                            class="size-7 text-muted"
                        />
                    </template>

                    <div>
                        {{ card.reqId }} {{ card.label }}
                        <div class="text-error text-sm mt-2 font-medium">
                            Coming Soon
                        </div>
                    </div>
                </UCard>
            </div>
        </template>
    </section>
</template>
