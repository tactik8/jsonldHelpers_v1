
import * as thing from './things.js'

import * as things from './things.js'


export class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl
        this._headers
    }

    get headers(){
        return this._headers
    }

    set headers(value){
        this._headers= value
    }

    async get(path, params) {
        return await apiGet(this.headers, this.baseUrl, path, params)
    }

    async post(path, data) {
        return await apiGet(this.headers, this.baseUrl, path, data)
    }

    async delete(path, params) {
        return await apiDelete(this.headers, this.baseUrl, path, params)
    }

    async test(path){
        return await apiTest(this.headers, this.baseUrl, path)
    }


}


export default {
    ApiClient
}


async function apiGet(headers, baseUrl, path, params) {

    let action = new thing.Action()
    action.name = "API Get"
    action.instrument = new thing.WebAPI(baseUrl)

    try {

        let url = appendPath(baseUrl, path, params)

         let baseHeaders = {
            "Content-Type": "application/json"
        }

        let options = {
            "headers": { ...(headers || {}), ...baseHeaders},
            "method": "GET"
        }

        let response = await fetch(url, options)

        if (response.status >= 300) {
            action.setFailed(response.statusText)
            return action
        }

        let result = await response.json()

        action.setCompleted(result)

        return action

    } catch (err) {
        action.setFailed(String(err))
        return action
    }
}





async function apiPost(headers, baseUrl, path, data) {

    let action = new thing.Action()
    action.name = "API Post"
    action.instrument = new thing.WebAPI(baseUrl)

    try {

        let url = appendPath(baseUrl, path, params)

        let baseHeaders = {
            "Content-Type": "application/json"
        }

        let options = {
            "headers": { ...(headers || {}), ...baseHeaders},
            "method": "POST",
            "body": JSON.stringify(data, null, 4)
        }

        let response = await fetch(url, options)

        if (response.status >= 300) {
            action.setFailed(response.statusText)
            return action
        }

        let result = await response.json()

        action.setCompleted(result)

        return action

    } catch (err) {
        action.setFailed(String(err))
        return action
    }
}



async function apiDelete(headers, baseUrl, path, params) {

    let action = new thing.Action()
    action.name = "API Get"
    action.instrument = new thing.WebAPI(baseUrl)

    try {

        let url = appendPath(baseUrl, path, params)

         let baseHeaders = {
            "Content-Type": "application/json"
        }

        let options = {
            "headers": { ...(headers || {}), ...baseHeaders},
            "method": "DELETE"
        }

        let response = await fetch(url, options)

        if (response.status >= 300) {
            action.setFailed(response.statusText)
            return action
        }

        let result = await response.json()

        action.setCompleted(result)

        return action

    } catch (err) {
        action.setFailed(String(err))
        return action
    }
}



async function test(headers, baseUrl, path){

    let record = {
        "@type": "Thing",
        "@id": "https://krknapi.co/testRecordV1",
        "name": "testRecordV1"
    }

    let action = new things.Action()

    let params = {"@id": record['@id']}

    let a

    // Step 1 Delete record to ensure fresh start
    a = apiDelete(headers, baseUrl, path, params)
    action.hasPart = action.hasPart.concat(a)
    if((await a).isFailed){
        action.setFailed('Error step1 delete record')
        return action
    }

    // Step 2 Create record
    a = apiPost(headers, baseUrl, path, record)
    action.hasPart = action.hasPart.concat(a)
    if((await a).isFailed){
        action.setFailed('Error step2 create record')
        return action
    }


    // Step 3 Get record
     a = apiGet(headers, baseUrl, path, params)
    action.hasPart = action.hasPart.concat(a)
    if((await a).isFailed){
        action.setFailed('Error step3 get record')
        return action
    }
    if(a.result?.['@id'] != record?.['@id']){
         action.setFailed('Error step3 got wrong record')
        return action
    }

    // Step 4 Delete record to ensure fresh start
     a = apiDelete(headers, baseUrl, path, params)
    action.hasPart = action.hasPart.concat(a)
    if((await a).isFailed){
        action.setFailed('Error step4 delete record')
        return action
    }

    // Step 5 get record
      a = apiGet(headers, baseUrl, path, params)
    action.hasPart = action.hasPart.concat(a)
    if((await a).isFailed){
        action.setFailed('Error step5 get record')
        return action
    }
    if(a.result?.name == record?.['name']){
         action.setFailed('Error step5 record still exist')
        return action
    }


    action.setCompleted()
    return action.record
}





function appendPath(baseUrl, path, params) {
    const url = new URL(baseUrl);
    url.pathname = (url.pathname + "/" + path).replace(/\/+/g, "/");

    if(params){
        url.search = new URLSearchParams(params).toString();
    }

    return url.href;
}