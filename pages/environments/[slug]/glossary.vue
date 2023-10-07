<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { EnvironmentStore } from '~/stores/EnvironmentStore'

const route = useRoute(),
    environmentId = route.path.split('/')[2],
    environmentStore = EnvironmentStore(),
    environment = environmentStore.getById(environmentId)!,
    glossary = environment.glossary
</script>

<template>
    <h2>Glossary</h2>

    <table>
        <thead>
            <tr>
                <th>Term</th>
                <th>Definition</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <input type="text" name="term" placeholder="" />
                </td>
                <td>
                    <input type="text" name="definition" />
                </td>
                <td>
                    <button>Add</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>