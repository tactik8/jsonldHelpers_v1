
import { jsonldBase as h } from '../jsonldBase.js'

import * as dot from '../../dotHelpers/dotHelpers.js'



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
    return h.getValue(record, '@id')
}



export function isRef(value) {

    if (!value?.["@id"]) { return false }
    return !Object.keys(value).some(x => x != "@id")
}

export function ref(record_or_id) {
    if (!record_or_id) {
        return undefined
    }
    let record_id = h._utilGetId(record_or_id)
    if (!record_id) {
        return undefined
    }
    return { "@id": record_id }
}



export function getValue(record, propertyID, position, defaultValue) {
    position = Number(position)
    if (isNaN(position)) { position = 0 }
    let values = dot.get(record, propertyID)
    values = h.toArray(values)
    let value = values?.[position]
    
    return value ?? defaultValue

}

export function setValue(record, propertyID, value, position) {
    position = Number(position)
    if (isNaN(position)) { position = 0 }

    let values = h.getValues(record, propertyID)
    value = h.toArray(value)?.[0]
    values[position] = value
    dot.set(record, propertyID, values)
    return record
}

export function addValue(record, propertyID, value) {

    value = h.toArray(value)

    let currentValues = h.getValues(record, propertyID)

    let newValues = currentValues.concat(value)

    record = dot.set(record, propertyID, newValues)

    return record
}

export function addValues(record, propertyID, values) {

    return h.addValue(record, propertyID, values)
}


export function getValues(record, propertyID, defaultValue) {
    let values = dot.get(record, propertyID)
    values = h.toArray(values)
    values = values.filter(x => x !== undefined)
    if (values.length == 0 && defaultValue !== undefined) {
        return defaultValue
    }
    return values
}

export function setValues(record, propertyID, value) {
    value = h.toArray(value)
    dot.set(record, propertyID, value)
    return record
}



// -----------------------------------------------------------------------
// Additional property
// -----------------------------------------------------------------------


export function getAdditionalProperty(record, propertyID) {

    let pvs = h.getValues(record, 'additionalProperty')
    let pv = pvs.find(x => h.getValue(x, "propertyID") == propertyID)
    let value = h.getValue(pv, 'value')
    return value
}

export function setAdditionalProperty(record, propertyID, value, unitText) {

    let pvs = h.getValues(record, 'additionalProperty')
    pvs = pvs.filter(x => h.getValue(x, "propertyID") != propertyID)


    let pv = {
        "@type": "PropertyValue",
        "@id": h.randomUUID(),
        "propertyID": propertyID,
        "value": value
    }
    record = h.addValue(record, 'additionalProperty', pv)
    return record

}

// -----------------------------------------------------------------------
// Short cut properties
// -----------------------------------------------------------------------


export function actionStatus(record){
    return h.getValue(record, 'actionStatus')
}

export function contentUrl(record){
    return h.getValue(record, 'contentUrl')
}

export function description(record){
    return h.getValue(record, 'description')
}

export function email(record){
    return h.getValue(record, 'email')
}

export function item(record){
    return h.getValue(record, 'item')
}

export function itemListElement(record){
    return h.getValues(record, 'itemListElement')
}

export function name(record){
    return h.getValue(record, 'name')
}

export function position(record){
    return h.getValue(record, 'position')
}

export function text(record){
    return h.getValue(record, 'text')
}

export function url(record){
    return h.getValue(record, 'url')
}
