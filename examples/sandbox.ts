import { CStructBE, CStructClass, CStructProperty } from "../src";

import * as fs from "fs";
interface GeoAltitude {
    lat: number;
    long: number;
    alt: number;
}

@CStructClass({
    types: `{ GeoAltitude: { lat:double, long:double, alt:double }}`
})
class GeoAltitudesFile {
    @CStructProperty({type: 'string30'})
    public fileName: string = 'GeoAltitudesFile v1.0';

    @CStructProperty({type: 'GeoAltitude[i32]'})
    public geoAltitudes: GeoAltitude[] = [];
}

(async () => {
    // Make random data
    const geoAltitudesFile = new GeoAltitudesFile();
    for (let i = 0; i < 400e3; i++) {
        let randomLat = Math.random() * (90 - -90) + -90;
        let randomLong = Math.random() * (180 - -180) + -180;
        let randomAlt = 6.4e6 * Math.random() * (8e3 - -4e3) + -4e3;
        const geo = {lat: randomLat, long: randomLong, alt: randomAlt};
        geoAltitudesFile.geoAltitudes.push(geo);
    }
    console.log('Write data length,', geoAltitudesFile.geoAltitudes.length);

    // Write data
    console.time('make');
    const geoFileStruct = CStructBE.from(GeoAltitudesFile);
    const writeFile = geoFileStruct.make(geoAltitudesFile).buffer;
    console.timeEnd('make');

    // Write to file
    fs.promises.writeFile('geoAltitudesFile.bin', writeFile);

    // Read from file
    const readFile = await fs.promises.readFile('geoAltitudesFile.bin');

    // Read data
    console.time('read');
    const geoFileStruct2 = CStructBE.from<GeoAltitudesFile>(GeoAltitudesFile);
    const readGeoAltitudesFile = geoFileStruct2.read(readFile).struct;
    console.timeEnd('read');

    console.log('Read fileName,', readGeoAltitudesFile.fileName);
    console.log('Read data length,', readGeoAltitudesFile.geoAltitudes.length);
})();





