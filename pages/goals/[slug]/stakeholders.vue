<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { GoalsRepository } from '~/data/GoalsRepository'
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder'

const route = useRoute(),
    repo = new GoalsRepository(),
    goals = await repo.getBySlug(route.path.split('/')[2])!,
    { stakeholders } = goals,
    items = ref(stakeholders.stakeholders)

const createStakeholder = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form),
        stakeholder = new Stakeholder({
            id: self.crypto.randomUUID(),
            name: formData.get('name') as string,
            description: formData.get('description') as string ?? '',
            category: formData.get('category') as StakeholderCategory,
            segmentation: formData.get('segmentation') as StakeholderSegmentation,
        });
    items.value.push(stakeholder);
    repo.update(goals);
    items.value.sort((a, b) => a.name.localeCompare(b.name));
    form.reset();
}

const deleteStakeholder = (id: Guid) => {
    const index = items.value.findIndex(b => b.id === id);
    items.value.splice(index, 1);
    repo.delete(id)
}
</script>

<template>
    <h2>Stakeholders</h2>

    <p>
        Stakeholders are the categories of people who are affected by the
        problem you are trying to solve. Do not list individuals, but rather
        groups or roles. Example: instead of "Jane Doe", use "Project Manager".
    </p>

    <form id="new-stakeholder" @submit="createStakeholder" autocomplete="off"></form>
    <table>
        <caption>
            <span class="required">*</span> Required
        </caption>
        <thead>
            <tr>
                <th>
                    Name <span class="required">*</span>
                </th>
                <th>Description</th>
                <th>Segmentation</th>
                <th>Category</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr class="new-stakeholder-row">
                <td>
                    <input type="text" name="name" required form="new-stakeholder" />
                </td>
                <td>
                    <input type="text" name="description" form="new-stakeholder" />
                </td>
                <td>
                    <select name="segmentation" form="new-stakeholder">
                        <option v-for="segmentation in StakeholderSegmentation" :key="segmentation" :value="segmentation">
                            {{ segmentation }}
                        </option>
                    </select>
                </td>
                <td>
                    <select name="category" form="new-stakeholder">
                        <option v-for="category in StakeholderCategory" :key="category" :value="category">
                            {{ category }}
                        </option>
                    </select>
                </td>
                <td>
                    <button form="new-stakeholder" class="add-stakeholder">Add</button>
                </td>
            </tr>
            <tr v-for="stakeholder in items" :key="stakeholder.id">
                <td>{{ stakeholder.name }}</td>
                <td>{{ stakeholder.description }}</td>
                <td>{{ stakeholder.segmentation }}</td>
                <td>{{ stakeholder.category }}</td>
                <td>
                    <button class="delete-button" @click="deleteStakeholder(stakeholder.id)">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.add-stakeholder {
    background-color: var(--btn-okay-color);
}

tr td:last-child {
    padding: 0;
}

.new-stakeholder-row {
    & td {
        padding: 0;
    }

    & input,
    select {
        background-color: white;
        box-sizing: border-box;
        color: black;
        width: 100%;
    }
}
</style>