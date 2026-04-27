import { v4 as uuidv4 } from 'uuid';

import dot from './dotHelpers.js'


/**
 * Database for storing jsonld records
 * Post or set Overwrites current record, unless it is only a @id record
 */
export class DB {
    constructor() {
        this._store = new Map()
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
        return JSON.stringify(this.records, null, 4)
    }

    get(record_id) {
        return getRecord(this._store, record_id, true)
    }

    set(value) {
        return postRecord(this._store, value)
    }

    post(value) {
        return postRecord(this._store, value)
    }

    delete(record_id) {
        return deleteRecord(this._store, value)
    }

    length() {
        return length(this._store)
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

    //
    static flatten(value) {
        return flatten(value)
    }

    static getValue(record, propertyID) {
        return getValue(record, propertyID)
    }
    static getValues(record, propertyID) {
        return getValues(record, propertyID)
    }

    static get dot() {
        return dot
    }

}


export default {
    DB,
    clean,
    evaluate,
    expand,
    flatten,
    getValue,
    getValues,
    setValue,
    setValues
}



function testClass() {

    let record = {
        "@type": "Thing",
        "@id": "Thing1",
        "name": "bob1",
        "other": {
            "@type": "Thing",
            "@id": "Thing2",
            "name": "bob2",
            "other": {
                "@type": "Thing",
                "@id": "Thing3",
                "name": "bob3",
            }
        },
        "other2": [
            {
                "@type": "Thing",
                "@id": "Thing21",
                "name": "bob21",
                "other": {
                    "@type": "Thing31",
                    "@id": "Thing31",
                    "name": "bob31",
                }
            },
            {
                "@type": "Thing",
                "@id": "Thing21",
                "name": "bob22",
                "other": {
                    "@type": "Thing32",
                    "@id": "Thing32",
                    "name": "bob32",
                }
            }
        ]
    }

    let db = new JsonldDB()
    db.post(record)

    console.log('size', db.length())
    console.log('r', db.records)
    return db.records

}

export function testRecord(name, no = 0, depth = 1) {


    name = String(name || "test")


    let records = []

    for (let i = 0; i <= no; i++) {
        let item_name = name + "_" + String(i)
        let record = {
            "@type": "Thing",
            "@id": "https://testrecord.com/" + item_name,
            "name": item_name
        }

        if (depth > 0) {
            record.other1 = testRecord(item_name, no, depth - 1)
        }

        records.push(record)
    }

    return no == 0 ? records[0] : records


}





// -----------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------

function toArray(value) {

    return (Array.isArray(value) && typeof value != "string") ? value : [value]

}


export function getValue(record, propertyID) {
    let values = dot.get(record, propertyID)
    values = toArray(values)
    return values?.[0]
}

export function setValue(record, propertyID, value) {

    value = toArray(value)?.[0]
    dot.set(record, propertyID, value)
    return record
}

export function getValues(record, propertyID) {
    let values = dot.get(record, propertyID)
    values = toArray(values)
    return values
}

export function setValues(record, propertyID, value) {
    value = toArray(value)
    dot.set(record, propertyID, value)
    return record
}


// -----------------------------------------------------------------------
// Clean
// -----------------------------------------------------------------------

export function clean(value) {

    return value
}

// -----------------------------------------------------------------------
// Array
// -----------------------------------------------------------------------


function postRecord(store, value) {

    // Assign Id
    value = assignId(value)

    // flatten
    value = flatten(value)


    // convert store to map
    let storeRecord = _storeToMap(store)

    // Add to store
    for (let v of value) {

        // Compare with existing value
        let storeValue = storeRecord.store.get(v?.['@id'])

        // Skip if value already exista and new value doesn't have properties
        // Prevents overwriting current record with simple link
        let nbProperties = Object.keys(v).filter(x => !x.startsWith('@'))
        if (storeValue && nbProperties == 0) {
            continue
        }

        // Store value
        storeRecord.store.set(v?.['@id'], v)
    }

    // Convert back to array if required
    store = _storeToOriginal(storeRecord)

    return store

}


function getRecord(store, record_id, expandFlag = true) {

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Retrieve record
    let record = storeRecord.store.get(record_id)

    // Expand record
    if (expandFlag == true) {
        record = expand(storeRecord, record)
    }

    // Return
    return record;
}


function getRecords(store, filters, expandFlag = true) {

    // convert store to map
    let storeRecord = _storeToMap(store)

    let records = Array.from(storeRecord.store.values());

    if (filters) {
        records = records.filter(x => evaluate(x, filters))

    }

    if (expandFlag == true) {
        records = expand(storeRecord, records)
    }


    return records

}






function deleteRecord(store, record_id) {

    storeRecord = _storeToMap(store)

    record_id = Array.isArray(record_id && typeof record_id != "string") ? record_id : [record_id]

    record_id.map(x => storeRecord.store.delete(x))

    return true

}


function length(store) {
    let storeRecord = _storeToMap(store)
    return storeRecord.store.size
}


function getRecordIDs(store) {


    let records = getRecords(store)

    let recordIDs = records.map(x => x?.['@id'])

    return recordIDs

}

// -----------------------------------------------------------------------
// Array
// -----------------------------------------------------------------------

function testCond() {

    let record = {
        "@type": "Thing",
        "@id": "Thing1",
        "name": "bob1",
        "other": {
            "@type": "Thing",
            "@id": "Thing2",
            "name": "bob2",
            "other": {
                "@type": "Thing",
                "@id": "Thing3",
                "name": "bob3",
            }
        },
        "other2": [
            {
                "@type": "Thing",
                "@id": "Thing21",
                "name": "bob21",
                "other": {
                    "@type": "Thing31",
                    "@id": "Thing31",
                    "name": "bob31",
                }
            },
            {
                "@type": "Thing",
                "@id": "Thing21",
                "name": "bob22",
                "other": {
                    "@type": "Thing32",
                    "@id": "Thing32",
                    "name": "bob32",
                }
            }
        ]
    }

    let filter = {
        "$and": [
            {
                "other.name": "bob2"
            },
            {
                "other.name": "bob1"
            }
        ]
    }

    let result = evaluate(record, filter)

    return result
}

//
export function evaluate(record, condition) {

    for (let k of Object.keys(condition)) {

        let propertyID = k
        let values = condition?.[k]
        values = (Array.isArray(values) && typeof values != "string") ? values : [values]

        // handle and & or
        if (propertyID == "$and") {
            values = Array.isArray(values) ? values : [values]
            return values.every(x => evaluate(record, x))
        }
        if (propertyID == "$or") {
            values = Array.isArray(values) ? values : [values]
            return values.some(x => evaluate(record, x))
        }

        // Extract conditions
        let conditions = []
        for (let v of values) {
            let c = _extractCondition(record, propertyID, v)
        }

        // test conditions
        let result = conditions.every(x => testCondition(x.r, x.p, x.o, x.v))

        return result

    }
}


function testCondition(record, propertyID, operator, value) {


    try {
        let recordValue = dot.get(record, propertyID)

        if (operator == "$equal") {
            return recordValue == value
        }
        if (operator == "$lt") {
            return recordValue < value
        }
        if (operator == "$gt") {
            return recordValue > value
        }
        if (operator == "$le") {
            return recordValue <= value
        }
        if (operator == "$ge") {
            return recordValue >= value
        }
        if (operator == "$same") {
            return recordValue?.['@id'] && recordValue?.['@id'] >= value?.['@id']
        }
        if (operator == "$includes") {
            return recordValue.includes(value)
        }

    } catch (error) {
        return false
    }

}


function _extractCondition(record, propertyID, value) {

    let c = {
        r: record,
        p: propertyID,
        o: null,
        v: null
    }

    if (typeof value == "string") {
        if (value.startsWith('$')) {
            c = {
                r: record,
                p: propertyID,
                o: value.split(' ')[0],
                v: value.split(' ').slice(1).join(' ')
            }
        } else {
            c = {
                r: record,
                p: propertyID,
                o: "$equal",
                v: value
            }
        }
    }

    if (typeof value == "object") {
        c = {
            r: record,
            p: propertyID,
            o: Object.keys(v)?.[0],
            v: value?.[Object.keys(v)?.[0]]
        }
    }

    return c
}




// -----------------------------------------------------------------------
// json
// -----------------------------------------------------------------------



export function expand(store, record) {


    function _expand(store, record, cache) {

        let storeRecord = _storeToMap(store)

        if (Array.isArray(record)) {
            return record.map(x => _expand(storeRecord, x, cache))
        }

        if (!record?.['@id']) {
            return record
        }

        let newRecord = cache.get(record?.['@id'])
        if (newRecord) {
            return { "@id": newRecord?.["@id"] }
        }


        newRecord = getRecord(storeRecord, record?.['@id'], false)
        record = newRecord || record

        cache.set(newRecord?.['@id'], newRecord)

        for (let k of Object.keys(record)) {
            record[k] = _expand(storeRecord, record[k], cache)
        }


        return record

    }

    let cache = new Map()
    return _expand(store, record, cache)
}




export function flatten(record) {

    let records = []

    if (Array.isArray(record)) {
        records = record.map(x => flatten(x))
        records = records.flat()
        return records
    }

    if (!record?.['@id'] && !record?.['@type']) {
        return []
    }

    for (let k of Object.keys(record)) {
        if (k == "@id") {
            continue
        }

        let values = record[k]
        values = Array.isArray(values) ? values : [values]

        record[k] = []
        for (let v of values) {
            if (v?.["@id"]) {
                record[k].push({ "@id": v?.['@id'] })
            } else {
                record[k].push(v)
            }
            records.push(flatten(v))
        }
    }
    records = [record].concat(records)
    records = records.flat()

    // Remove values with only @id
    records = records.filter(x => Object.keys(x).pop('@id').length > 0)

    return records

}


/**
 * Fill in missing @id
 * @param {*} value 
 * @returns 
 */
function assignId(value) {

    if (Array.isArray(value)) {
        return value.map(x => assignId(x))
    }

    if (!value?.['@id'] && !value?.['@type']) {
        return value
    }

    for (let k of Object.keys(value)) {
        value['@id'] = value?.["@id"] || "_:" + uuidv4()
        value[k] = assignId(value[k])
    }
    return value
}

/**
 * Replace @id from one value to another
 * idsMap {"replacee": "xxx", "replacer": "xxx"}
 * @param {*} value 
 * @param {*} idsMap 
 * @returns 
 */
function replaceIds(value, idsMap) {

    // Convert to map if not already
    if (!(idsMap instanceof Map)) {
        let newIdsMap = new Map()
        idsMap = Array.isArray(idsMap) ? idsMap : idsMap
        idsMap.map(x => newIdsMap.set(x.replacee, x.replacer))
        idsMap = newIdsMap
    }


    if (Array.isArray(value)) {
        return value.map(x => changeIds(x, ids))
    }

    if (!value?.['@id']) {
        return value
    }

    // Check if a replacer value exist for the current @id
    let replacee = value?.['@id']
    let replacer = idsMap.get(replacee)

    if (replacer) {
        value['@id'] = replacer
    }

    return value

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
function _storeToMap(store) {

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

        // Convert to map
        store = store || []
        store = Array.isArray(store) ? store : store
        let newStore = new Map()
        store.map(x => newStore.set(x?.['@id'], x))
    }

    let storeRecord = {
        store: newStore,
        storeIsMapFlag: false
    }

    return stoneRecord

}


/**
 * Converts store to original format
 * @param {*} storeRecord 
 */
function _storeToOriginal(storeRecord) {

    // 
    if (storeRecord.storeIsMapFlag == true) {
        return storeRecord.store
    }

    let store = Array.from(store.values())
    return store

}




