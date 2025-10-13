<script lang="ts" setup>
import type { PegsCard } from '#shared/types'

const props = defineProps<{
        cards: PegsCard[]
        solutionslug: string
        organizationslug: string
    }>(),
    { isRequirementMissing } = useMinimumRequirements(),
    // Track missing requirements for each card
    missingRequirements = ref<Record<string, boolean>>({})

// Check for missing requirements when component mounts or solution changes
watch([() => props.organizationslug, () => props.solutionslug, () => props.cards], async () => {
    if (!props.organizationslug || !props.solutionslug) return

    const missing: Record<string, boolean> = {}

    for (const card of props.cards) {
        let hasMissingRequirement = false

        if (card.minActiveReqTypes && card.minActiveReqTypes.length > 0) {
            // eslint-disable-next-line max-params
            hasMissingRequirement = await card.minActiveReqTypes.reduce(async (accPromise, reqType) => {
                const acc = await accPromise
                if (acc) return true // Already found missing, short-circuit

                return await isRequirementMissing({
                    reqType,
                    organizationSlug: props.organizationslug,
                    solutionSlug: props.solutionslug
                }).catch(() => false) // If this specific check fails, assume not missing
            }, Promise.resolve(false))
        }

        missing[card.reqId] = hasMissingRequirement
    }

    missingRequirements.value = missing
}, { immediate: true })
</script>

<template>
    <slot name="header" />

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
        <template
            v-for="card in props.cards"
            :key="card.label"
        >
            <NuxtLink
                v-if="!card.disabled"
                :to="card.path"
                class="block"
            >
                <UChip
                    v-if="missingRequirements[card.reqId]"
                    color="error"
                    size="3xl"
                    position="top-right"
                    class="relative w-full"
                >
                    <UCard
                        variant="subtle"
                        class="w-full"
                    >
                        <template #header>
                            <UIcon
                                :name="card.icon"
                                class="size-7"
                            />
                        </template>

                        {{ card.reqId }} {{ card.label }}
                    </UCard>
                </UChip>
                <UCard
                    v-else
                    variant="subtle"
                    class="w-full"
                >
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
                class="cursor-not-allowed block"
            >
                <UChip
                    v-if="missingRequirements[card.reqId]"
                    color="error"
                    size="3xl"
                    position="top-right"
                    class="relative w-full"
                >
                    <UCard
                        variant="subtle"
                        class="border-dashed border-muted opacity-70 w-full"
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
                </UChip>
                <UCard
                    v-else
                    variant="subtle"
                    class="border-dashed border-muted opacity-70 w-full"
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
