import { isInterger } from "@rvue/shared";
import { EffectOptions, IEffect, IFn, IOperation } from "./type";

export const effect = (fn: IFn, options: EffectOptions = { lazy: false }) => {
  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect();
  }
  return effect;
};

const effectStack: IEffect[] = []; // 保存当前effect执行栈
export let activeEffect: IEffect; // 当前正在被执行的effect
let id = 0;

// effect(() => {
//   console.log(data.name)
//   effect(() => {
//     console.log(data.age)
//   })
//   console.log(data.address)
// })

function createReactiveEffect(fn: IFn, options: EffectOptions): IFn {
  const effect = function effect() {
    try {
      effectStack.push(effect); // 执行之前入栈，保证顺序正确
      activeEffect = effect;
      return fn(); // 此时进行取值，会走到get方法
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effect.id = id++;
  effect.__isEffect = true;
  effect.options = options;
  effect.deps = [] as Array<unknown>; // 用来收集当前effect依赖了哪些属性
  return effect;
}

const dependMap = new WeakMap<Record<any, any>, Map<any, Set<IEffect>>>();
// {
//   [target]: {
//     [key]: Set
//   }
// }

// 建立target中的key和effect的关联关系
export function track(target: Record<any, any>, type: IOperation, key: any) {
  if (!activeEffect) return; // 过滤 console.log(data.name)这种操作，不是在effect里面触发的情况
  let targetMap = dependMap.get(target);
  if (!targetMap) {
    dependMap.set(target, (targetMap = new Map()));
  }
  let set = targetMap.get(key);
  if (!set) {
    targetMap.set(key, (set = new Set()));
  }
  set.add(activeEffect);
}

export function trigger(
  target: Record<any, any>,
  type: IOperation,
  key: any,
  newValue?: any,
  oldValue?: any
) {
  const targetMap = dependMap.get(target);
  if (!targetMap) return;
  const dep = targetMap.get(key);
  // 收集要执行的全部effect
  const set = new Set<IEffect>();
  const run = () => {
    for (const effectFn of set) {
      // 计算属性有自己的更新逻辑
      if (effectFn.options && effectFn.options.scheduler) {
        effectFn.options.scheduler(effectFn);
      } else {
        effectFn();
      }
    }
  };

  const add = (inputs: Set<IEffect> | undefined) => {
    if (!inputs) return;
    for (const item of inputs) {
      set.add(item);
    }
  };
  // 当前修改的是数组索引时，单独处理，主动触发更新
  if (key === "length" && Array.isArray(target)) {
    for (const [key, val] of targetMap) {
      // 如果当前索引小于数组长度，那么需要重新执行这个effect，因为发生改变了
      if (key < newValue || key === "length") {
        add(val);
      }
    }
  } else {
    add(dep);
    if (type === "add") {
      // 如果是数组新增元素，也要触发数组length的依赖收集，因为在trigger的时候，过滤掉了，所以需要加上
      if (Array.isArray(target) && isInterger(key)) {
        add(targetMap.get("length"));
      }
    }
  }

  run();
}
