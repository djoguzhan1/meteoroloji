import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_22: ProvinceCalibrationBundle = {
  "provinceCode": "TR-22",
  "provinceName": "Edirne",
  "plateNumber": 22,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17050",
  "stationLat": 41.6667,
  "stationLon": 26.5667,
  "stationElevationM": 48,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.181258,
          "icon": 0.268637,
          "ukmo": 0.02,
          "meteofrance": 0.208573,
          "gfs": 0.064057,
          "gem": 0.02,
          "jma": 0.217475
        },
        "intercept": 0.6833,
        "betaDrivers": [
          -0.1014,
          0.2855,
          0.268,
          0.053,
          -0.3236,
          -0.5203
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9535,
        "spreadScale": 0.3113,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236247,
            "ecmwfAifs": 0.084648,
            "icon": 0.218151,
            "ukmo": 0.117012,
            "meteofrance": 0.160814,
            "gfs": 0.067089,
            "gem": 0.060052,
            "jma": 0.055987
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.848,
          "logisticSlope": 3.9864,
          "wetFractionWeight": 4.559,
          "powerEta": 0.68,
          "rawBrier": 0.02465,
          "calibratedBrier": 0.02249
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4265,
          "rawIfsRmseC": 1.8632,
          "rawEqualMaeC": 1.1376,
          "rawEqualRmseC": 1.4452,
          "cvSimplexMaeC": 1.043,
          "cvCalibratedMaeC": 0.8927,
          "cvCalibratedRmseC": 1.199
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.051205,
          "ecmwfAifs": 0.348742,
          "icon": 0.199548,
          "ukmo": 0.067095,
          "meteofrance": 0.121912,
          "gfs": 0.062869,
          "gem": 0.02,
          "jma": 0.128629
        },
        "intercept": 0.6364,
        "betaDrivers": [
          -0.0909,
          0.1602,
          0.1391,
          0.0202,
          -0.1268,
          -0.1871
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0273,
        "spreadScale": 0.297,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308178,
            "ecmwfAifs": 0.23036,
            "icon": 0.13738,
            "ukmo": 0.106888,
            "meteofrance": 0.045204,
            "gfs": 0.066391,
            "gem": 0.059428,
            "jma": 0.046171
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.909,
          "logisticSlope": 4.0958,
          "wetFractionWeight": 4.3585,
          "powerEta": 0.68,
          "rawBrier": 0.02465,
          "calibratedBrier": 0.02253
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4265,
          "rawIfsRmseC": 1.8632,
          "rawEqualMaeC": 1.1376,
          "rawEqualRmseC": 1.4452,
          "cvSimplexMaeC": 1.0563,
          "cvCalibratedMaeC": 0.907,
          "cvCalibratedRmseC": 1.2203
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.301925,
          "ukmo": 0.02,
          "meteofrance": 0.452605,
          "gfs": 0.02,
          "gem": 0.093574,
          "jma": 0.071896
        },
        "intercept": 0.3724,
        "betaDrivers": [
          -0.3206,
          0.2177,
          0.062,
          -0.2918,
          -0.1492,
          -0.3262
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0391,
        "spreadScale": 0.1833,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247901,
            "ecmwfAifs": 0.073882,
            "icon": 0.219272,
            "ukmo": 0.119269,
            "meteofrance": 0.163267,
            "gfs": 0.062075,
            "gem": 0.057772,
            "jma": 0.056562
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9542,
          "logisticSlope": 3.3485,
          "wetFractionWeight": 3.4539,
          "powerEta": 0.68,
          "rawBrier": 0.04555,
          "calibratedBrier": 0.04288
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5551,
          "rawIfsRmseC": 1.9892,
          "rawEqualMaeC": 1.1376,
          "rawEqualRmseC": 1.4719,
          "cvSimplexMaeC": 0.9389,
          "cvCalibratedMaeC": 0.8447,
          "cvCalibratedRmseC": 1.1603
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.043681,
          "ecmwfAifs": 0.201162,
          "icon": 0.23477,
          "ukmo": 0.02,
          "meteofrance": 0.285961,
          "gfs": 0.02,
          "gem": 0.102392,
          "jma": 0.092034
        },
        "intercept": 0.4905,
        "betaDrivers": [
          -0.2178,
          0.1326,
          0.0781,
          -0.1008,
          -0.0805,
          -0.1865
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0167,
        "spreadScale": 0.2212,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.329592,
            "ecmwfAifs": 0.204927,
            "icon": 0.140739,
            "ukmo": 0.111043,
            "meteofrance": 0.045278,
            "gfs": 0.06261,
            "gem": 0.05827,
            "jma": 0.047541
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9632,
          "logisticSlope": 3.6317,
          "wetFractionWeight": 3.2015,
          "powerEta": 0.68,
          "rawBrier": 0.04555,
          "calibratedBrier": 0.04321
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5551,
          "rawIfsRmseC": 1.9892,
          "rawEqualMaeC": 1.1376,
          "rawEqualRmseC": 1.4719,
          "cvSimplexMaeC": 0.9847,
          "cvCalibratedMaeC": 0.8542,
          "cvCalibratedRmseC": 1.1757
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.037871,
          "ecmwfAifs": 0.02,
          "icon": 0.30976,
          "ukmo": 0.02,
          "meteofrance": 0.341977,
          "gfs": 0.02,
          "gem": 0.230392,
          "jma": 0.02
        },
        "intercept": 0.3306,
        "betaDrivers": [
          -0.6871,
          0.2644,
          0.2112,
          -0.1627,
          -0.0192,
          -0.296
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4626,
        "spreadScale": 0.3062,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237186,
            "ecmwfAifs": 0.081063,
            "icon": 0.221024,
            "ukmo": 0.114167,
            "meteofrance": 0.159728,
            "gfs": 0.068503,
            "gem": 0.058876,
            "jma": 0.059453
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7154,
          "logisticSlope": 3.6734,
          "wetFractionWeight": 3.0864,
          "powerEta": 0.68,
          "rawBrier": 0.01361,
          "calibratedBrier": 0.01347
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2005,
          "rawIfsRmseC": 1.554,
          "rawEqualMaeC": 1.0828,
          "rawEqualRmseC": 1.369,
          "cvSimplexMaeC": 0.9568,
          "cvCalibratedMaeC": 0.6902,
          "cvCalibratedRmseC": 0.9554
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.243452,
          "ecmwfAifs": 0.129394,
          "icon": 0.249384,
          "ukmo": 0.02,
          "meteofrance": 0.190399,
          "gfs": 0.02,
          "gem": 0.127371,
          "jma": 0.02
        },
        "intercept": 0.4197,
        "betaDrivers": [
          -0.423,
          0.2093,
          0.113,
          -0.046,
          0.0444,
          -0.1219
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5531,
        "spreadScale": 0.3059,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311433,
            "ecmwfAifs": 0.222053,
            "icon": 0.140103,
            "ukmo": 0.104974,
            "meteofrance": 0.045203,
            "gfs": 0.068236,
            "gem": 0.058647,
            "jma": 0.049351
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7993,
          "logisticSlope": 3.3738,
          "wetFractionWeight": 3.5387,
          "powerEta": 0.68,
          "rawBrier": 0.01361,
          "calibratedBrier": 0.01307
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2005,
          "rawIfsRmseC": 1.554,
          "rawEqualMaeC": 1.0828,
          "rawEqualRmseC": 1.369,
          "cvSimplexMaeC": 0.9941,
          "cvCalibratedMaeC": 0.7402,
          "cvCalibratedRmseC": 0.9996
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.36728,
          "ukmo": 0.02,
          "meteofrance": 0.285638,
          "gfs": 0.115016,
          "gem": 0.053633,
          "jma": 0.118433
        },
        "intercept": 0.5526,
        "betaDrivers": [
          -0.5492,
          0.1303,
          0.099,
          0.1716,
          -0.1351,
          -0.3148
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6593,
        "spreadScale": 0.1944,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247077,
            "ecmwfAifs": 0.082549,
            "icon": 0.207975,
            "ukmo": 0.1256,
            "meteofrance": 0.15668,
            "gfs": 0.065733,
            "gem": 0.058193,
            "jma": 0.056193
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3307,
          "logisticSlope": 3.8713,
          "wetFractionWeight": 2.8245,
          "powerEta": 0.68,
          "rawBrier": 0.03561,
          "calibratedBrier": 0.03341
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.2715,
          "rawIfsRmseC": 1.6271,
          "rawEqualMaeC": 0.9678,
          "rawEqualRmseC": 1.2232,
          "cvSimplexMaeC": 0.9376,
          "cvCalibratedMaeC": 0.7219,
          "cvCalibratedRmseC": 0.953
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.147506,
          "ecmwfAifs": 0.221054,
          "icon": 0.23183,
          "ukmo": 0.036791,
          "meteofrance": 0.169577,
          "gfs": 0.085039,
          "gem": 0.02,
          "jma": 0.088203
        },
        "intercept": 0.5767,
        "betaDrivers": [
          -0.327,
          0.1266,
          0.0916,
          0.0741,
          -0.0874,
          -0.1733
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6748,
        "spreadScale": 0.2469,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320037,
            "ecmwfAifs": 0.223068,
            "icon": 0.130049,
            "ukmo": 0.113925,
            "meteofrance": 0.045134,
            "gfs": 0.064591,
            "gem": 0.057182,
            "jma": 0.046014
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4629,
          "logisticSlope": 3.8831,
          "wetFractionWeight": 2.9599,
          "powerEta": 0.68,
          "rawBrier": 0.03561,
          "calibratedBrier": 0.03202
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.2715,
          "rawIfsRmseC": 1.6271,
          "rawEqualMaeC": 0.9678,
          "rawEqualRmseC": 1.2232,
          "cvSimplexMaeC": 0.9646,
          "cvCalibratedMaeC": 0.7565,
          "cvCalibratedRmseC": 0.9948
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.181258,
          "icon": 0.268637,
          "ukmo": 0.02,
          "meteofrance": 0.208573,
          "gfs": 0.064057,
          "gem": 0.02,
          "jma": 0.217475
        },
        "interceptC": 0.6833,
        "diurnalHarmonicsC": [
          -0.1014,
          0.2855,
          0,
          0
        ],
        "driverBetasC": [
          0.268,
          -0.5203,
          0.053,
          -0.3236
        ],
        "spreadBaseC2": 0.9535,
        "spreadScale": 0.3113,
        "cvMaeC": 0.8927,
        "cvRmseC": 1.199,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.035602,
          "ecmwfAifs": 0.265001,
          "icon": 0.234092,
          "ukmo": 0.043547,
          "meteofrance": 0.165243,
          "gfs": 0.063463,
          "gem": 0.02,
          "jma": 0.173052
        },
        "interceptC": 0.6599,
        "diurnalHarmonicsC": [
          -0.0961,
          0.2228,
          0,
          0
        ],
        "driverBetasC": [
          0.2036,
          -0.3537,
          0.0366,
          -0.2252
        ],
        "spreadBaseC2": 0.9904,
        "spreadScale": 0.3042,
        "cvMaeC": 0.8999,
        "cvRmseC": 1.2096,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.051205,
          "ecmwfAifs": 0.348742,
          "icon": 0.199548,
          "ukmo": 0.067095,
          "meteofrance": 0.121912,
          "gfs": 0.062869,
          "gem": 0.02,
          "jma": 0.128629
        },
        "interceptC": 0.6364,
        "diurnalHarmonicsC": [
          -0.0909,
          0.1602,
          0,
          0
        ],
        "driverBetasC": [
          0.1391,
          -0.1871,
          0.0202,
          -0.1268
        ],
        "spreadBaseC2": 1.0273,
        "spreadScale": 0.297,
        "cvMaeC": 0.907,
        "cvRmseC": 1.2203,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.301925,
          "ukmo": 0.02,
          "meteofrance": 0.452605,
          "gfs": 0.02,
          "gem": 0.093574,
          "jma": 0.071896
        },
        "interceptC": 0.3724,
        "diurnalHarmonicsC": [
          -0.3206,
          0.2177,
          0,
          0
        ],
        "driverBetasC": [
          0.062,
          -0.3262,
          -0.2918,
          -0.1492
        ],
        "spreadBaseC2": 1.0391,
        "spreadScale": 0.1833,
        "cvMaeC": 0.8447,
        "cvRmseC": 1.1603,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.03184,
          "ecmwfAifs": 0.110581,
          "icon": 0.268348,
          "ukmo": 0.02,
          "meteofrance": 0.369283,
          "gfs": 0.02,
          "gem": 0.097983,
          "jma": 0.081965
        },
        "interceptC": 0.4315,
        "diurnalHarmonicsC": [
          -0.2692,
          0.1752,
          0,
          0
        ],
        "driverBetasC": [
          0.0701,
          -0.2563,
          -0.1963,
          -0.1149
        ],
        "spreadBaseC2": 1.0279,
        "spreadScale": 0.2022,
        "cvMaeC": 0.8495,
        "cvRmseC": 1.168,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.043681,
          "ecmwfAifs": 0.201162,
          "icon": 0.23477,
          "ukmo": 0.02,
          "meteofrance": 0.285961,
          "gfs": 0.02,
          "gem": 0.102392,
          "jma": 0.092034
        },
        "interceptC": 0.4905,
        "diurnalHarmonicsC": [
          -0.2178,
          0.1326,
          0,
          0
        ],
        "driverBetasC": [
          0.0781,
          -0.1865,
          -0.1008,
          -0.0805
        ],
        "spreadBaseC2": 1.0167,
        "spreadScale": 0.2212,
        "cvMaeC": 0.8542,
        "cvRmseC": 1.1757,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.037871,
          "ecmwfAifs": 0.02,
          "icon": 0.30976,
          "ukmo": 0.02,
          "meteofrance": 0.341977,
          "gfs": 0.02,
          "gem": 0.230392,
          "jma": 0.02
        },
        "interceptC": 0.3306,
        "diurnalHarmonicsC": [
          -0.6871,
          0.2644,
          0,
          0
        ],
        "driverBetasC": [
          0.2112,
          -0.296,
          -0.1627,
          -0.0192
        ],
        "spreadBaseC2": 0.4626,
        "spreadScale": 0.3062,
        "cvMaeC": 0.6902,
        "cvRmseC": 0.9554,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.140662,
          "ecmwfAifs": 0.074697,
          "icon": 0.279571,
          "ukmo": 0.02,
          "meteofrance": 0.266188,
          "gfs": 0.02,
          "gem": 0.178882,
          "jma": 0.02
        },
        "interceptC": 0.3751,
        "diurnalHarmonicsC": [
          -0.5551,
          0.2369,
          0,
          0
        ],
        "driverBetasC": [
          0.1621,
          -0.2089,
          -0.1043,
          0.0126
        ],
        "spreadBaseC2": 0.5079,
        "spreadScale": 0.3061,
        "cvMaeC": 0.7152,
        "cvRmseC": 0.9775,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.243452,
          "ecmwfAifs": 0.129394,
          "icon": 0.249384,
          "ukmo": 0.02,
          "meteofrance": 0.190399,
          "gfs": 0.02,
          "gem": 0.127371,
          "jma": 0.02
        },
        "interceptC": 0.4197,
        "diurnalHarmonicsC": [
          -0.423,
          0.2093,
          0,
          0
        ],
        "driverBetasC": [
          0.113,
          -0.1219,
          -0.046,
          0.0444
        ],
        "spreadBaseC2": 0.5531,
        "spreadScale": 0.3059,
        "cvMaeC": 0.7402,
        "cvRmseC": 0.9996,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.36728,
          "ukmo": 0.02,
          "meteofrance": 0.285638,
          "gfs": 0.115016,
          "gem": 0.053633,
          "jma": 0.118433
        },
        "interceptC": 0.5526,
        "diurnalHarmonicsC": [
          -0.5492,
          0.1303,
          0,
          0
        ],
        "driverBetasC": [
          0.099,
          -0.3148,
          0.1716,
          -0.1351
        ],
        "spreadBaseC2": 0.6593,
        "spreadScale": 0.1944,
        "cvMaeC": 0.7219,
        "cvRmseC": 0.953,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.083753,
          "ecmwfAifs": 0.120527,
          "icon": 0.299556,
          "ukmo": 0.028395,
          "meteofrance": 0.227608,
          "gfs": 0.100027,
          "gem": 0.036816,
          "jma": 0.103318
        },
        "interceptC": 0.5646,
        "diurnalHarmonicsC": [
          -0.4381,
          0.1285,
          0,
          0
        ],
        "driverBetasC": [
          0.0953,
          -0.2441,
          0.1229,
          -0.1113
        ],
        "spreadBaseC2": 0.667,
        "spreadScale": 0.2207,
        "cvMaeC": 0.7392,
        "cvRmseC": 0.9739,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.147506,
          "ecmwfAifs": 0.221054,
          "icon": 0.23183,
          "ukmo": 0.036791,
          "meteofrance": 0.169577,
          "gfs": 0.085039,
          "gem": 0.02,
          "jma": 0.088203
        },
        "interceptC": 0.5767,
        "diurnalHarmonicsC": [
          -0.327,
          0.1266,
          0,
          0
        ],
        "driverBetasC": [
          0.0916,
          -0.1733,
          0.0741,
          -0.0874
        ],
        "spreadBaseC2": 0.6748,
        "spreadScale": 0.2469,
        "cvMaeC": 0.7565,
        "cvRmseC": 0.9948,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.236247,
        "ecmwfAifs": 0.084648,
        "icon": 0.218151,
        "ukmo": 0.117012,
        "meteofrance": 0.160814,
        "gfs": 0.067089,
        "gem": 0.060052,
        "jma": 0.055987
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.247901,
        "ecmwfAifs": 0.073882,
        "icon": 0.219272,
        "ukmo": 0.119269,
        "meteofrance": 0.163267,
        "gfs": 0.062075,
        "gem": 0.057772,
        "jma": 0.056562
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.237186,
        "ecmwfAifs": 0.081063,
        "icon": 0.221024,
        "ukmo": 0.114167,
        "meteofrance": 0.159728,
        "gfs": 0.068503,
        "gem": 0.058876,
        "jma": 0.059453
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.247077,
        "ecmwfAifs": 0.082549,
        "icon": 0.207975,
        "ukmo": 0.1256,
        "meteofrance": 0.15668,
        "gfs": 0.065733,
        "gem": 0.058193,
        "jma": 0.056193
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.205001,
    "ecmwfAifs": 0.068815,
    "icon": 0.30988,
    "ukmo": 0.168017,
    "meteofrance": 0.107045,
    "gfs": 0.064782,
    "gem": 0.03823,
    "jma": 0.03823
  },
  "pressureWeights": {
    "ecmwfIfs": 0.296172,
    "ecmwfAifs": 0.152373,
    "icon": 0.140698,
    "ukmo": 0.183101,
    "meteofrance": 0.080197,
    "gfs": 0.067263,
    "gem": 0.040098,
    "jma": 0.040098
  }
} as const;

export default PROVINCE_CALIBRATION_TR_22;
