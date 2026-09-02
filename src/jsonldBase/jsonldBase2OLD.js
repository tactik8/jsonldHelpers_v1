import dot from '../dotHelpers/dotHelpers.js'
import * as recordIDHelpers from '../recordIdHelpers/recordIdHelpers.js'

/**
 * Database for storing jsonld records
 * Post or set Overwrites current record, unless it is only a @id record
 */
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
        let records = flatten(value)

        for (let r of records) {
            let currentRecord = getRecord(this._store, record_id(r))

            this._store = postRecord(this._store, r)
            if (!isEqual(currentRecord, r)) {
                this.broadcast(record_id(r))
            }
        }
        return value
    }

    post(value) {
        return this.set(value)
    }

    delete(record_id) {
        this._store = deleteRecord(this._store, record_id)
    }

    getValue(record_id, propertyID, position, defaultValue) {
        let record = this.get(record_id)
        return getValue(record, propertyID, position, defaultValue)
    }
    getValues(record_id, propertyID, defaultValue) {
        let record = this.get(record_id)
        return getValues(record, propertyID, defaultValue)
    }
    setValue(record_id, propertyID, value) {
        let record = this.get(record_id)
        if (!record) {
            record = { "@id": record_id }
        }
        record = clone(record)
        record = setValue(record, propertyID, value)
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
        return randomUUID()
    }

    static clean(value, baseUrl) {
        return clean(value, baseUrl)
    }


    static flatten(value) {
        return flatten(value)
    }

    static getValue(record, propertyID, position, defaultValue) {
        return getValue(record, propertyID, position, defaultValue)
    }
    static getValues(record, propertyID, defaultValue) {
        return getValues(record, propertyID, defaultValue)
    }

    static setValue(record, propertyID, value, position) {
        return setValue(record, propertyID, value, position)
    }

    static setValues(record, propertyID, values) {
        return setValues(record, propertyID, values)
    }

    static addValue(record, propertyID, value) {
        return addValue(record, propertyID, value)
    }

    static addValues(record, propertyID, values) {
        return addValues(record, propertyID, values)
    }

    static strip(value) {
        return strip(value)
    }

    static get dot() {
        return dot
    }

    static ref(record) {
        return ref(record)
    }

    static simplify(value) {
        return simplify(value)
    }

    static isJsonld(record) {
        return isJsonld(record)
    }

    static isValid(record) {
        return isValid(record)
    }

    static isArray(value) {
        return isArray(value)
    }
    static setAdditionalProperty(record, propertyID, value, unitText) {
        return setAdditionalProperty(record, propertyID, value, unitText)
    }
    static getAdditionalProperty(record, propertyID) {
        return getAdditionalProperty(record, propertyID)
    }

}


export const jsonldBase = {
    DB,
    record_type,
    record_id,
    eq,
    setAdditionalProperty,
    getAdditionalProperty,
    evaluate,
    expand,
    flatten,
    getValue,
    getValues,
    setValue,
    setValues,
    addValue,
    addValues,
    setTempID,
    clean,
    ref,
    simplify,
    strip,
    clone,
    randomUUID
    
}

export default jsonldBase

/**
 * Returns @id from record or return string
 * @param {*} record_or_id 
 */
function _utilGetId(record_or_id) {
    let value = record_id(record_or_id) || record_or_id
    value = isArray(value) ? value[0] : value
    return value
}

/**
 * returns true if object is valid jsonld
 * @param {*} record 
 */
export function isValid(record) {
    return isJsonld(record)
}

/**
 * Returns true if valid ojsonld object (returns false for arrays)
 * @param {*} record 
 */
export function isJsonld(record) {
    return record?.['@type'] || record?.['@id']
}


/**
 * 
 */
