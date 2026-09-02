


import { jsonldBase as h } from '../jsonldBase.js'
import { toArray } from './utilitiesHelpers.js'




/**
 * Dedupes a list containing objects, values, etc. Merge duplicates by default
 * @param {*} items 
 * @param {bool} mergeItems
 */
export function dedupe(items, mergeItems = true) {

    // Ensure items
    items = h.toArray(items)


    // Skip if empty
    if (items.length < 2) {
        return items
    }

    let newItems = []
    for (let i of items) {
        if (includes(newItems, i) == false) {

            // Merge items if valid jsonld
            if (mergeItems == true && h.isValid(i)) {
                let similarItems = search(items, i)
                similarItems.forEach(x => i = h.merge(x, i))
            }

            newItems.push(i)
        }
    }

    newItems = sort(newItems)

    return newItems

}


/**
 * Returns true if list contains a specific item
 * @param {*} itemList 
 * @param {*} item 
 */
export function includes(itemList, item) {

    itemList = h.toArray(itemList)

    for (let i of itemList) {
        if (h.isSame(i, item) == true) {
            return true
        }

    }

    return false

}

/**
 * Concat two lists of jsonld or any, skip duplicates by default
 * @param {*} list1 
 * @param {*} list2 
 */
export function concat(list1, list2, skipDuplicates = true) {

    list1 = h.toArray(list1)
    list2 = h.toArray(list2)


    let newList = list1.concat(list2)
    newList = newList.filter(x => x != undefined)

    if (skipDuplicates == true) {
        newList = dedupe(newList)
    }

    newList = sort(newList)
    return newList

}

/**
 * Sort items. orderDirection asc (1) by default
 * @param {*} items 
 * @param {*} orderDirection 
 */
export function sort(items, orderBy = undefined, orderDirection = undefined,) {


    orderDirection = orderDirection ?? 1

    if (typeof orderDirection == "string") {
        orderDirection = orderDirection.toLowerCase()
    }

    orderDirection = orderDirection == "asc" ? 1 : orderDirection
    orderDirection = orderDirection == "desc" ? -1 : orderDirection

    items = h.toArray(items)

    if (items.length < 2) {
        return items
    }

    if (orderBy == undefined) {

        if (orderDirection == 1) {
            items.sort((a, b) => h.lt(a, b) == true ? -1 : 1)
        } else {
            items.sort((a, b) => h.gt(a, b) == true ? -1 : 1)
        }
    } else {
        if (orderDirection == 1) {
            items.sort((a, b) => h.lt(h.getValue(a, orderBy), h.getValue(b, orderBy)) == true ? -1 : 1)
        } else {
            items.sort((a, b) => h.gt(h.getValue(a, orderBy), h.getValue(b, orderBy)) == true ? -1 : 1)
        }
    }
    return items

}

/**
 * Returns values that are both in list1 and list2
 * @param {*} list1 
 * @param {*} list2 
 * @returns 
 */
export function intersection(list1, list2) {

    list1 = h.toArray(list1)
    list2 = h.toArray(list2)


    let commonItems = []

    for (let i of list1) {
        if (includes(list2, i) == true) {
            commonItems.push(i)
        }
    }

    commonItems = sort(commonItems)
    return commonItems

}


/**
 * Returns values in list1 not in list2
 * @param {*} list1 
 * @param {*} list2 
 */
export function diff(list1, list2) {

    list1 = h.toArray(list1)
    list2 = h.toArray(list2)


    let notCommonItems = []

    for (let i of list1) {
        if (includes(list2, i) == false) {
            notCommonItems.push(i)
        }
    }

    notCommonItems = sort(notCommonItems)
    return notCommonItems

}


/**
 * Deletes an item from list
 */
export function deleteItem(itemList, item) {

    itemList = h.toArray(itemList)

    let newList = []
    for (let i of itemList) {
        if (h.isSame(i, item) == false) {
            newList.push(i)
        }
    }

    return newList

}

/**
 * Add or repalce item in list
 * @param {*} itemList 
 * @param {*} item 
 * @returns 
 */
export function upsertItem(itemList, item) {

    itemList = h.toArray(itemList)

    let newList = []
    for (let i of itemList) {
        if (h.isSame(i, item) == true) {
            newList.push(item)
        } else {
            newList.push(i)
        }
    }

    return newList

}

/**
 * INsert item or replace 
 */
export function insertItem(itemList, item) {
    return upsertItem(itemList, item)
}

/**
 * Get length
 */
export function length(itemList) {

    itemList = h.toArray(itemList)

    return itemList.length
}

/**
 * Returns first same item
 * @param {*} itemList 
 * @param {*} item 
 */
export function find(itemList, item) {

    itemList = h.toArray(itemList)

    for (let i of itemList) {
        if (h.isSame(i, item)) {
            return i
        }
    }

    return undefined

}

/**
 * Returns all same items
 * @param {*} itemList 
 * @param {*} item 
 */
export function search(itemList, item) {

    itemList = h.toArray(itemList)

    let results = []

    for (let i of itemList) {
        if (h.isSame(i, item)) {
            results.push(i)
        }
    }

    return results

}


/**
 * Returns all same items
 * @param {*} itemList 
 * @param {*} item 
 */
export function filter(itemList, filter, orderBy, orderDirection, limit, offset) {

    itemList = h.toArray(itemList)

    //
    if (itemList.length == 0) {
        return itemList
    }

    // filter items
    if (h.isNotNull(filter)) {
        itemList = itemList.filter(x => h.evaluate(x, filter))
    }

    // sort items
    itemList = sort(itemList, orderBy, orderDirection)

    if (itemList.length == 0) {
        return itemList
    }


    // offset and limit
    offset = h.toNumber(offset)
    if (h.isNumber(offset)) {
        itemList = itemList.slice(offset)
    }

    limit = h.toNumber(limit)
    if (h.isNumber(limit)) {
        if (itemList.length >= limit) {
            itemList = slice(0, limit)
        }
    }

    return itemList

}