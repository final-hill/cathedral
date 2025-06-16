<script setup lang="ts">
import { z } from 'zod';
import { AppUser } from '~/shared/domain';

const toast = useToast(),
    { fetch } = useUserSession(),
    { register, authenticate } = useWebAuthn()

const signUpFormSchema = AppUser.pick({
    name: true,
    email: true
});

const signInFormSchema = AppUser.pick({
    email: true
});

type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
type SignInFormSchema = z.infer<typeof signInFormSchema>;

const signUpformState = reactive<SignUpFormSchema>({
    name: '',
    email: ''
});

const signInformState = reactive<SignInFormSchema>({
    email: ''
});

async function signUp() {
    await register({ userName: signUpformState.email, displayName: signUpformState.name })
        .then(fetch)
        .then(async () => {
            const redirect = useRoute().query.redirect as string ?? { name: 'Home' };
            await navigateTo(redirect);
        })
        .catch((error) => {
            toast.add({
                title: error.data?.message || error.message,
                description: error.data?.data?.issues[0]?.message || error.data?.data,
                icon: 'i-lucide-alert-triangle',
                color: 'error'
            })
        })
}

async function signIn() {
    await authenticate(signInformState.email)
        .then(fetch)
        .then(async () => {
            const redirect = useRoute().query.redirect as string ?? { name: 'Home' };
            await navigateTo(redirect);
        })
        .catch((error) => {
            toast.add({
                title: error.data?.message || error.message,
                description: error.data?.data,
                icon: 'i-lucide-alert-triangle',
                color: 'error'
            })
        })
}

const tabs = [
    { label: 'Sign In', slot: 'sign-in' },
    { label: 'Sign Up', slot: 'sign-up' }
];
</script>

<template>
    <UCard class="w-2xl m-auto">
        <template #header>
            <h2 class="text-lg font-semibold leading-6">
                Cathedral
            </h2>
        </template>
        <UTabs :items="tabs" class="h-80">
            <template #sign-in>
                <UForm class="flex flex-col gap-6 h-60 mt-4" @submit.prevent="signIn" :state="signInformState"
                    :schema="signInFormSchema">
                    <h3>Welcome Back</h3>
                    <UFormField label="Email" name="email" field="email" required>
                        <UInput v-model="signInformState.email" name="email" type="email" class="w-full"
                            autocomplete="username webauthn" />
                    </UFormField>
                    <UButton type="submit" color="success" label="Sign in" size="xl"
                        :disabled="signInformState.email === ''" />
                </UForm>
            </template>
            <template #sign-up>
                <UForm class="flex flex-col gap-6 h-60 mt-4" @submit.prevent="signUp" :state="signUpformState"
                    :schema="signUpFormSchema">
                    <h3>Register</h3>
                    <UFormField label="Email" name="email" field="email" required>
                        <UInput v-model="signUpformState.email" name="email" type="email" class="w-full" />
                    </UFormField>
                    <UFormField label="Full Name" name="name" field="name" required>
                        <UInput v-model="signUpformState.name" name="name" type="text" class="w-full" />
                    </UFormField>
                    <UButton type="submit" color="success" label="Sign up" size="xl"
                        :disabled="signUpformState.email === '' || signUpformState.name === ''" />
                </UForm>
            </template>
        </UTabs>
    </UCard>
</template>
