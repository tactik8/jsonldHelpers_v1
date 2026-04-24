
import  * as thing from '../src/things.js';

describe('Thing Classes', () => {
  
  
  test('Should produce record', async () => {
    

    let t = new thing.Thing()

    t.name = "Some thing"

    let record = t.record

    
    expect(record).toHaveProperty('name', "Some thing");

  });

 
  
});

