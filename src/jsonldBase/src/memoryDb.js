

import { dotHelpers as dot } from '../../dotHelpers/dotHelpers.js'
import { jsonldBase as h } from '../jsonldBase.js'


export class DB {
    constructor() {
        this._store = new Map()
        this._subscriptions = new Map()
    }

    *[Symbol.iterator]() {
        for (const item of this._store.values()) {
            yield item;
        }
    }

    toString() {
        return "JSONLD Array items: " + String(this.length())
    }

    toJSON() {
        return this.records
    }

    get(record_id, expand = true) {
        return getRecord(this._store, record_id, expand)
    }

    set(value) {
        let records = h.flatten(value)

        for (let r of records) {
            let currentRecord = getRecord(this._store, h.record_id(r))

            this._store = postRecord(this._store, r)
            if (!h.isEqual(currentRecord, r)) {
                this.broadcast(h.record_id(r))
            }
        }
        return value
    }

    post(value) {
        return this.set(value)
    }

    patch(value, skipDuplicates=true){
        let records = h.flatten(value)

        for (let r of records) {
            let currentRecord = getRecord(this._store, h.record_id(r))

            this._store = patchRecord(this._store, r, skipDuplicates)
            if (!h.isEqual(currentRecord, r)) {
                this.broadcast(h.record_id(r))
            }
        }
        return value
    }

    delete(record_id) {
        this._store = h.deleteRecord(this._store, record_id)
    }

    getValue(record_id, propertyID, position, defaultValue) {
        let record = this.get(record_id)
        return h.getValue(record, propertyID, position, defaultValue)
    }
    getValues(record_id, propertyID, defaultValue) {
        let record = this.get(record_id)
        return h.getValues(record, propertyID, defaultValue)
    }
    setValue(record_id, propertyID, value) {
        let record = this.get(record_id)
        if (!record) {
            record = { "@id": record_id }
        }
        record = h.clone(record)
        record = h.setValue(record, propertyID, value)
        return this.set(record)
    }


    length() {
        return this._store.size
    }

    get records() {
        return getRecords(this._store)
    }

    getRecords(expand = false) {
        return getRecords(this._store, undefined, false)
    }

    get record_ids() {
        return getRecordIDs(this._store)
    }

    // callbacks

    subscribe(record_id, callbackFn) {

        if (!record_id || record_id == "*" || record_id == "all") {
            record_id = "all"
        }
        let ss = this._subscriptions.get(record_id) || []
        if (!ss.includes(callbackFn)) {
            ss.push(callbackFn)
            this._subscriptions.set(record_id, ss)
        }
        return
    }

    unsubscribe(record_id, callbackFn) {

        if (!record_id || record_id == "*" || record_id == "all") {
            record_id = "all"
        }
        let ss = this._subscriptions.get(record_id) || []
        ss = ss.filter(x => x != callbackFn)
        this._subscriptions.set(record_id, ss)
        return
    }

    broadcast(record_id) {
        let record = this.get(record_id)
        let ss = this._subscriptions.get(record_id) || []
        ss = ss.concat(this._subscriptions.get('all') || [])
        ss = [... new Set(ss)]

        ss.forEach(x => x(record))

    }

    // Static

    static randomUUID() {
        return h.randomUUID()
    }

    static clean(value, baseUrl) {
        return h.clean(value, baseUrl)
    }


    static flatten(value) {
        return h.flatten(value)
    }

    static getValue(record, propertyID, position, defaultValue) {
        return h.getValue(record, propertyID, position, defaultValue)
    }
    static getValues(record, propertyID, defaultValue) {
        return h.getValues(record, propertyID, defaultValue)
    }

    static setValue(record, propertyID, value, position) {
        return h.setValue(record, propertyID, value, position)
    }

    static setValues(record, propertyID, values) {
        return h.setValues(record, propertyID, values)
    }

    static addValue(record, propertyID, value) {
        return h.addValue(record, propertyID, value)
    }

    static addValues(record, propertyID, values) {
        return h.addValues(record, propertyID, values)
    }

    static strip(value) {
        return h.strip(value)
    }

    static get dot() {
        return dot
    }

    static ref(record) {
        return h.ref(record)
    }

    static simplify(value) {
        return h.simplify(value)
    }

    static isJsonld(record) {
        return h.isJsonld(record)
    }

    static isValid(record) {
        return h.isValid(record)
    }

    static isArray(value) {
        return h.isArray(value)
    }
    static setAdditionalProperty(record, propertyID, value, unitText) {
        return h.setAdditionalProperty(record, propertyID, value, unitText)
    }
    static getAdditionalProperty(record, propertyID) {
        return h.getAdditionalProperty(record, propertyID)
    }

}






