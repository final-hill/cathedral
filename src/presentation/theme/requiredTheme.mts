import type { Theme } from '~/types/Theme.mjs';

const requiredTheme: Theme = {
    '.required::after': {
        content: '*',
        color: 'var(--btn-danger-color)',
        paddingLeft: '0.25em'
    }
};

export default requiredTheme;