// test/helpers.test.js

import { DB } from '../src/jsonldBase.js';

describe('Record Helpers', () => {
  
  


  test('DB should allow storing and retrieving a value', async () => {
    
    let db = new DB()

    let record1 = {
      "@context": "https://schema.org/",
      "@type": "Thing",
      "@id": "https://testcase.com/thing1",
      "name": "thing1",
      "url": "https://www.test.com/thing/thing1"
    }
    
    db.post(record1)

    let record_id = record1?.['@id']
    let result = db.get('https://testcase.com/thing1')

    expect(db.length()).toBe(1)
    expect(result).toHaveProperty('@id', record_id);
    expect(result.url).toBeDefined();
  });

 
  
});



// test/integration.js
import * as myLib from '../src/index.js';

test('the library exports the expected functions', () => {
  expect(typeof myLib.DB).toBe('function');
  expect(typeof myLib.evaluate).toBe('function');
});