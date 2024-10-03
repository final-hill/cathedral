<script lang="ts" setup>
useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Solution').params,
    router = useRouter(),
    { data: solutions, error: solutionError } = await useFetch('/api/solutions', {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = solutions.value![0],
    confirm = useConfirm()

const rawRequirement = ref(''),
    rawRequirementSizeLimit = 1000,
    parsedRequirementCount = ref<number | null>(null)

if (solutionError.value)
    $eventBus.$emit('page-error', solutionError.value)

const links = [
    { name: 'Project' as const, icon: 'pi-box', label: 'Project' },
    { name: 'Environment' as const, icon: 'pi-cloud', label: 'Environment' },
    { name: 'Goals' as const, icon: 'pi-bullseye', label: 'Goals' },
    { name: 'System' as const, icon: 'pi-sitemap', label: 'System' }
]

const handleSolutionDelete = async () => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/solutions/${solution.id}`, {
                method: 'delete'
            }).catch((e) => $eventBus.$emit('page-error', e))
            router.push({ name: 'Organization', params: { organizationslug } })
        },
        reject: () => { }
    })
}

const handleSolutionEdit = () => {
    router.push({ name: 'Edit Solution', params: { solutionslug, organizationslug } })
}

const parsingRequirements = ref(false),
    parsingError = ref('')
const parseRawRequirement = async () => {
    parsingRequirements.value = true
    parsingError.value = ''
    const response = await $fetch('/api/parse-requirements', {
        method: 'post',
        body: {
            solutionId: solution.id,
            statement: rawRequirement.value
        }
    }).catch((e) => {
        $eventBus.$emit('page-error', e)
        parsingError.value = e.message
    }).finally(() => parsingRequirements.value = false)

    parsedRequirementCount.value = response ?? null

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
            <NuxtLink :to="{ name: 'Workbox', params: { solutionslug, organizationslug } }" class="col-fixed w-2 mr-4">
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
                    :to="{ name: link.name, params: { solutionslug, organizationslug } }" class="col-fixed w-2 mr-4">
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
            <InlineMessage severity="success" class="mt-4" v-if="parsedRequirementCount">
                {{ parsedRequirementCount }} requirements added to the workbox.
            </InlineMessage>
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