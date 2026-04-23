declare module "leaflet-control-geocoder" {
  import * as L from "leaflet";

  namespace Control {
    class Geocoder extends L.Control {
      constructor(options?: Record<string, unknown>);
      static nominatim(options?: Record<string, unknown>): unknown;
      markGeocode(result: unknown): this;
    }
  }

  function geocoder(options?: Record<string, unknown>): Control.Geocoder;
}
