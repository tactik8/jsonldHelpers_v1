

import { v4 as uuidv4 } from "uuid"

export default {
    get,
    set,
    validate,
    getGenericRecordID,
    getStandardID
};




const standards = {
    "website": "domain",
    "webpage": "url",
    "offer": "url",
    "brand": "domain"
}



// -----------------------------------------------------------------------
// Clean
// -----------------------------------------------------------------------

/**
 * Returns a standardized record_id for a record
 * @param {*} value 
 * @param {*} baseUrl 
 * @returns 
 */
export function get(value, baseUrl) {

    if (!value || !value?.['@type']) {
        return undefined
    }

    let record_types = getRecordTypes(value)
    for (let record_type of record_types) {

        let idType = standards?.[record_type]

        if (idType == "url") {
            return getIdBasedOnUrl(value?.['@type'], getUrls(value))
        }

        if (idType == "domain") {
            return getIdBasedOnDomain(record_type, getUrls(value))
        }

    }

    return getGenericRecordID(baseUrl)

}



/**
 * Returns a standardized record_id for a record
 * @param {*} value 
 * @param {*} baseUrl 
 * @returns 
 */
export function getStandardID(value, baseUrl) {

    if (!value || !value?.['@type']) {
        return undefined
    }

    let record_types = getRecordTypes(value)
    for (let record_type of record_types) {

        let idType = standards?.[record_type]

        if (idType == "url") {
            return getIdBasedOnUrl(value?.['@type'], getUrls(value))
        }

        if (idType == "domain") {
            return getIdBasedOnDomain(record_type, getUrls(value))
        }

    }

    return undefined

}



/**
 * Set standardized record id to record and sub values
 * @param {*} value 
 * @param {*} baseUrl 
 */
export function set(value, baseUrl) {

    if (Array.isArray(value) && typeof value != "string") {
        return value.map(x => set(x, baseUrl))
    }

    if (value?.["@type"] || value?.['@id']) {

        if (validate(value) == false) {
            value['@id'] = get(value, baseUrl)
        }

        for (let k of Object.keys(value)) {
            value[k] = set(value?.[k], baseUrl)
        }

    }
    return value
}


/**
 * Validates if a record has a proper record_id
 * @param {*} value 
 * @param {*} baseUrl 
 * @returns bool
 */
export function validate(value, baseUrl) {

    let currentRecordID = value?.['@id'] 

    if (!currentRecordID) {
        return false
    }

    // Check if standardized id
    if (getIdNomenclatureType(value)) {
        let standardizedRecordID = getStandardizedRecordId(value, baseUrl)
        return standardizedRecordID == currentRecordID
    }

    // Check if valid url
    return standardizeUrl(value?.['@id'], baseUrl) == currentRecordID

}


function getIdNomenclatureType(value) {

    let record_types = value?.['@type']
    record_types = (Array.isArray(record_types) && typeof record_types != "string") ? record_types : [record_types]

    for (let record_type of record_types) {
        if (standards?.[record_type]) {
            return standards?.[record_type]
        }
    }

    return undefined

}


function getRecordTypes(value) {

    let record_types = value?.['@type']
    record_types = (Array.isArray(record_types) && typeof record_types != "string") ? record_types : [record_types]
    record_types = record_types.filter(x => x)
    return record_types
}

function getUrls(value) {

    let values = value?.['url']
    values = (Array.isArray(values) && typeof values != "string") ? values : [values]
    values = values.filter(x => x)
    return values

}

export function getGenericRecordID(baseUrl) {

    baseUrl = standardizeUrl(baseUrl)

    if(!baseUrl){
        return "_:" + uuidv4()
    }


    if(!baseUrl.endsWith('/')){
        baseUrl = baseUrl + '/'
    }

    let record_id = standardizeUrl(baseUrl) + uuidv4()

    return record_id


}

function getIdBasedOnUrl(record_type, urls) {


    // Format record_type
    if (!record_type || typeof record_type != "string") {
        return undefined
    }
    record_type = record_type.toLowerCase()


    // Standardize urls
    if (Array.isArray(urls) && typeof urls != "string") {
        urls = [urls]
    }
    urls = urls.map(x => standardizeUrl(x))
    urls = urls.filter(x => x)

    // Get first valid url
    let url = urls?.[0]

    if (!url) {
        return "_:" + uuuidv4()
    }


    //
    if(!url.endsWith('/')){
        url = url + '/'
    }

    let record_id = url + "@" + record_type

    return record_id


}


function getIdBasedOnDomain(record_type, urls) {


    // Format record_type
    if (!record_type || typeof record_type != "string") {
        return undefined
    }
    record_type = record_type.toLowerCase()


    // Standardize urls
    if (Array.isArray(urls) && typeof urls != "string") {
        urls = [urls]
    }
    urls = urls.map(x => getDomain(x))
    urls = urls.filter(x => x)

    // Get first valid url
    let url = urls?.[0]

    if (!url) {
        return "_:" + uuidv4()
    }


    //
     if(!url.endsWith('/')){
        url = url + '/'
    }
    let record_id = url + "@" + record_type

    return record_id


}





/**
 * Extracts the domain (hostname) from a URL string.
 * @param {string} urlString - The URL to parse.
 * @returns {string|null} - The domain (e.g., 'example.com') or null if invalid.
 */
function getDomain(urlString) {
    if (!urlString || typeof urlString !== 'string') return null;

    try {
        // Ensure it has a protocol so the URL constructor can parse it
        let tempUrl = urlString.trim();
        if (!/^https?:\/\//i.test(tempUrl) && !tempUrl.startsWith('//')) {
            tempUrl = 'https://' + tempUrl;
        }

        const url = new URL(tempUrl);

        // .hostname returns 'www.example.com' 
        // (strips credentials, ports, paths, and queries)
        return url.hostname.toLowerCase();
    } catch (e) {
        return null;
    }
}

/**
 * Standardizes a URL string by adding a protocol if missing,
 * trimming whitespace, and normalizing the structure.
 * @param {string} urlString - The raw input string.
 * @param {string} defaultProtocol - Protocol to use if missing (default: 'https').
 * @returns {string|null} - The standardized URL or null if invalid.
 */
function standardizeUrl(urlString, defaultProtocol = 'https') {
    if (!urlString || typeof urlString !== 'string') return null;

    let cleanUrl = urlString.trim();

    // 1. Prepend protocol if it starts with // (protocol-relative) or no protocol at all
    if (cleanUrl.startsWith('//')) {
        cleanUrl = `${defaultProtocol}:${cleanUrl}`;
    } else if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `${defaultProtocol}://${cleanUrl}`;
    }

    try {
        const url = new URL(cleanUrl);

        // 2. Normalize components
        url.hostname = url.hostname.toLowerCase();

        // 3. Remove trailing slash from the path if no search params/hash exist
        let result = url.toString();
        if (result.endsWith('/') && !urlString.endsWith('/')) {
            result = result.slice(0, -1);
        }

        return result;
    } catch (e) {
        // Return null if the string cannot be parsed into a valid URL
        return null;
    }
}