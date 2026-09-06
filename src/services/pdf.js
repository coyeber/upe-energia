import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export async function extractPdfText(file, onProgress=()=>{}){
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages=[]
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i)
    const content=await page.getTextContent()
    pages.push(content.items.map(x=>x.str).join(' '))
    onProgress(Math.round((i/pdf.numPages)*100))
  }
  return pages.join('\n')
}
