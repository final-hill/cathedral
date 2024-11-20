import { describe, it, expect, vi, beforeEach, afterEach, } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('should call the function after the specified delay', () => {
        // Arrange
        const func = vi.fn();
        const debouncedFunc = debounce(func, 200);

        // Act
        debouncedFunc();

        // Assert
        expect(func).not.toHaveBeenCalled();
        vi.advanceTimersByTime(200);
        expect(func).toHaveBeenCalled();
    });

    it('should not call the function if called again within the delay', () => {
        // Arrange
        const func = vi.fn();
        const debouncedFunc = debounce(func, 200);

        // Act
        debouncedFunc();
        debouncedFunc();

        // Assert
        expect(func).not.toHaveBeenCalled();
        vi.advanceTimersByTime(200);
        expect(func).toHaveBeenCalledTimes(1);
    });

    it('should call the function with the correct arguments', () => {
        // Arrange
        const func = vi.fn();
        const debouncedFunc = debounce(func, 200);

        // Act
        debouncedFunc('arg1', 'arg2');

        // Assert
        vi.advanceTimersByTime(200);
        expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should reset the delay if called again within the delay period', () => {
        // Arrange
        const func = vi.fn();
        const debouncedFunc = debounce(func, 200);

        // Act
        debouncedFunc();
        vi.advanceTimersByTime(100);
        debouncedFunc();
        vi.advanceTimersByTime(100);

        // Assert
        expect(func).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(func).toHaveBeenCalled();
    });
});