export function isEqual(a, b) {

    const sortedReplacer = (key, value) => {
        if (value instanceof Object && !(value instanceof Array)) {
            return Object.keys(value)
                .sort()
                .reduce((sorted, k) => {
                    sorted[k] = value[k];
                    return sorted;
                }, {});
        }
        return value;
    };


    try {
        a = JSON.stringify(a, sortedReplacer, 4)
    } catch { }
    try {
        b = JSON.stringify(b, sortedReplacer, 4)
    } catch { }

    return a == b

}

/**
 * Returns first @type
 * @param {*} record 
 * @returns 
 */
export function record_type(record) {

    return getValue(record, '@type')

}

/**
 * Returns @id
 * @param {*} record 
 * @returns 
 */
export function record_id(record) {
    return getValue(record, '@id')
}



export function isRef(value) {

    if (!value?.["@id"]) { return false }
    return !Object.keys(value).some(x => x != "@id")
}

export function ref(record_or_id) {
    if (!record_or_id) {
        return undefined
    }
    let record_id = _utilGetId(record_or_id)
    if (!record_id) {
        return undefined
    }
    return { "@id": record_id }
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


export function randomUUID() {
    // Use native Web Crypto / Node.js 16.7+ API if available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Cryptographically secure byte generator fallback
    const getRandomByte = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            return crypto.getRandomValues(new Uint8Array(1))[0];
        }
        return Math.floor(Math.random() * 256);
    };

    // Generate UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomHex = getRandomByte() % 16;
        const value = char === 'x' ? randomHex : (randomHex & 0x3) | 0x8;
        return value.toString(16);
    });


}


export function eq(value1, value2) {

    if (value1 === undefined && value2 === undefined) {
        return true
    }
    if (value1 !== undefined && value2 === undefined) {
        return false
    }
    if (value1 === undefined && value2 !== undefined) {
        return false
    }

    if (value1 === null && value2 === null) {
        return true
    }
    if (value1 !== null && value2 === null) {
        return false
    }
    if (value1 === null && value2 !== null) {
        return false
    }

    // Clean
    value1 = clean(value1)
    value2 = clean(value2)

    // Strip child records
    value1 = strip(value1)
    value2 = strip(value2)


    try {
        value1 = JSON.stringify(value1, Object.keys(value1).sort(), 0)
    } catch { }

    try {
        value2 = JSON.stringify(value2, Object.keys(value2).sort(), 0)
    } catch { }



    return value1 == value2

}


/**
 * Replace record_ids by standardized record_id. Sets permanent id if _:
 * @param {*} value 
 * @returns 
 */
export function clean(value, baseUrl) {

    if (Array.isArray(value) && value.length > 1) {
        return value.map(x => clean(x, baseUrl))
    }

    if (!value?.['@type'] || !value?.['@id']) {
        return value
    }

    try {
        clone(value)
    } catch (err) {

    }

    value = setTempID(value)

    let flatRecords = flatten(value)

    // Order keys
    flatRecords = flatRecords.map(x => JSON.parse(JSON.stringify(x, Object.keys(x).sort(), 4)))

    // 
    let replacements = []

    // Get combinations of replacer, replacees
    for (let f of flatRecords) {

        // Ensure id not array
        f['@id'] = Array.isArray(f?.['@id']) ? f?.['@id'][0] : f?.['@id']

        // Validate id, skip if ok
        if (recordIDHelpers.validate(f) == true) {
            continue
        }


        // Get standard id
        let newID = recordIDHelpers.getStandardID(f, baseUrl)

        if (newID && f?.['@id'] != newID) {
            let r = {
                "replacer": newID,
                "replacee": f?.['@id']
            }
            replacements.push(r)
        }

        if (!newID && f?.['@id'].startsWith('_:')) {
            let r = {
                "replacer": recordIDHelpers.getGenericRecordID(baseUrl),
                "replacee": f?.['@id']
            }
            replacements.push(r)
        }

    }

    // Execute replacement
    value = replaceIds(value, replacements)

    //
    return value
}

// -----------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------

export function clone(value) {

    try {
        value = structuredClone(value)
        return value

    } catch (err) {

    }

    return value
}

