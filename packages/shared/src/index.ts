export const isObject = (val: any): val is Record<any, any> =>
  typeof val === "object" && val !== null;

export const hasChanged = (val1: any, val2: any) => val1 !== val2;

export const isInterger = (val: any): boolean => parseInt(val) + "" === val;

export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export const isNumber = (val: unknown): val is Number =>
  typeof val === "number";
