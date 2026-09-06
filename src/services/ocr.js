import { createWorker } from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export async function ocrPdf(file, onProgress=()=>{}){
  const worker=await createWorker('por',1,{ logger:m=>{ if(m.status==='recognizing text' && m.progress) onProgress(Math.round(m.progress*100)) } })
  try{
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise
    const texts=[]
    for(let i=1;i<=Math.min(pdf.numPages,5);i++){
      const page=await pdf.getPage(i)
      const viewport=page.getViewport({scale:1.55})
      const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d')
      canvas.width=viewport.width; canvas.height=viewport.height
      await page.render({canvasContext:ctx,viewport}).promise
      const {data}=await worker.recognize(canvas)
      texts.push(data.text)
    }
    return texts.join('\n')
  } finally { await worker.terminate() }
}
