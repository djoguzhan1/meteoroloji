import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_48: ProvinceCalibrationBundle = {
  "provinceCode": "TR-48",
  "provinceName": "Muğla",
  "plateNumber": 48,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17292",
  "stationLat": 37.2,
  "stationLon": 28.35,
  "stationElevationM": 646,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17088,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.497925,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.382075,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.2331,
          -0.0426,
          0.2496,
          -0.1145,
          -0.4729,
          -0.2154
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2417,
        "spreadScale": 0.211,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.27202,
            "ecmwfAifs": 0.086371,
            "icon": 0.18906,
            "ukmo": 0.123664,
            "meteofrance": 0.151507,
            "gfs": 0.061481,
            "gem": 0.056419,
            "jma": 0.059478
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6405,
          "logisticSlope": 3.9585,
          "wetFractionWeight": 3.2308,
          "powerEta": 0.68,
          "rawBrier": 0.06467,
          "calibratedBrier": 0.06061
        },
        "verification": {
          "sampleHours": 4282,
          "rawIfsMaeC": 0.614,
          "rawIfsRmseC": 0.8478,
          "rawEqualMaeC": 0.8631,
          "rawEqualRmseC": 1.1213,
          "cvSimplexMaeC": 0.5281,
          "cvCalibratedMaeC": 0.4848,
          "cvCalibratedRmseC": 0.6495
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.545241,
          "ecmwfAifs": 0.032166,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.287083,
          "gem": 0.05551,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1549,
          -0.0218,
          0.1332,
          -0.0568,
          -0.21,
          -0.1032
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1736,
        "spreadScale": 0.3446,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.34311,
            "ecmwfAifs": 0.22728,
            "icon": 0.115123,
            "ukmo": 0.10923,
            "meteofrance": 0.045013,
            "gfs": 0.05883,
            "gem": 0.053987,
            "jma": 0.047427
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7657,
          "logisticSlope": 4.0355,
          "wetFractionWeight": 2.9192,
          "powerEta": 0.68,
          "rawBrier": 0.06467,
          "calibratedBrier": 0.05973
        },
        "verification": {
          "sampleHours": 4282,
          "rawIfsMaeC": 0.614,
          "rawIfsRmseC": 0.8478,
          "rawEqualMaeC": 0.8631,
          "rawEqualRmseC": 1.1213,
          "cvSimplexMaeC": 0.5419,
          "cvCalibratedMaeC": 0.5044,
          "cvCalibratedRmseC": 0.6839
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.507538,
          "ecmwfAifs": 0.151251,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.241211,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.353,
          0.1536,
          0.2287,
          -0.1579,
          -0.2307,
          -0.1905
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3893,
        "spreadScale": 0.1337,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254248,
            "ecmwfAifs": 0.074161,
            "icon": 0.21366,
            "ukmo": 0.122342,
            "meteofrance": 0.160624,
            "gfs": 0.064885,
            "gem": 0.056139,
            "jma": 0.053941
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8419,
          "logisticSlope": 4.1738,
          "wetFractionWeight": 2.825,
          "powerEta": 0.68,
          "rawBrier": 0.04577,
          "calibratedBrier": 0.04145
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6781,
          "rawIfsRmseC": 0.9655,
          "rawEqualMaeC": 0.8345,
          "rawEqualRmseC": 1.0718,
          "cvSimplexMaeC": 0.5815,
          "cvCalibratedMaeC": 0.5124,
          "cvCalibratedRmseC": 0.7438
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.489363,
          "ecmwfAifs": 0.195221,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.180848,
          "gem": 0.054568,
          "jma": 0.02
        },
        "intercept": 0.0197,
        "betaDrivers": [
          0.2016,
          0.0634,
          0.1227,
          -0.0706,
          -0.1024,
          -0.093
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4177,
        "spreadScale": 0.145,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33543,
            "ecmwfAifs": 0.204118,
            "icon": 0.136082,
            "ukmo": 0.113028,
            "meteofrance": 0.045226,
            "gfs": 0.06494,
            "gem": 0.056187,
            "jma": 0.044989
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9135,
          "logisticSlope": 4.3353,
          "wetFractionWeight": 2.6247,
          "powerEta": 0.68,
          "rawBrier": 0.04577,
          "calibratedBrier": 0.04117
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6781,
          "rawIfsRmseC": 0.9655,
          "rawEqualMaeC": 0.8345,
          "rawEqualRmseC": 1.0718,
          "cvSimplexMaeC": 0.5865,
          "cvCalibratedMaeC": 0.5388,
          "cvCalibratedRmseC": 0.7704
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.569773,
          "ecmwfAifs": 0.089056,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.173409,
          "gfs": 0.087762,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.3429,
          0.0877,
          0.5075,
          0.2984,
          -0.347,
          -0.0693
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1841,
        "spreadScale": 0.132,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23641,
            "ecmwfAifs": 0.082603,
            "icon": 0.213475,
            "ukmo": 0.124157,
            "meteofrance": 0.163622,
            "gfs": 0.06604,
            "gem": 0.056176,
            "jma": 0.057517
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6519,
          "logisticSlope": 4.2362,
          "wetFractionWeight": 3.534,
          "powerEta": 0.68,
          "rawBrier": 0.01272,
          "calibratedBrier": 0.01272
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.6665,
          "rawIfsRmseC": 0.8703,
          "rawEqualMaeC": 0.7982,
          "rawEqualRmseC": 1.0516,
          "cvSimplexMaeC": 0.5454,
          "cvCalibratedMaeC": 0.4743,
          "cvCalibratedRmseC": 0.6486
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.553606,
          "ecmwfAifs": 0.140818,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.140463,
          "gfs": 0.084447,
          "gem": 0.020666,
          "jma": 0.02
        },
        "intercept": 0.0151,
        "betaDrivers": [
          0.174,
          0.0617,
          0.2162,
          0.1027,
          -0.1396,
          -0.0231
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2293,
        "spreadScale": 0.1282,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.310123,
            "ecmwfAifs": 0.226059,
            "icon": 0.13519,
            "ukmo": 0.114051,
            "meteofrance": 0.045253,
            "gfs": 0.065721,
            "gem": 0.055904,
            "jma": 0.047699
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6878,
          "logisticSlope": 4.2596,
          "wetFractionWeight": 3.6496,
          "powerEta": 0.68,
          "rawBrier": 0.01272,
          "calibratedBrier": 0.01252
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.6665,
          "rawIfsRmseC": 0.8703,
          "rawEqualMaeC": 0.7982,
          "rawEqualRmseC": 1.0516,
          "cvSimplexMaeC": 0.552,
          "cvCalibratedMaeC": 0.5039,
          "cvCalibratedRmseC": 0.6775
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.634772,
          "ecmwfAifs": 0.026766,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.206354,
          "gem": 0.052108,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.431,
          0.1807,
          0.2443,
          -0.1853,
          -0.517,
          -0.1392
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3493,
        "spreadScale": 0.0949,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252774,
            "ecmwfAifs": 0.086141,
            "icon": 0.195477,
            "ukmo": 0.131571,
            "meteofrance": 0.151992,
            "gfs": 0.062774,
            "gem": 0.058943,
            "jma": 0.060328
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4064,
          "logisticSlope": 4.5503,
          "wetFractionWeight": 3.341,
          "powerEta": 0.68,
          "rawBrier": 0.02896,
          "calibratedBrier": 0.02835
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6468,
          "rawIfsRmseC": 0.894,
          "rawEqualMaeC": 0.9268,
          "rawEqualRmseC": 1.1854,
          "cvSimplexMaeC": 0.6329,
          "cvCalibratedMaeC": 0.4954,
          "cvCalibratedRmseC": 0.678
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.578938,
          "ecmwfAifs": 0.086655,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.18637,
          "gem": 0.068037,
          "jma": 0.02
        },
        "intercept": 0.0789,
        "betaDrivers": [
          0.2581,
          0.0817,
          0.1608,
          -0.0766,
          -0.2173,
          -0.0832
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3787,
        "spreadScale": 0.1249,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.322085,
            "ecmwfAifs": 0.228983,
            "icon": 0.120244,
            "ukmo": 0.117398,
            "meteofrance": 0.045039,
            "gfs": 0.060679,
            "gem": 0.056976,
            "jma": 0.048596
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6163,
          "logisticSlope": 4.1556,
          "wetFractionWeight": 3.6434,
          "powerEta": 0.68,
          "rawBrier": 0.02896,
          "calibratedBrier": 0.02605
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6468,
          "rawIfsRmseC": 0.894,
          "rawEqualMaeC": 0.9268,
          "rawEqualRmseC": 1.1854,
          "cvSimplexMaeC": 0.6392,
          "cvCalibratedMaeC": 0.5343,
          "cvCalibratedRmseC": 0.7238
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.497925,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.382075,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.2331,
          -0.0426,
          0,
          0
        ],
        "driverBetasC": [
          0.2496,
          -0.2154,
          -0.1145,
          -0.4729
        ],
        "spreadBaseC2": 0.2417,
        "spreadScale": 0.211,
        "cvMaeC": 0.4848,
        "cvRmseC": 0.6495,
        "sampleHours": 4282
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.521583,
          "ecmwfAifs": 0.026083,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.334579,
          "gem": 0.037755,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.194,
          -0.0322,
          0,
          0
        ],
        "driverBetasC": [
          0.1914,
          -0.1593,
          -0.0857,
          -0.3414
        ],
        "spreadBaseC2": 0.2077,
        "spreadScale": 0.2778,
        "cvMaeC": 0.4946,
        "cvRmseC": 0.6667,
        "sampleHours": 4282
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.545241,
          "ecmwfAifs": 0.032166,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.287083,
          "gem": 0.05551,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1549,
          -0.0218,
          0,
          0
        ],
        "driverBetasC": [
          0.1332,
          -0.1032,
          -0.0568,
          -0.21
        ],
        "spreadBaseC2": 0.1736,
        "spreadScale": 0.3446,
        "cvMaeC": 0.5044,
        "cvRmseC": 0.6839,
        "sampleHours": 4282
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.507538,
          "ecmwfAifs": 0.151251,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.241211,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.353,
          0.1536,
          0,
          0
        ],
        "driverBetasC": [
          0.2287,
          -0.1905,
          -0.1579,
          -0.2307
        ],
        "spreadBaseC2": 0.3893,
        "spreadScale": 0.1337,
        "cvMaeC": 0.5124,
        "cvRmseC": 0.7438,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.498451,
          "ecmwfAifs": 0.173236,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.211029,
          "gem": 0.037284,
          "jma": 0.02
        },
        "interceptC": 0.0098,
        "diurnalHarmonicsC": [
          0.2773,
          0.1085,
          0,
          0
        ],
        "driverBetasC": [
          0.1757,
          -0.1417,
          -0.1143,
          -0.1666
        ],
        "spreadBaseC2": 0.4035,
        "spreadScale": 0.1394,
        "cvMaeC": 0.5256,
        "cvRmseC": 0.7571,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.489363,
          "ecmwfAifs": 0.195221,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.180848,
          "gem": 0.054568,
          "jma": 0.02
        },
        "interceptC": 0.0197,
        "diurnalHarmonicsC": [
          0.2016,
          0.0634,
          0,
          0
        ],
        "driverBetasC": [
          0.1227,
          -0.093,
          -0.0706,
          -0.1024
        ],
        "spreadBaseC2": 0.4177,
        "spreadScale": 0.145,
        "cvMaeC": 0.5388,
        "cvRmseC": 0.7704,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.569773,
          "ecmwfAifs": 0.089056,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.173409,
          "gfs": 0.087762,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.3429,
          0.0877,
          0,
          0
        ],
        "driverBetasC": [
          0.5075,
          -0.0693,
          0.2984,
          -0.347
        ],
        "spreadBaseC2": 0.1841,
        "spreadScale": 0.132,
        "cvMaeC": 0.4743,
        "cvRmseC": 0.6486,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.561689,
          "ecmwfAifs": 0.114937,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.156936,
          "gfs": 0.086105,
          "gem": 0.020333,
          "jma": 0.02
        },
        "interceptC": 0.0076,
        "diurnalHarmonicsC": [
          0.2584,
          0.0747,
          0,
          0
        ],
        "driverBetasC": [
          0.3619,
          -0.0462,
          0.2006,
          -0.2433
        ],
        "spreadBaseC2": 0.2067,
        "spreadScale": 0.1301,
        "cvMaeC": 0.4891,
        "cvRmseC": 0.663,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.553606,
          "ecmwfAifs": 0.140818,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.140463,
          "gfs": 0.084447,
          "gem": 0.020666,
          "jma": 0.02
        },
        "interceptC": 0.0151,
        "diurnalHarmonicsC": [
          0.174,
          0.0617,
          0,
          0
        ],
        "driverBetasC": [
          0.2162,
          -0.0231,
          0.1027,
          -0.1396
        ],
        "spreadBaseC2": 0.2293,
        "spreadScale": 0.1282,
        "cvMaeC": 0.5039,
        "cvRmseC": 0.6775,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.634772,
          "ecmwfAifs": 0.026766,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.206354,
          "gem": 0.052108,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.431,
          0.1807,
          0,
          0
        ],
        "driverBetasC": [
          0.2443,
          -0.1392,
          -0.1853,
          -0.517
        ],
        "spreadBaseC2": 0.3493,
        "spreadScale": 0.0949,
        "cvMaeC": 0.4954,
        "cvRmseC": 0.678,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.606854,
          "ecmwfAifs": 0.056711,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.196362,
          "gem": 0.060073,
          "jma": 0.02
        },
        "interceptC": 0.0394,
        "diurnalHarmonicsC": [
          0.3446,
          0.1312,
          0,
          0
        ],
        "driverBetasC": [
          0.2026,
          -0.1112,
          -0.131,
          -0.3671
        ],
        "spreadBaseC2": 0.364,
        "spreadScale": 0.1099,
        "cvMaeC": 0.5149,
        "cvRmseC": 0.7009,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.578938,
          "ecmwfAifs": 0.086655,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.18637,
          "gem": 0.068037,
          "jma": 0.02
        },
        "interceptC": 0.0789,
        "diurnalHarmonicsC": [
          0.2581,
          0.0817,
          0,
          0
        ],
        "driverBetasC": [
          0.1608,
          -0.0832,
          -0.0766,
          -0.2173
        ],
        "spreadBaseC2": 0.3787,
        "spreadScale": 0.1249,
        "cvMaeC": 0.5343,
        "cvRmseC": 0.7238,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.27202,
        "ecmwfAifs": 0.086371,
        "icon": 0.18906,
        "ukmo": 0.123664,
        "meteofrance": 0.151507,
        "gfs": 0.061481,
        "gem": 0.056419,
        "jma": 0.059478
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.254248,
        "ecmwfAifs": 0.074161,
        "icon": 0.21366,
        "ukmo": 0.122342,
        "meteofrance": 0.160624,
        "gfs": 0.064885,
        "gem": 0.056139,
        "jma": 0.053941
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.23641,
        "ecmwfAifs": 0.082603,
        "icon": 0.213475,
        "ukmo": 0.124157,
        "meteofrance": 0.163622,
        "gfs": 0.06604,
        "gem": 0.056176,
        "jma": 0.057517
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.252774,
        "ecmwfAifs": 0.086141,
        "icon": 0.195477,
        "ukmo": 0.131571,
        "meteofrance": 0.151992,
        "gfs": 0.062774,
        "gem": 0.058943,
        "jma": 0.060328
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.249772,
    "ecmwfAifs": 0.068869,
    "icon": 0.234227,
    "ukmo": 0.155683,
    "meteofrance": 0.107129,
    "gfs": 0.1078,
    "gem": 0.03826,
    "jma": 0.03826
  },
  "pressureWeights": {
    "ecmwfIfs": 0.519307,
    "ecmwfAifs": 0.103639,
    "icon": 0.137478,
    "ukmo": 0.097359,
    "meteofrance": 0.054547,
    "gfs": 0.033124,
    "gem": 0.027273,
    "jma": 0.027273
  }
} as const;

export default PROVINCE_CALIBRATION_TR_48;
