
import { v4 as uuidv4 } from 'uuid';

import * as idhelper from './recordIdHelpers.js'

import * as h from './jsonldBase.js'

export class Thing {
    constructor(value) {
        this._isThingClass = true
        this._record = value || {}
        this.record_type = "Thing"
        this.record_id = idhelper.get(this.record, this.baseUrl)
    }



    toString() {
        return `${this._record_type}/${this._record_id}`
    }

    toJSON() {
        return this.record
    }

    get(propertyID) {
        return h.getValues(this._record, propertyID)
    }

    set(propertyID, value) {
        this._record = h.setValues(this._record, propertyID, value)
    }

    get baseUrl() {
        return process.env.baseUrl
    }

    set baseUrl(value) {
        process.env.baseUrl = value
    }

    get record() {
        return classToRecord(this._record)
    }

    set record(value) {
        this._record = value
    }

    get record_type() {
        return h.getValue(this._record, "@type")
    }
    set record_type(value) {
        this._record = h.setValue(this._record, "@type", value)
    }

    get record_id() {
        return h.getValue(this._record, "@id")
    }
    set record_id(value) {
        this._record = h.setValue(this._record, "@id", value)
    }

    get name() {
        return h.getValue(this._record, "name")
    }
    set name(value) {
        this._record = h.setValue(this._record, "name", value)
    }

    get url() {
        return h.getValue(this._record, "url")
    }
    set url(value) {
        this._record = h.setValue(this._record, "url", value)
        this.record_id = idhelper.get(this._record, this.baseUrl)
    }

    get description() {
        return h.getValue(this._record, "description")
    }
    set description(value) {
        this._record = h.setValue(this._record, "description", value)
    }

    get sameAs() {
        return h.getValue(this._record, "sameAs")
    }
    set sameAs(value) {
        this._record = h.setValue(this._record, "sameAs", value)
    }

    // Static

    static get baseUrl() {
        return process.env.baseUrl
    }

    static set baseUrl(value) {
        process.env.baseUrl = value
    }

    static getValue(record, propertyID) {
        return h.getValue(record, propertyID)
    }
    static setValue(record, propertyID, value) {
        return h.setValue(record, propertyID, value)
    }
    static getValues(record, propertyID) {
        return h.getValues(record, propertyID)
    }
    static setValues(record, propertyID, value) {
        return h.setValues(record, propertyID, value)
    }

    static flatten(value) {
        return h.flatten(value)
    }

}


export class WebPage extends Thing {
    constructor(url) {
        super()
        this.record_type = "WebPage"
        this.url = url
    }
}

export class WebSite extends Thing {
    constructor(url) {
        super()
        this.record_type = "WebSite"
        this.url = url
    }
}

export class WebAPI extends Thing {
    constructor(url) {
        super()
        this.record_type = "WebAPI"
        this.url = url
    }
}

export class Action extends Thing {
    constructor(name, object) {
        super()
        this.name = name
        this.object = object
        this.record_type = "Action"
        this.setActive()
    }

    toString() {
        return `${this.name} - ${(this.actionStatus || "").replace('ActionStatus', '')}`
    }

    setPotential() {
        this._record = setPotential(this._record)
    }

    setActive() {
        this._record = setActive(this._record)
    }

    setCompleted(result) {
        this._record = setCompleted(this._record, result)
    }

    setFailed(error) {
        this._record = setFailed(this._record, error)
    }

    get isPotential() {
        return this.actionStatus == "PotentialActionStatus"
    }
    get isActive() {
        return this.actionStatus == "ActiveActionStatus"
    }
    get isCompleted() {
        return this.actionStatus == "CompletedActionStatus"
    }
    get isFailed() {
        return this.actionStatus == "FailedActionStatus"
    }


    get object() {
        return h.getValue(this._record, "object")
    }
    set object(value) {
        this._record = h.setValue(this._record, "object", value)
    }

    get instrument() {
        return h.getValue(this._record, "instrument")
    }
    set instrument(value) {
        this._record = h.setValue(this._record, "instrument", value)
    }

    get agent() {
        return h.getValue(this._record, "agent")
    }
    set agent(value) {
        this._record = h.setValue(this._record, "agent", value)
    }

    get result() {
        return h.getValue(this._record, "result")
    }
    set result(value) {
        this._record = h.setValue(this._record, "result", value)
    }

    get actionStatus() {
        return h.getValue(this._record, "actionStatus")
    }
    set actionStatus(value) {
        this._record = h.setValue(this._record, "actionStatus", value)
    }

    get startTime() {
        return h.getValue(this._record, "startTime")
    }
    set startTime(value) {
        this._record = h.setValue(this._record, "startTime", value)
    }

    get endTime() {
        return h.getValue(this._record, "endTime")
    }
    set endTime(value) {
        this._record = h.setValue(this._record, "endTime", value)
    }

    get error() {
        return h.getValue(this._record, "error")
    }
    set error(value) {
        this._record = h.setValue(this._record, "error", value)
    }


    // Static
    static setPotential(record) {
        return setPotential(record)
    }

    static setActive(record) {
        return setActive(record)
    }

    static setCompleted(record, result) {
        return setCompleted(record, result)
    }

    static setFailed(record, error) {
        return setFailed(record, error)
    }

    static isPotential(record) {
        return h.getValue(record?.record || record, actionStatus) == "PotentialActionStatus"
    }
    static isActive(record) {
        return h.getValue(record?.record || record, actionStatus) == "ActiveActionStatus"
    }
    static isCompleted(record) {
        return h.getValue(record?.record || record, actionStatus) == "CompletedActionStatus"
    }
    static isFailed(record) {
        return h.getValue(record?.record || record, actionStatus) == "FailedActionStatus"
    }

}

function setPotential(record) {
    record = record?.record || record
    h.setValue(record, 'actionStatus', 'PotentialActionStatus')
    h.setValue(record, 'timeStart', undefined)
    h.setValue(record, 'timeEnd', undefined)
    h.setValue(record, 'result', undefined)
    h.setValue(record, 'error', undefined)
    return record
}

function setActive(record) {
    record = record?.record || record
    h.setValue(record, 'actionStatus', 'ActiveActionStatus')
    h.setValue(record, 'timeStart', new Date())
    h.setValue(record, 'timeEnd', undefined)
    return record
}

function setCompleted(record, result) {
    record = record?.record || record
    h.setValue(record, 'actionStatus', 'CompletedActionStatus')
    h.setValue(record, 'timeStart', h.getValue(record, 'timeStart') || new Date())
    h.setValue(record, 'timeEnd', new Date())
    h.setValue(record, 'result', result)
    return record
}

function setFailed(record, error) {
    record = record?.record || record
    h.setValue(record, 'actionStatus', 'FailedActionStatus')
    h.setValue(record, 'timeStart', h.getValue(record, 'timeStart') || new Date())
    h.setValue(record, 'timeEnd', new Date())
    h.setValue(record, 'error', error)
    return record
}




export default  {
    Thing,
    Action,
    WebAPI,
    WebSite,
    WebPage

}



/**
 * Convert a class Thing type object to record
 * @param {} value 
 * @returns 
 */
function classToRecord(value) {

    if (Array.isArray(value)) {
        return value.map(x => classToRecord(x))
    }

    if (value?.['_isThingClass'] == true) {
        value = value._record
    }

    if (value?.['@type'] || value?.['@id']) {
        for (let k of Object.keys(value)) {
            value[k] = classToRecord(value[k])
        }
    }

    return value

}