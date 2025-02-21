<script lang="ts" setup>
import type { SolutionViewModel } from '#shared/models'

useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Solution').params,
    router = useRouter(),
    { data: solution, error: solutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    confirm = useConfirm()

const rawRequirement = ref(''),
    rawRequirementSizeLimit = 1000
// parsedRequirementCount = ref<number | null>(null)

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value)

const links = [
    { name: 'Project' as const, icon: 'pi-box', label: 'Project', reqId: 'P' },
    { name: 'Environment' as const, icon: 'pi-cloud', label: 'Environment', reqId: 'E' },
    { name: 'Goals' as const, icon: 'pi-bullseye', label: 'Goals', reqId: 'G' },
    { name: 'System' as const, icon: 'pi-sitemap', label: 'System', reqId: 'S' }
]

const handleSolutionDelete = async () => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.value?.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/solution/${slug}`, {
                method: 'delete',
                body: { organizationSlug }
            }).catch((e) => $eventBus.$emit('page-error', e))
            router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
        },
        reject: () => { }
    })
}

const handleSolutionEdit = () => {
    router.push({ name: 'Edit Solution', params: { solutionslug: slug, organizationslug: organizationSlug } })
}

const parsingRequirements = ref(false),
    parsingError = ref('')
const parseRawRequirement = async () => {
    parsingRequirements.value = true
    parsingError.value = ''
    const response = await $fetch('/api/parse-requirement', {
        method: 'post',
        body: {
            solutionId: solution.value?.id,
            organizationSlug,
            description: rawRequirement.value
        }
    }).catch((e) => {
        $eventBus.$emit('page-error', e)
        parsingError.value = e.message
    }).finally(() => parsingRequirements.value = false)

    //parsedRequirementCount.value = response ?? null

    if (response)
        resetRawRequirement()
}

const resetRawRequirement = () => {
    rawRequirement.value = ''
}
</script>

<template>
    <Toolbar class="mb-6">
        <template #start>
            <NuxtLink :to="{ name: 'Workbox', params: { solutionslug: slug, organizationslug: organizationSlug } }"
                class="col-fixed w-2 mr-4">
                <Button label="Workbox" :icon="`pi pi-briefcase text-3xl`" severity="help" />
            </NuxtLink>
        </template>
        <template #end>
            <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleSolutionEdit()" label="Edit Solution" />
            <Button icon="pi pi-trash" class="delete-button" @click="handleSolutionDelete()" severity="danger"
                label="Delete Solution" />
        </template>
    </Toolbar>
    <ConfirmDialog></ConfirmDialog>
    <TabView>
        <TabPanel header="Overview">
            <div class="grid">
                <NuxtLink v-for="link in links" :key="link.name"
                    :to="{ name: link.name, params: { solutionslug: slug, organizationslug: organizationSlug } }"
                    class="col-fixed w-2 mr-4" v-badge="link.reqId">
                    <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`"
                        iconPos="top" severity="secondary" />
                </NuxtLink>
            </div>
        </TabPanel>
        <TabPanel header="Create Requirements">
            <p>
                Enter the requirement statement below.
                The system will parse the statement and create one
                or more formal specifications.
            </p>
            <form autocomplete="off" @submit.prevent="parseRawRequirement" @reset="resetRawRequirement">
                <Textarea v-model.trim="rawRequirement" class="w-full" autoResize rows="5" required spellcheck="true"
                    :invalid="rawRequirement.length > rawRequirementSizeLimit" />
                <small class="block">Size Limit: {{ rawRequirement.length }}/{{ rawRequirementSizeLimit }}</small>
                <InlineMessage severity="error" class="mt-2" v-if="rawRequirement.length > rawRequirementSizeLimit">
                    The requirement statement exceeds the size limit of {{ rawRequirementSizeLimit }} characters.
                </InlineMessage>
                <Toolbar>
                    <template #start>
                        <Button label="Create" class="mr-2" severity="success" type="submit"
                            :disabled="rawRequirement.length > rawRequirementSizeLimit || rawRequirement.length === 0" />
                        <Button label="Reset" class="" severity="info" type="reset" />
                    </template>
                </Toolbar>
            </form>

            <InlineMessage severity="info" class="mt-4" v-if="parsingRequirements">
                Parsing requirement statement...
            </InlineMessage>
            <InlineMessage severity="error" class="mt-4" v-if="parsingError">
                {{ parsingError }}
            </InlineMessage>
            <!--
            <InlineMessage severity="success" class="mt-4" v-if="parsedRequirementCount">
                {{ parsedRequirementCount }} requirements added to the workbox.
            </InlineMessage>
            -->
        </TabPanel>
        <!--
        <TabPanel header="Workbox">
            <p>The Workbox is the list of parsed requirements awaiting review</p>
            <InlineMessage v-if="!parsedRequirements" severity="info">
                The Workbox is empty.
            </InlineMessage>
            <Accordion v-if="parsedRequirements">
                <AccordionTab v-for="parsedRequirement in parsedRequirements" :key="parsedRequirement.id"
                    :header="parsedRequirement.statement.substring(0, 100)">
                    <p>{{ parsedRequirement.statement }}</p>
                    <DataView :value="parsedRequirement.jsonResult" :data-key="undefined">
                        <template #list="slotProps">
                            <div v-for="(item, index) in slotProps.items" :key="index">
                                <pre>{{ JSON.stringify(item) }}</pre>
                            </div>
                        </template>
                    </DataView>
                </AccordionTab>
            </Accordion>
        </TabPanel>
    -->
    </TabView>
</template>
<style scoped>
:deep(.p-overlay-badge .p-badge) {
    top: 1.8rem;
    left: 0.2rem;
    right: auto;
}
</style>