import Tex from '../Tex'

/** Plain text with inline TeX between $…$ (the format of questions, options and steps in src/lib/train*.ts). */
export default function RichText({ text }: { text: string }) {
  const parts = text.split('$')
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <Tex key={i} tex={p} /> : p))}
    </>
  )
}
