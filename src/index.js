import * as helpers from './jsonldBase.js';
import * as dot from './dotHelpers.js';
import * as thing from './things.js'
import * as apiClient from './apiClient.js'
import * as rdf from './rdfHelpers.js'


export * from './jsonldBase.js'
export * from './dotHelpers.js'
export * from './things.js'
export * from './apiClient.js'
export * from './rdfHelpers.js'

export default { ...helpers, ...thing, ...apiClient, ...rdf};



function test() {


    let r = {

        "@context": "https://schema.org/",
        "@type": "Thing",
        "@id": "https://testapi.com/thing1",
        "name": {
            "@value": "thing1",
            "@annotation": {
                "org:prop1": "value1"
            }
        },
        "url": "https://www.test.com/thing/thing1",
        "other": [
            {
                "@context": "https://schema.org/",
                "@type": "Thing",
                "@id": "https://testapi.com/thing2",
                "name": "thing2",
                "url": "https://www.test.com/thing/thing2"
            },
            {
                "@context": "https://schema.org/",
                "@type": "Thing",
                "@id": "https://testapi.com/thing3",
                "name": "thing3",
                "url": "https://www.test.com/thing/thing3"
            }
        ]
    }


    let annotation = {
        "og:source": "some system",
        "og:table": "some table",
        "og:other": {
            "og:other2": "some other2"
        }
    }

    let db = new rdf.RdfDB()
    db.post(r, annotation)

    let r2 = db.getRecord()
    console.log(JSON.stringify(r2, undefined, 4))
    
    

}

test()