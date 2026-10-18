# Model, scale and readouts

Source: actual 216-feature Rotterdam 3DBAG/BAG WFS subset in `assets/rotterdam.geojson`. Exact request and license in DATA_SOURCES.md. TU Delft / 3DGI 3DBAG CC BY4; BAG attributes CC0.

Every polygon ring and hole is extruded unchanged from EPSG:28992 coordinates, centred at 92700,436500. Scale 1:1000, one source metre becomes .001 model metre. Height = `b3_h_70p - b3_h_maaiveld`; nonpositive or nonfinite values are omitted. Readouts are computed in film.js from the same accepted feature array. “Built before 1940” counts original construction attributes >0 and <1940; chronology uses `oorspronkelijkbouwjaar`. Maximum is accepted 70th-percentile roof height above terrain, not the city's official tallest building. Feature count denotes supplied features and may include building parts, not necessarily unique BAG identifiers.

The physical model stays matte white. Data enters through shader-added projector light and normal-facing throw. There is no historical bomb-damage inference, no calculated real solar shadow and no claim about the entire city; this is a different, smaller actual subset than the original film.
