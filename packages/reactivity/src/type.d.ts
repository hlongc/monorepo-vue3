export interface HandlerType {
  get: (target: Record<any, any>, key: any, receiver: Proxy) => any;
  set: (
    target: Record<any, any>,
    key: any,
    value: any,
    receiver: Proxy
  ) => boolean;
}

export interface EffectOptions {
  lazy?: boolean; // 计算属性懒执行
  scheduler?: (effect: IEffect) => void;
}

export type IFn = (...args: any[]) => any;

export interface IEffect {
  (): any;
  options?: EffectOptions;
  id?: number;
  __isEffect?: boolean;
  deps?: Array<unknown>;
}

// track trigger操作类型
export type IOperation = "add" | "set" | "get";

export interface WatchOptions {
  immediate?: boolean; // 默认：false
  deep?: boolean;
}
