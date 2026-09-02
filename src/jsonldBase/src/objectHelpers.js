


import { jsonldBase as h } from '../jsonldBase.js'


import * as recordIDHelpers from '../../recordIdHelpers/recordIdHelpers.js'



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

    // Clone
    try {
        value = clone(value)
    } catch (err) { }

    // Set id
    value = setTempID(value)

    // Flatten
    let flatRecords = h.flatten(value)

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
                "replacer": h.getGenericRecordID(baseUrl),
                "replacee": f?.['@id']
            }
            replacements.push(r)
        }

    }

    // Execute replacement
    value = h.replaceIds(value, replacements)



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
    } catch  {}

    try {
        value = JSON.parse(JSON.stringify(value))
        return value
    } catch {}

    return value
}


/**
 * Merges two jsonld values, skips duplicates by default
 * @param {*} value1 
 * @param {*} value2 
 * @param {*} skipDuplicates (default true)
 */
export function merge(item1, item2, skipDuplicates = true) {


    let keys = []
    keys = keys.concat(Object.keys(item1))
    keys = keys.concat(Object.keys(item2))
    keys = [...new Set(keys)]


    let mergedRecord = {
        "@id": item1?.['@id'] || item2?.['@id']
    }

    for (let k of keys) {
        if (k == "@id") {
            continue
        }
        let values1 = h.toArray(item1?.[k] || undefined)
        let values2 = h.toArray(item2?.[k] || undefined)
        let values = values1.concat(values2)

        if (skipDuplicates == true) {
            values = h.dedupe(values)
        }
        mergedRecord[k] = values

    }

    return mergedRecord

}



