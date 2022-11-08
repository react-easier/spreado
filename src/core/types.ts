export type SpreadoIndexValueMap = Record<string | number | symbol, unknown>;

export type TryMatch<A, B, C = A> = A extends B ? B : C;

export type TryPartial<T> = Partial<T> extends T ? T : Partial<T>;
