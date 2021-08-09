export enum DMSHemisphereIndicator {
  NONE = 0,
  LATITUDE = 1,
  LONGITUDE = 2,
  AZIMUTH = 3
}

export enum DMSTrailingComponent {
  DEGREE = 0,
  MINUTE = 1,
  SECOND = 2
}

export declare const DMS: {
  NONE: DMSHemisphereIndicator.NONE,
  LATITUDE: DMSHemisphereIndicator.LATITUDE,
  LONGITUDE: DMSHemisphereIndicator.LONGITUDE,
  AZIMUTH: DMSHemisphereIndicator.AZIMUTH,

  DEGREE: DMSTrailingComponent.DEGREE,
  MINUTE: DMSTrailingComponent.MINUTE,
  SECOND: DMSTrailingComponent.SECOND,

  Decode: (dms: string) => {
    val: number;
    ind: DMSHemisphereIndicator;
  },

  DecodeLatLon: (
    stra: string,
    strb: string,
    longfirst?: boolean // default = false
  ) => {
    lat: number;
    lon: number;
  },

  DecodeAngle: (angstr: string) => number,

  DecodeAzimuth: (azistr: string) => number,

  Encode: (
    angle: number,
    trailing: DMSTrailingComponent,
    prec: number,
    ind?: DMSHemisphereIndicator // default = NONE
  ) => string
};

declare class GeodesicClass {
  constructor(a: number, f: number);

  ArcDirect(
    lat1: number,
    lon1: number,
    azi1: number,
    a12: number,
    outmask?: number
  ): {
    lat1: number;
    lon1: number;
    azi1: number;
    a12: number;
  };

  ArcDirectLine(
    lat1: number,
    lon1: number,
    azi1: number,
    a12: number,
    caps?: number
  ): any; // TODO: define GeodesicLine object

  Direct(
    lat1: number,
    lon1: number,
    azi1: number,
    s12: number,
    outmask?: number
  ): {
    lat1: number;
    lon1: number;
    azi1: number;
    s12: number;
    a12: number;
    lat2?: number
    lon2?: number
    azi2?: number
    m12?: number
    M12?: number
    M21?: number
    S12?: number
  };

  DirectLine(
    lat1: number,
    lon1: number,
    azi1: number,
    s12: number,
    caps?: number
  ): any; // TODO: define GeodesicLine object

  GenDirect(
    lat1: number,
    lon1: number,
    azi1: number,
    arcmode: boolean,
    s12_a12: number,
    outmask?: number
  ): {
    lat1: number;
    lon1: number;
    azi1: number;
    s12?: number;
    a12: number;
  };

  GenDirectLine(
    lat1: number,
    lon1: number,
    azi1: number,
    arcmode: boolean,
    s12_a12: number,
    caps?: number
  ): any; // TODO: define GeodesicLine object

  Inverse(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    outmask?: number
  ): {
    lat1: number;
    lon1: number;
    lat2: number;
    lon2: number;
    a12: number;
    s12?: number;
    azi1?: number
    azi2?: number
    m12?: number
    M12?: number
    M21?: number
    S12?: number
  }

  InverseLine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    caps?: number
  ): any; // TODO: define GeodesicLine object

  Polygon(polyline?: boolean): any // TODO: define PolygonArea object
}

export declare const Geodesic: {
  NONE: number
  ARC: number
  LATITUDE: number
  LONGITUDE: number
  AZIMUTH: number
  DISTANCE: number
  STANDARD: number
  DISTANCE_IN: number
  REDUCEDLENGTH: number
  GEODESICSCALE: number
  AREA: number
  ALL: number
  LONG_UNROLL: number
  Geodesic: typeof GeodesicClass,
  WGS84: GeodesicClass
};

// TODO: Type
export declare const GeodesicLine: any;
export declare const Math: any;
export declare const PolygonArea: any;
