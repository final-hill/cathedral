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
    'button x-feather-icon': {
        // @ts-ignore: FIXME
        '--size': '1em'
    },
    'button:hover, button:active, button:focus': {
        filter: 'brightness(1.2)'
    },
    'button[type="submit"]': {
        color: 'var(--link-color)',
    },
    '.edit-button': {
        color: 'var(--btn-font-color)'
    },
    '.delete-button, .delete-button[type="submit"]': {
        color: 'var(--btn-danger-color)'
    },
    'button:has(x-feather-icon)': {
        width: 'fit-content'
    }
};

export default buttonTheme;