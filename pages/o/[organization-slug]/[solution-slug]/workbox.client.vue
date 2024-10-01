<script lang="ts" setup>
import type { ParsedRequirement } from '~/server/domain/requirements';

useHead({ title: 'Workbox' });
definePageMeta({ name: 'Workbox' });

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Workbox').params as { solutionslug: string, organizationslug: string },
    { data: solutions, error: solutionError } = await useFetch('/api/solutions', {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = solutions.value![0];

const { data: parsedRequirements, error: parsedRequirementsError } = await useFetch<ParsedRequirement[]>('/api/parse-requirements', {
    method: 'get',
    query: { solutionId: solution.id }
});

// counts the number of requirements in the meta requirement
const countRequirements = (parsedRequirement: ParsedRequirement) =>
    Object.values(parsedRequirement)
        .filter(Array.isArray)
        .reduce((acc, val) => acc + val.length, 0);

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value);

if (parsedRequirementsError.value)
    $eventBus.$emit('page-error', parsedRequirementsError.value);

const onApprove = async (parentId: string, itemId: string) => {
    alert('Approve: Not implemented yet')
}

const onReject = async (parentId: string, itemId: string) => {
    alert('Reject: Not implemented yet')
}
</script>

<template>
    <div>
        <p>The Workbox is the list of parsed requirements awaiting review</p>
        <InlineMessage v-if="!parsedRequirements?.length" severity="info">
            The Workbox is empty.
        </InlineMessage>
        <Accordion v-if="parsedRequirements">
            <AccordionTab v-for="parsedRequirement in parsedRequirements" :key="parsedRequirement.id">
                <template #header>
                    <span class="flex align-items-center gap-2 w-full">
                        <InlineMessage severity="secondary">{{ parsedRequirement.lastModified }}</InlineMessage>
                        by
                        <span class="font-bold white-space-nowrap">{{ parsedRequirement.modifiedBy.name }}</span>
                        <Badge :value="countRequirements(parsedRequirement)" class="ml-auto mr-2" />
                        <!-- <Button icon="pi pi-refresh" rounded raised /> -->
                    </span>
                </template>
                <h2>Statement</h2>
                <p class="font-italic">{{ parsedRequirement.statement }}</p>

                <WorkboxDataView :parsedRequirement="parsedRequirement" :on-reject="onReject" :on-approve="onApprove" />
            </AccordionTab>
        </Accordion>
    </div>
</template>

<style lang="css" scoped>
:deep(.p-accordion-content) {
    padding: 1rem;
}
</style>