// -----------------------------------------------------------------------
// DB
// -----------------------------------------------------------------------

/**
 * Post a copy of the record to store
 * @param {*} store 
 * @param {*} value 
 * @returns 
 */
export function postRecord(store, value) {

    if (!value) {
        return
    }

    value = h.clone(value)

    // Assign Id. if missing or wrong
    value = h.assignId(value)

    // flatten
    value = h.flatten(value)

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Add to store
    for (let v of value) {

        // Compare with existing value
        let storeValue = storeRecord.store.get(v?.['@id'])

        // Skip if value already exists and new value doesn't have properties
        // Prevents overwriting current record with simple link
        if (storeValue && h.isRef(v)) {
            continue
        }

        // Store value
        storeRecord.store.set(v?.['@id'], v)
    }

    // Convert back to array if required
    store = h._storeToOriginal(storeRecord)

    return store

}


/**
 * 
 */
export function patchRecord(store, value, skipDuplicates = true) {

    value = h.clone(value)

    // Assign Id. if missing or wrong
    value = h.assignId(value)

    // flatten
    value = h.flatten(value)

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Add to store
    for (let v of value) {

        // Compare with existing value
        let storeValue = storeRecord.store.get(v?.['@id'])

        // Skip if value already exists and new value doesn't have properties
        // Prevents overwriting current record with simple link
        if (storeValue && h.isRef(v)) {
            continue
        }

        // combine values
        v = h.merge(v, storeValue, skipDuplicates)


        // Store value
        storeRecord.store.set(v?.['@id'], v)
    }

    // Convert back to array if required
    store = h._storeToOriginal(storeRecord)

    return store

}


/**
 * Retrieves a copy of the record from db
 * @param {*} store 
 * @param {*} record_or_id 
 * @param {*} expandFlag 
 * @returns 
 */
export function getRecord(store, record_or_id, expandFlag = true) {

    let record_id = h._utilGetId(record_or_id)

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Retrieve record
    let record = storeRecord.store.get(record_id)

    // Expand record
    if (expandFlag == true) {
        record = h.expand(storeRecord, record)
    }

    // Copy record 
    record = h.clone(record)


    // Return
    return record;
}

/**
 * Retrieves a copy of the records in db
 * @param {*} store 
 * @param {*} filters 
 * @param {*} expandFlag 
 * @returns 
 */
export function getRecords(store, filters, expandFlag = true) {

    // convert store to map
    let storeRecord = _storeToMap(store)

    let records = Array.from(storeRecord.store.values());

    if (filters) {
        records = records.filter(x => h.evaluate(x, filters))

    }

    if (expandFlag == true) {
        records = h.expand(storeRecord, records)
    }


    // Clone record
    records = h.clone(records)

    return records

}




function deleteRecord(store, record_or_id) {

    let record_id = h._utilGetId(record_or_id)

    let storeRecord = _storeToMap(store)

    record_id = Array.isArray(record_id) ? record_id : [record_id]

    record_id.map(x => storeRecord.store.delete(x))

    return store

}


function length(store) {
    let storeRecord = _storeToMap(store)
    return storeRecord.store.size
}

/**
 * Get all record_ids from db
 * @param {*} store 
 * @returns 
 */
function getRecordIDs(store) {

    let records = getRecords(store)

    let recordIDs = records.map(x => h.record_id(x))

    return recordIDs

}





// ------------------------------------------------------------
// Map helper functions
// ------------------------------------------------------------

/**
 * Converts a store into a map (if required)
 * @param {*} store 
 * @returns 
 * storeRecord: 
 *      - store: the actual map
 *      - storeIsMapFlag: flag that identifies original format
 */
export function _storeToMap(store) {

    // Return if already in storeRecord format
    if (store?.store) {
        return store
    }

    // Return storeRecord  if already a map

    if (store instanceof Map) {
        return {
            store: store,
            storeIsMapFlag: true
        }
    }

    // Convert to map
    store = store || []
    store = Array.isArray(store) ? store : [store]
    let newStore = new Map()
    store.forEach(x => newStore.set(x?.['@id'], x))
    store = newStore


    let storeRecord = {
        store: store,
        storeIsMapFlag: false
    }

    return storeRecord

}


/**
 * Converts store to original format
 * @param {*} storeRecord 
 */
export function _storeToOriginal(storeRecord) {

    // 
    if (storeRecord.storeIsMapFlag == true) {
        return storeRecord.store
    }

    let store = Array.from(store.values())
    return store

}


