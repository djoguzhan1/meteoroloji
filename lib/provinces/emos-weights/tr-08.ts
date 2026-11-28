import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_08: ProvinceCalibrationBundle = {
  "provinceCode": "TR-08",
  "provinceName": "Artvin",
  "plateNumber": 8,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17045",
  "stationLat": 41.1667,
  "stationLon": 41.8167,
  "stationElevationM": 613,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.265428,
          "ukmo": 0.02,
          "meteofrance": 0.614572,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 2.0681,
        "betaDrivers": [
          -0.3646,
          -0.3077,
          -1.0269,
          -0.7245,
          0.1563,
          0.0687
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.911,
        "spreadScale": 0.4349,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251426,
            "ecmwfAifs": 0.081429,
            "icon": 0.226014,
            "ukmo": 0.11071,
            "meteofrance": 0.158715,
            "gfs": 0.073566,
            "gem": 0.046826,
            "jma": 0.051314
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4747,
          "logisticSlope": 6.3552,
          "wetFractionWeight": 3.8449,
          "powerEta": 0.68,
          "rawBrier": 0.0464,
          "calibratedBrier": 0.03859
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 3.6061,
          "rawIfsRmseC": 3.7579,
          "rawEqualMaeC": 2.799,
          "rawEqualRmseC": 3.0894,
          "cvSimplexMaeC": 2.1729,
          "cvCalibratedMaeC": 1.3517,
          "cvCalibratedRmseC": 1.7901
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.189032,
          "ecmwfAifs": 0.054889,
          "icon": 0.372202,
          "ukmo": 0.02,
          "meteofrance": 0.280858,
          "gfs": 0.035701,
          "gem": 0.02,
          "jma": 0.027318
        },
        "intercept": 2.1148,
        "betaDrivers": [
          -0.1974,
          -0.245,
          -0.3985,
          -0.2141,
          -0.0073,
          0.0876
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7724,
        "spreadScale": 0.3089,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.328092,
            "ecmwfAifs": 0.221675,
            "icon": 0.142379,
            "ukmo": 0.101165,
            "meteofrance": 0.045177,
            "gfs": 0.072826,
            "gem": 0.046355,
            "jma": 0.042331
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6169,
          "logisticSlope": 5.8561,
          "wetFractionWeight": 3.8522,
          "powerEta": 0.68,
          "rawBrier": 0.0464,
          "calibratedBrier": 0.03995
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 3.6061,
          "rawIfsRmseC": 3.7579,
          "rawEqualMaeC": 2.799,
          "rawEqualRmseC": 3.0894,
          "cvSimplexMaeC": 2.2175,
          "cvCalibratedMaeC": 1.2107,
          "cvCalibratedRmseC": 1.547
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.230785,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.649215
        },
        "intercept": 1.9826,
        "betaDrivers": [
          -0.094,
          -0.1816,
          0.3918,
          0.5174,
          -0.4971,
          -1.4187
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5255,
        "spreadScale": 0.489,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249828,
            "ecmwfAifs": 0.069406,
            "icon": 0.220429,
            "ukmo": 0.1201,
            "meteofrance": 0.15698,
            "gfs": 0.070366,
            "gem": 0.058535,
            "jma": 0.054356
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6466,
          "logisticSlope": 3.1056,
          "wetFractionWeight": 3.7858,
          "powerEta": 0.68,
          "rawBrier": 0.07041,
          "calibratedBrier": 0.06311
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 3.0648,
          "rawIfsRmseC": 3.2529,
          "rawEqualMaeC": 2.945,
          "rawEqualRmseC": 3.2381,
          "cvSimplexMaeC": 2.2252,
          "cvCalibratedMaeC": 1.4191,
          "cvCalibratedRmseC": 1.785
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.35052,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.52948
        },
        "intercept": 2.1398,
        "betaDrivers": [
          -0.0428,
          -0.11,
          0.1434,
          0.165,
          -0.1972,
          -0.5468
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5245,
        "spreadScale": 0.2875,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.332553,
            "ecmwfAifs": 0.192741,
            "icon": 0.141651,
            "ukmo": 0.111951,
            "meteofrance": 0.045195,
            "gfs": 0.071057,
            "gem": 0.05911,
            "jma": 0.045742
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7667,
          "logisticSlope": 3.6792,
          "wetFractionWeight": 3.365,
          "powerEta": 0.68,
          "rawBrier": 0.07041,
          "calibratedBrier": 0.06221
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 3.0648,
          "rawIfsRmseC": 3.2529,
          "rawEqualMaeC": 2.945,
          "rawEqualRmseC": 3.2381,
          "cvSimplexMaeC": 2.2711,
          "cvCalibratedMaeC": 1.2544,
          "cvCalibratedRmseC": 1.5801
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.086521,
          "jma": 0.793479
        },
        "intercept": 1.3477,
        "betaDrivers": [
          0.3971,
          0.4778,
          0.7091,
          0.0353,
          -0.5077,
          -1.3981
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1525,
        "spreadScale": 0.7705,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.272696,
            "ecmwfAifs": 0.041936,
            "icon": 0.224667,
            "ukmo": 0.123212,
            "meteofrance": 0.159233,
            "gfs": 0.067282,
            "gem": 0.056705,
            "jma": 0.054269
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9959,
          "logisticSlope": 3.0848,
          "wetFractionWeight": 3.2473,
          "powerEta": 0.68,
          "rawBrier": 0.05619,
          "calibratedBrier": 0.04389
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 2.8368,
          "rawIfsRmseC": 2.9529,
          "rawEqualMaeC": 2.6208,
          "rawEqualRmseC": 2.7963,
          "cvSimplexMaeC": 1.5245,
          "cvCalibratedMaeC": 1.1229,
          "cvCalibratedRmseC": 1.4303
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.161236,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.139552,
          "jma": 0.599212
        },
        "intercept": 1.4919,
        "betaDrivers": [
          0.22,
          0.1766,
          0.2294,
          0.043,
          -0.1824,
          -0.4111
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1731,
        "spreadScale": 0.6017,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.381001,
            "ecmwfAifs": 0.122233,
            "icon": 0.151536,
            "ukmo": 0.120549,
            "meteofrance": 0.045333,
            "gfs": 0.071313,
            "gem": 0.060102,
            "jma": 0.047933
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3219,
          "logisticSlope": 3.4887,
          "wetFractionWeight": 3.2237,
          "powerEta": 0.68,
          "rawBrier": 0.05619,
          "calibratedBrier": 0.0429
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 2.8368,
          "rawIfsRmseC": 2.9529,
          "rawEqualMaeC": 2.6208,
          "rawEqualRmseC": 2.7963,
          "cvSimplexMaeC": 1.6003,
          "cvCalibratedMaeC": 0.995,
          "cvCalibratedRmseC": 1.2851
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.86
        },
        "intercept": 1.9642,
        "betaDrivers": [
          0.2475,
          -0.1465,
          0.0775,
          0.1047,
          -0.2866,
          -1.1384
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.1114,
        "spreadScale": 0.3051,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258273,
            "ecmwfAifs": 0.061534,
            "icon": 0.218726,
            "ukmo": 0.119116,
            "meteofrance": 0.157173,
            "gfs": 0.074007,
            "gem": 0.052612,
            "jma": 0.058559
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.062,
          "logisticSlope": 3.9869,
          "wetFractionWeight": 3.7732,
          "powerEta": 0.68,
          "rawBrier": 0.04599,
          "calibratedBrier": 0.0445
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 3.2548,
          "rawIfsRmseC": 3.38,
          "rawEqualMaeC": 2.959,
          "rawEqualRmseC": 3.1737,
          "cvSimplexMaeC": 1.9751,
          "cvCalibratedMaeC": 1.3522,
          "cvCalibratedRmseC": 1.6987
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.149949,
          "ecmwfAifs": 0.02,
          "icon": 0.04718,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.045455,
          "gem": 0.02,
          "jma": 0.677416
        },
        "intercept": 2.0594,
        "betaDrivers": [
          0.0969,
          -0.1097,
          0.0294,
          0.0377,
          -0.122,
          -0.3599
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6676,
        "spreadScale": 0.1761,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.347937,
            "ecmwfAifs": 0.172941,
            "icon": 0.14225,
            "ukmo": 0.112372,
            "meteofrance": 0.045224,
            "gfs": 0.075635,
            "gem": 0.053769,
            "jma": 0.049872
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4131,
          "logisticSlope": 3.9569,
          "wetFractionWeight": 3.8811,
          "powerEta": 0.68,
          "rawBrier": 0.04599,
          "calibratedBrier": 0.04191
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 3.2548,
          "rawIfsRmseC": 3.38,
          "rawEqualMaeC": 2.959,
          "rawEqualRmseC": 3.1737,
          "cvSimplexMaeC": 2.1588,
          "cvCalibratedMaeC": 1.1487,
          "cvCalibratedRmseC": 1.453
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.265428,
          "ukmo": 0.02,
          "meteofrance": 0.614572,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 2.0681,
        "diurnalHarmonicsC": [
          -0.3646,
          -0.3077,
          0,
          0
        ],
        "driverBetasC": [
          -1.0269,
          0.0687,
          -0.7245,
          0.1563
        ],
        "spreadBaseC2": 0.911,
        "spreadScale": 0.4349,
        "cvMaeC": 1.3517,
        "cvRmseC": 1.7901,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.104516,
          "ecmwfAifs": 0.037445,
          "icon": 0.318815,
          "ukmo": 0.02,
          "meteofrance": 0.447714,
          "gfs": 0.027851,
          "gem": 0.02,
          "jma": 0.023659
        },
        "interceptC": 2.0915,
        "diurnalHarmonicsC": [
          -0.281,
          -0.2763,
          0,
          0
        ],
        "driverBetasC": [
          -0.7127,
          0.0781,
          -0.4693,
          0.0745
        ],
        "spreadBaseC2": 0.8417,
        "spreadScale": 0.3719,
        "cvMaeC": 1.2812,
        "cvRmseC": 1.6685,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.189032,
          "ecmwfAifs": 0.054889,
          "icon": 0.372202,
          "ukmo": 0.02,
          "meteofrance": 0.280858,
          "gfs": 0.035701,
          "gem": 0.02,
          "jma": 0.027318
        },
        "interceptC": 2.1148,
        "diurnalHarmonicsC": [
          -0.1974,
          -0.245,
          0,
          0
        ],
        "driverBetasC": [
          -0.3985,
          0.0876,
          -0.2141,
          -0.0073
        ],
        "spreadBaseC2": 0.7724,
        "spreadScale": 0.3089,
        "cvMaeC": 1.2107,
        "cvRmseC": 1.547,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.230785,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.649215
        },
        "interceptC": 1.9826,
        "diurnalHarmonicsC": [
          -0.094,
          -0.1816,
          0,
          0
        ],
        "driverBetasC": [
          0.3918,
          -1.4187,
          0.5174,
          -0.4971
        ],
        "spreadBaseC2": 1.5255,
        "spreadScale": 0.489,
        "cvMaeC": 1.4191,
        "cvRmseC": 1.785,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.290653,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.589347
        },
        "interceptC": 2.0612,
        "diurnalHarmonicsC": [
          -0.0684,
          -0.1458,
          0,
          0
        ],
        "driverBetasC": [
          0.2676,
          -0.9828,
          0.3412,
          -0.3471
        ],
        "spreadBaseC2": 1.525,
        "spreadScale": 0.3882,
        "cvMaeC": 1.3367,
        "cvRmseC": 1.6825,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.35052,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.52948
        },
        "interceptC": 2.1398,
        "diurnalHarmonicsC": [
          -0.0428,
          -0.11,
          0,
          0
        ],
        "driverBetasC": [
          0.1434,
          -0.5468,
          0.165,
          -0.1972
        ],
        "spreadBaseC2": 1.5245,
        "spreadScale": 0.2875,
        "cvMaeC": 1.2544,
        "cvRmseC": 1.5801,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.086521,
          "jma": 0.793479
        },
        "interceptC": 1.3477,
        "diurnalHarmonicsC": [
          0.3971,
          0.4778,
          0,
          0
        ],
        "driverBetasC": [
          0.7091,
          -1.3981,
          0.0353,
          -0.5077
        ],
        "spreadBaseC2": 0.1525,
        "spreadScale": 0.7705,
        "cvMaeC": 1.1229,
        "cvRmseC": 1.4303,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.090618,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.113037,
          "jma": 0.696345
        },
        "interceptC": 1.4198,
        "diurnalHarmonicsC": [
          0.3085,
          0.3272,
          0,
          0
        ],
        "driverBetasC": [
          0.4692,
          -0.9046,
          0.0391,
          -0.3451
        ],
        "spreadBaseC2": 0.1628,
        "spreadScale": 0.6861,
        "cvMaeC": 1.059,
        "cvRmseC": 1.3577,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.161236,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.139552,
          "jma": 0.599212
        },
        "interceptC": 1.4919,
        "diurnalHarmonicsC": [
          0.22,
          0.1766,
          0,
          0
        ],
        "driverBetasC": [
          0.2294,
          -0.4111,
          0.043,
          -0.1824
        ],
        "spreadBaseC2": 0.1731,
        "spreadScale": 0.6017,
        "cvMaeC": 0.995,
        "cvRmseC": 1.2851,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.86
        },
        "interceptC": 1.9642,
        "diurnalHarmonicsC": [
          0.2475,
          -0.1465,
          0,
          0
        ],
        "driverBetasC": [
          0.0775,
          -1.1384,
          0.1047,
          -0.2866
        ],
        "spreadBaseC2": 2.1114,
        "spreadScale": 0.3051,
        "cvMaeC": 1.3522,
        "cvRmseC": 1.6987,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.084975,
          "ecmwfAifs": 0.02,
          "icon": 0.03359,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.032728,
          "gem": 0.02,
          "jma": 0.768707
        },
        "interceptC": 2.0118,
        "diurnalHarmonicsC": [
          0.1722,
          -0.1281,
          0,
          0
        ],
        "driverBetasC": [
          0.0534,
          -0.7491,
          0.0712,
          -0.2043
        ],
        "spreadBaseC2": 1.8895,
        "spreadScale": 0.2406,
        "cvMaeC": 1.2505,
        "cvRmseC": 1.5758,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.149949,
          "ecmwfAifs": 0.02,
          "icon": 0.04718,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.045455,
          "gem": 0.02,
          "jma": 0.677416
        },
        "interceptC": 2.0594,
        "diurnalHarmonicsC": [
          0.0969,
          -0.1097,
          0,
          0
        ],
        "driverBetasC": [
          0.0294,
          -0.3599,
          0.0377,
          -0.122
        ],
        "spreadBaseC2": 1.6676,
        "spreadScale": 0.1761,
        "cvMaeC": 1.1487,
        "cvRmseC": 1.453,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.251426,
        "ecmwfAifs": 0.081429,
        "icon": 0.226014,
        "ukmo": 0.11071,
        "meteofrance": 0.158715,
        "gfs": 0.073566,
        "gem": 0.046826,
        "jma": 0.051314
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.249828,
        "ecmwfAifs": 0.069406,
        "icon": 0.220429,
        "ukmo": 0.1201,
        "meteofrance": 0.15698,
        "gfs": 0.070366,
        "gem": 0.058535,
        "jma": 0.054356
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.272696,
        "ecmwfAifs": 0.041936,
        "icon": 0.224667,
        "ukmo": 0.123212,
        "meteofrance": 0.159233,
        "gfs": 0.067282,
        "gem": 0.056705,
        "jma": 0.054269
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.258273,
        "ecmwfAifs": 0.061534,
        "icon": 0.218726,
        "ukmo": 0.119116,
        "meteofrance": 0.157173,
        "gfs": 0.074007,
        "gem": 0.052612,
        "jma": 0.058559
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.197311,
    "ecmwfAifs": 0.072004,
    "icon": 0.260092,
    "ukmo": 0.163106,
    "meteofrance": 0.112006,
    "gfs": 0.115477,
    "gem": 0.040002,
    "jma": 0.040002
  },
  "pressureWeights": {
    "ecmwfIfs": 0.38828,
    "ecmwfAifs": 0.134257,
    "icon": 0.141632,
    "ukmo": 0.144749,
    "meteofrance": 0.070661,
    "gfs": 0.049759,
    "gem": 0.035331,
    "jma": 0.035331
  }
} as const;

export default PROVINCE_CALIBRATION_TR_08;
