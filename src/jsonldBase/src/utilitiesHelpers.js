

import { jsonldBase as h } from '../jsonldBase.js'


/**
 * Returns random uuidv4
 * @returns 
 */
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





/**
 * Returns true if record or property is undefined or null
 * @param {*} record 
 * @param {*} propertyID 
 * @returns 
 */
export function isNull(record, propertyID = undefined) {


    if (record == undefined || record == null) {
        return true
    }

    // Evalue record as not null if no propertyID given
    if (propertyID == undefined || propertyID == null) {
        return false
    }

    // 
    let values = getValues(record, propertyID)

    return values.length == 0

}

/**
 * Returns true if record or property is not undefined or null
 * @param {*} record 
 * @param {*} propertyID 
 * @returns 
 */
export function isNotNull(record, propertyID = undefined) {

    return !isNull(record, propertyID)
}


/**
 * Return true if value is anumber
 * @param {*} value 
 */
export function isNumber(value) {

    value = Number(value)
    return !isNaN(value)

}

/**
 * Return true if value is anumber
 * @param {*} value 
 */
export function isNotNumber(value) {

    return !isNumber(value)

}

/**
 * Ensure a value is a number
 * @param {*} value 
 * @returns 
 */
export function toNumber(value) {
    value = Number(value)

    if (!isNaN(value)) {
        return value
    }
    return undefined
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
export function toArray(value) {

    value = isArray(value) ? value : [value]

    value = value.filter(x => x != undefined)

    return value

}

/**
 * Convert value to single, if array, takes first element
 * @param {*} value 
 * @returns 
 */
export function toSingle(value) {

    value = toArray(value)

    return value?.[0] ?? undefined

}


/**
 * Returns @id from record or return string
 * @param {*} record_or_id 
 */
export function _utilGetId(record_or_id) {

    // error handling
    if (record_or_id === undefined) { return undefined }
    if (record_or_id === null) { return undefined }


    //
    let value = h.record_id(record_or_id) ?? record_or_id
    value = h.isArray(value) ? value[0] : value
    return value ?? undefined
}




