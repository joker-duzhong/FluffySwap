import UQRCode from 'uqrcodejs'

export type QrMatrix = boolean[][]

export const createQrMatrix = (value: string): QrMatrix => {
  const qr = new UQRCode()
  qr.data = value || 'aurakey'
  qr.margin = 0
  qr.make()
  return qr.modules.map((row: any[]) => row.map((cell: any) => Boolean(cell?.isBlack ?? cell)))
}
