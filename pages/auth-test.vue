<script lang="ts" setup>
import AppUserInteractor from '~/application/AppUserInteractor'
import AppUserRepository from '~/data/AppUserRepository'

const appUserInteractor = new AppUserInteractor(new AppUserRepository()),
    username = ref(''),
    displayName = ref(''),
    registration = ref({})

const createUser = async () => {
    const userId = await appUserInteractor.create({ name: username.value, displayName: displayName.value })
}
</script>

<template>
    <h2>WebAuthn Test</h2>

    <label for="username">Username:</label>
    <input id="username" type="text" v-model="username" />

    <label for="displayName">Display Name:</label>
    <input id="displayName" type="text" v-model="displayName" />

    <button @click="createUser">Register</button>
    <hr>
    <pre>
        {{ registration }}
    </pre>
</template>