declare global {
  type DeepRequire<T> = T extends object ? { readonly [P in keyof T]: T[P] } : T;
}

export {};