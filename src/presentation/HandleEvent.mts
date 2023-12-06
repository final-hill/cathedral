import { type Constructor } from '~/types/Constructor.mjs';

export const HandleEvent = <C extends Constructor<any>>(BaseClass: C) => class HandleEventMixin extends BaseClass {
    /**
     * A callback that is invoked when an event is dispatched to the component.
     * @param event The event that was dispatched.
     * @returns void
     */
    handleEvent(event: Event): void {
        const eventName = event.type.charAt(0).toUpperCase() + event.type.slice(1),
            handler = this[`on${eventName}`];
        if (typeof handler === 'function')
            handler.call(this, event);
    }
};