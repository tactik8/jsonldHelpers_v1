


import { _h } from '../src/index.js'


function test() {


    let items = []
    for(let i=0; i < 10; i++){
        items.push(_h.records.thing(1))
    }

    items[2].test = "test1"
    items = _h.dedupe(items)

        console.log(items)
    



}

test()



