import { hasChanged } from "@rvue/shared";
import { effect } from ".";
import { IFn, WatchOptions } from "./type";

function doWatch(source: IFn, cb: IFn, options?: WatchOptions) {
  let oldValue;

  const scheduler = () => {
    if (cb) {
      const newValue = watchEffect();
      if (hasChanged(oldValue, newValue)) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }
  };

  const watchEffect = effect(() => source(), { lazy: true, scheduler });
  if (options && options.immediate) {
    scheduler();
  }
  oldValue = watchEffect();
}

export function watch(source: IFn, cb: IFn, options?: WatchOptions) {
  return doWatch(source, cb, options);
}
