import {
  StateEvent,
  StateEventRegistry,
  StateOption,
  Toastable,
  UseState,
  selectState,
  setState,
} from '..';
import { toast } from 'react-toastify';

export const useAsyncDispatch = (
  subEvents: Record<any, any>,
  registry: UseState<StateEventRegistry>
) => {
  const dispatchStateEvent = (eventName: StateEvent, status: StateOption) => {
    setState(registry)(stateEvents => ({ ...stateEvents, [eventName]: status }));
  };

  const stateCheck = (event: keyof typeof StateEvent, option: StateOption): boolean => {
    return selectState(registry)[event] === (subEvents[event] as any)[option];
  };

  async function newAsyncDispatch<Output>(
    eventName: StateEvent,
    eventHooks: {
      onStartEvent: StateOption;
      onFinishEvent: Toastable<StateOption>;
      onErrorEvent: Toastable<StateOption>;
      onResetEvent: StateOption;
    },
    method: () => Promise<Output>
  ): Promise<Output> {
    dispatchStateEvent(eventName, eventHooks.onResetEvent);
    dispatchStateEvent(eventName, eventHooks.onStartEvent);
    try {
      const data = await method();
      const event = eventHooks.onFinishEvent;
      dispatchStateEvent(eventName, event.value);
      if (event.toast) {
        toast(event.toast, {
          type: 'success',
        });
      }
      return data;
    } catch (error: any) {
      const event = eventHooks.onErrorEvent;
      dispatchStateEvent(eventName, event.value);
      if (event.toast) {
        toast(`${event.toast} - Error: ${error.message}`, {
          type: 'error',
        });
      }
      throw new Error(`${eventName} : ${error.message}`);
    }
  }

  return { dispatchStateEvent, newAsyncDispatch, stateCheck };
};
