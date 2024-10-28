import { it, expect, describe } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TopNavigation from './TopNavigation.vue';

describe('TopNavigation', () => {
    it('should render the title', async () => {
        const component = await mountSuspended(TopNavigation);
        expect(component.html()).toContain('Home');
    });
});