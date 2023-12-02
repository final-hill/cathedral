type Theme = Record<string, Partial<CSSStyleDeclaration>>

export const formTheme: Record<string, Partial<CSSStyleDeclaration>> = {
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
        filter: 'brightness(1.2)',
    },
    'button[type="submit"]': {
        backgroundColor: 'var(--btn-okay-color)',
        color: 'var(--btn-font-color)'
    },
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
    'input:read-only': {
        backgroundColor: 'transparent',
        color: 'var(--font-color)',
    },
    '.required::after': {
        content: ' *',
        color: 'var(--btn-danger-color)',
        display: 'inline-block'
    }
}

