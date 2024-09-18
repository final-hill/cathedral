<script lang="ts" setup>
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

const { data: parsedRequirements, error: parsedRequirementsError } = await useFetch('/api/parse-requirements', {
    method: 'get',
    query: { solutionId: solution.id }
});

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value);

if (parsedRequirementsError.value)
    $eventBus.$emit('page-error', parsedRequirementsError.value);
</script>

<template>
    <div>
        <p>The Workbox is the list of parsed requirements awaiting review</p>
        <InlineMessage v-if="!parsedRequirements" severity="info">
            The Workbox is empty.
        </InlineMessage>
        <Accordion v-if="parsedRequirements">
            <AccordionTab v-for="parsedRequirement in parsedRequirements" :key="parsedRequirement.id"
                :header="parsedRequirement.submittedAt + ' ' + parsedRequirement.submittedBy">
                <p>{{ parsedRequirement.statement }}</p>
                <DataView :value="parsedRequirement.jsonResult?.requirements" :data-key="undefined">
                    <template #list="slotProps">
                        <div v-for="(item, index) in slotProps.items" :key="index">
                            <pre>{{ JSON.stringify(item) }}</pre>
                        </div>
                    </template>
                </DataView>
            </AccordionTab>
        </Accordion>
    </div>
</template>
