/**
 * Debounce function. This function will only call the function passed to it
 * after the delay has passed without any other calls to the function.
 */
export default function debounce(func: Function, delay: number) {
    let timeoutId: number;
    return function (...args: any[]) {
        if (timeoutId)
            clearTimeout(timeoutId);
        timeoutId = self.setTimeout(() => {
            func(...args);
        }, delay);
    };
}