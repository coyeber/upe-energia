import test from 'node:test'
import assert from 'node:assert/strict'
import { createHandler } from '../api/bills.js'

async function run(method,body,auth='Bearer token',rows=[]){
 const calls=[]
 const handler=createHandler({verifyToken:async()=>({uid:'owner'}),getSql:()=>async(strings,...params)=>{calls.push({query:strings.join('?'),params});return rows}})
 const res={code:0,setHeader(){},status(code){this.code=code;return this},json(data){this.data=data;return this}}
 await handler({method,body,headers:{authorization:auth}},res)
 return {res,calls}
}
test('requires Firebase token before querying',async()=>{
 const {res,calls}=await run('GET',null,'')
 assert.equal(res.code,401);assert.equal(calls.length,0)
})
test('list filters by authenticated UID',async()=>{
 const {res,calls}=await run('GET')
 assert.equal(res.code,200);assert.match(calls[0].query,/WHERE firebase_user_id=/);assert.deepEqual(calls[0].params,['owner'])
})
test('insert ignores client-supplied owner',async()=>{
 const {res,calls}=await run('POST',{firebase_user_id:'other',dados:{}},'Bearer token',[{id:'new'}])
 assert.equal(res.code,201);assert.equal(calls[0].params[0],'owner')
})
test('delete requires ownership and returns not found for other records',async()=>{
 const id='12345678-1234-1234-1234-123456789abc'
 const {res,calls}=await run('DELETE',{id,firebase_user_id:'other'})
 assert.equal(res.code,404);assert.match(calls[0].query,/AND firebase_user_id=/);assert.deepEqual(calls[0].params,[id,'owner'])
})
