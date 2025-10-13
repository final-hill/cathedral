<script lang="ts" setup>
import type { ReqType } from '#shared/domain'

type EnrichedMissingRequirement = { reqType: ReqType, label: string, section: string, code: string, path: string }

const props = defineProps<{
        open: boolean
        missingRequirements: EnrichedMissingRequirement[]
    }>(),
    emit = defineEmits<{
        'update:open': [value: boolean]
    }>(),
    isOpen = computed({
        get: () => props.open,
        set: value => emit('update:open', value)
    }),
    groupedMissing = computed(() => {
        // eslint-disable-next-line max-params
        return props.missingRequirements.reduce((acc, req) => {
            if (!acc[req.section])
                acc[req.section] = []

            acc[req.section]!.push(req)
            return acc
        }, {} as Record<string, EnrichedMissingRequirement[]>)
    }),
    totalMissing = computed(() => props.missingRequirements.length)
</script>

<template>
    <UDrawer
        v-model:open="isOpen"
        title="Minimum Requirements"
        :description="`${totalMissing} requirement type${totalMissing !== 1 ? 's' : ''} missing active items`"
    >
        <UButton
            color="warning"
            variant="outline"
            trailing-icon="i-lucide-chevron-up"
            :label="`${totalMissing} Missing Requirements`"
            :disabled="totalMissing === 0"
        />

        <template #body>
            <div
                v-if="totalMissing === 0"
                class="text-center py-8"
            >
                <UIcon
                    name="i-lucide-check-circle"
                    class="size-12 mx-auto text-success mb-4"
                />
                <h3 class="text-lg font-semibold text-highlighted mb-2">
                    All Minimum Requirements Met
                </h3>
                <p class="text-muted">
                    Your solution has all the required minimum requirement types with active items.
                </p>
            </div>

            <div
                v-else
                class="space-y-6"
            >
                <div class="prose prose-sm">
                    <p class="text-muted">
                        The following requirement types are missing active items.
                        Click on any item to navigate to that section.
                    </p>
                </div>

                <div
                    v-for="(requirements, section) in groupedMissing"
                    :key="section"
                    class="space-y-3"
                >
                    <h3 class="text-sm font-semibold text-highlighted uppercase tracking-wide">
                        {{ section }}
                    </h3>

                    <div class="space-y-2">
                        <NuxtLink
                            v-for="requirement in requirements"
                            :key="requirement.code"
                            :to="requirement.path"
                            class="block"
                            @click="isOpen = false"
                        >
                            <UCard
                                variant="subtle"
                                class="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-warning"
                            >
                                <div class="flex items-start justify-between">
                                    <div class="space-y-1">
                                        <div class="flex items-center gap-2">
                                            <UIcon
                                                name="i-lucide-alert-triangle"
                                                class="size-4 text-warning"
                                            />
                                            <span class="font-medium text-highlighted">
                                                {{ requirement.code }} {{ requirement.label }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-muted">
                                            No active requirements found for this type
                                        </p>
                                    </div>
                                    <UIcon
                                        name="i-lucide-chevron-right"
                                        class="size-4 text-muted"
                                    />
                                </div>
                            </UCard>
                        </NuxtLink>
                    </div>
                </div>

                <div class="bg-info/10 border border-info/20 rounded-lg p-4 space-y-2">
                    <div class="flex items-start gap-2">
                        <UIcon
                            name="i-lucide-info"
                            class="size-4 text-info mt-0.5"
                        />
                        <div class="text-sm">
                            <p class="font-medium text-highlighted">
                                About Minimum Requirements
                            </p>
                            <p class="text-muted mt-1">
                                These requirement types are essential for a minimal requirements specification.
                                You should have at least one active requirement for each type to ensure your
                                solution meets the minimum requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UDrawer>
</template>
