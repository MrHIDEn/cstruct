import { Model, Types } from "./types";

export type Constructor<T = unknown> = new (...args: any[]) => T;
export type Dictionary<T = any> = { [k: string]: T };
export type CStructCOptions = {
    types?: Types,
    model?: Model
}
export type CStructPOptions = {
    type: string,
}