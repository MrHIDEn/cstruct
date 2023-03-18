import * as fs from "fs";
import { CStructBE, CStructClass, CStructProperty } from "../src";

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
    for (let i = 0; i < 1e6; i++) {
        let randomLat = Math.random() * (90 - -90) + -90;
        let randomLong = Math.random() * (180 - -180) + -180;
        let randomAlt = 6.4e6 * Math.random() * (8e3 - -4e3) + -4e3;
        const geo = {lat: randomLat, long: randomLong, alt: randomAlt};
        geoAltitudesFile.geoAltitudes.push(geo);
    }
    console.log('Write data length,', geoAltitudesFile.geoAltitudes.length);

    // Make buffer
    console.time('make');
    const writeFile = CStructBE.make(geoAltitudesFile).buffer;
    console.timeEnd('make');
    console.log('Write file length,', writeFile.length);

    // Write to file
    await fs.promises.writeFile('geoAltitudesFile.bin', writeFile);

    // Read from file
    const readFile = await fs.promises.readFile('geoAltitudesFile.bin');
    console.log('Read file length,', readFile.length);

    // Read data
    console.time('read');
    const readGeoAltitudesFile = CStructBE.read(GeoAltitudesFile, readFile).struct;
    console.timeEnd('read');

    console.log('Read fileName,', readGeoAltitudesFile.fileName);
    console.log('Read data length,', readGeoAltitudesFile.geoAltitudes.length);
})();