import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_24: ProvinceCalibrationBundle = {
  "provinceCode": "TR-24",
  "provinceName": "Erzincan",
  "plateNumber": 24,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17092",
  "stationLat": 39.7333,
  "stationLon": 39.5,
  "stationElevationM": 1156,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17439,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.317391,
          "icon": 0.02,
          "ukmo": 0.165278,
          "meteofrance": 0.073152,
          "gfs": 0.02,
          "gem": 0.364179,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.5008,
          -0.0745,
          -0.8546,
          0.6029,
          0.6264,
          1.1939
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.3332,
        "spreadScale": 1.3383,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.28116,
            "ecmwfAifs": 0.090062,
            "icon": 0.206181,
            "ukmo": 0.104171,
            "meteofrance": 0.145279,
            "gfs": 0.065884,
            "gem": 0.056423,
            "jma": 0.05084
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.34,
          "logisticSlope": 5.9361,
          "wetFractionWeight": 4.003,
          "powerEta": 0.68,
          "rawBrier": 0.0371,
          "calibratedBrier": 0.03274
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.8044,
          "rawIfsRmseC": 3.7871,
          "rawEqualMaeC": 2.4089,
          "rawEqualRmseC": 3.1584,
          "cvSimplexMaeC": 2.2638,
          "cvCalibratedMaeC": 2.1297,
          "cvCalibratedRmseC": 2.7656
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.383371,
          "icon": 0.021048,
          "ukmo": 0.174798,
          "meteofrance": 0.093266,
          "gfs": 0.02,
          "gem": 0.267517,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2697,
          -0.0998,
          -0.3257,
          0.1615,
          0.1783,
          0.5221
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.1412,
        "spreadScale": 1.4268,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.351055,
            "ecmwfAifs": 0.234598,
            "icon": 0.12428,
            "ukmo": 0.091082,
            "meteofrance": 0.043003,
            "gfs": 0.062406,
            "gem": 0.053445,
            "jma": 0.040131
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3664,
          "logisticSlope": 5.8326,
          "wetFractionWeight": 3.3156,
          "powerEta": 0.68,
          "rawBrier": 0.0371,
          "calibratedBrier": 0.03326
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.8044,
          "rawIfsRmseC": 3.7871,
          "rawEqualMaeC": 2.4089,
          "rawEqualRmseC": 3.1584,
          "cvSimplexMaeC": 2.2199,
          "cvCalibratedMaeC": 2.1485,
          "cvCalibratedRmseC": 2.774
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.039105,
          "ecmwfAifs": 0.02,
          "icon": 0.086058,
          "ukmo": 0.320358,
          "meteofrance": 0.178161,
          "gfs": 0.02,
          "gem": 0.316318,
          "jma": 0.02
        },
        "intercept": 0.0149,
        "betaDrivers": [
          -0.3055,
          -0.3839,
          -0.3709,
          -0.0259,
          0.009,
          0.0677
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1437,
        "spreadScale": 0.9487,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.284037,
            "ecmwfAifs": 0.070433,
            "icon": 0.211116,
            "ukmo": 0.116392,
            "meteofrance": 0.147468,
            "gfs": 0.064039,
            "gem": 0.054185,
            "jma": 0.05233
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7996,
          "logisticSlope": 3.086,
          "wetFractionWeight": 4.2592,
          "powerEta": 0.68,
          "rawBrier": 0.07006,
          "calibratedBrier": 0.06091
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 2.0788,
          "rawIfsRmseC": 2.7725,
          "rawEqualMaeC": 1.7689,
          "rawEqualRmseC": 2.2563,
          "cvSimplexMaeC": 1.5931,
          "cvCalibratedMaeC": 1.5575,
          "cvCalibratedRmseC": 2.0087
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.184973,
          "ecmwfAifs": 0.064081,
          "icon": 0.140378,
          "ukmo": 0.235992,
          "meteofrance": 0.112406,
          "gfs": 0.02,
          "gem": 0.22217,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2595,
          -0.2815,
          -0.1866,
          -0.0094,
          0.0266,
          0.1237
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7231,
        "spreadScale": 1.1522,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.367963,
            "ecmwfAifs": 0.190357,
            "icon": 0.132033,
            "ukmo": 0.105589,
            "meteofrance": 0.045013,
            "gfs": 0.062936,
            "gem": 0.053252,
            "jma": 0.042857
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8428,
          "logisticSlope": 3.0749,
          "wetFractionWeight": 3.9819,
          "powerEta": 0.68,
          "rawBrier": 0.07006,
          "calibratedBrier": 0.06
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 2.0788,
          "rawIfsRmseC": 2.7725,
          "rawEqualMaeC": 1.7689,
          "rawEqualRmseC": 2.2563,
          "cvSimplexMaeC": 1.6243,
          "cvCalibratedMaeC": 1.5873,
          "cvCalibratedRmseC": 2.0499
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.363417,
          "meteofrance": 0.158293,
          "gfs": 0.02,
          "gem": 0.37829,
          "jma": 0.02
        },
        "intercept": 0.0192,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1144,
        "spreadScale": 1.0004,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247291,
            "ecmwfAifs": 0.070826,
            "icon": 0.226556,
            "ukmo": 0.121417,
            "meteofrance": 0.169186,
            "gfs": 0.059267,
            "gem": 0.051464,
            "jma": 0.053993
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1596,
          "logisticSlope": 3.6268,
          "wetFractionWeight": 3.4668,
          "powerEta": 0.68,
          "rawBrier": 0.01923,
          "calibratedBrier": 0.01123
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.3503,
          "rawIfsRmseC": 3.0985,
          "rawEqualMaeC": 1.7446,
          "rawEqualRmseC": 2.3899,
          "cvSimplexMaeC": 1.5875,
          "cvCalibratedMaeC": 1.5873,
          "cvCalibratedRmseC": 2.0565
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.130876,
          "ecmwfAifs": 0.123614,
          "icon": 0.059337,
          "ukmo": 0.277574,
          "meteofrance": 0.101995,
          "gfs": 0.02,
          "gem": 0.266604,
          "jma": 0.02
        },
        "intercept": -0.0108,
        "betaDrivers": [
          -0.191,
          -0.1199,
          -0.0334,
          0.0319,
          0.0741,
          0.0793
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.863,
        "spreadScale": 1.1424,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.333625,
            "ecmwfAifs": 0.199341,
            "icon": 0.147555,
            "ukmo": 0.114707,
            "meteofrance": 0.045392,
            "gfs": 0.060658,
            "gem": 0.052672,
            "jma": 0.04605
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.3162,
          "logisticSlope": 3.5234,
          "wetFractionWeight": 3.6841,
          "powerEta": 0.68,
          "rawBrier": 0.01923,
          "calibratedBrier": 0.01074
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.3503,
          "rawIfsRmseC": 3.0985,
          "rawEqualMaeC": 1.7446,
          "rawEqualRmseC": 2.3899,
          "cvSimplexMaeC": 1.6222,
          "cvCalibratedMaeC": 1.6198,
          "cvCalibratedRmseC": 2.1038
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.285347,
          "meteofrance": 0.020489,
          "gfs": 0.02,
          "gem": 0.594164,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.6214,
          -0.7405,
          -0.6777,
          0.1463,
          0.6484,
          0.6077
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 3.6017,
        "spreadScale": 0.6985,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.268114,
            "ecmwfAifs": 0.074926,
            "icon": 0.212485,
            "ukmo": 0.116206,
            "meteofrance": 0.15321,
            "gfs": 0.063604,
            "gem": 0.056981,
            "jma": 0.054474
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5211,
          "logisticSlope": 4.6185,
          "wetFractionWeight": 4.2067,
          "powerEta": 0.68,
          "rawBrier": 0.02809,
          "calibratedBrier": 0.02478
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 3.1379,
          "rawIfsRmseC": 4.1983,
          "rawEqualMaeC": 2.6696,
          "rawEqualRmseC": 3.4902,
          "cvSimplexMaeC": 2.0987,
          "cvCalibratedMaeC": 2.0116,
          "cvCalibratedRmseC": 2.5448
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.087499,
          "icon": 0.0234,
          "ukmo": 0.300384,
          "meteofrance": 0.10736,
          "gfs": 0.02,
          "gem": 0.421357,
          "jma": 0.02
        },
        "intercept": -0.1366,
        "betaDrivers": [
          -0.3261,
          -0.4693,
          -0.3259,
          0.0236,
          0.2154,
          0.2423
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.4329,
        "spreadScale": 1.0752,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.348665,
            "ecmwfAifs": 0.203273,
            "icon": 0.133397,
            "ukmo": 0.105823,
            "meteofrance": 0.045096,
            "gfs": 0.062748,
            "gem": 0.056214,
            "jma": 0.044784
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6897,
          "logisticSlope": 4.2509,
          "wetFractionWeight": 4.0579,
          "powerEta": 0.68,
          "rawBrier": 0.02809,
          "calibratedBrier": 0.02386
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 3.1379,
          "rawIfsRmseC": 4.1983,
          "rawEqualMaeC": 2.6696,
          "rawEqualRmseC": 3.4902,
          "cvSimplexMaeC": 2.1599,
          "cvCalibratedMaeC": 2.0622,
          "cvCalibratedRmseC": 2.5798
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.317391,
          "icon": 0.02,
          "ukmo": 0.165278,
          "meteofrance": 0.073152,
          "gfs": 0.02,
          "gem": 0.364179,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.5008,
          -0.0745,
          0,
          0
        ],
        "driverBetasC": [
          -0.8546,
          1.1939,
          0.6029,
          0.6264
        ],
        "spreadBaseC2": 2.3332,
        "spreadScale": 1.3383,
        "cvMaeC": 2.1297,
        "cvRmseC": 2.7656,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.350381,
          "icon": 0.020524,
          "ukmo": 0.170038,
          "meteofrance": 0.083209,
          "gfs": 0.02,
          "gem": 0.315848,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.3852,
          -0.0872,
          0,
          0
        ],
        "driverBetasC": [
          -0.5901,
          0.858,
          0.3822,
          0.4023
        ],
        "spreadBaseC2": 2.2372,
        "spreadScale": 1.3826,
        "cvMaeC": 2.1391,
        "cvRmseC": 2.7698,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.383371,
          "icon": 0.021048,
          "ukmo": 0.174798,
          "meteofrance": 0.093266,
          "gfs": 0.02,
          "gem": 0.267517,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2697,
          -0.0998,
          0,
          0
        ],
        "driverBetasC": [
          -0.3257,
          0.5221,
          0.1615,
          0.1783
        ],
        "spreadBaseC2": 2.1412,
        "spreadScale": 1.4268,
        "cvMaeC": 2.1485,
        "cvRmseC": 2.774,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.039105,
          "ecmwfAifs": 0.02,
          "icon": 0.086058,
          "ukmo": 0.320358,
          "meteofrance": 0.178161,
          "gfs": 0.02,
          "gem": 0.316318,
          "jma": 0.02
        },
        "interceptC": 0.0149,
        "diurnalHarmonicsC": [
          -0.3055,
          -0.3839,
          0,
          0
        ],
        "driverBetasC": [
          -0.3709,
          0.0677,
          -0.0259,
          0.009
        ],
        "spreadBaseC2": 1.1437,
        "spreadScale": 0.9487,
        "cvMaeC": 1.5575,
        "cvRmseC": 2.0087,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.112039,
          "ecmwfAifs": 0.042041,
          "icon": 0.113218,
          "ukmo": 0.278174,
          "meteofrance": 0.145284,
          "gfs": 0.02,
          "gem": 0.269244,
          "jma": 0.02
        },
        "interceptC": 0.0075,
        "diurnalHarmonicsC": [
          -0.2825,
          -0.3327,
          0,
          0
        ],
        "driverBetasC": [
          -0.2787,
          0.0957,
          -0.0176,
          0.0178
        ],
        "spreadBaseC2": 0.9334,
        "spreadScale": 1.0504,
        "cvMaeC": 1.5724,
        "cvRmseC": 2.0293,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.184973,
          "ecmwfAifs": 0.064081,
          "icon": 0.140378,
          "ukmo": 0.235992,
          "meteofrance": 0.112406,
          "gfs": 0.02,
          "gem": 0.22217,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2595,
          -0.2815,
          0,
          0
        ],
        "driverBetasC": [
          -0.1866,
          0.1237,
          -0.0094,
          0.0266
        ],
        "spreadBaseC2": 0.7231,
        "spreadScale": 1.1522,
        "cvMaeC": 1.5873,
        "cvRmseC": 2.0499,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.363417,
          "meteofrance": 0.158293,
          "gfs": 0.02,
          "gem": 0.37829,
          "jma": 0.02
        },
        "interceptC": 0.0192,
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
        "spreadBaseC2": 1.1144,
        "spreadScale": 1.0004,
        "cvMaeC": 1.5873,
        "cvRmseC": 2.0565,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.075438,
          "ecmwfAifs": 0.071807,
          "icon": 0.039669,
          "ukmo": 0.320496,
          "meteofrance": 0.130144,
          "gfs": 0.02,
          "gem": 0.322446,
          "jma": 0.02
        },
        "interceptC": 0.0042,
        "diurnalHarmonicsC": [
          -0.0955,
          -0.06,
          0,
          0
        ],
        "driverBetasC": [
          -0.0167,
          0.0396,
          0.0159,
          0.037
        ],
        "spreadBaseC2": 0.9887,
        "spreadScale": 1.0714,
        "cvMaeC": 1.6035,
        "cvRmseC": 2.0802,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.130876,
          "ecmwfAifs": 0.123614,
          "icon": 0.059337,
          "ukmo": 0.277574,
          "meteofrance": 0.101995,
          "gfs": 0.02,
          "gem": 0.266604,
          "jma": 0.02
        },
        "interceptC": -0.0108,
        "diurnalHarmonicsC": [
          -0.191,
          -0.1199,
          0,
          0
        ],
        "driverBetasC": [
          -0.0334,
          0.0793,
          0.0319,
          0.0741
        ],
        "spreadBaseC2": 0.863,
        "spreadScale": 1.1424,
        "cvMaeC": 1.6198,
        "cvRmseC": 2.1038,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.285347,
          "meteofrance": 0.020489,
          "gfs": 0.02,
          "gem": 0.594164,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.6214,
          -0.7405,
          0,
          0
        ],
        "driverBetasC": [
          -0.6777,
          0.6077,
          0.1463,
          0.6484
        ],
        "spreadBaseC2": 3.6017,
        "spreadScale": 0.6985,
        "cvMaeC": 2.0116,
        "cvRmseC": 2.5448,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.053749,
          "icon": 0.0217,
          "ukmo": 0.292866,
          "meteofrance": 0.063924,
          "gfs": 0.02,
          "gem": 0.507761,
          "jma": 0.02
        },
        "interceptC": -0.0683,
        "diurnalHarmonicsC": [
          -0.4738,
          -0.6049,
          0,
          0
        ],
        "driverBetasC": [
          -0.5018,
          0.425,
          0.085,
          0.4319
        ],
        "spreadBaseC2": 3.0173,
        "spreadScale": 0.8868,
        "cvMaeC": 2.0369,
        "cvRmseC": 2.5623,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.087499,
          "icon": 0.0234,
          "ukmo": 0.300384,
          "meteofrance": 0.10736,
          "gfs": 0.02,
          "gem": 0.421357,
          "jma": 0.02
        },
        "interceptC": -0.1366,
        "diurnalHarmonicsC": [
          -0.3261,
          -0.4693,
          0,
          0
        ],
        "driverBetasC": [
          -0.3259,
          0.2423,
          0.0236,
          0.2154
        ],
        "spreadBaseC2": 2.4329,
        "spreadScale": 1.0752,
        "cvMaeC": 2.0622,
        "cvRmseC": 2.5798,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.28116,
        "ecmwfAifs": 0.090062,
        "icon": 0.206181,
        "ukmo": 0.104171,
        "meteofrance": 0.145279,
        "gfs": 0.065884,
        "gem": 0.056423,
        "jma": 0.05084
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.284037,
        "ecmwfAifs": 0.070433,
        "icon": 0.211116,
        "ukmo": 0.116392,
        "meteofrance": 0.147468,
        "gfs": 0.064039,
        "gem": 0.054185,
        "jma": 0.05233
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.247291,
        "ecmwfAifs": 0.070826,
        "icon": 0.226556,
        "ukmo": 0.121417,
        "meteofrance": 0.169186,
        "gfs": 0.059267,
        "gem": 0.051464,
        "jma": 0.053993
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.268114,
        "ecmwfAifs": 0.074926,
        "icon": 0.212485,
        "ukmo": 0.116206,
        "meteofrance": 0.15321,
        "gfs": 0.063604,
        "gem": 0.056981,
        "jma": 0.054474
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.2024,
    "ecmwfAifs": 0.072009,
    "icon": 0.253155,
    "ukmo": 0.169122,
    "meteofrance": 0.112014,
    "gfs": 0.11129,
    "gem": 0.040005,
    "jma": 0.040005
  },
  "pressureWeights": {
    "ecmwfIfs": 0.313416,
    "ecmwfAifs": 0.153836,
    "icon": 0.149327,
    "ukmo": 0.176937,
    "meteofrance": 0.080966,
    "gfs": 0.044552,
    "gem": 0.040483,
    "jma": 0.040483
  }
} as const;

export default PROVINCE_CALIBRATION_TR_24;
