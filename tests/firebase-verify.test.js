import test from 'node:test'
import assert from 'node:assert/strict'
import {generateKeyPairSync,sign} from 'node:crypto'
import {createFirebaseVerifier} from '../server/firebase-verify.js'
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048})
const time=1700000000
const base={aud:'poli-energia',iss:'https://securetoken.google.com/poli-energia',sub:'owner',exp:time+3600,iat:time-10,auth_time:time-20}
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url')
function jwt(claims={},header={}){
 const body=encode({alg:'RS256',kid:'test',...header})+'.'+encode({...base,...claims})
 return body+'.'+sign('RSA-SHA256',Buffer.from(body),privateKey).toString('base64url')
}
const verifier=()=>createFirebaseVerifier({now:()=>time*1000,fetcher:async()=>({ok:true,headers:new Headers({'cache-control':'max-age=3600'}),json:async()=>({test:publicKey.export({format:'pem',type:'spki'})})})})
test('accepts correctly signed token for the intended Firebase project',async()=>{
 assert.equal((await verifier()(jwt())).uid,'owner')
})
test('rejects invalid issuer, audience, expiry, algorithms, and unknown signing keys',async()=>{
 for(const token of [jwt({aud:'other'}),jwt({iss:'wrong'}),jwt({exp:time}),jwt({iat:time+1}),jwt({auth_time:time+1}),jwt({sub:''}),jwt({}, {alg:'none'}),jwt({}, {kid:'unknown'})])
  await assert.rejects(verifier()(token),{code:'auth/invalid-id-token'})
})
test('rejects tampered identity',async()=>{
 const [h,,s]=jwt().split('.')
 await assert.rejects(verifier()(h+'.'+encode({...base,sub:'attacker'})+'.'+s),{code:'auth/invalid-id-token'})
})
test('fails closed if Google public certificates cannot be obtained',async()=>{
 const verify=createFirebaseVerifier({now:()=>time*1000,fetcher:async()=>{throw Error('offline')}})
 await assert.rejects(verify(jwt()),{code:'AUTH_CERTS_UNAVAILABLE'})
})
