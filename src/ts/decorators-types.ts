import { Model, Types } from "./types";

export type Constructor<T = unknown> = new (...args: any[]) => T;
export type Dictionary<T = any> = { [k: string]: T };
export type Class<T = any> = new() => T;
export type CStructClassOptions = {
    types?: Types,
    model?: Model
}
export type CStructPropertyOptions = {
    type: string,
}