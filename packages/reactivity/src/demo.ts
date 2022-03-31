import { hasChanged, isInterger, isObject } from "@rvue/shared";
import { effect, reactive, track, trigger } from ".";

function createGetter() {
  return function get(
    target: Record<any, any>,
    key: any,
    receiver: ProxyConstructor
  ) {
    const ret = Reflect.get(target, key, receiver);
    track(target, "get", key); // 依赖收集
    return isObject(ret) ? reactive(ret) : ret;
  };
}

function createSetter() {
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
    // 触发之前的收集到的effect函数
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(oldValue, value)) {
      trigger(target, "set", key, value, oldValue);
    }
    return ret;
  };
}

const get = createGetter();
const set = createSetter();

export const mutableHandler = {
  get,
  set,
};

// effect(() => {
//   console.log(computedVal)
// })
