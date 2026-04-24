
import * as thing from './things.js'

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

}


export default {
    ApiClient
}


async function apiGet(headers, baseUrl, path, params) {

    let action = new thing.Action()
    action.name = "API Get"
    action.instrument = new WebAPI(baseUrl)

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
    action.instrument = new WebAPI(baseUrl)

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

function appendPath(baseUrl, path, params) {
    const url = new URL(baseUrl);
    url.pathname = (url.pathname + "/" + path).replace(/\/+/g, "/");

    if(params){
        url.search = new URLSearchParams(params).toString();
    }

    return url.href;
}