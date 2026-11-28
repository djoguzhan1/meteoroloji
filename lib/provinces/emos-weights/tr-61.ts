import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_61: ProvinceCalibrationBundle = {
  "provinceCode": "TR-61",
  "provinceName": "Trabzon",
  "plateNumber": 61,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17038",
  "stationLat": 41,
  "stationLon": 39.7167,
  "stationElevationM": 35,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.638277,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.241723,
          "jma": 0.02
        },
        "intercept": 0.3327,
        "betaDrivers": [
          0.2538,
          0.2082,
          -0.1493,
          0.5596,
          0.4838,
          -0.0692
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6766,
        "spreadScale": 0.8359,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239254,
            "ecmwfAifs": 0.090345,
            "icon": 0.204699,
            "ukmo": 0.119227,
            "meteofrance": 0.157543,
            "gfs": 0.069235,
            "gem": 0.058924,
            "jma": 0.060773
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0255,
          "logisticSlope": 6.4647,
          "wetFractionWeight": 2.3462,
          "powerEta": 0.68,
          "rawBrier": 0.05513,
          "calibratedBrier": 0.05353
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.0807,
          "rawIfsRmseC": 2.6949,
          "rawEqualMaeC": 1.418,
          "rawEqualRmseC": 1.9265,
          "cvSimplexMaeC": 1.0336,
          "cvCalibratedMaeC": 0.9937,
          "cvCalibratedRmseC": 1.3716
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.133436,
          "icon": 0.46447,
          "ukmo": 0.02,
          "meteofrance": 0.032188,
          "gfs": 0.02,
          "gem": 0.289906,
          "jma": 0.02
        },
        "intercept": 0.4157,
        "betaDrivers": [
          0.1365,
          0.1066,
          -0.04,
          0.2019,
          0.1509,
          -0.0128
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6854,
        "spreadScale": 0.9384,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306374,
            "ecmwfAifs": 0.241351,
            "icon": 0.126543,
            "ukmo": 0.106913,
            "meteofrance": 0.045122,
            "gfs": 0.067258,
            "gem": 0.057241,
            "jma": 0.049198
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2433,
          "logisticSlope": 6.2357,
          "wetFractionWeight": 2.4345,
          "powerEta": 0.68,
          "rawBrier": 0.05513,
          "calibratedBrier": 0.05224
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.0807,
          "rawIfsRmseC": 2.6949,
          "rawEqualMaeC": 1.418,
          "rawEqualRmseC": 1.9265,
          "cvSimplexMaeC": 1.0848,
          "cvCalibratedMaeC": 1.0292,
          "cvCalibratedRmseC": 1.4263
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.080114,
          "icon": 0.72029,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.099596,
          "jma": 0.02
        },
        "intercept": -0.0698,
        "betaDrivers": [
          0.2778,
          0.3533,
          0.1699,
          0.2583,
          0.2773,
          0.3296
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6423,
        "spreadScale": 0.6755,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255063,
            "ecmwfAifs": 0.079274,
            "icon": 0.200569,
            "ukmo": 0.122715,
            "meteofrance": 0.158193,
            "gfs": 0.063868,
            "gem": 0.060942,
            "jma": 0.059376
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4407,
          "logisticSlope": 4.4781,
          "wetFractionWeight": 2.8808,
          "powerEta": 0.68,
          "rawBrier": 0.07531,
          "calibratedBrier": 0.0741
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8192,
          "rawIfsRmseC": 2.5788,
          "rawEqualMaeC": 1.4478,
          "rawEqualRmseC": 2.0752,
          "cvSimplexMaeC": 1.0408,
          "cvCalibratedMaeC": 0.9841,
          "cvCalibratedRmseC": 1.4645
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.248777,
          "icon": 0.458653,
          "ukmo": 0.02,
          "meteofrance": 0.035948,
          "gfs": 0.02,
          "gem": 0.176622,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1347,
          0.2062,
          0.062,
          0.0749,
          0.0656,
          0.21
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6285,
        "spreadScale": 0.7798,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.331164,
            "ecmwfAifs": 0.214723,
            "icon": 0.125715,
            "ukmo": 0.111571,
            "meteofrance": 0.045159,
            "gfs": 0.062907,
            "gem": 0.060025,
            "jma": 0.048736
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5321,
          "logisticSlope": 4.6595,
          "wetFractionWeight": 2.5385,
          "powerEta": 0.68,
          "rawBrier": 0.07531,
          "calibratedBrier": 0.07411
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8192,
          "rawIfsRmseC": 2.5788,
          "rawEqualMaeC": 1.4478,
          "rawEqualRmseC": 2.0752,
          "cvSimplexMaeC": 1.086,
          "cvCalibratedMaeC": 1.0312,
          "cvCalibratedRmseC": 1.5467
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.327634,
          "ukmo": 0.02,
          "meteofrance": 0.05475,
          "gfs": 0.02,
          "gem": 0.517616,
          "jma": 0.02
        },
        "intercept": 0.2319,
        "betaDrivers": [
          0.3277,
          0.2866,
          0.3215,
          0.2172,
          -0.1475,
          0.2018
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.6874,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24643,
            "ecmwfAifs": 0.077942,
            "icon": 0.216532,
            "ukmo": 0.121382,
            "meteofrance": 0.15227,
            "gfs": 0.065635,
            "gem": 0.060556,
            "jma": 0.059253
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.3123,
          "logisticSlope": 3.4498,
          "wetFractionWeight": 3.0521,
          "powerEta": 0.68,
          "rawBrier": 0.08785,
          "calibratedBrier": 0.08688
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6404,
          "rawIfsRmseC": 2.0622,
          "rawEqualMaeC": 1.3214,
          "rawEqualRmseC": 1.579,
          "cvSimplexMaeC": 0.8767,
          "cvCalibratedMaeC": 0.726,
          "cvCalibratedRmseC": 0.9541
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.021546,
          "icon": 0.353285,
          "ukmo": 0.02,
          "meteofrance": 0.179069,
          "gfs": 0.02,
          "gem": 0.3661,
          "jma": 0.02
        },
        "intercept": 0.3067,
        "betaDrivers": [
          0.2133,
          0.1932,
          0.1193,
          0.1043,
          -0.0723,
          0.1139
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.6812,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.321582,
            "ecmwfAifs": 0.21219,
            "icon": 0.136411,
            "ukmo": 0.11092,
            "meteofrance": 0.045091,
            "gfs": 0.064976,
            "gem": 0.059948,
            "jma": 0.048882
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5129,
          "logisticSlope": 3.4461,
          "wetFractionWeight": 2.4582,
          "powerEta": 0.68,
          "rawBrier": 0.08785,
          "calibratedBrier": 0.08628
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6404,
          "rawIfsRmseC": 2.0622,
          "rawEqualMaeC": 1.3214,
          "rawEqualRmseC": 1.579,
          "cvSimplexMaeC": 0.8914,
          "cvCalibratedMaeC": 0.7289,
          "cvCalibratedRmseC": 0.9506
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.514558,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.365442,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.47,
          0.2011,
          0.2572,
          0.0019,
          0.0455,
          0.3048
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.385,
        "spreadScale": 0.6875,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254001,
            "ecmwfAifs": 0.076293,
            "icon": 0.213053,
            "ukmo": 0.119581,
            "meteofrance": 0.152204,
            "gfs": 0.066976,
            "gem": 0.058168,
            "jma": 0.059724
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.716,
          "logisticSlope": 4.0469,
          "wetFractionWeight": 2.9679,
          "powerEta": 0.68,
          "rawBrier": 0.06847,
          "calibratedBrier": 0.06448
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.0078,
          "rawIfsRmseC": 2.5336,
          "rawEqualMaeC": 1.3854,
          "rawEqualRmseC": 1.7312,
          "cvSimplexMaeC": 0.983,
          "cvCalibratedMaeC": 0.9051,
          "cvCalibratedRmseC": 1.2023
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.090727,
          "icon": 0.398105,
          "ukmo": 0.02,
          "meteofrance": 0.033024,
          "gfs": 0.02,
          "gem": 0.326021,
          "jma": 0.092123
        },
        "intercept": 0.2903,
        "betaDrivers": [
          0.2339,
          0.1215,
          0.111,
          -0.0068,
          0.0078,
          0.1321
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2834,
        "spreadScale": 0.8427,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.331148,
            "ecmwfAifs": 0.207504,
            "icon": 0.134092,
            "ukmo": 0.109172,
            "meteofrance": 0.045088,
            "gfs": 0.066242,
            "gem": 0.05753,
            "jma": 0.049224
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0289,
          "logisticSlope": 3.8943,
          "wetFractionWeight": 2.9168,
          "powerEta": 0.68,
          "rawBrier": 0.06847,
          "calibratedBrier": 0.06269
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.0078,
          "rawIfsRmseC": 2.5336,
          "rawEqualMaeC": 1.3854,
          "rawEqualRmseC": 1.7312,
          "cvSimplexMaeC": 1.0379,
          "cvCalibratedMaeC": 0.9423,
          "cvCalibratedRmseC": 1.2572
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
          "icon": 0.638277,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.241723,
          "jma": 0.02
        },
        "interceptC": 0.3327,
        "diurnalHarmonicsC": [
          0.2538,
          0.2082,
          0,
          0
        ],
        "driverBetasC": [
          -0.1493,
          -0.0692,
          0.5596,
          0.4838
        ],
        "spreadBaseC2": 0.6766,
        "spreadScale": 0.8359,
        "cvMaeC": 0.9937,
        "cvRmseC": 1.3716,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.076718,
          "icon": 0.551373,
          "ukmo": 0.02,
          "meteofrance": 0.026094,
          "gfs": 0.02,
          "gem": 0.265815,
          "jma": 0.02
        },
        "interceptC": 0.3742,
        "diurnalHarmonicsC": [
          0.1952,
          0.1574,
          0,
          0
        ],
        "driverBetasC": [
          -0.0946,
          -0.041,
          0.3807,
          0.3174
        ],
        "spreadBaseC2": 0.681,
        "spreadScale": 0.8871,
        "cvMaeC": 1.0114,
        "cvRmseC": 1.3989,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.133436,
          "icon": 0.46447,
          "ukmo": 0.02,
          "meteofrance": 0.032188,
          "gfs": 0.02,
          "gem": 0.289906,
          "jma": 0.02
        },
        "interceptC": 0.4157,
        "diurnalHarmonicsC": [
          0.1365,
          0.1066,
          0,
          0
        ],
        "driverBetasC": [
          -0.04,
          -0.0128,
          0.2019,
          0.1509
        ],
        "spreadBaseC2": 0.6854,
        "spreadScale": 0.9384,
        "cvMaeC": 1.0292,
        "cvRmseC": 1.4263,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.080114,
          "icon": 0.72029,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.099596,
          "jma": 0.02
        },
        "interceptC": -0.0698,
        "diurnalHarmonicsC": [
          0.2778,
          0.3533,
          0,
          0
        ],
        "driverBetasC": [
          0.1699,
          0.3296,
          0.2583,
          0.2773
        ],
        "spreadBaseC2": 0.6423,
        "spreadScale": 0.6755,
        "cvMaeC": 0.9841,
        "cvRmseC": 1.4645,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.164446,
          "icon": 0.589471,
          "ukmo": 0.02,
          "meteofrance": 0.027974,
          "gfs": 0.02,
          "gem": 0.138109,
          "jma": 0.02
        },
        "interceptC": -0.0349,
        "diurnalHarmonicsC": [
          0.2062,
          0.2797,
          0,
          0
        ],
        "driverBetasC": [
          0.1159,
          0.2698,
          0.1666,
          0.1714
        ],
        "spreadBaseC2": 0.6354,
        "spreadScale": 0.7277,
        "cvMaeC": 1.0076,
        "cvRmseC": 1.5056,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.248777,
          "icon": 0.458653,
          "ukmo": 0.02,
          "meteofrance": 0.035948,
          "gfs": 0.02,
          "gem": 0.176622,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1347,
          0.2062,
          0,
          0
        ],
        "driverBetasC": [
          0.062,
          0.21,
          0.0749,
          0.0656
        ],
        "spreadBaseC2": 0.6285,
        "spreadScale": 0.7798,
        "cvMaeC": 1.0312,
        "cvRmseC": 1.5467,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.327634,
          "ukmo": 0.02,
          "meteofrance": 0.05475,
          "gfs": 0.02,
          "gem": 0.517616,
          "jma": 0.02
        },
        "interceptC": 0.2319,
        "diurnalHarmonicsC": [
          0.3277,
          0.2866,
          0,
          0
        ],
        "driverBetasC": [
          0.3215,
          0.2018,
          0.2172,
          -0.1475
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.6874,
        "cvMaeC": 0.726,
        "cvRmseC": 0.9541,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.020773,
          "icon": 0.34046,
          "ukmo": 0.02,
          "meteofrance": 0.11691,
          "gfs": 0.02,
          "gem": 0.441857,
          "jma": 0.02
        },
        "interceptC": 0.2693,
        "diurnalHarmonicsC": [
          0.2705,
          0.2399,
          0,
          0
        ],
        "driverBetasC": [
          0.2204,
          0.1578,
          0.1608,
          -0.1099
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.6843,
        "cvMaeC": 0.7274,
        "cvRmseC": 0.9524,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.021546,
          "icon": 0.353285,
          "ukmo": 0.02,
          "meteofrance": 0.179069,
          "gfs": 0.02,
          "gem": 0.3661,
          "jma": 0.02
        },
        "interceptC": 0.3067,
        "diurnalHarmonicsC": [
          0.2133,
          0.1932,
          0,
          0
        ],
        "driverBetasC": [
          0.1193,
          0.1139,
          0.1043,
          -0.0723
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.6812,
        "cvMaeC": 0.7289,
        "cvRmseC": 0.9506,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.514558,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.365442,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.47,
          0.2011,
          0,
          0
        ],
        "driverBetasC": [
          0.2572,
          0.3048,
          0.0019,
          0.0455
        ],
        "spreadBaseC2": 0.385,
        "spreadScale": 0.6875,
        "cvMaeC": 0.9051,
        "cvRmseC": 1.2023,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.055364,
          "icon": 0.456331,
          "ukmo": 0.02,
          "meteofrance": 0.026512,
          "gfs": 0.02,
          "gem": 0.345731,
          "jma": 0.056062
        },
        "interceptC": 0.1452,
        "diurnalHarmonicsC": [
          0.3519,
          0.1613,
          0,
          0
        ],
        "driverBetasC": [
          0.1841,
          0.2185,
          -0.0024,
          0.0267
        ],
        "spreadBaseC2": 0.3342,
        "spreadScale": 0.7651,
        "cvMaeC": 0.9237,
        "cvRmseC": 1.2298,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.090727,
          "icon": 0.398105,
          "ukmo": 0.02,
          "meteofrance": 0.033024,
          "gfs": 0.02,
          "gem": 0.326021,
          "jma": 0.092123
        },
        "interceptC": 0.2903,
        "diurnalHarmonicsC": [
          0.2339,
          0.1215,
          0,
          0
        ],
        "driverBetasC": [
          0.111,
          0.1321,
          -0.0068,
          0.0078
        ],
        "spreadBaseC2": 0.2834,
        "spreadScale": 0.8427,
        "cvMaeC": 0.9423,
        "cvRmseC": 1.2572,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.239254,
        "ecmwfAifs": 0.090345,
        "icon": 0.204699,
        "ukmo": 0.119227,
        "meteofrance": 0.157543,
        "gfs": 0.069235,
        "gem": 0.058924,
        "jma": 0.060773
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.255063,
        "ecmwfAifs": 0.079274,
        "icon": 0.200569,
        "ukmo": 0.122715,
        "meteofrance": 0.158193,
        "gfs": 0.063868,
        "gem": 0.060942,
        "jma": 0.059376
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.24643,
        "ecmwfAifs": 0.077942,
        "icon": 0.216532,
        "ukmo": 0.121382,
        "meteofrance": 0.15227,
        "gfs": 0.065635,
        "gem": 0.060556,
        "jma": 0.059253
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.254001,
        "ecmwfAifs": 0.076293,
        "icon": 0.213053,
        "ukmo": 0.119581,
        "meteofrance": 0.152204,
        "gfs": 0.066976,
        "gem": 0.058168,
        "jma": 0.059724
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.219263,
    "ecmwfAifs": 0.06918,
    "icon": 0.27534,
    "ukmo": 0.158503,
    "meteofrance": 0.107614,
    "gfs": 0.093234,
    "gem": 0.038433,
    "jma": 0.038433
  },
  "pressureWeights": {
    "ecmwfIfs": 0.295612,
    "ecmwfAifs": 0.161948,
    "icon": 0.145623,
    "ukmo": 0.14204,
    "meteofrance": 0.085236,
    "gfs": 0.084305,
    "gem": 0.042618,
    "jma": 0.042618
  }
} as const;

export default PROVINCE_CALIBRATION_TR_61;
