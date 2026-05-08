declare module 'uqrcodejs' {
  export default class UQRCode {
    data: string
    margin: number
    modules: any[][]
    make(): void
  }
}
