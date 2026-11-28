import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_80: ProvinceCalibrationBundle = {
  "provinceCode": "TR-80",
  "provinceName": "Osmaniye",
  "plateNumber": 80,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 37.0742,
  "stationLon": 36.2478,
  "stationElevationM": 94,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-01",
    "TR-31",
    "TR-46"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-01",
      "provinceName": "Adana",
      "wmoStationId": "17352",
      "weight": 0.5
    },
    {
      "provinceCode": "TR-31",
      "provinceName": "Hatay",
      "wmoStationId": "LTDA0",
      "weight": 0.3
    },
    {
      "provinceCode": "TR-46",
      "provinceName": "Kahramanmaraş",
      "wmoStationId": "17255",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.042078,
          "icon": 0.522277,
          "ukmo": 0.074352,
          "meteofrance": 0.036413,
          "gfs": 0.02,
          "gem": 0.26488,
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
        "spreadBaseC2": 0.8915,
        "spreadScale": 0.5068,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243679,
            "ecmwfAifs": 0.089125,
            "icon": 0.218842,
            "ukmo": 0.119721,
            "meteofrance": 0.150892,
            "gfs": 0.062311,
            "gem": 0.05853,
            "jma": 0.0569
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
          "ecmwfIfs": 0.095756,
          "ecmwfAifs": 0.221686,
          "icon": 0.296281,
          "ukmo": 0.072423,
          "meteofrance": 0.032393,
          "gfs": 0.02,
          "gem": 0.241461,
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
        "spreadBaseC2": 0.8953,
        "spreadScale": 0.5223,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243679,
            "ecmwfAifs": 0.089125,
            "icon": 0.218842,
            "ukmo": 0.119721,
            "meteofrance": 0.150892,
            "gfs": 0.062311,
            "gem": 0.05853,
            "jma": 0.0569
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
          "ecmwfIfs": 0.045291,
          "ecmwfAifs": 0.274416,
          "icon": 0.325346,
          "ukmo": 0.032592,
          "meteofrance": 0.02,
          "gfs": 0.078628,
          "gem": 0.203727,
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
        "spreadBaseC2": 0.9364,
        "spreadScale": 0.5775,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245392,
            "ecmwfAifs": 0.077401,
            "icon": 0.222587,
            "ukmo": 0.119024,
            "meteofrance": 0.152405,
            "gfs": 0.066792,
            "gem": 0.058384,
            "jma": 0.058015
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
          "ecmwfIfs": 0.186947,
          "ecmwfAifs": 0.290255,
          "icon": 0.210053,
          "ukmo": 0.041799,
          "meteofrance": 0.025082,
          "gfs": 0.058602,
          "gem": 0.167262,
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
        "spreadBaseC2": 0.9212,
        "spreadScale": 0.5634,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245392,
            "ecmwfAifs": 0.077401,
            "icon": 0.222587,
            "ukmo": 0.119024,
            "meteofrance": 0.152405,
            "gfs": 0.066792,
            "gem": 0.058384,
            "jma": 0.058015
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
          "ecmwfIfs": 0.127027,
          "ecmwfAifs": 0.338023,
          "icon": 0.042649,
          "ukmo": 0.02,
          "meteofrance": 0.08981,
          "gfs": 0.072692,
          "gem": 0.282579,
          "jma": 0.02722
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
        "spreadBaseC2": 0.3872,
        "spreadScale": 0.8561,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.223552,
            "ecmwfAifs": 0.07804,
            "icon": 0.224644,
            "ukmo": 0.130809,
            "meteofrance": 0.157631,
            "gfs": 0.067883,
            "gem": 0.060623,
            "jma": 0.056818
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
          "ecmwfIfs": 0.217896,
          "ecmwfAifs": 0.334872,
          "icon": 0.091576,
          "ukmo": 0.02,
          "meteofrance": 0.067282,
          "gfs": 0.053194,
          "gem": 0.187927,
          "jma": 0.027253
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
        "spreadBaseC2": 0.448,
        "spreadScale": 0.7999,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.223552,
            "ecmwfAifs": 0.07804,
            "icon": 0.224644,
            "ukmo": 0.130809,
            "meteofrance": 0.157631,
            "gfs": 0.067883,
            "gem": 0.060623,
            "jma": 0.056818
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
          "ecmwfIfs": 0.071861,
          "ecmwfAifs": 0.075605,
          "icon": 0.452362,
          "ukmo": 0.050844,
          "meteofrance": 0.02,
          "gfs": 0.027051,
          "gem": 0.282277,
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
        "spreadBaseC2": 0.7694,
        "spreadScale": 0.875,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240129,
            "ecmwfAifs": 0.079366,
            "icon": 0.223094,
            "ukmo": 0.120917,
            "meteofrance": 0.153514,
            "gfs": 0.065376,
            "gem": 0.059667,
            "jma": 0.057937
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
          "ecmwfIfs": 0.171209,
          "ecmwfAifs": 0.178559,
          "icon": 0.244295,
          "ukmo": 0.061323,
          "meteofrance": 0.023385,
          "gfs": 0.03253,
          "gem": 0.268699,
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
        "spreadBaseC2": 0.7912,
        "spreadScale": 1.0465,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240129,
            "ecmwfAifs": 0.079366,
            "icon": 0.223094,
            "ukmo": 0.120917,
            "meteofrance": 0.153514,
            "gfs": 0.065376,
            "gem": 0.059667,
            "jma": 0.057937
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
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.042078,
          "icon": 0.522277,
          "ukmo": 0.074352,
          "meteofrance": 0.036413,
          "gfs": 0.02,
          "gem": 0.26488,
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
        "spreadBaseC2": 0.8915,
        "spreadScale": 0.5068,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.057878,
          "ecmwfAifs": 0.131882,
          "icon": 0.409279,
          "ukmo": 0.073387,
          "meteofrance": 0.034403,
          "gfs": 0.02,
          "gem": 0.253171,
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
        "spreadBaseC2": 0.8915,
        "spreadScale": 0.5068,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.095756,
          "ecmwfAifs": 0.221686,
          "icon": 0.296281,
          "ukmo": 0.072423,
          "meteofrance": 0.032393,
          "gfs": 0.02,
          "gem": 0.241461,
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
        "spreadBaseC2": 0.8953,
        "spreadScale": 0.5223,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.045291,
          "ecmwfAifs": 0.274416,
          "icon": 0.325346,
          "ukmo": 0.032592,
          "meteofrance": 0.02,
          "gfs": 0.078628,
          "gem": 0.203727,
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
        "spreadBaseC2": 0.9364,
        "spreadScale": 0.5775,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.116119,
          "ecmwfAifs": 0.282334,
          "icon": 0.2677,
          "ukmo": 0.037196,
          "meteofrance": 0.022541,
          "gfs": 0.068615,
          "gem": 0.185495,
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
        "spreadBaseC2": 0.9364,
        "spreadScale": 0.5775,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.186947,
          "ecmwfAifs": 0.290255,
          "icon": 0.210053,
          "ukmo": 0.041799,
          "meteofrance": 0.025082,
          "gfs": 0.058602,
          "gem": 0.167262,
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
        "spreadBaseC2": 0.9212,
        "spreadScale": 0.5634,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.127027,
          "ecmwfAifs": 0.338023,
          "icon": 0.042649,
          "ukmo": 0.02,
          "meteofrance": 0.08981,
          "gfs": 0.072692,
          "gem": 0.282579,
          "jma": 0.02722
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
        "spreadBaseC2": 0.3872,
        "spreadScale": 0.8561,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.172462,
          "ecmwfAifs": 0.336447,
          "icon": 0.067113,
          "ukmo": 0.02,
          "meteofrance": 0.078546,
          "gfs": 0.062943,
          "gem": 0.235253,
          "jma": 0.027236
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
        "spreadBaseC2": 0.3872,
        "spreadScale": 0.8561,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.217896,
          "ecmwfAifs": 0.334872,
          "icon": 0.091576,
          "ukmo": 0.02,
          "meteofrance": 0.067282,
          "gfs": 0.053194,
          "gem": 0.187927,
          "jma": 0.027253
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
        "spreadBaseC2": 0.448,
        "spreadScale": 0.7999,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.071861,
          "ecmwfAifs": 0.075605,
          "icon": 0.452362,
          "ukmo": 0.050844,
          "meteofrance": 0.02,
          "gfs": 0.027051,
          "gem": 0.282277,
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
        "spreadBaseC2": 0.7694,
        "spreadScale": 0.875,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.121535,
          "ecmwfAifs": 0.127082,
          "icon": 0.348329,
          "ukmo": 0.056084,
          "meteofrance": 0.021692,
          "gfs": 0.02979,
          "gem": 0.275488,
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
        "spreadBaseC2": 0.7694,
        "spreadScale": 0.875,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.171209,
          "ecmwfAifs": 0.178559,
          "icon": 0.244295,
          "ukmo": 0.061323,
          "meteofrance": 0.023385,
          "gfs": 0.03253,
          "gem": 0.268699,
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
        "spreadBaseC2": 0.7912,
        "spreadScale": 1.0465,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243679,
        "ecmwfAifs": 0.089125,
        "icon": 0.218842,
        "ukmo": 0.119721,
        "meteofrance": 0.150892,
        "gfs": 0.062311,
        "gem": 0.05853,
        "jma": 0.0569
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245392,
        "ecmwfAifs": 0.077401,
        "icon": 0.222587,
        "ukmo": 0.119024,
        "meteofrance": 0.152405,
        "gfs": 0.066792,
        "gem": 0.058384,
        "jma": 0.058015
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.223552,
        "ecmwfAifs": 0.07804,
        "icon": 0.224644,
        "ukmo": 0.130809,
        "meteofrance": 0.157631,
        "gfs": 0.067883,
        "gem": 0.060623,
        "jma": 0.056818
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.240129,
        "ecmwfAifs": 0.079366,
        "icon": 0.223094,
        "ukmo": 0.120917,
        "meteofrance": 0.153514,
        "gfs": 0.065376,
        "gem": 0.059667,
        "jma": 0.057937
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.199681,
    "ecmwfAifs": 0.06907,
    "icon": 0.271926,
    "ukmo": 0.169786,
    "meteofrance": 0.107442,
    "gfs": 0.105351,
    "gem": 0.038372,
    "jma": 0.038372
  },
  "pressureWeights": {
    "ecmwfIfs": 0.298625,
    "ecmwfAifs": 0.147266,
    "icon": 0.132381,
    "ukmo": 0.19294,
    "meteofrance": 0.077509,
    "gfs": 0.073771,
    "gem": 0.038754,
    "jma": 0.038754
  }
} as const;

export default PROVINCE_CALIBRATION_TR_80;
