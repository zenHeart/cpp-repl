declare interface EmscriptenModule {
  ccall: (
    ident: string,
    returnType: string,
    argTypes: string[],
    args: any[]
  ) => any;
  cwrap: (
    ident: string,
    returnType: string,
    argTypes: string[]
  ) => (...args: any[]) => any;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
}

declare interface Window {
  Module: EmscriptenModule;
} 