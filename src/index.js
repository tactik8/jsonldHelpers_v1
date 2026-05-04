import jsonldBase, * as helpers from './jsonldBase.js';
import * as dot from './dotHelpers.js';
import * as thing from './things.js'
import * as apiClient from './apiClient.js'
import * as rdf from './rdfHelpers.js'
import * as recordIDHelpers from './recordIdHelpers.js'


export * from './jsonldBase.js'
export * from './dotHelpers.js'
export * from './things.js'
export * from './apiClient.js'
export * from './rdfHelpers.js'

export default { ...helpers, ...thing, ...apiClient, ...rdf, ...recordIDHelpers};



function test() {


    console.log('test')
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



   

    let r2 = helpers.clean(r, 'https://krknapi.com')

    
    console.log('zz', JSON.stringify(r2, undefined, 4))
    
    

}

// test()


async function test2(){

    let apiUrl = 'http://127.0.0.1:3000/record'
    let api = new apiClient.ApiClient(apiUrl)

    let action = await api.test()
    console.log(JSON.stringify(action, null, 4))
}

await test2()
