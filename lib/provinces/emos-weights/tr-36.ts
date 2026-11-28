import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_36: ProvinceCalibrationBundle = {
  "provinceCode": "TR-36",
  "provinceName": "Kars",
  "plateNumber": 36,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17098",
  "stationLat": 40.6,
  "stationLon": 43.0833,
  "stationElevationM": 1775,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.312821,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.115218,
          "gfs": 0.113938,
          "gem": 0.378023,
          "jma": 0.02
        },
        "intercept": -0.0711,
        "betaDrivers": [
          -0.1277,
          0.3841,
          -0.7168,
          0.4075,
          1.125,
          0.7089
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.9044,
        "spreadScale": 0.735,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250986,
            "ecmwfAifs": 0.081598,
            "icon": 0.203205,
            "ukmo": 0.117978,
            "meteofrance": 0.155617,
            "gfs": 0.072622,
            "gem": 0.056904,
            "jma": 0.06109
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4875,
          "logisticSlope": 6.0713,
          "wetFractionWeight": 3.6457,
          "powerEta": 0.68,
          "rawBrier": 0.02435,
          "calibratedBrier": 0.02316
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 3.0571,
          "rawIfsRmseC": 4.1379,
          "rawEqualMaeC": 2.2378,
          "rawEqualRmseC": 3.0293,
          "cvSimplexMaeC": 2.0092,
          "cvCalibratedMaeC": 1.9315,
          "cvCalibratedRmseC": 2.5426
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.390571,
          "icon": 0.02,
          "ukmo": 0.054752,
          "meteofrance": 0.104465,
          "gfs": 0.103366,
          "gem": 0.286846,
          "jma": 0.02
        },
        "intercept": -0.1734,
        "betaDrivers": [
          -0.0965,
          0.1055,
          -0.2753,
          0.2035,
          0.4232,
          0.3104
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.6646,
        "spreadScale": 0.8398,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324389,
            "ecmwfAifs": 0.220016,
            "icon": 0.126789,
            "ukmo": 0.106777,
            "meteofrance": 0.045115,
            "gfs": 0.071205,
            "gem": 0.055794,
            "jma": 0.049915
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.619,
          "logisticSlope": 5.9048,
          "wetFractionWeight": 3.6786,
          "powerEta": 0.68,
          "rawBrier": 0.02435,
          "calibratedBrier": 0.02194
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 3.0571,
          "rawIfsRmseC": 4.1379,
          "rawEqualMaeC": 2.2378,
          "rawEqualRmseC": 3.0293,
          "cvSimplexMaeC": 2.0119,
          "cvCalibratedMaeC": 1.9672,
          "cvCalibratedRmseC": 2.6043
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.087405,
          "ecmwfAifs": 0.043112,
          "icon": 0.277166,
          "ukmo": 0.202278,
          "meteofrance": 0.02,
          "gfs": 0.064696,
          "gem": 0.285343,
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
        "maxResidualShiftC": 0.5,
        "spreadBaseC2": 1.457,
        "spreadScale": 0.4605,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24917,
            "ecmwfAifs": 0.074028,
            "icon": 0.219134,
            "ukmo": 0.123035,
            "meteofrance": 0.154004,
            "gfs": 0.066705,
            "gem": 0.05432,
            "jma": 0.059604
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4231,
          "logisticSlope": 2.9297,
          "wetFractionWeight": 2.6063,
          "powerEta": 0.68,
          "rawBrier": 0.08412,
          "calibratedBrier": 0.07766
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.6428,
          "rawIfsRmseC": 2.1443,
          "rawEqualMaeC": 1.3015,
          "rawEqualRmseC": 1.7282,
          "cvSimplexMaeC": 1.2363,
          "cvCalibratedMaeC": 1.2363,
          "cvCalibratedRmseC": 1.6189
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.191901,
          "ecmwfAifs": 0.130582,
          "icon": 0.223398,
          "ukmo": 0.166037,
          "meteofrance": 0.02142,
          "gfs": 0.048094,
          "gem": 0.198568,
          "jma": 0.02
        },
        "intercept": 0.0431,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.4258,
        "spreadScale": 0.5009,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.32815,
            "ecmwfAifs": 0.20339,
            "icon": 0.139321,
            "ukmo": 0.113467,
            "meteofrance": 0.045133,
            "gfs": 0.066644,
            "gem": 0.05427,
            "jma": 0.049625
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5134,
          "logisticSlope": 3.1606,
          "wetFractionWeight": 2.6033,
          "powerEta": 0.68,
          "rawBrier": 0.08412,
          "calibratedBrier": 0.07684
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.6428,
          "rawIfsRmseC": 2.1443,
          "rawEqualMaeC": 1.3015,
          "rawEqualRmseC": 1.7282,
          "cvSimplexMaeC": 1.242,
          "cvCalibratedMaeC": 1.2413,
          "cvCalibratedRmseC": 1.6378
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.138955,
          "ukmo": 0.336713,
          "meteofrance": 0.02,
          "gfs": 0.198911,
          "gem": 0.245421,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.003,
          -0.1451,
          0.0907,
          -0.0477,
          0.0116,
          -0.1162
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4609,
        "spreadScale": 0.4861,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259912,
            "ecmwfAifs": 0.073762,
            "icon": 0.205972,
            "ukmo": 0.13214,
            "meteofrance": 0.152745,
            "gfs": 0.062736,
            "gem": 0.053171,
            "jma": 0.059562
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8798,
          "logisticSlope": 2.264,
          "wetFractionWeight": 3.2524,
          "powerEta": 0.68,
          "rawBrier": 0.05674,
          "calibratedBrier": 0.04606
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4618,
          "rawIfsRmseC": 1.8733,
          "rawEqualMaeC": 1.3661,
          "rawEqualRmseC": 1.7349,
          "cvSimplexMaeC": 1.2244,
          "cvCalibratedMaeC": 1.2201,
          "cvCalibratedRmseC": 1.5849
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.222985,
          "ecmwfAifs": 0.059139,
          "icon": 0.139767,
          "ukmo": 0.225855,
          "meteofrance": 0.02,
          "gfs": 0.131379,
          "gem": 0.180875,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0439,
          -0.1679,
          0.0243,
          -0.0341,
          0.0265,
          -0.0687
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5337,
        "spreadScale": 0.4701,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.339362,
            "ecmwfAifs": 0.200922,
            "icon": 0.129829,
            "ukmo": 0.120818,
            "meteofrance": 0.045098,
            "gfs": 0.062141,
            "gem": 0.052666,
            "jma": 0.049164
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0835,
          "logisticSlope": 2.2012,
          "wetFractionWeight": 3.6457,
          "powerEta": 0.68,
          "rawBrier": 0.05674,
          "calibratedBrier": 0.04343
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4618,
          "rawIfsRmseC": 1.8733,
          "rawEqualMaeC": 1.3661,
          "rawEqualRmseC": 1.7349,
          "cvSimplexMaeC": 1.2486,
          "cvCalibratedMaeC": 1.2402,
          "cvCalibratedRmseC": 1.5944
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.299391,
          "ukmo": 0.058725,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.541884,
          "jma": 0.02
        },
        "intercept": 0.1158,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.6038,
        "spreadScale": 0.4882,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.263476,
            "ecmwfAifs": 0.073325,
            "icon": 0.209658,
            "ukmo": 0.116625,
            "meteofrance": 0.154545,
            "gfs": 0.066494,
            "gem": 0.056665,
            "jma": 0.059212
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0959,
          "logisticSlope": 3.7461,
          "wetFractionWeight": 2.3542,
          "powerEta": 0.68,
          "rawBrier": 0.04116,
          "calibratedBrier": 0.03629
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.8637,
          "rawIfsRmseC": 2.5068,
          "rawEqualMaeC": 1.7061,
          "rawEqualRmseC": 2.206,
          "cvSimplexMaeC": 1.3913,
          "cvCalibratedMaeC": 1.3877,
          "cvCalibratedRmseC": 1.7556
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.137899,
          "ecmwfAifs": 0.103989,
          "icon": 0.231213,
          "ukmo": 0.107833,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.359066,
          "jma": 0.02
        },
        "intercept": 0.0213,
        "betaDrivers": [
          -0.1413,
          -0.2512,
          -0.1479,
          0.0014,
          0.1768,
          0.1307
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3732,
        "spreadScale": 0.6284,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.344548,
            "ecmwfAifs": 0.200042,
            "icon": 0.132357,
            "ukmo": 0.106798,
            "meteofrance": 0.045125,
            "gfs": 0.065965,
            "gem": 0.056214,
            "jma": 0.048951
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.223,
          "logisticSlope": 3.3712,
          "wetFractionWeight": 2.8399,
          "powerEta": 0.68,
          "rawBrier": 0.04116,
          "calibratedBrier": 0.03467
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.8637,
          "rawIfsRmseC": 2.5068,
          "rawEqualMaeC": 1.7061,
          "rawEqualRmseC": 2.206,
          "cvSimplexMaeC": 1.4393,
          "cvCalibratedMaeC": 1.427,
          "cvCalibratedRmseC": 1.8086
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.312821,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.115218,
          "gfs": 0.113938,
          "gem": 0.378023,
          "jma": 0.02
        },
        "interceptC": -0.0711,
        "diurnalHarmonicsC": [
          -0.1277,
          0.3841,
          0,
          0
        ],
        "driverBetasC": [
          -0.7168,
          0.7089,
          0.4075,
          1.125
        ],
        "spreadBaseC2": 2.9044,
        "spreadScale": 0.735,
        "cvMaeC": 1.9315,
        "cvRmseC": 2.5426,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.351696,
          "icon": 0.02,
          "ukmo": 0.037376,
          "meteofrance": 0.109842,
          "gfs": 0.108652,
          "gem": 0.332434,
          "jma": 0.02
        },
        "interceptC": -0.1222,
        "diurnalHarmonicsC": [
          -0.1121,
          0.2448,
          0,
          0
        ],
        "driverBetasC": [
          -0.496,
          0.5096,
          0.3055,
          0.7741
        ],
        "spreadBaseC2": 2.7845,
        "spreadScale": 0.7874,
        "cvMaeC": 1.9493,
        "cvRmseC": 2.5735,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.390571,
          "icon": 0.02,
          "ukmo": 0.054752,
          "meteofrance": 0.104465,
          "gfs": 0.103366,
          "gem": 0.286846,
          "jma": 0.02
        },
        "interceptC": -0.1734,
        "diurnalHarmonicsC": [
          -0.0965,
          0.1055,
          0,
          0
        ],
        "driverBetasC": [
          -0.2753,
          0.3104,
          0.2035,
          0.4232
        ],
        "spreadBaseC2": 2.6646,
        "spreadScale": 0.8398,
        "cvMaeC": 1.9672,
        "cvRmseC": 2.6043,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.087405,
          "ecmwfAifs": 0.043112,
          "icon": 0.277166,
          "ukmo": 0.202278,
          "meteofrance": 0.02,
          "gfs": 0.064696,
          "gem": 0.285343,
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
        "spreadBaseC2": 1.457,
        "spreadScale": 0.4605,
        "cvMaeC": 1.2363,
        "cvRmseC": 1.6189,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.139653,
          "ecmwfAifs": 0.086847,
          "icon": 0.250281,
          "ukmo": 0.184158,
          "meteofrance": 0.02071,
          "gfs": 0.056395,
          "gem": 0.241956,
          "jma": 0.02
        },
        "interceptC": 0.0215,
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
        "spreadBaseC2": 1.4414,
        "spreadScale": 0.4807,
        "cvMaeC": 1.2388,
        "cvRmseC": 1.6283,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.191901,
          "ecmwfAifs": 0.130582,
          "icon": 0.223398,
          "ukmo": 0.166037,
          "meteofrance": 0.02142,
          "gfs": 0.048094,
          "gem": 0.198568,
          "jma": 0.02
        },
        "interceptC": 0.0431,
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
        "spreadBaseC2": 1.4258,
        "spreadScale": 0.5009,
        "cvMaeC": 1.2413,
        "cvRmseC": 1.6378,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.138955,
          "ukmo": 0.336713,
          "meteofrance": 0.02,
          "gfs": 0.198911,
          "gem": 0.245421,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.003,
          -0.1451,
          0,
          0
        ],
        "driverBetasC": [
          0.0907,
          -0.1162,
          -0.0477,
          0.0116
        ],
        "spreadBaseC2": 1.4609,
        "spreadScale": 0.4861,
        "cvMaeC": 1.2201,
        "cvRmseC": 1.5849,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.121492,
          "ecmwfAifs": 0.03957,
          "icon": 0.139361,
          "ukmo": 0.281284,
          "meteofrance": 0.02,
          "gfs": 0.165145,
          "gem": 0.213148,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0235,
          -0.1565,
          0,
          0
        ],
        "driverBetasC": [
          0.0575,
          -0.0925,
          -0.0409,
          0.019
        ],
        "spreadBaseC2": 1.4973,
        "spreadScale": 0.4781,
        "cvMaeC": 1.2302,
        "cvRmseC": 1.5897,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.222985,
          "ecmwfAifs": 0.059139,
          "icon": 0.139767,
          "ukmo": 0.225855,
          "meteofrance": 0.02,
          "gfs": 0.131379,
          "gem": 0.180875,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0439,
          -0.1679,
          0,
          0
        ],
        "driverBetasC": [
          0.0243,
          -0.0687,
          -0.0341,
          0.0265
        ],
        "spreadBaseC2": 1.5337,
        "spreadScale": 0.4701,
        "cvMaeC": 1.2402,
        "cvRmseC": 1.5944,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.299391,
          "ukmo": 0.058725,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.541884,
          "jma": 0.02
        },
        "interceptC": 0.1158,
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
        "spreadBaseC2": 1.6038,
        "spreadScale": 0.4882,
        "cvMaeC": 1.3877,
        "cvRmseC": 1.7556,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.078949,
          "ecmwfAifs": 0.061994,
          "icon": 0.265302,
          "ukmo": 0.083279,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.450476,
          "jma": 0.02
        },
        "interceptC": 0.0685,
        "diurnalHarmonicsC": [
          -0.0707,
          -0.1256,
          0,
          0
        ],
        "driverBetasC": [
          -0.074,
          0.0654,
          0.0007,
          0.0884
        ],
        "spreadBaseC2": 1.4885,
        "spreadScale": 0.5583,
        "cvMaeC": 1.4074,
        "cvRmseC": 1.7821,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.137899,
          "ecmwfAifs": 0.103989,
          "icon": 0.231213,
          "ukmo": 0.107833,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.359066,
          "jma": 0.02
        },
        "interceptC": 0.0213,
        "diurnalHarmonicsC": [
          -0.1413,
          -0.2512,
          0,
          0
        ],
        "driverBetasC": [
          -0.1479,
          0.1307,
          0.0014,
          0.1768
        ],
        "spreadBaseC2": 1.3732,
        "spreadScale": 0.6284,
        "cvMaeC": 1.427,
        "cvRmseC": 1.8086,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.250986,
        "ecmwfAifs": 0.081598,
        "icon": 0.203205,
        "ukmo": 0.117978,
        "meteofrance": 0.155617,
        "gfs": 0.072622,
        "gem": 0.056904,
        "jma": 0.06109
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.24917,
        "ecmwfAifs": 0.074028,
        "icon": 0.219134,
        "ukmo": 0.123035,
        "meteofrance": 0.154004,
        "gfs": 0.066705,
        "gem": 0.05432,
        "jma": 0.059604
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.259912,
        "ecmwfAifs": 0.073762,
        "icon": 0.205972,
        "ukmo": 0.13214,
        "meteofrance": 0.152745,
        "gfs": 0.062736,
        "gem": 0.053171,
        "jma": 0.059562
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.263476,
        "ecmwfAifs": 0.073325,
        "icon": 0.209658,
        "ukmo": 0.116625,
        "meteofrance": 0.154545,
        "gfs": 0.066494,
        "gem": 0.056665,
        "jma": 0.059212
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.209887,
    "ecmwfAifs": 0.069975,
    "icon": 0.260229,
    "ukmo": 0.169589,
    "meteofrance": 0.10885,
    "gfs": 0.10372,
    "gem": 0.038875,
    "jma": 0.038875
  },
  "pressureWeights": {
    "ecmwfIfs": 0.343053,
    "ecmwfAifs": 0.147897,
    "icon": 0.152352,
    "ukmo": 0.162274,
    "meteofrance": 0.07784,
    "gfs": 0.038744,
    "gem": 0.03892,
    "jma": 0.03892
  }
} as const;

export default PROVINCE_CALIBRATION_TR_36;
