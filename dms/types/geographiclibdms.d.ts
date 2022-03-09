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
