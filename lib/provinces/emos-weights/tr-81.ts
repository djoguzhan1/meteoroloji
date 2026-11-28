import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_81: ProvinceCalibrationBundle = {
  "provinceCode": "TR-81",
  "provinceName": "Düzce",
  "plateNumber": 81,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 40.8438,
  "stationLon": 31.1565,
  "stationElevationM": 146,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-54",
    "TR-14",
    "TR-67"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-54",
      "provinceName": "Sakarya",
      "wmoStationId": "17069",
      "weight": 0.5
    },
    {
      "provinceCode": "TR-14",
      "provinceName": "Bolu",
      "wmoStationId": "17070",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-67",
      "provinceName": "Zonguldak",
      "wmoStationId": "17022",
      "weight": 0.15
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.399916,
          "ecmwfAifs": 0.104002,
          "icon": 0.177342,
          "ukmo": 0.107938,
          "meteofrance": 0.054276,
          "gfs": 0.074054,
          "gem": 0.062472,
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
        "spreadBaseC2": 0.6252,
        "spreadScale": 0.412,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252237,
            "ecmwfAifs": 0.085084,
            "icon": 0.212934,
            "ukmo": 0.11359,
            "meteofrance": 0.1582,
            "gfs": 0.065541,
            "gem": 0.057385,
            "jma": 0.055029
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
          "ecmwfIfs": 0.39014,
          "ecmwfAifs": 0.154661,
          "icon": 0.128024,
          "ukmo": 0.102909,
          "meteofrance": 0.047565,
          "gfs": 0.067568,
          "gem": 0.083916,
          "jma": 0.025217
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
        "spreadBaseC2": 0.6259,
        "spreadScale": 0.483,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252237,
            "ecmwfAifs": 0.085084,
            "icon": 0.212934,
            "ukmo": 0.11359,
            "meteofrance": 0.1582,
            "gfs": 0.065541,
            "gem": 0.057385,
            "jma": 0.055029
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
          "ecmwfIfs": 0.409462,
          "ecmwfAifs": 0.029968,
          "icon": 0.171393,
          "ukmo": 0.154908,
          "meteofrance": 0.114862,
          "gfs": 0.057524,
          "gem": 0.041883,
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
        "spreadBaseC2": 0.8347,
        "spreadScale": 0.3944,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251718,
            "ecmwfAifs": 0.070974,
            "icon": 0.217858,
            "ukmo": 0.119309,
            "meteofrance": 0.158141,
            "gfs": 0.066458,
            "gem": 0.06006,
            "jma": 0.055482
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
          "ecmwfIfs": 0.413912,
          "ecmwfAifs": 0.068167,
          "icon": 0.152886,
          "ukmo": 0.125803,
          "meteofrance": 0.082558,
          "gfs": 0.058557,
          "gem": 0.072521,
          "jma": 0.025596
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
        "spreadBaseC2": 0.7858,
        "spreadScale": 0.4898,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251718,
            "ecmwfAifs": 0.070974,
            "icon": 0.217858,
            "ukmo": 0.119309,
            "meteofrance": 0.158141,
            "gfs": 0.066458,
            "gem": 0.06006,
            "jma": 0.055482
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
          "ecmwfIfs": 0.409309,
          "ecmwfAifs": 0.075102,
          "icon": 0.066764,
          "ukmo": 0.143732,
          "meteofrance": 0.197595,
          "gfs": 0.038347,
          "gem": 0.049151,
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
        "spreadBaseC2": 0.3956,
        "spreadScale": 0.3875,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249426,
            "ecmwfAifs": 0.079539,
            "icon": 0.215667,
            "ukmo": 0.121294,
            "meteofrance": 0.154974,
            "gfs": 0.065961,
            "gem": 0.058004,
            "jma": 0.055135
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
          "ecmwfIfs": 0.429321,
          "ecmwfAifs": 0.09162,
          "icon": 0.074355,
          "ukmo": 0.127024,
          "meteofrance": 0.162334,
          "gfs": 0.037904,
          "gem": 0.0571,
          "jma": 0.020342
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
        "spreadBaseC2": 0.3725,
        "spreadScale": 0.4384,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249426,
            "ecmwfAifs": 0.079539,
            "icon": 0.215667,
            "ukmo": 0.121294,
            "meteofrance": 0.154974,
            "gfs": 0.065961,
            "gem": 0.058004,
            "jma": 0.055135
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
          "ecmwfIfs": 0.415848,
          "ecmwfAifs": 0.032988,
          "icon": 0.077295,
          "ukmo": 0.157773,
          "meteofrance": 0.137948,
          "gfs": 0.100729,
          "gem": 0.057419,
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
        "spreadBaseC2": 0.4325,
        "spreadScale": 0.5121,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259389,
            "ecmwfAifs": 0.083217,
            "icon": 0.207611,
            "ukmo": 0.112546,
            "meteofrance": 0.149793,
            "gfs": 0.06823,
            "gem": 0.060978,
            "jma": 0.058236
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
          "ecmwfIfs": 0.42376,
          "ecmwfAifs": 0.091834,
          "icon": 0.089002,
          "ukmo": 0.139832,
          "meteofrance": 0.082801,
          "gfs": 0.085555,
          "gem": 0.061043,
          "jma": 0.026173
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
        "spreadBaseC2": 0.4616,
        "spreadScale": 0.5789,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259389,
            "ecmwfAifs": 0.083217,
            "icon": 0.207611,
            "ukmo": 0.112546,
            "meteofrance": 0.149793,
            "gfs": 0.06823,
            "gem": 0.060978,
            "jma": 0.058236
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
          "ecmwfIfs": 0.399916,
          "ecmwfAifs": 0.104002,
          "icon": 0.177342,
          "ukmo": 0.107938,
          "meteofrance": 0.054276,
          "gfs": 0.074054,
          "gem": 0.062472,
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
        "spreadBaseC2": 0.6252,
        "spreadScale": 0.412,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.395027,
          "ecmwfAifs": 0.129331,
          "icon": 0.152683,
          "ukmo": 0.105424,
          "meteofrance": 0.050921,
          "gfs": 0.070811,
          "gem": 0.073194,
          "jma": 0.022609
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
        "spreadBaseC2": 0.6252,
        "spreadScale": 0.412,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.39014,
          "ecmwfAifs": 0.154661,
          "icon": 0.128024,
          "ukmo": 0.102909,
          "meteofrance": 0.047565,
          "gfs": 0.067568,
          "gem": 0.083916,
          "jma": 0.025217
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
        "spreadBaseC2": 0.6259,
        "spreadScale": 0.483,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.409462,
          "ecmwfAifs": 0.029968,
          "icon": 0.171393,
          "ukmo": 0.154908,
          "meteofrance": 0.114862,
          "gfs": 0.057524,
          "gem": 0.041883,
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
        "spreadBaseC2": 0.8347,
        "spreadScale": 0.3944,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.411686,
          "ecmwfAifs": 0.049068,
          "icon": 0.162139,
          "ukmo": 0.140356,
          "meteofrance": 0.09871,
          "gfs": 0.058041,
          "gem": 0.057202,
          "jma": 0.022798
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
        "spreadBaseC2": 0.8347,
        "spreadScale": 0.3944,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.413912,
          "ecmwfAifs": 0.068167,
          "icon": 0.152886,
          "ukmo": 0.125803,
          "meteofrance": 0.082558,
          "gfs": 0.058557,
          "gem": 0.072521,
          "jma": 0.025596
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
        "spreadBaseC2": 0.7858,
        "spreadScale": 0.4898,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.409309,
          "ecmwfAifs": 0.075102,
          "icon": 0.066764,
          "ukmo": 0.143732,
          "meteofrance": 0.197595,
          "gfs": 0.038347,
          "gem": 0.049151,
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
        "spreadBaseC2": 0.3956,
        "spreadScale": 0.3875,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.419314,
          "ecmwfAifs": 0.083361,
          "icon": 0.07056,
          "ukmo": 0.135378,
          "meteofrance": 0.179964,
          "gfs": 0.038126,
          "gem": 0.053126,
          "jma": 0.020171
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
        "spreadBaseC2": 0.3956,
        "spreadScale": 0.3875,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.429321,
          "ecmwfAifs": 0.09162,
          "icon": 0.074355,
          "ukmo": 0.127024,
          "meteofrance": 0.162334,
          "gfs": 0.037904,
          "gem": 0.0571,
          "jma": 0.020342
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
        "spreadBaseC2": 0.3725,
        "spreadScale": 0.4384,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.415848,
          "ecmwfAifs": 0.032988,
          "icon": 0.077295,
          "ukmo": 0.157773,
          "meteofrance": 0.137948,
          "gfs": 0.100729,
          "gem": 0.057419,
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
        "spreadBaseC2": 0.4325,
        "spreadScale": 0.5121,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.419805,
          "ecmwfAifs": 0.062411,
          "icon": 0.083148,
          "ukmo": 0.148803,
          "meteofrance": 0.110374,
          "gfs": 0.093142,
          "gem": 0.059231,
          "jma": 0.023086
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
        "spreadBaseC2": 0.4325,
        "spreadScale": 0.5121,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.42376,
          "ecmwfAifs": 0.091834,
          "icon": 0.089002,
          "ukmo": 0.139832,
          "meteofrance": 0.082801,
          "gfs": 0.085555,
          "gem": 0.061043,
          "jma": 0.026173
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
        "spreadBaseC2": 0.4616,
        "spreadScale": 0.5789,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.252237,
        "ecmwfAifs": 0.085084,
        "icon": 0.212934,
        "ukmo": 0.11359,
        "meteofrance": 0.1582,
        "gfs": 0.065541,
        "gem": 0.057385,
        "jma": 0.055029
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.251718,
        "ecmwfAifs": 0.070974,
        "icon": 0.217858,
        "ukmo": 0.119309,
        "meteofrance": 0.158141,
        "gfs": 0.066458,
        "gem": 0.06006,
        "jma": 0.055482
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.249426,
        "ecmwfAifs": 0.079539,
        "icon": 0.215667,
        "ukmo": 0.121294,
        "meteofrance": 0.154974,
        "gfs": 0.065961,
        "gem": 0.058004,
        "jma": 0.055135
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.259389,
        "ecmwfAifs": 0.083217,
        "icon": 0.207611,
        "ukmo": 0.112546,
        "meteofrance": 0.149793,
        "gfs": 0.06823,
        "gem": 0.060978,
        "jma": 0.058236
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.242464,
    "ecmwfAifs": 0.070491,
    "icon": 0.240828,
    "ukmo": 0.173651,
    "meteofrance": 0.109653,
    "gfs": 0.084589,
    "gem": 0.039162,
    "jma": 0.039162
  },
  "pressureWeights": {
    "ecmwfIfs": 0.305116,
    "ecmwfAifs": 0.140583,
    "icon": 0.116059,
    "ukmo": 0.216742,
    "meteofrance": 0.073992,
    "gfs": 0.073518,
    "gem": 0.036995,
    "jma": 0.036995
  }
} as const;

export default PROVINCE_CALIBRATION_TR_81;
