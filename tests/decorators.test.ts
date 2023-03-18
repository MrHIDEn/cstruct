import { hexToBuffer, CStructBE, CStructLE, CStructClass, CStructProperty } from "../src";

describe('Decorators', () => {
    describe('BE', () => {
        describe(`make`, () => {
            it(`should make buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');

                const result = CStructBE.make(myClass);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');

                const result = CStructBE.make(myData);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');

                const result = CStructBE.make(myClass);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructBE.write(myClass, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructBE.write(myData, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('000A FFF6');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructBE.write(myClass, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write with offset 2`, () => {
            it(`should write buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('7777 000A FFF6');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructBE.write(myClass, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('7777 000A FFF6');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructBE.write(myData, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('7777 000A FFF6');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructBE.write(myClass, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`read`, () => {
            it(`should read buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('000A FFF6');
                const expected = {a: 10, b: -10};

                const result = CStructBE.read(myClass, buffer);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }
                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }
                const myData = new MyData();
                myData.myClass = new MyClass();
                const buffer = hexToBuffer('000A FFF6');
                const expected = {myClass: {a: 10, b: -10}};

                const result = CStructBE.read(myData, buffer);

                expect(myData).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('000A FFF6');
                const expected = {a: 10, b: -10};

                const result = CStructBE.read(myClass, buffer);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`read with offset 2`, () => {
            it(`should read buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('7777 000A FFF6');
                const expected = {a: 10, b: -10};

                const result = CStructBE.read(myClass, buffer, 2);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }
                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }
                const myData = new MyData();
                myData.myClass = new MyClass();
                const buffer = hexToBuffer('7777 000A FFF6');
                const expected = {myClass: {a: 10, b: -10}};

                const result = CStructBE.read(myData, buffer, 2);

                expect(myData).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('7777 000A FFF6');
                const expected = {a: 10, b: -10};

                const result = CStructBE.read(myClass, buffer, 2);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });

    describe('LE', () => {
        describe(`make`, () => {
            it(`should make buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');

                const result = CStructLE.make(myClass);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');

                const result = CStructLE.make(myData);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should make buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');

                const result = CStructLE.make(myClass);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write`, () => {
            it(`should write buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructLE.write(myClass, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructLE.write(myData, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('0A00 F6FF');
                const buffer = hexToBuffer('0000 0000');

                const result = CStructLE.write(myClass, buffer);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`write with offset 2`, () => {
            it(`should write buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('7777 0A00 F6FF');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructLE.write(myClass, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }

                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }

                const myData = new MyData();
                myData.myClass = new MyClass();
                myData.myClass.a = 10;
                myData.myClass.b = -10;
                const expected = hexToBuffer('7777 0A00 F6FF');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructLE.write(myData, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should write buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }

                const myClass = new MyClass();
                myClass.a = 10;
                myClass.b = -10;
                const expected = hexToBuffer('7777 0A00 F6FF');
                const buffer = hexToBuffer('7777 0000 0000');

                const result = CStructLE.write(myClass, buffer, 2);

                expect(result.buffer).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });

        describe(`read`, () => {
            it(`should read buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('0A00 F6FF');
                const expected = {a: 10, b: -10};

                const result = CStructLE.read(myClass, buffer);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }
                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }
                const myData = new MyData();
                myData.myClass = new MyClass();
                const buffer = hexToBuffer('0A00 F6FF');
                const expected = {myClass: {a: 10, b: -10}};

                const result = CStructLE.read(myData, buffer);

                expect(myData).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('0A00 F6FF');
                const expected = {a: 10, b: -10};

                const result = CStructLE.read(myClass, buffer);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(4);
                expect(result.size).toBe(4);
            });
        });

        describe(`read with offset 2`, () => {
            it(`should read buffer with CStructClass decorator and only model`, () => {
                @CStructClass({
                    model: {a: 'u16', b: 'i16'}
                })
                class MyClass {
                    public a: number;
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('7777 0A00 F6FF');
                const expected = {a: 10, b: -10};

                const result = CStructLE.read(myClass, buffer, 2);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructClass decorator and model and types`, () => {
                class MyClass {
                    public a: number;
                    public b: number;
                }
                @CStructClass({
                    model: {myClass: 'MyClass'},
                    types: {MyClass: {a: 'u16', b: 'i16'}}
                })
                class MyData {
                    public myClass: MyClass;
                }
                const myData = new MyData();
                myData.myClass = new MyClass();
                const buffer = hexToBuffer('7777 0A00 F6FF');
                const expected = {myClass: {a: 10, b: -10}};

                const result = CStructLE.read(myData, buffer, 2);

                expect(myData).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });

            it(`should read buffer with CStructModelProperty decorator`, () => {
                class MyClass {
                    @CStructProperty({type: 'u16'})
                    public a: number;

                    @CStructProperty({type: 'i16'})
                    public b: number;
                }
                const myClass = new MyClass();
                const buffer = hexToBuffer('7777 0A00 F6FF');
                const expected = {a: 10, b: -10};

                const result = CStructLE.read(myClass, buffer, 2);

                expect(myClass).toEqual(expected);
                expect(result.struct).toEqual(expected);
                expect(result.offset).toBe(6);
                expect(result.size).toBe(4);
            });
        });
    });
});