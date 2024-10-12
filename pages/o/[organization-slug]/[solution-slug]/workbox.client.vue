<script lang="ts" setup>
import type { ParsedRequirement, Requirement, ParsedReqColType } from '~/server/domain/index.js';

useHead({ title: 'Workbox' });
definePageMeta({ name: 'Workbox' });

const { $eventBus } = useNuxtApp(),
    router = useRouter(),
    { solutionslug, organizationslug } = useRoute('Workbox').params,
    { data: solutions, error: solutionError } = await useFetch('/api/solutions', {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = solutions.value![0];

const { data: parsedRequirements, error: parsedRequirementsError, refresh } = await useFetch<ParsedRequirement[]>('/api/parse-requirements', {
    method: 'get',
    query: { solutionId: solution.id },
    transform: (data: ParsedRequirement[]) => data.map((parsedRequirement) => {
        parsedRequirement.lastModified = new Date(parsedRequirement.lastModified)
        return parsedRequirement;
    })
});

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value);

if (parsedRequirementsError.value)
    $eventBus.$emit('page-error', parsedRequirementsError.value);

const renderParsedRequirements = ref(true);

const onItemApprove = async (type: ParsedReqColType, itemId: string) => {
    await $fetch(`/api/${camelCaseToSlug(type)}/${itemId}`, {
        // @ts-ignore: method not recognized
        method: 'put',
        body: { solutionId: solution.id, isSilence: false }
    });
    renderParsedRequirements.value = false;
    await refresh();
    renderParsedRequirements.value = true;
}

const onItemDelete = async (type: ParsedReqColType, itemId: string) => {
    await $fetch(`/api/${camelCaseToSlug(type)}/${itemId}`, {
        // @ts-ignore: method not recognized
        method: 'delete',
        body: { solutionId: solution.id }
    });
    renderParsedRequirements.value = false;
    await refresh();
    renderParsedRequirements.value = true;
}

const onItemUpdate = async (type: ParsedReqColType, data: Requirement) => {
    alert(`UPDATE ${type} not implemented`)
}
</script>

<template>
    <div>
        <p>The Workbox is the list of parsed requirements awaiting review</p>
        <InlineMessage v-if="!parsedRequirements?.length" severity="info">
            The Workbox is empty.
        </InlineMessage>
        <Accordion v-if="renderParsedRequirements">
            <AccordionTab v-for="parsedRequirement in parsedRequirements" :key="parsedRequirement.id">
                <template #header>
                    <div class="grid w-11">
                        <InlineMessage class="col-fixed" severity="secondary">{{
                            parsedRequirement.lastModified.toLocaleString() }}
                        </InlineMessage>
                        <span class="col-fixed font-bold">by {{ parsedRequirement.modifiedBy.name }}</span>
                        <span class="col font-italic">{{ parsedRequirement.statement }}</span>
                    </div>
                </template>
                <WorkboxDataView :parsedRequirement="parsedRequirement" :on-item-delete="onItemDelete"
                    :on-item-approve="onItemApprove" :on-item-update="onItemUpdate" />
            </AccordionTab>
        </Accordion>
    </div>
</template>

<style lang="css" scoped>
:deep(.p-accordion-content) {
    padding: 1rem;
}
</style>