import { hasChanged, isInterger, isObject } from "@rvue/shared";
import { activeEffect, reactive, readonly, track, trigger } from ".";

function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
  return function get(
    target: Record<any, any>,
    key: any,
    receiver: ProxyConstructor
  ) {
    const ret = Reflect.get(target, key, receiver);
    if (isShallow) return ret;
    if (!isReadonly) {
      track(target, "get", key);
    }
    // 在取值完成以后再判断是否需要继续进行递归
    if (isObject(ret)) return isReadonly ? readonly(ret) : reactive(ret);
    return ret;
  };
}

function createSetter(isShallow: boolean = false) {
  return function set(
    target: Record<any, any>,
    key: any,
    value: any,
    receiver: ProxyConstructor
  ) {
    const oldValue = target[key];
    // 如果是对数组进行push操作，会触发两次set，第一次是新增元素，第二次是数组长度发生改变
    // 如果是数组，看一下是新增还是修改，新增时key代表新的索引，key < target.length代表修改，否则代表数组新增元素
    // 不是数组直接判断这个属性之前是否存在

    const hadKey =
      Array.isArray(target) && isInterger(key)
        ? Number(key) < target.length
        : Reflect.has(target, key);
    // 在这里进行更新，否则会影响上面的长度取值错误，在更新之前才能取到之前的长度
    const ret = Reflect.set(target, key, value, receiver);
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(oldValue, value)) {
      trigger(target, "set", key, value, oldValue);
    }
    return ret;
  };
}

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);
const readonlySet = function (target: Record<any, any>, key: any) {
  console.error(`该对象${JSON.stringify(target)}为只读，不可以设置${key}`);
  return false;
};

export const mutableHandler = {
  get,
  set,
};

export const shallowMutableHandler = {
  get: shallowGet,
  set: shallowSet,
};

export const readonlyHandler = {
  get: readonlyGet,
  set: readonlySet,
};

export const shallowReadonlyHandler = {
  get: shallowReadonlyGet,
  set: readonlySet,
};
