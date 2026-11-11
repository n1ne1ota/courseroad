declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.glsl' {
    const src: string;
    export default src;
}

declare module '*.vert' {
    const src: string;
    export default src;
}

declare module '*.frag' {
    const src: string;
    export default src;
}
