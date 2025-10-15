<script setup lang="ts">
import { ReqType, Interface } from '#shared/domain'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { organizationslug, solutionslug, _pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        _pegs: string
        id: string
    },
    { data: requirement } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE}/${id}`, options: {
        query: {
            organizationSlug: organizationslug,
            solutionSlug: solutionslug
        },
        schema: Interface
    } }),
    // For API interface pages, we don't want to show the interface type since we're already in the API section
    displaySchema = Interface.omit({
        interfaceType: true
    })

useHead({
    title: requirement.value?.name ? `${requirement.value.name} - API Interface` : 'API Interface'
})
</script>

<template>
    <div
        v-if="requirement"
        class="space-y-6"
    >
        <!-- Interface Details -->
        <RequirementView
            :requirement="requirement"
            :schema="displaySchema"
        />
    </div>
</template>
