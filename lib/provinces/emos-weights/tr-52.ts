import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_52: ProvinceCalibrationBundle = {
  "provinceCode": "TR-52",
  "provinceName": "Ordu",
  "plateNumber": 52,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 40.9839,
  "stationLon": 37.8764,
  "stationElevationM": 5,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-28",
    "TR-55"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-28",
      "provinceName": "Giresun",
      "wmoStationId": "17034",
      "weight": 0.55
    },
    {
      "provinceCode": "TR-55",
      "provinceName": "Samsun",
      "wmoStationId": "17030",
      "weight": 0.45
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.382356,
          "ecmwfAifs": 0.061348,
          "icon": 0.225524,
          "ukmo": 0.02,
          "meteofrance": 0.053609,
          "gfs": 0.081797,
          "gem": 0.065573,
          "jma": 0.109793
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
        "spreadBaseC2": 0.3435,
        "spreadScale": 0.1121,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251489,
            "ecmwfAifs": 0.083411,
            "icon": 0.218894,
            "ukmo": 0.11182,
            "meteofrance": 0.15868,
            "gfs": 0.065191,
            "gem": 0.055994,
            "jma": 0.054521
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
          "ecmwfIfs": 0.360795,
          "ecmwfAifs": 0.190189,
          "icon": 0.177641,
          "ukmo": 0.02,
          "meteofrance": 0.04898,
          "gfs": 0.060218,
          "gem": 0.040778,
          "jma": 0.101399
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
        "spreadBaseC2": 0.3333,
        "spreadScale": 0.1397,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251489,
            "ecmwfAifs": 0.083411,
            "icon": 0.218894,
            "ukmo": 0.11182,
            "meteofrance": 0.15868,
            "gfs": 0.065191,
            "gem": 0.055994,
            "jma": 0.054521
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
          "ecmwfIfs": 0.352589,
          "ecmwfAifs": 0.101213,
          "icon": 0.162373,
          "ukmo": 0.02,
          "meteofrance": 0.041699,
          "gfs": 0.045708,
          "gem": 0.053407,
          "jma": 0.223011
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
        "spreadBaseC2": 0.3253,
        "spreadScale": 0.1459,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258314,
            "ecmwfAifs": 0.069044,
            "icon": 0.219616,
            "ukmo": 0.120331,
            "meteofrance": 0.154606,
            "gfs": 0.062797,
            "gem": 0.058004,
            "jma": 0.057288
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
          "ecmwfIfs": 0.37288,
          "ecmwfAifs": 0.188685,
          "icon": 0.132713,
          "ukmo": 0.02,
          "meteofrance": 0.030712,
          "gfs": 0.039275,
          "gem": 0.0296,
          "jma": 0.186135
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
        "spreadBaseC2": 0.3056,
        "spreadScale": 0.1649,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258314,
            "ecmwfAifs": 0.069044,
            "icon": 0.219616,
            "ukmo": 0.120331,
            "meteofrance": 0.154606,
            "gfs": 0.062797,
            "gem": 0.058004,
            "jma": 0.057288
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
          "ecmwfIfs": 0.415722,
          "ecmwfAifs": 0.078777,
          "icon": 0.126911,
          "ukmo": 0.02,
          "meteofrance": 0.147343,
          "gfs": 0.083341,
          "gem": 0.035407,
          "jma": 0.092499
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
        "spreadBaseC2": 0.1606,
        "spreadScale": 0.1589,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256559,
            "ecmwfAifs": 0.078821,
            "icon": 0.213481,
            "ukmo": 0.118598,
            "meteofrance": 0.157055,
            "gfs": 0.065404,
            "gem": 0.05685,
            "jma": 0.053232
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
          "ecmwfIfs": 0.393166,
          "ecmwfAifs": 0.21227,
          "icon": 0.116749,
          "ukmo": 0.02,
          "meteofrance": 0.112831,
          "gfs": 0.057831,
          "gem": 0.02,
          "jma": 0.067153
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
        "spreadBaseC2": 0.1732,
        "spreadScale": 0.1649,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256559,
            "ecmwfAifs": 0.078821,
            "icon": 0.213481,
            "ukmo": 0.118598,
            "meteofrance": 0.157055,
            "gfs": 0.065404,
            "gem": 0.05685,
            "jma": 0.053232
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
          "ecmwfIfs": 0.434496,
          "ecmwfAifs": 0.053627,
          "icon": 0.199736,
          "ukmo": 0.02,
          "meteofrance": 0.088199,
          "gfs": 0.067925,
          "gem": 0.044212,
          "jma": 0.091805
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
        "spreadBaseC2": 0.2187,
        "spreadScale": 0.1504,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.263522,
            "ecmwfAifs": 0.077104,
            "icon": 0.203668,
            "ukmo": 0.121729,
            "meteofrance": 0.15385,
            "gfs": 0.069165,
            "gem": 0.057126,
            "jma": 0.053836
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
          "ecmwfIfs": 0.424388,
          "ecmwfAifs": 0.156496,
          "icon": 0.161632,
          "ukmo": 0.02,
          "meteofrance": 0.071207,
          "gfs": 0.050735,
          "gem": 0.03039,
          "jma": 0.085152
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
        "spreadBaseC2": 0.2175,
        "spreadScale": 0.1588,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.263522,
            "ecmwfAifs": 0.077104,
            "icon": 0.203668,
            "ukmo": 0.121729,
            "meteofrance": 0.15385,
            "gfs": 0.069165,
            "gem": 0.057126,
            "jma": 0.053836
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
          "ecmwfIfs": 0.382356,
          "ecmwfAifs": 0.061348,
          "icon": 0.225524,
          "ukmo": 0.02,
          "meteofrance": 0.053609,
          "gfs": 0.081797,
          "gem": 0.065573,
          "jma": 0.109793
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
        "spreadBaseC2": 0.3435,
        "spreadScale": 0.1121,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.371574,
          "ecmwfAifs": 0.125769,
          "icon": 0.201582,
          "ukmo": 0.02,
          "meteofrance": 0.051295,
          "gfs": 0.071008,
          "gem": 0.053176,
          "jma": 0.105596
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
        "spreadBaseC2": 0.3435,
        "spreadScale": 0.1121,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.360795,
          "ecmwfAifs": 0.190189,
          "icon": 0.177641,
          "ukmo": 0.02,
          "meteofrance": 0.04898,
          "gfs": 0.060218,
          "gem": 0.040778,
          "jma": 0.101399
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
        "spreadBaseC2": 0.3333,
        "spreadScale": 0.1397,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.352589,
          "ecmwfAifs": 0.101213,
          "icon": 0.162373,
          "ukmo": 0.02,
          "meteofrance": 0.041699,
          "gfs": 0.045708,
          "gem": 0.053407,
          "jma": 0.223011
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
        "spreadBaseC2": 0.3253,
        "spreadScale": 0.1459,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.362733,
          "ecmwfAifs": 0.144949,
          "icon": 0.147543,
          "ukmo": 0.02,
          "meteofrance": 0.036206,
          "gfs": 0.042492,
          "gem": 0.041504,
          "jma": 0.204573
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
        "spreadBaseC2": 0.3253,
        "spreadScale": 0.1459,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.37288,
          "ecmwfAifs": 0.188685,
          "icon": 0.132713,
          "ukmo": 0.02,
          "meteofrance": 0.030712,
          "gfs": 0.039275,
          "gem": 0.0296,
          "jma": 0.186135
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
        "spreadBaseC2": 0.3056,
        "spreadScale": 0.1649,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.415722,
          "ecmwfAifs": 0.078777,
          "icon": 0.126911,
          "ukmo": 0.02,
          "meteofrance": 0.147343,
          "gfs": 0.083341,
          "gem": 0.035407,
          "jma": 0.092499
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
        "spreadBaseC2": 0.1606,
        "spreadScale": 0.1589,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.404445,
          "ecmwfAifs": 0.145523,
          "icon": 0.12183,
          "ukmo": 0.02,
          "meteofrance": 0.130087,
          "gfs": 0.070586,
          "gem": 0.027703,
          "jma": 0.079826
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
        "spreadBaseC2": 0.1606,
        "spreadScale": 0.1589,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.393166,
          "ecmwfAifs": 0.21227,
          "icon": 0.116749,
          "ukmo": 0.02,
          "meteofrance": 0.112831,
          "gfs": 0.057831,
          "gem": 0.02,
          "jma": 0.067153
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
        "spreadBaseC2": 0.1732,
        "spreadScale": 0.1649,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.434496,
          "ecmwfAifs": 0.053627,
          "icon": 0.199736,
          "ukmo": 0.02,
          "meteofrance": 0.088199,
          "gfs": 0.067925,
          "gem": 0.044212,
          "jma": 0.091805
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
        "spreadBaseC2": 0.2187,
        "spreadScale": 0.1504,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.429441,
          "ecmwfAifs": 0.105062,
          "icon": 0.180684,
          "ukmo": 0.02,
          "meteofrance": 0.079703,
          "gfs": 0.05933,
          "gem": 0.037301,
          "jma": 0.088479
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
        "spreadBaseC2": 0.2187,
        "spreadScale": 0.1504,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.424388,
          "ecmwfAifs": 0.156496,
          "icon": 0.161632,
          "ukmo": 0.02,
          "meteofrance": 0.071207,
          "gfs": 0.050735,
          "gem": 0.03039,
          "jma": 0.085152
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
        "spreadBaseC2": 0.2175,
        "spreadScale": 0.1588,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.251489,
        "ecmwfAifs": 0.083411,
        "icon": 0.218894,
        "ukmo": 0.11182,
        "meteofrance": 0.15868,
        "gfs": 0.065191,
        "gem": 0.055994,
        "jma": 0.054521
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.258314,
        "ecmwfAifs": 0.069044,
        "icon": 0.219616,
        "ukmo": 0.120331,
        "meteofrance": 0.154606,
        "gfs": 0.062797,
        "gem": 0.058004,
        "jma": 0.057288
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.256559,
        "ecmwfAifs": 0.078821,
        "icon": 0.213481,
        "ukmo": 0.118598,
        "meteofrance": 0.157055,
        "gfs": 0.065404,
        "gem": 0.05685,
        "jma": 0.053232
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.263522,
        "ecmwfAifs": 0.077104,
        "icon": 0.203668,
        "ukmo": 0.121729,
        "meteofrance": 0.15385,
        "gfs": 0.069165,
        "gem": 0.057126,
        "jma": 0.053836
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.246723,
    "ecmwfAifs": 0.068702,
    "icon": 0.207613,
    "ukmo": 0.172626,
    "meteofrance": 0.106871,
    "gfs": 0.121129,
    "gem": 0.038168,
    "jma": 0.038168
  },
  "pressureWeights": {
    "ecmwfIfs": 0.347823,
    "ecmwfAifs": 0.145106,
    "icon": 0.128665,
    "ukmo": 0.150869,
    "meteofrance": 0.076371,
    "gfs": 0.074794,
    "gem": 0.038186,
    "jma": 0.038186
  }
} as const;

export default PROVINCE_CALIBRATION_TR_52;