/**
 * Returns true if array
 * @param {*} value 
 * @returns 
 */
export function isArray(value) {
    return Array.isArray(value) && typeof value != "string"
}

/**
 * Converts to array if not one already
 * @param {*} value 
 * @returns 
 */
function toArray(value) {

    let result = Array.isArray(value) ? value : [value]

    result = result.filter(x => x !== undefined)

    return result

}


// -----------------------------------------------------------------------
// Value methods
// -----------------------------------------------------------------------

export function getValue(record, propertyID, position, defaultValue) {
    position = Number(position)
    if (isNaN(position)) { position = 0 }
    let values = dot.get(record, propertyID)
    values = toArray(values)
    let value = values?.[position]

    if (value === undefined && defaultValue !== undefined) {
        return defaultValue
    }
    return value

}

export function setValue(record, propertyID, value, position) {
    position = Number(position)
    if (isNaN(position)) { position = 0 }

    let values = getValues(record, propertyID)
    value = toArray(value)?.[0]
    values[position] = value
    dot.set(record, propertyID, values)
    return record
}

export function addValue(record, propertyID, value) {

    value = toArray(value)

    let currentValues = getValues(record, propertyID)

    let newValues = currentValues.concat(value)

    record = dot.set(record, propertyID, newValues)

    return record
}

export function addValues(record, propertyID, values) {

    return addValue(record, propertyID, values)
}


export function getValues(record, propertyID, defaultValue) {
    let values = dot.get(record, propertyID)
    values = toArray(values)
    values = values.filter(x => x !== undefined)
    if (values.length == 0 && defaultValue !== undefined) {
        return defaultValue
    }
    return values
}

export function setValues(record, propertyID, value) {
    value = toArray(value)
    dot.set(record, propertyID, value)
    return record
}




// -----------------------------------------------------------------------
// Additional property
// -----------------------------------------------------------------------


export function getAdditionalProperty(record, propertyID) {

    let pvs = getValues(record, 'additionalProperty')
    let pv = pvs.find(x => getValue(x, "propertyID") == propertyID)
    let value = getValue(pv, 'value')
    return value
}

export function setAdditionalProperty(record, propertyID, value, unitText) {

    let pvs = getValues(record, 'additionalProperty')
    pvs = pvs.filter(x => getValue(x, "propertyID") != propertyID)


    let pv = {
        "@type": "PropertyValue",
        "@id": randomUUID(),
        "propertyID": propertyID,
        "value": value
    }
    record = addValue(record, 'additionalProperty', pv)
    return record

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
function postRecord(store, value) {

    if (!value) {
        return
    }

    value = clone(value)

    // Assign Id. if missing or wrong
    value = assignId(value)

    // flatten
    value = flatten(value)

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Add to store
    for (let v of value) {

        // Compare with existing value
        let storeValue = storeRecord.store.get(v?.['@id'])

        // Skip if value already exists and new value doesn't have properties
        // Prevents overwriting current record with simple link
        if (storeValue && isRef(v)) {
            continue
        }

        // Store value
        storeRecord.store.set(v?.['@id'], v)
    }

    // Convert back to array if required
    store = _storeToOriginal(storeRecord)

    return store

}

/**
 * Retrieves a copy of the record from db
 * @param {*} store 
 * @param {*} record_or_id 
 * @param {*} expandFlag 
 * @returns 
 */
function getRecord(store, record_or_id, expandFlag = true) {

    let record_id = _utilGetId(record_or_id)

    // convert store to map
    let storeRecord = _storeToMap(store)

    // Retrieve record
    let record = storeRecord.store.get(record_id)

    // Expand record
    if (expandFlag == true) {
        record = expand(storeRecord, record)
    }

    // Copy record 
    record = clone(record)


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


    // Clone record
    records = clone(records)

    return records

}




function deleteRecord(store, record_or_id) {

    let record_id = _utilGetId(record_or_id)

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

    let recordIDs = records.map(x => record_id(x))

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

    let conditions = []
    for (let k of Object.keys(condition)) {

        let propertyID = k
        let values = condition?.[k]
        values = Array.isArray(values) ? values : [values]

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

        for (let v of values) {
            let c = _extractCondition(record, propertyID, v)
            conditions.push(c)
        }



    }
    // test conditions
    let result = conditions.every(x => testCondition(x.r, x.p, x.o, x.v))

    return result
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
            o: Object.keys(value)?.[0],
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
            if (k == "previousItem" || k == "nextItem") {
                continue
            }
            record[k] = _expand(storeRecord, record[k], cache)
        }


        return record

    }

    let cache = new Map()
    return _expand(store, record, cache)
}

