import { CStructBE, CStructClass, CStructProperty } from "../src";
import * as fs from "fs";


class GeoAltitude {
    // @CStructProperty({type: 'double'})
    public lat: number;
    // @CStructProperty({type: 'double'})
    public long: number;
    // @CStructProperty({type: 'double'})
    public alt: number;
    @CStructProperty({type: 'i8'})
    public test1 = 2;
    @CStructProperty({type: 'i8'})
    public static test2 = 8;
}
const geoAltitude = new GeoAltitude();
geoAltitude.test1 = 3;
const geoAltitudeStruct = CStructBE.from(geoAltitude);
console.log(geoAltitudeStruct.make(geoAltitude).buffer.toString('hex'));
