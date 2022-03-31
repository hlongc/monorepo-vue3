import { isObject } from "@rvue/shared";
import {
  mutableHandler,
  readonlyHandler,
  shallowMutableHandler,
  shallowReadonlyHandler,
} from "./baseHandlers";
import type { HandlerType } from "./type";

export function reactive(target: any): any {
  return createReactiveObject(target, false, mutableHandler);
}

export function shallowReactive(target: any): any {
  return createReactiveObject(target, false, shallowMutableHandler);
}

export function readonly(target: any): any {
  return createReactiveObject(target, true, readonlyHandler);
}

export function shallowReadonly(target: any): any {
  return createReactiveObject(target, true, shallowReadonlyHandler);
}

const reactiveMap = new WeakMap();
// 只读的单独缓存
const readonlyMap = new WeakMap();

/**
 *
 * @param target 需要被代理的对象
 * @param isReadonly 是否只读
 * @param handler 拦截器
 * @returns
 */
function createReactiveObject(
  target: Record<string, any>,
  isReadonly: boolean,
  handler: HandlerType
): any {
  // 不是对象不进行代理
  if (!isObject(target)) return target;
  // 之前代理过不进行重复代理
  const map = isReadonly ? readonlyMap : reactiveMap;
  if (map.has(target)) return map.get(target);

  const proxy = new Proxy(target, handler);
  if (isReadonly) {
    readonlyMap.set(target, proxy);
  } else {
    reactiveMap.set(target, proxy);
  }

  return proxy;
}
