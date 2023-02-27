import { Alias, ReaderFunctions, WriterFunctions } from "./types";
export declare class BaseBuffer {
    private _atomTypes;
    private _stringAtom;
    protected isProtectedType(type: string): boolean;
    protected addPredefinedAliases(): void;
    addUserAliases(aliases: Alias[]): void;
    addAlias(type: string, ...alias: string[]): void;
    protected _atomFunctions: Map<string, WriterFunctions | ReaderFunctions>;
}
//# sourceMappingURL=base-buffer.d.ts.map