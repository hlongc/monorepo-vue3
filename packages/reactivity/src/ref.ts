import { hasChanged, isObject } from "@rvue/shared";
import { reactive, track, trigger } from ".";

export function ref(val: any) {
  return createRef(val);
}

export function shallowRef(val: any) {
  return createRef(val, true);
}

const convert = (val: any) => (isObject(val) ? reactive(val) : val);

class RefImpl {
  private _value;
  private __v_isRef = true;
  constructor(public rawValue: any, public shallow = false) {
    this._value = shallow ? rawValue : convert(rawValue);
  }
  get value() {
    track(this, "get", "value");
    return this._value;
  }
  set value(newValue) {
    if (hasChanged(newValue, this.rawValue)) {
      this._value = this.shallow ? newValue : convert(newValue);
      this.rawValue = newValue;
      trigger(this, "set", "value", newValue, this.rawValue);
    }
  }
}

function createRef(val: any, shallow = false) {
  return new RefImpl(val, shallow);
}

// 相当于使用get set重写
class ObjectRefImpl {
  private __v_isRef = true;
  constructor(private target: Record<any, any>, private key: any) {}
  get value() {
    return this.target[this.key];
  }
  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

export function toRef(target: Record<any, any>, key: any) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(target: Record<any, any> | Array<any>) {
  const ret = Array.isArray(target) ? new Array(target.length) : {};
  for (const key in target) {
    ret[key] = toRef(target, key);
  }
  return ret;
}
