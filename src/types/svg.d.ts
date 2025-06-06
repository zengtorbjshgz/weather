declare module '*.svg?component' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.svg?url' {
  const src: string
  export default src
}

declare module '*.svg?raw' {
  const src: string
  export default src
}