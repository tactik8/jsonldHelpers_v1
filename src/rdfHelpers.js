import { v4 as uuidv4 } from 'uuid';

import * as dot from './dotHelpers.js'



/**
 * Class object to store rdf records
 */
export class RdfDB {
    constructor() {

        this._db = []

    }

    getRdf(subject) {
        return this._db.filter(x => !subject || x.subject == subject)
    }

    getRecord(subject) {
        return fromRDF(this.getRdf(subject))
    }

    post(value, annotation) {
        value = toRDF(value, annotation)
        value = Array.isArray(value) ? value : [value]
        value.forEach(x => this._db.push(x))
    }

    [Symbol.iterator]() {
        return this._db[Symbol.iterator]();
    }
}



export default {
    RdfDB,
    toRDF,
    fromRDF
};



function lt(rdfA, rdfB) {
    // Confidence
    let ac = rdfA?.label?.confidence || 0
    let bc = rdfB?.label?.confidence || 0

    if (ac < bc) { return true }
    if (ac > bc) { return false }

    // Date
    let ad = rdfA?.label?.createdDate || undefined
    let bd = rdfB?.label?.createdDate || undefined

    if (ac < bc) { return true }
    if (ac > bc) { return false }

    return false
}

function gt(rdfA, rdfB) {
    // Confidence
    let ac = rdfA?.label?.confidence || 0
    let bc = rdfB?.label?.confidence || 0

    if (ac > bc) { return true }
    if (ac < bc) { return false }

    // Date
    let ad = rdfA?.label?.createdDate || undefined
    let bd = rdfB?.label?.createdDate || undefined

    if (ac > bc) { return true }
    if (ac < bc) { return false }

    return false
}


/**
 * Returns best rdf value
 * @param {*} rdfRecords 
 * @param {*} record_id 
 * @param {*} propertyID 
 * @param {*} date 
 * @returns 
 */
function getBest(rdfRecords, record_id, propertyID, date) {

    rdfRecords = Array.isArray(rdfRecords) ? rdfRecords : [rdfRecords]

    rdfRecords = rdfRecords.filter(x => x?.subject == record_id && x?.predicate == propertyID)

    refRecords = rdfRecords.sorted((a, b) => gt(a, b))

    return refRecords[0]
}










export function toRDF(value, annotation) {

    function _toRDF(subject, predicate, value, label) {

        let results = []

        // Handle array
        if (Array.isArray(value)) {
            results = results.concat(value.map((x, index) => _toRDF(subject, predicate, x, label)))
            return results.flat()
        }

        // handle already rdf
        if (value?.subject && value?.predicate && value?.object) {
            return [value]
        }


        // handle label, add to @annotation
        if (label && typeof label == "object") {

            if (typeof value != "object") {
                value = { "@value": value }
            }
            value['@annotation'] = { ...(value?.['@annotation'] || {}), ...label }
        }


        // Handle if annotation
        if (predicate == "@annotation") {
            return []
        }

        // handle jsonld @value
        if (value?.["@value"]) {

            // handle annotation
            let annotation = value?.['@annotation']
            if (annotation && typeof annotation == "object") {
                annotation['@id'] = annotation?.['@id'] || "_:" + uuidv4()
                let annoRDFs = Object.keys(annotation).map(k => _toRDF(annotation['@id'], k, annotation[k]))
                results = results.concat(annoRDFs)
                annotation = annotation?.['@id']
            }
            // generate
            results = results.concat([{ subject: subject, predicate: predicate, object: value?.['@value'], label }])
            return results
        }

        // handle jsonld @id
        if (typeof value == "object") {

            // set @id
            value['@id'] = value?.['@id'] || '_:' + uuidv4()

            // 
            let newRdf = { subject: subject, predicate: predicate, object: value?.['@id'], label }
            results = results.concat([newRdf])
            results = results.concat(Object.keys(value).map(k => _toRDF(value?.["@id"], k, value?.[k], label)))
            return results.flat()
        }


        let newRdf = { subject: subject, predicate: predicate, object: value, label: label }
        return results.concat([newRdf])

    }

    //
    let results = []

    // Handle annotations
    if (annotation) {
        let flatAnnotations = flattenJson(annotation)
        if (flatAnnotations.length > 1) {
            results = results.concat(flatAnnotations.slice(1))
        }
        annotation = flatAnnotations?.[0]
    }

    results = results.concat(_toRDF(null, null, value, annotation))
    results = results.flat()
    results = results.filter(x => x.subject)
    return results

}


export function fromRDF(value) {

    value = Array.isArray(value) ? value : [value]

    // Init objects
    let m = new Map()

    // Init object map
    for (let v of value) {
        m.set(v?.subject, { "@id": v?.subject })
    }

    // 
    for (let v of value) {

        if (v.predicate == "@id") {
            continue
        }

        // get / create record
        let record = m.get(v.subject)

        // Retrieve object if exists
        let obj = v?.['object']

        let dbObj = m.get(v?.['object'])
        if (dbObj) {
            obj = { "@id": dbObj?.['@id'] }
        }

        // if label / annotation
        if (v.label) {

            if (!obj?.['@id']) {
                obj = {
                    "@value": obj
                }
            }
            obj["@annotation"] = v?.label
        }

        // Set property id. Set to @value if label present
        record[v.predicate] = record?.[v.predicate] || []
        record[v.predicate] = Array.isArray(record[v.predicate]) ? record[v.predicate] : [record[v.predicate]]
        record[v.predicate].push(obj)


    }

    //  
    let records = [...m.values()]
    records.forEach(x => x['@id'] = Array.isArray(x?.['@id']) ? x?.['@id'][0] : x?.['@id'])

    return records

}



function flattenJson(value) {

    let results = []
    if (Array.isArray(value)) {
        results = value.map(x => flattenJson(x))
        return results.flat()
    }

    if (typeof value == "object" && Object.keys(value).length > 0) {

        for (let k of Object.keys(value)) {

            let subValues = value?.[k]
            subValues = Array.isArray(subValues) ? subValues : [subValues]

            let newValues = []
            for (let v of subValues) {
                if (typeof v == "object") {

                    v['@id'] = v?.['@id'] || '_:' + uuidv4()
                    newValues.push({ "@id": v?.['@id'] })
                    results = results.concat(flattenJson(v))

                } else {
                    newValues.push(v)
                }
            }
            value[k] = newValues
            results = [value].concat(results)

        }

    }

    return results

}