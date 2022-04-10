import { isFunction } from "@rvue/shared";
import { effect, track, trigger } from ".";
import { IEffect } from "./type";

export type ComputedGetter<T> = (...args: any[]) => T;
export type ComputedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

class ComputedRefImpl<T> {
  private effect: IEffect;
  private _value: any;
  private _dirty = true; // 脏值检测
  constructor(private getter, private setter) {
    this.effect = effect(this.getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          // 触发更新
          trigger(this, "set", "value");
        }
      },
    });
  }
  get value() {
    if (this._dirty) {
      // 所依赖的值发生了改变才进行重新计算
      this._value = this.effect();
      this._dirty = false;
    }
    track(this, "get", "value"); // 依赖收集
    return this._value;
  }
  set value(newValue: any) {
    this.setter(newValue);
  }
}

export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>, setter: ComputedSetter<T>;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      throw new Error("未设置setter函数,不能设置计算属性");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl<T>(getter, setter);
}
