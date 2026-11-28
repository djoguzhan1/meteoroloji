import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_01: ProvinceCalibrationBundle = {
  "provinceCode": "TR-01",
  "provinceName": "Adana",
  "plateNumber": 1,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17352",
  "stationLat": 36.9833,
  "stationLon": 35.3,
  "stationElevationM": 20,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17439,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.064155,
          "icon": 0.790986,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.044859,
          "jma": 0.02
        },
        "intercept": 0.18,
        "betaDrivers": [
          0.098,
          -0.1404,
          -0.2765,
          -0.2064,
          0.1153,
          -0.291
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8174,
        "spreadScale": 0.31,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246386,
            "ecmwfAifs": 0.089586,
            "icon": 0.217202,
            "ukmo": 0.119223,
            "meteofrance": 0.146414,
            "gfs": 0.060979,
            "gem": 0.06114,
            "jma": 0.05907
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9568,
          "logisticSlope": 3.806,
          "wetFractionWeight": 2.6646,
          "powerEta": 0.68,
          "rawBrier": 0.04863,
          "calibratedBrier": 0.04709
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.5198,
          "rawIfsRmseC": 1.8305,
          "rawEqualMaeC": 1.1451,
          "rawEqualRmseC": 1.4136,
          "cvSimplexMaeC": 0.894,
          "cvCalibratedMaeC": 0.8627,
          "cvCalibratedRmseC": 1.1428
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.103185,
          "ecmwfAifs": 0.312077,
          "icon": 0.406693,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.098045,
          "jma": 0.02
        },
        "intercept": 0.2988,
        "betaDrivers": [
          0.0124,
          -0.1485,
          -0.1406,
          -0.0698,
          0.0501,
          -0.147
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9097,
        "spreadScale": 0.3249,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313339,
            "ecmwfAifs": 0.237683,
            "icon": 0.133351,
            "ukmo": 0.106175,
            "meteofrance": 0.044143,
            "gfs": 0.058831,
            "gem": 0.058987,
            "jma": 0.047491
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.981,
          "logisticSlope": 3.839,
          "wetFractionWeight": 2.6527,
          "powerEta": 0.68,
          "rawBrier": 0.04863,
          "calibratedBrier": 0.04533
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.5198,
          "rawIfsRmseC": 1.8305,
          "rawEqualMaeC": 1.1451,
          "rawEqualRmseC": 1.4136,
          "cvSimplexMaeC": 0.9728,
          "cvCalibratedMaeC": 0.9111,
          "cvCalibratedRmseC": 1.1924
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.290803,
          "icon": 0.426915,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.137255,
          "gem": 0.065027,
          "jma": 0.02
        },
        "intercept": 0.0557,
        "betaDrivers": [
          0.0716,
          -0.1775,
          0.0321,
          -0.3806,
          -0.1115,
          0.0301
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8146,
        "spreadScale": 0.3786,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247717,
            "ecmwfAifs": 0.081209,
            "icon": 0.224992,
            "ukmo": 0.115743,
            "meteofrance": 0.149276,
            "gfs": 0.066582,
            "gem": 0.058571,
            "jma": 0.05591
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4674,
          "logisticSlope": 2.339,
          "wetFractionWeight": 3.0749,
          "powerEta": 0.68,
          "rawBrier": 0.0687,
          "calibratedBrier": 0.0613
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.48,
          "rawIfsRmseC": 1.8645,
          "rawEqualMaeC": 1.0243,
          "rawEqualRmseC": 1.3135,
          "cvSimplexMaeC": 0.9354,
          "cvCalibratedMaeC": 0.9221,
          "cvCalibratedRmseC": 1.2123
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.134217,
          "ecmwfAifs": 0.344995,
          "icon": 0.264292,
          "ukmo": 0.027176,
          "meteofrance": 0.02,
          "gfs": 0.097204,
          "gem": 0.092116,
          "jma": 0.02
        },
        "intercept": 0.1615,
        "betaDrivers": [
          0.0331,
          -0.1483,
          0.0128,
          -0.1869,
          -0.0494,
          0.0138
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7656,
        "spreadScale": 0.4306,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320936,
            "ecmwfAifs": 0.219496,
            "icon": 0.140722,
            "ukmo": 0.105008,
            "meteofrance": 0.045037,
            "gfs": 0.065441,
            "gem": 0.057567,
            "jma": 0.045793
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5629,
          "logisticSlope": 2.419,
          "wetFractionWeight": 3.2802,
          "powerEta": 0.68,
          "rawBrier": 0.0687,
          "calibratedBrier": 0.05912
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.48,
          "rawIfsRmseC": 1.8645,
          "rawEqualMaeC": 1.0243,
          "rawEqualRmseC": 1.3135,
          "cvSimplexMaeC": 0.9605,
          "cvCalibratedMaeC": 0.94,
          "cvCalibratedRmseC": 1.2277
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.234054,
          "ecmwfAifs": 0.394959,
          "icon": 0.065298,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.125384,
          "gem": 0.105865,
          "jma": 0.03444
        },
        "intercept": -0.3098,
        "betaDrivers": [
          0.2134,
          0.0826,
          0.4153,
          -0.4206,
          -0.2206,
          0.1243
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.8994,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.221629,
            "ecmwfAifs": 0.080718,
            "icon": 0.228839,
            "ukmo": 0.131951,
            "meteofrance": 0.153529,
            "gfs": 0.066437,
            "gem": 0.063912,
            "jma": 0.052985
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9426,
          "logisticSlope": 3.4085,
          "wetFractionWeight": 2.8004,
          "powerEta": 0.68,
          "rawBrier": 0.01248,
          "calibratedBrier": 0.01012
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0435,
          "rawIfsRmseC": 1.3789,
          "rawEqualMaeC": 0.9146,
          "rawEqualRmseC": 1.2045,
          "cvSimplexMaeC": 0.8724,
          "cvCalibratedMaeC": 0.765,
          "cvCalibratedRmseC": 1.0367
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.286007,
          "ecmwfAifs": 0.366275,
          "icon": 0.113567,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.086388,
          "gem": 0.073258,
          "jma": 0.034505
        },
        "intercept": -0.2977,
        "betaDrivers": [
          0.1509,
          0.0643,
          0.1435,
          -0.1712,
          -0.1008,
          0.0833
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.8485,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.291788,
            "ecmwfAifs": 0.221701,
            "icon": 0.145445,
            "ukmo": 0.121651,
            "meteofrance": 0.045126,
            "gfs": 0.066355,
            "gem": 0.063834,
            "jma": 0.0441
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9979,
          "logisticSlope": 3.6221,
          "wetFractionWeight": 3.1081,
          "powerEta": 0.68,
          "rawBrier": 0.01248,
          "calibratedBrier": 0.01005
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0435,
          "rawIfsRmseC": 1.3789,
          "rawEqualMaeC": 0.9146,
          "rawEqualRmseC": 1.2045,
          "cvSimplexMaeC": 0.8536,
          "cvCalibratedMaeC": 0.7712,
          "cvCalibratedRmseC": 1.0384
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.123722,
          "ecmwfAifs": 0.106047,
          "icon": 0.553064,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.034102,
          "gem": 0.123065,
          "jma": 0.02
        },
        "intercept": -0.0276,
        "betaDrivers": [
          0.2765,
          -0.3481,
          0.0116,
          -0.4288,
          -0.1417,
          0.0847
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0835,
        "spreadScale": 0.5322,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24479,
            "ecmwfAifs": 0.084096,
            "icon": 0.226714,
            "ukmo": 0.118062,
            "meteofrance": 0.144342,
            "gfs": 0.063964,
            "gem": 0.061656,
            "jma": 0.056376
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3365,
          "logisticSlope": 2.4995,
          "wetFractionWeight": 4.5497,
          "powerEta": 0.68,
          "rawBrier": 0.03478,
          "calibratedBrier": 0.02907
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.3341,
          "rawIfsRmseC": 1.7137,
          "rawEqualMaeC": 1.2717,
          "rawEqualRmseC": 1.6211,
          "cvSimplexMaeC": 1.1033,
          "cvCalibratedMaeC": 1.0609,
          "cvCalibratedRmseC": 1.4048
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.258354,
          "ecmwfAifs": 0.236534,
          "icon": 0.259925,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.045061,
          "gem": 0.140126,
          "jma": 0.02
        },
        "intercept": -0.0141,
        "betaDrivers": [
          0.1749,
          -0.2548,
          -0.0032,
          -0.222,
          -0.0567,
          0.0308
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2183,
        "spreadScale": 0.4953,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314839,
            "ecmwfAifs": 0.225646,
            "icon": 0.140767,
            "ukmo": 0.106332,
            "meteofrance": 0.044011,
            "gfs": 0.06241,
            "gem": 0.060157,
            "jma": 0.045838
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4118,
          "logisticSlope": 2.7795,
          "wetFractionWeight": 4.2665,
          "powerEta": 0.68,
          "rawBrier": 0.03478,
          "calibratedBrier": 0.02837
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.3341,
          "rawIfsRmseC": 1.7137,
          "rawEqualMaeC": 1.2717,
          "rawEqualRmseC": 1.6211,
          "cvSimplexMaeC": 1.1241,
          "cvCalibratedMaeC": 1.0908,
          "cvCalibratedRmseC": 1.4296
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.064155,
          "icon": 0.790986,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.044859,
          "jma": 0.02
        },
        "interceptC": 0.18,
        "diurnalHarmonicsC": [
          0.098,
          -0.1404,
          0,
          0
        ],
        "driverBetasC": [
          -0.2765,
          -0.291,
          -0.2064,
          0.1153
        ],
        "spreadBaseC2": 0.8174,
        "spreadScale": 0.31,
        "cvMaeC": 0.8627,
        "cvRmseC": 1.1428,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.061593,
          "ecmwfAifs": 0.188116,
          "icon": 0.598839,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.071452,
          "jma": 0.02
        },
        "interceptC": 0.2394,
        "diurnalHarmonicsC": [
          0.0552,
          -0.1444,
          0,
          0
        ],
        "driverBetasC": [
          -0.2086,
          -0.219,
          -0.1381,
          0.0827
        ],
        "spreadBaseC2": 0.8636,
        "spreadScale": 0.3175,
        "cvMaeC": 0.8869,
        "cvRmseC": 1.1676,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.103185,
          "ecmwfAifs": 0.312077,
          "icon": 0.406693,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.098045,
          "jma": 0.02
        },
        "interceptC": 0.2988,
        "diurnalHarmonicsC": [
          0.0124,
          -0.1485,
          0,
          0
        ],
        "driverBetasC": [
          -0.1406,
          -0.147,
          -0.0698,
          0.0501
        ],
        "spreadBaseC2": 0.9097,
        "spreadScale": 0.3249,
        "cvMaeC": 0.9111,
        "cvRmseC": 1.1924,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.290803,
          "icon": 0.426915,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.137255,
          "gem": 0.065027,
          "jma": 0.02
        },
        "interceptC": 0.0557,
        "diurnalHarmonicsC": [
          0.0716,
          -0.1775,
          0,
          0
        ],
        "driverBetasC": [
          0.0321,
          0.0301,
          -0.3806,
          -0.1115
        ],
        "spreadBaseC2": 0.8146,
        "spreadScale": 0.3786,
        "cvMaeC": 0.9221,
        "cvRmseC": 1.2123,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.077109,
          "ecmwfAifs": 0.317899,
          "icon": 0.345603,
          "ukmo": 0.023588,
          "meteofrance": 0.02,
          "gfs": 0.117229,
          "gem": 0.078572,
          "jma": 0.02
        },
        "interceptC": 0.1086,
        "diurnalHarmonicsC": [
          0.0523,
          -0.1629,
          0,
          0
        ],
        "driverBetasC": [
          0.0224,
          0.0219,
          -0.2838,
          -0.0804
        ],
        "spreadBaseC2": 0.7901,
        "spreadScale": 0.4046,
        "cvMaeC": 0.931,
        "cvRmseC": 1.22,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.134217,
          "ecmwfAifs": 0.344995,
          "icon": 0.264292,
          "ukmo": 0.027176,
          "meteofrance": 0.02,
          "gfs": 0.097204,
          "gem": 0.092116,
          "jma": 0.02
        },
        "interceptC": 0.1615,
        "diurnalHarmonicsC": [
          0.0331,
          -0.1483,
          0,
          0
        ],
        "driverBetasC": [
          0.0128,
          0.0138,
          -0.1869,
          -0.0494
        ],
        "spreadBaseC2": 0.7656,
        "spreadScale": 0.4306,
        "cvMaeC": 0.94,
        "cvRmseC": 1.2277,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.234054,
          "ecmwfAifs": 0.394959,
          "icon": 0.065298,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.125384,
          "gem": 0.105865,
          "jma": 0.03444
        },
        "interceptC": -0.3098,
        "diurnalHarmonicsC": [
          0.2134,
          0.0826,
          0,
          0
        ],
        "driverBetasC": [
          0.4153,
          0.1243,
          -0.4206,
          -0.2206
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.8994,
        "cvMaeC": 0.765,
        "cvRmseC": 1.0367,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.26003,
          "ecmwfAifs": 0.380616,
          "icon": 0.089433,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.105886,
          "gem": 0.089562,
          "jma": 0.034473
        },
        "interceptC": -0.3038,
        "diurnalHarmonicsC": [
          0.1822,
          0.0735,
          0,
          0
        ],
        "driverBetasC": [
          0.2794,
          0.1038,
          -0.2959,
          -0.1607
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.874,
        "cvMaeC": 0.7681,
        "cvRmseC": 1.0375,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.286007,
          "ecmwfAifs": 0.366275,
          "icon": 0.113567,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.086388,
          "gem": 0.073258,
          "jma": 0.034505
        },
        "interceptC": -0.2977,
        "diurnalHarmonicsC": [
          0.1509,
          0.0643,
          0,
          0
        ],
        "driverBetasC": [
          0.1435,
          0.0833,
          -0.1712,
          -0.1008
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.8485,
        "cvMaeC": 0.7712,
        "cvRmseC": 1.0384,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.123722,
          "ecmwfAifs": 0.106047,
          "icon": 0.553064,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.034102,
          "gem": 0.123065,
          "jma": 0.02
        },
        "interceptC": -0.0276,
        "diurnalHarmonicsC": [
          0.2765,
          -0.3481,
          0,
          0
        ],
        "driverBetasC": [
          0.0116,
          0.0847,
          -0.4288,
          -0.1417
        ],
        "spreadBaseC2": 1.0835,
        "spreadScale": 0.5322,
        "cvMaeC": 1.0609,
        "cvRmseC": 1.4048,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.191037,
          "ecmwfAifs": 0.171291,
          "icon": 0.406494,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.039582,
          "gem": 0.131596,
          "jma": 0.02
        },
        "interceptC": -0.0209,
        "diurnalHarmonicsC": [
          0.2257,
          -0.3014,
          0,
          0
        ],
        "driverBetasC": [
          0.0042,
          0.0577,
          -0.3254,
          -0.0992
        ],
        "spreadBaseC2": 1.1509,
        "spreadScale": 0.5138,
        "cvMaeC": 1.0758,
        "cvRmseC": 1.4172,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.258354,
          "ecmwfAifs": 0.236534,
          "icon": 0.259925,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.045061,
          "gem": 0.140126,
          "jma": 0.02
        },
        "interceptC": -0.0141,
        "diurnalHarmonicsC": [
          0.1749,
          -0.2548,
          0,
          0
        ],
        "driverBetasC": [
          -0.0032,
          0.0308,
          -0.222,
          -0.0567
        ],
        "spreadBaseC2": 1.2183,
        "spreadScale": 0.4953,
        "cvMaeC": 1.0908,
        "cvRmseC": 1.4296,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.246386,
        "ecmwfAifs": 0.089586,
        "icon": 0.217202,
        "ukmo": 0.119223,
        "meteofrance": 0.146414,
        "gfs": 0.060979,
        "gem": 0.06114,
        "jma": 0.05907
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.247717,
        "ecmwfAifs": 0.081209,
        "icon": 0.224992,
        "ukmo": 0.115743,
        "meteofrance": 0.149276,
        "gfs": 0.066582,
        "gem": 0.058571,
        "jma": 0.05591
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.221629,
        "ecmwfAifs": 0.080718,
        "icon": 0.228839,
        "ukmo": 0.131951,
        "meteofrance": 0.153529,
        "gfs": 0.066437,
        "gem": 0.063912,
        "jma": 0.052985
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.24479,
        "ecmwfAifs": 0.084096,
        "icon": 0.226714,
        "ukmo": 0.118062,
        "meteofrance": 0.144342,
        "gfs": 0.063964,
        "gem": 0.061656,
        "jma": 0.056376
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.198247,
    "ecmwfAifs": 0.070048,
    "icon": 0.270037,
    "ukmo": 0.169889,
    "meteofrance": 0.108964,
    "gfs": 0.104983,
    "gem": 0.038916,
    "jma": 0.038916
  },
  "pressureWeights": {
    "ecmwfIfs": 0.303077,
    "ecmwfAifs": 0.150419,
    "icon": 0.133744,
    "ukmo": 0.177267,
    "meteofrance": 0.079168,
    "gfs": 0.077157,
    "gem": 0.039584,
    "jma": 0.039584
  }
} as const;

export default PROVINCE_CALIBRATION_TR_01;
