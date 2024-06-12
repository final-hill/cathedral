<script lang="ts" setup>

import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import EffectRepository from '../../data/EffectRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetEffectsUseCase from '../../application/GetEffectsUseCase';
import CreateEffectUseCase from '../../application/CreateEffectUseCase';
import UpdateEffectUseCase from '../../application/UpdateEffectUseCase';
import DeleteEffectUseCase from '../../application/DeleteEffectUseCase';
import type Effect from '../../domain/Effect';

useHead({
    title: 'Effects'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    effectRepository = new EffectRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getEffectsUseCase = new GetEffectsUseCase(effectRepository),
    createEffectUseCase = new CreateEffectUseCase(environmentRepository, effectRepository),
    updateEffectUseCase = new UpdateEffectUseCase(effectRepository),
    deleteEffectUseCase = new DeleteEffectUseCase(environmentRepository, effectRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type EffectViewModel = Pick<Effect, 'id' | 'name' | 'statement'>;

const effects = ref<EffectViewModel[]>([]),
    emptyEffect = { id: emptyUuid, name: '', statement: '' }

onMounted(async () => {
    effects.value = await getEffectsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EffectViewModel) => {
    const newId = await createEffectUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement
    })

    effects.value = await getEffectsUseCase.execute(environment!.id) ?? []
}

const onUpdate = async (data: EffectViewModel) => {
    await updateEffectUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    effects.value = await getEffectsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    effects.value = effects.value.filter(o => o.id !== id)
    await deleteEffectUseCase.execute(id)
}
</script>

<template>
    <p>
        An Effect is an environment property affected by a System.
        Example: "The running system will cause the temperature of the room to increase."
    </p>
    <XDataTable :datasource="effects" :empty-record="emptyEffect" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
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