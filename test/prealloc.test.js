const { struct } = require('../index');
let model, buffer, readBE, readLE, writeBE, writeLE, offset;

test('if preAllocSize initial is 200', () => {
    model = struct(['b8']);
    expect(model.preAllocSize).toBe(200);
});

test('if preAllocSize, set/get', () => {
    model = struct(['b8']);
    model.preAllocSize = 321;
    expect(model.preAllocSize).toBe(321);
});