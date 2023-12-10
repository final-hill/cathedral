import type { Theme } from '~/types/Theme.mjs';

const buttonTheme: Theme = {
    'button': {
        backgroundColor: 'var(--site-dark-bg)',
        borderRadius: 'var(--border-radius)',
        color: 'var(--font-color)',
        border: '1px solid var(--shadow-color)',
        padding: '0.5em 1em',
        fontSize: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        width: '2in'
    },
    'button:hover, button:active, button:focus': {
        filter: 'brightness(1.2)'
    },
    'button[type="submit"]': {
        backgroundColor: 'var(--btn-okay-color)',
        color: 'var(--btn-font-color)'
    }
};

export default buttonTheme;