import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_62: ProvinceCalibrationBundle = {
  "provinceCode": "TR-62",
  "provinceName": "Tunceli",
  "plateNumber": 62,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 39.1079,
  "stationLon": 39.5401,
  "stationElevationM": 981,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-12",
    "TR-24",
    "TR-23"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-12",
      "provinceName": "Bingöl",
      "wmoStationId": "17203",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-24",
      "provinceName": "Erzincan",
      "wmoStationId": "17092",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-23",
      "provinceName": "Elazığ",
      "wmoStationId": "17202",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.401699,
          "ecmwfAifs": 0.124087,
          "icon": 0.04111,
          "ukmo": 0.087115,
          "meteofrance": 0.116914,
          "gfs": 0.02,
          "gem": 0.189075,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.2705,
        "spreadScale": 0.6011,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.26921,
            "ecmwfAifs": 0.086158,
            "icon": 0.211476,
            "ukmo": 0.112426,
            "meteofrance": 0.147423,
            "gfs": 0.064517,
            "gem": 0.05539,
            "jma": 0.0534
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.437566,
          "ecmwfAifs": 0.150153,
          "icon": 0.053458,
          "ukmo": 0.098689,
          "meteofrance": 0.076619,
          "gfs": 0.02,
          "gem": 0.143515,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.1509,
        "spreadScale": 0.6737,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.26921,
            "ecmwfAifs": 0.086158,
            "icon": 0.211476,
            "ukmo": 0.112426,
            "meteofrance": 0.147423,
            "gfs": 0.064517,
            "gem": 0.05539,
            "jma": 0.0534
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.404687,
          "ecmwfAifs": 0.02,
          "icon": 0.11742,
          "ukmo": 0.125125,
          "meteofrance": 0.075356,
          "gfs": 0.02,
          "gem": 0.217412,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.062,
        "spreadScale": 0.4953,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.265424,
            "ecmwfAifs": 0.071203,
            "icon": 0.217121,
            "ukmo": 0.119036,
            "meteofrance": 0.149956,
            "gfs": 0.065289,
            "gem": 0.056049,
            "jma": 0.055922
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.485128,
          "ecmwfAifs": 0.035428,
          "icon": 0.123075,
          "ukmo": 0.111494,
          "meteofrance": 0.052342,
          "gfs": 0.02,
          "gem": 0.152533,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.816,
        "spreadScale": 0.6351,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.265424,
            "ecmwfAifs": 0.071203,
            "icon": 0.217121,
            "ukmo": 0.119036,
            "meteofrance": 0.149956,
            "gfs": 0.065289,
            "gem": 0.056049,
            "jma": 0.055922
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.393145,
          "ecmwfAifs": 0.02,
          "icon": 0.138189,
          "ukmo": 0.182468,
          "meteofrance": 0.068403,
          "gfs": 0.02,
          "gem": 0.157795,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.8345,
        "spreadScale": 0.5454,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23831,
            "ecmwfAifs": 0.07797,
            "icon": 0.226026,
            "ukmo": 0.122944,
            "meteofrance": 0.162835,
            "gfs": 0.064523,
            "gem": 0.050425,
            "jma": 0.056967
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.471259,
          "ecmwfAifs": 0.056265,
          "icon": 0.096425,
          "ukmo": 0.151778,
          "meteofrance": 0.049584,
          "gfs": 0.022305,
          "gem": 0.132384,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.703,
        "spreadScale": 0.6187,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23831,
            "ecmwfAifs": 0.07797,
            "icon": 0.226026,
            "ukmo": 0.122944,
            "meteofrance": 0.162835,
            "gfs": 0.064523,
            "gem": 0.050425,
            "jma": 0.056967
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.383573,
          "ecmwfAifs": 0.02,
          "icon": 0.113288,
          "ukmo": 0.155194,
          "meteofrance": 0.020171,
          "gfs": 0.02,
          "gem": 0.267774,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.7428,
        "spreadScale": 0.3635,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255179,
            "ecmwfAifs": 0.076743,
            "icon": 0.216205,
            "ukmo": 0.118952,
            "meteofrance": 0.151318,
            "gfs": 0.067575,
            "gem": 0.058099,
            "jma": 0.055929
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.422707,
          "ecmwfAifs": 0.043625,
          "icon": 0.083627,
          "ukmo": 0.160126,
          "meteofrance": 0.051064,
          "gfs": 0.02,
          "gem": 0.198851,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.3216,
        "spreadScale": 0.5011,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255179,
            "ecmwfAifs": 0.076743,
            "icon": 0.216205,
            "ukmo": 0.118952,
            "meteofrance": 0.151318,
            "gfs": 0.067575,
            "gem": 0.058099,
            "jma": 0.055929
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.401699,
          "ecmwfAifs": 0.124087,
          "icon": 0.04111,
          "ukmo": 0.087115,
          "meteofrance": 0.116914,
          "gfs": 0.02,
          "gem": 0.189075,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.2705,
        "spreadScale": 0.6011,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.419632,
          "ecmwfAifs": 0.13712,
          "icon": 0.047284,
          "ukmo": 0.092902,
          "meteofrance": 0.096767,
          "gfs": 0.02,
          "gem": 0.166295,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.2705,
        "spreadScale": 0.6011,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.437566,
          "ecmwfAifs": 0.150153,
          "icon": 0.053458,
          "ukmo": 0.098689,
          "meteofrance": 0.076619,
          "gfs": 0.02,
          "gem": 0.143515,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.1509,
        "spreadScale": 0.6737,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.404687,
          "ecmwfAifs": 0.02,
          "icon": 0.11742,
          "ukmo": 0.125125,
          "meteofrance": 0.075356,
          "gfs": 0.02,
          "gem": 0.217412,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.062,
        "spreadScale": 0.4953,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.444908,
          "ecmwfAifs": 0.027714,
          "icon": 0.120248,
          "ukmo": 0.118309,
          "meteofrance": 0.063849,
          "gfs": 0.02,
          "gem": 0.184972,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.062,
        "spreadScale": 0.4953,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.485128,
          "ecmwfAifs": 0.035428,
          "icon": 0.123075,
          "ukmo": 0.111494,
          "meteofrance": 0.052342,
          "gfs": 0.02,
          "gem": 0.152533,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.816,
        "spreadScale": 0.6351,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.393145,
          "ecmwfAifs": 0.02,
          "icon": 0.138189,
          "ukmo": 0.182468,
          "meteofrance": 0.068403,
          "gfs": 0.02,
          "gem": 0.157795,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.8345,
        "spreadScale": 0.5454,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.432202,
          "ecmwfAifs": 0.038133,
          "icon": 0.117307,
          "ukmo": 0.167123,
          "meteofrance": 0.058994,
          "gfs": 0.021152,
          "gem": 0.145089,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.8345,
        "spreadScale": 0.5454,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.471259,
          "ecmwfAifs": 0.056265,
          "icon": 0.096425,
          "ukmo": 0.151778,
          "meteofrance": 0.049584,
          "gfs": 0.022305,
          "gem": 0.132384,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.703,
        "spreadScale": 0.6187,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.383573,
          "ecmwfAifs": 0.02,
          "icon": 0.113288,
          "ukmo": 0.155194,
          "meteofrance": 0.020171,
          "gfs": 0.02,
          "gem": 0.267774,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.7428,
        "spreadScale": 0.3635,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.403139,
          "ecmwfAifs": 0.031813,
          "icon": 0.098458,
          "ukmo": 0.15766,
          "meteofrance": 0.035618,
          "gfs": 0.02,
          "gem": 0.233312,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.7428,
        "spreadScale": 0.3635,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.422707,
          "ecmwfAifs": 0.043625,
          "icon": 0.083627,
          "ukmo": 0.160126,
          "meteofrance": 0.051064,
          "gfs": 0.02,
          "gem": 0.198851,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 1.3216,
        "spreadScale": 0.5011,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.26921,
        "ecmwfAifs": 0.086158,
        "icon": 0.211476,
        "ukmo": 0.112426,
        "meteofrance": 0.147423,
        "gfs": 0.064517,
        "gem": 0.05539,
        "jma": 0.0534
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.265424,
        "ecmwfAifs": 0.071203,
        "icon": 0.217121,
        "ukmo": 0.119036,
        "meteofrance": 0.149956,
        "gfs": 0.065289,
        "gem": 0.056049,
        "jma": 0.055922
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.23831,
        "ecmwfAifs": 0.07797,
        "icon": 0.226026,
        "ukmo": 0.122944,
        "meteofrance": 0.162835,
        "gfs": 0.064523,
        "gem": 0.050425,
        "jma": 0.056967
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.255179,
        "ecmwfAifs": 0.076743,
        "icon": 0.216205,
        "ukmo": 0.118952,
        "meteofrance": 0.151318,
        "gfs": 0.067575,
        "gem": 0.058099,
        "jma": 0.055929
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.258945,
    "ecmwfAifs": 0.067649,
    "icon": 0.239182,
    "ukmo": 0.155717,
    "meteofrance": 0.105231,
    "gfs": 0.09811,
    "gem": 0.037583,
    "jma": 0.037583
  },
  "pressureWeights": {
    "ecmwfIfs": 0.432442,
    "ecmwfAifs": 0.127386,
    "icon": 0.126983,
    "ukmo": 0.145416,
    "meteofrance": 0.066898,
    "gfs": 0.034289,
    "gem": 0.033293,
    "jma": 0.033293
  }
} as const;

export default PROVINCE_CALIBRATION_TR_62;