/**
 * Reeplaces all children objects by @id
 * @param {*} record 
 * @returns 
 */
export function strip(record) {

    function _strip(record, maxLevel, currentLevel) {

        if (Array.isArray(record)) {
            return record.map(x => _strip(x, maxLevel, currentLevel))
        }

        if (record?.['@type'] || record?.['@id']) {

            if (currentLevel > maxLevel) {
                return { "@id": record?.['@id'] }
            } else {
                let newRecord = {}
                for (let k of Object.keys(record).sort()) {
                    newRecord[k] = _strip(record?.[k], maxLevel, currentLevel + 1)
                }
                return newRecord
            }

        }
        return record
    }

    return _strip(record, 0, 0)

}


export function flatten(record) {


    function _flatten(record) {

        let records = []

        if (Array.isArray(record)) {
            records = record.map(x => _flatten(x))
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
            if (k == "previousItem") {
                continue
            }
            if (k == "nextItem") {
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
                records.push(_flatten(v))
            }
        }
        records = [record].concat(records)
        records = records.flat()

        // Remove values with only @id
        // records = records.filter(x => Object.keys(x).some(k => k !== '@id'))

        return records
    }


    record = clone(record)

    return _flatten(record)

}



/**
 * Fill in missing @id
 * @param {*} value 
 * @returns 
 */
export function setTempID(value) {

    if (Array.isArray(value)) {
        return value.map(x => assignId(x))
    }

    if (!value?.['@id'] && !value?.['@type']) {
        return value
    }

    for (let k of Object.keys(value)) {
        value['@id'] = value?.["@id"] || "_:" + randomUUID();
        value[k] = assignId(value[k])
    }
    return value
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
        value['@id'] = value?.["@id"] || "_:" + randomUUID();
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
export function replaceIds(value, idsMap) {


    function _replaceIds(value, idsMap) {

        if (Array.isArray(value)) {
            return value.map(x => replaceIds(x, idsMap))
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

        // iterate keys
        for (let k of Object.keys(value)) {
            value[k] = replaceIds(value?.[k], idsMap)
        }




        return value

    }
    // Convert to map if not already
    if (!(idsMap instanceof Map)) {
        let newIdsMap = new Map()
        idsMap = Array.isArray(idsMap) ? idsMap : idsMap
        idsMap.map(x => newIdsMap.set(x.replacee, x.replacer))
        idsMap = newIdsMap
    }

    return _replaceIds(value, idsMap)

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
function _storeToOriginal(storeRecord) {

    // 
    if (storeRecord.storeIsMapFlag == true) {
        return storeRecord.store
    }

    let store = Array.from(store.values())
    return store

}






export function simplify(value) {

    if (Array.isArray(value)) {

        if (value.length == 1) {
            return simplify(value[0])
        }
        if (value.length == 0) {
            return undefined
        }

        return value.map(x => simplify(x))
    }

    if (value?.['@type'] || value?.['@id']) {
        for (let k of Object.keys(value)) {

            value[k] = simplify(value?.[k])

            if (value?.[k] === undefined) {
                delete value[k]
            }
        }
        return value

    }

    return value
}