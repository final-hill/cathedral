<script lang="tsx" setup>
import type { z } from 'zod';
import { ReqType } from '~/shared/domain';
import { ParsedRequirements } from '~/shared/domain/requirements/ParsedRequirements';
import { snakeCaseToTitleCase } from '~/shared/utils';

useHead({ title: 'Parsed Requirements Details' });
definePageMeta({ name: 'Parsed Requirements Details', middleware: 'auth' });

const route = useRoute(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug, id } = route.params as { solutionslug: string; organizationslug: string, id: string },
    { data, refresh, status, error } = await useFetch<z.infer<typeof ParsedRequirements>>(`/api/requirements/${ReqType.PARSED_REQUIREMENTS}/${id}`, {
        query: { solutionSlug, organizationSlug }
    });

if (error.value || !data.value)
    throw createError({
        statusCode: 404,
        statusMessage: 'Parsed Requirements not found'
    });

const parsedReq = ParsedRequirements.parse({
    ...data.value,
    creationDate: new Date(data.value.creationDate),
    lastModified: new Date(data.value.lastModified)
})

const reqTypes = new Set(
    parsedReq.requirements.map((req) => req.reqType)
);
</script>

<template>
    <h1>{{ parsedReq.name }} details</h1>

    <template v-for="reqType of reqTypes">
        <h2>{{ snakeCaseToTitleCase(reqType) }}</h2>

        <XWorkflow :organization-slug="organizationSlug" :req-type="reqType" :solution-slug="solutionSlug"
            :parsed-req-parent-id="id" :disable-new-requirement="true" />
    </template>
</template>