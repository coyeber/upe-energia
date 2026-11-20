import { createPublicKey, verify, constants } from 'node:crypto'

const PROJECT='poli-energia'
const CERTS='https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
const invalid=()=>Object.assign(new Error('Token Firebase inválido'),{code:'auth/invalid-id-token'})
const unavailable=()=>Object.assign(new Error('Chaves públicas Firebase indisponíveis'),{code:'AUTH_CERTS_UNAVAILABLE'})

function decode(segment){
 if(!/^[A-Za-z0-9_-]+$/.test(segment))throw invalid()
 const bytes=Buffer.from(segment,'base64url')
 if(bytes.toString('base64url')!==segment)throw invalid()
 return bytes
}
function object(segment){
 try{
  const value=JSON.parse(decode(segment).toString('utf8'))
  if(!value||typeof value!=='object'||Array.isArray(value))throw invalid()
  return value
 }catch{throw invalid()}
}

export function createFirebaseVerifier({fetcher=globalThis.fetch,now=()=>Date.now()}={}){
 let keys=new Map(),expires=0,pending
 async function getKeys(){
  if(expires>now()&&keys.size)return keys
  if(!pending)pending=(async()=>{
   try{
    const response=await fetcher(CERTS,{signal:AbortSignal.timeout(8000),redirect:'error'})
    if(!response.ok)throw unavailable()
    const body=await response.json()
    if(!body||typeof body!=='object'||Array.isArray(body))throw unavailable()
    const next=new Map()
    for(const [id,pem] of Object.entries(body)){
     if(typeof pem!=='string')throw unavailable()
     const key=createPublicKey(pem)
     if(key.asymmetricKeyType!=='rsa')throw unavailable()
     next.set(id,key)
    }
    if(!next.size)throw unavailable()
    const age=/\bmax-age=(\d+)/i.exec(response.headers.get('cache-control')||'')
    const ttl=age?Math.min(Number(age[1]),86400):0
    keys=next;expires=now()+ttl*1000
    return keys
   }catch{throw unavailable()}
  })().finally(()=>{pending=undefined})
  return pending
 }
 return async function verifyFirebaseToken(token){
  if(typeof token!=='string'||token.length>16384)throw invalid()
  const parts=token.split('.')
  if(parts.length!==3)throw invalid()
  const [h,p,s]=parts
  const header=object(h),claims=object(p),signature=decode(s)
  if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid||header.crit!==undefined||header.b64!==undefined)throw invalid()
  const time=Math.floor(now()/1000)
  if(claims.aud!==PROJECT||claims.iss!=='https://securetoken.google.com/'+PROJECT||
   typeof claims.sub!=='string'||!claims.sub||claims.sub.length>128||
   !Number.isInteger(claims.exp)||claims.exp<=time||
   !Number.isInteger(claims.iat)||claims.iat>time||
   !Number.isInteger(claims.auth_time)||claims.auth_time>time||
   (claims.nbf!==undefined&&(!Number.isInteger(claims.nbf)||claims.nbf>time)))throw invalid()
  const key=(await getKeys()).get(header.kid)
  if(!key)throw invalid()
  if(!verify('RSA-SHA256',Buffer.from(h+'.'+p),{key,padding:constants.RSA_PKCS1_PADDING},signature))throw invalid()
  return {...claims,uid:claims.sub}
 }
}
export const verifyFirebaseToken=createFirebaseVerifier()
