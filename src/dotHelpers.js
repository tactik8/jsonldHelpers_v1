


export default {
    get,
    set
};


/**
 * Gets a value based on dot notation.
 * @param {*} record 
 * @param {*} path 
 * @returns 
 */
export function get(record, path) {

    if (!path || typeof path != "string") {
        return undefined
    }

    let pathElements = _convertPathToArray(path)

    let workingRecord = record

    for (let p of pathElements) {

        if (!isNaN(p)) {
            workingRecord = (Array.isArray(workingRecord) && typeof workingRecord != "string") ? workingRecord : [workingRecord]
        } else {
            workingRecord = (Array.isArray(workingRecord) && typeof workingRecord != "string") ? workingRecord[0] : workingRecord
        }


        workingRecord = workingRecord?.[p] || undefined

    }

    return workingRecord

}

/**
 * Sets a value to an object based on dot notation. 
 * Creates the path if missing
 * @param {*} record 
 * @param {*} path 
 * @param {*} value 
 * @returns 
 */
export function set(record, path, value) {

    if (!path || typeof path != "string" || path == "") {
        return undefined
    }

    let pathElements = _convertPathToArray(path)

    if (pathElements.length == 0) {
        return value
    }

    let workingRecord = record

    // Initialize record
    record = record || {}
    if (!isNaN(pathElements[0])) {
        record = Array.isArray(record) ? record : [record]
    }


    // Create missing objects / arrays in path
    let parentRecord = record

    for (let i = 0; i < pathElements.length - 1; i++) {

        let p0 = pathElements[i]
        let p1 = pathElements[i + 1]

        let isNumber = !isNaN(p1)

        // Convert to array if number
        if (isNumber == true) {
            parentRecord[p0] = (Array.isArray(parentRecord[p0]) && typeof parentRecord[p0] != "string") ? parentRecord[p0] : [parentRecord[p0]]
            parentRecord = parentRecord?.[p0]
        }

        if (isNumber == false) {
            parentRecord[p0] = parentRecord?.[p0] || {}
            parentRecord = (Array.isArray(parentRecord?.[p0]) && typeof parentRecord[p0] != "string") ? parentRecord?.[p0][0] : parentRecord?.[p0]
        }

    }

    // Set value
    parentRecord[pathElements[pathElements.length - 1]] = value

    // 
    return record


}


/**
 * Flattens
 * @param {*} record 
 */
export function flatten(value){

   


}




/**
 * Converts a dot notation string to array of path elements
 * @param {*} path 
 * @returns 
 */
function _convertPathToArray(path) {


    let pathElements = []

    let currentPath = ""
    let separators = ['[', ']', '.']


    for (let i of path) {

        if (separators.includes(i)) {

            if (currentPath != "") {
                pathElements.push(currentPath)
            }
            currentPath = ""
            continue
        } else {
            currentPath = currentPath + i
        }
    }
    pathElements.push(currentPath)

    // Filter null
    pathElements = pathElements.filter(x => x != "")

    // Convert to numbers 
    pathElements = pathElements.map(x => isNaN(Number(x)) ? x : Number(x))


    return pathElements

}
