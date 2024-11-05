/**
 * Debounce function. This function will only call the function passed to it
 * after the delay has passed without any other calls to the function.
 */
export default function (func: Function, delay: number) {
    let timeoutId: any
    return function (...args: any[]) {
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func(...args); }, delay);
    };
}