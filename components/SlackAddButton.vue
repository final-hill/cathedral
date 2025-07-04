<script setup lang="ts">
interface Props {
    organizationSlug: string;
    variant?: 'default' | 'small';
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default'
});

const slackOAuthUrl = `/api/slack/oauth/authorize?organizationSlug=${props.organizationSlug}`;
</script>

<template>
    <a :href="slackOAuthUrl" class="inline-block">
        <img alt="Add to Slack" src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            :class="[
                'transition-opacity hover:opacity-80',
                variant === 'small' ? 'h-8 w-auto' : 'h-10 w-auto'
            ]" />
    </a>
</template>
