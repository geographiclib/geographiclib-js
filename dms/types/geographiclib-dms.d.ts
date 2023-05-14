export declare const NONE: 0;
export declare const LATITUDE: 1;
export declare const LONGITUDE: 2;
export declare const AZIMUTH: 3;

export declare const DEGREE: 0;
export declare const MINUTE: 1;
export declare const SECOND: 2;

export type DMSHemisphereIndicator = 0 | 1 | 2 | 3;
export type DMSTrailingComponent = 0 | 1 | 2;

export declare const Decode: (dms: string) => {
  val: number;
  ind: DMSHemisphereIndicator;
};

export declare const DecodeLatLon: (
  stra: string,
  strb: string,
  longfirst?: boolean // default = false
) => {
  lat: number;
  lon: number;
};

export declare const DecodeAngle: (angstr: string) => number;

export declare const DecodeAzimuth: (azistr: string) => number;

export declare const Encode: (
  angle: number,
  trailing: DMSTrailingComponent,
  prec: number,
  ind?: DMSHemisphereIndicator // default = NONE
) => string;
