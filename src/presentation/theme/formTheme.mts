import type { Theme } from '~/types/Theme.mjs';

const formTheme: Theme = {
    'input, select, textarea': {
        backgroundColor: 'var(--palette5)',
        border: '1px inset var(--shadow-color)',
        borderRadius: 'var(--border-radius)',
        boxSizing: 'border-box',
        color: 'var(--palette8)',
        fontSize: 'inherit',
        padding: '0.5em',
        width: '100%'
    },
    'input:read-only, textarea:read-only': {
        backgroundColor: 'var(--content-bg)',
        color: 'var(--font-color)',
    }
};

export default formTheme;