
/**
 * 
 * @param {*} value 
 */
export function toString(value) {


    if (Array.isArray(value)) {

        return arrayToString(value)
    }

    if (h.record_type(value) == "ListItem") {
        return listItemToString(value)
    }

    if (h.record_type(value) == "ItemList") {
        return itemListToString(value)
    }

    if (h.record_type(value) == "Action") {
        return actionToString(value)
    }

    return h.getValue(value, 'name') || h.getValue(value, '@id')

}


function arrayToString(value) {

    let content = `Array (${value.length})\n--------------------------\n`
    value.forEach(x => content += toString(x) + '\n')
    return content


}


function listItemToString(value) {

    return `${h.getValue(value, 'position')} - ${h.getValue(value, 'item.name') || h.getValue(value, 'item.@id')}`
}

function itemListToString(value) {
    let listItems = h.getValues(value, 'itemListElement')
    let content = `ItemList${h.getValue(value, 'name') || h.getValue(value, '@id')} (${listItems.length})\n--------------------------\n`
    listItems.forEach(x => content += toString(x) + '\n')
    return content
}

function actionToString(value) {

    return `${h.getValue(value, 'name')} ${h.getValue(value, 'name') || h.getValue(value, '@id')} - ${h.getValue(value, 'actionStatus')}`

}