<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GlossaryTermRepository from '../../data/GlossaryTermRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetGlossaryTermsUseCase from '../../application/GetGlossaryTermsUseCase';
import CreateGlossaryTermUseCase from '../../application/CreateGlossaryTermUseCase';
import UpdateGlossaryTermUseCase from '../../application/UpdateGlossaryTermUseCase';
import DeleteGlossaryTermUseCase from '../../application/DeleteGlossaryTermUseCase';
import type GlossaryTerm from '../../domain/GlossaryTerm';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';

useHead({
    title: 'Glossary'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    glossaryTermRepository = new GlossaryTermRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getGlossaryTermsUseCase = new GetGlossaryTermsUseCase(glossaryTermRepository),
    createGlossaryTermUseCase = new CreateGlossaryTermUseCase(environmentRepository, glossaryTermRepository),
    updateGlossaryTermUseCase = new UpdateGlossaryTermUseCase(glossaryTermRepository),
    deleteGlossaryTermUseCase = new DeleteGlossaryTermUseCase(environmentRepository, glossaryTermRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type GlossaryTermViewModel = Pick<GlossaryTerm, 'id' | 'name' | 'statement'>;

const glossaryTerms = ref<GlossaryTermViewModel[]>([]),
    emptyGlossaryTerm = { id: emptyUuid, name: '', statement: '' }

onMounted(async () => {
    glossaryTerms.value = await getGlossaryTermsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: GlossaryTermViewModel) => {
    const newId = await createGlossaryTermUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement
    })

    glossaryTerms.value = await getGlossaryTermsUseCase.execute(environment!.id) ?? []
}

const onUpdate = async (data: GlossaryTermViewModel) => {
    await updateGlossaryTermUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    glossaryTerms.value = await getGlossaryTermsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteGlossaryTermUseCase.execute(id)

    glossaryTerms.value = await getGlossaryTermsUseCase.execute(environment!.id) ?? []
}
</script>

<template>
    <p>
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <XDataTable :datasource="glossaryTerms" :empty-record="emptyGlossaryTerm" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Term" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by term" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" autofocus />
            </template>
        </Column>
        <Column field="statement" header="Definition">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by definition" />
            </template>
            <template #body="{ data }">
                {{ data.statement }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
    </XDataTable>
</template>