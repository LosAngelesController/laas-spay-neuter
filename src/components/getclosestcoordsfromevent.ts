import * as turf from "@turf/turf";

export function computeclosestcoordsfromevent(
  event: mapboxgl.MapMouseEvent & {
    features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
  } & mapboxgl.EventData
): number[] {
  if (event.features) {
    const from = turf.point([event.lngLat.lng, event.lngLat.lat]);

    const options = "kilometres";

    const setofuniquepoints = new Set<string>();

    event.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        const stringedcoordinates = feature.geometry.coordinates.join(",");

        setofuniquepoints.add(stringedcoordinates);
      }
    });

    console.log("setofuniquepoints", setofuniquepoints);

    const distancesofuniquepoints: any = {};

    setofuniquepoints.forEach((stringedcoordinates: string) => {
      const to = turf.point(
        stringedcoordinates.split(",").map((coord) => parseFloat(coord))
      );
      const distance = turf.distance(from, to, options);
      distancesofuniquepoints[stringedcoordinates] = distance;
    });

    let shortestdistanceset = Object.keys(distancesofuniquepoints).reduce(
      (key, v) =>
        distancesofuniquepoints[v] < distancesofuniquepoints[key] ? v : key
    );

    var result = shortestdistanceset
      .split(",")
      .map((coord) => parseFloat(coord));

    if (result.length === 2) {
      return result;
    } else {
      return [0, 0];
    }
  } else {
    return [0, 0];
  }
}
