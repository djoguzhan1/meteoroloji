import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_59: ProvinceCalibrationBundle = {
  "provinceCode": "TR-59",
  "provinceName": "Tekirdağ",
  "plateNumber": 59,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17056",
  "stationLat": 40.9833,
  "stationLon": 27.4833,
  "stationElevationM": 4,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.289599,
          "icon": 0.163443,
          "ukmo": 0.198501,
          "meteofrance": 0.150153,
          "gfs": 0.138304,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1605,
          0.0748,
          -0.1363,
          -0.2243,
          -0.1787,
          -0.0618
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7526,
        "spreadScale": 0.351,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25492,
            "ecmwfAifs": 0.082351,
            "icon": 0.225432,
            "ukmo": 0.107144,
            "meteofrance": 0.155325,
            "gfs": 0.065716,
            "gem": 0.052721,
            "jma": 0.056391
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.395,
          "logisticSlope": 4.5664,
          "wetFractionWeight": 3.2354,
          "powerEta": 0.68,
          "rawBrier": 0.03785,
          "calibratedBrier": 0.0349
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.0853,
          "rawIfsRmseC": 1.4125,
          "rawEqualMaeC": 0.7898,
          "rawEqualRmseC": 1.0547,
          "cvSimplexMaeC": 0.7919,
          "cvCalibratedMaeC": 0.7862,
          "cvCalibratedRmseC": 1.0486
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.166073,
          "ecmwfAifs": 0.339938,
          "icon": 0.133843,
          "ukmo": 0.134263,
          "meteofrance": 0.098951,
          "gfs": 0.086932,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0158,
        "betaDrivers": [
          0.0957,
          0.0725,
          -0.0362,
          -0.1325,
          -0.0837,
          0.0176
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8622,
        "spreadScale": 0.2239,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330697,
            "ecmwfAifs": 0.22287,
            "icon": 0.141179,
            "ukmo": 0.097332,
            "meteofrance": 0.045119,
            "gfs": 0.064672,
            "gem": 0.051884,
            "jma": 0.046247
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5421,
          "logisticSlope": 4.6118,
          "wetFractionWeight": 3.2981,
          "powerEta": 0.68,
          "rawBrier": 0.03785,
          "calibratedBrier": 0.03347
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.0853,
          "rawIfsRmseC": 1.4125,
          "rawEqualMaeC": 0.7898,
          "rawEqualRmseC": 1.0547,
          "cvSimplexMaeC": 0.7871,
          "cvCalibratedMaeC": 0.7819,
          "cvCalibratedRmseC": 1.0409
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.223088,
          "icon": 0.02,
          "ukmo": 0.028445,
          "meteofrance": 0.505532,
          "gfs": 0.162935,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.5213,
        "betaDrivers": [
          0.2253,
          0.4482,
          -0.3584,
          -0.568,
          0.5708,
          0.3781
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2499,
        "spreadScale": 0.1482,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245101,
            "ecmwfAifs": 0.072632,
            "icon": 0.217433,
            "ukmo": 0.123911,
            "meteofrance": 0.159028,
            "gfs": 0.066978,
            "gem": 0.058859,
            "jma": 0.056058
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0776,
          "logisticSlope": 3.7075,
          "wetFractionWeight": 3.2719,
          "powerEta": 0.68,
          "rawBrier": 0.04124,
          "calibratedBrier": 0.03883
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5618,
          "rawIfsRmseC": 2.0583,
          "rawEqualMaeC": 1.1426,
          "rawEqualRmseC": 1.5724,
          "cvSimplexMaeC": 1.021,
          "cvCalibratedMaeC": 0.8876,
          "cvCalibratedRmseC": 1.1864
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.035581,
          "ecmwfAifs": 0.394741,
          "icon": 0.080518,
          "ukmo": 0.078984,
          "meteofrance": 0.238485,
          "gfs": 0.131691,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.4446,
        "betaDrivers": [
          0.1018,
          0.2683,
          -0.0898,
          -0.3289,
          0.2353,
          0.1529
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2728,
        "spreadScale": 0.2919,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325358,
            "ecmwfAifs": 0.201141,
            "icon": 0.139338,
            "ukmo": 0.115182,
            "meteofrance": 0.045217,
            "gfs": 0.067449,
            "gem": 0.059272,
            "jma": 0.047043
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1108,
          "logisticSlope": 3.7247,
          "wetFractionWeight": 3.4765,
          "powerEta": 0.68,
          "rawBrier": 0.04124,
          "calibratedBrier": 0.03856
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5618,
          "rawIfsRmseC": 2.0583,
          "rawEqualMaeC": 1.1426,
          "rawEqualRmseC": 1.5724,
          "cvSimplexMaeC": 1.0554,
          "cvCalibratedMaeC": 0.9365,
          "cvCalibratedRmseC": 1.2582
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.496511,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.257697,
          "gem": 0.145792,
          "jma": 0.02
        },
        "intercept": -0.7795,
        "betaDrivers": [
          0.1336,
          0.9228,
          -0.1978,
          -0.8994,
          0.4197,
          0.3671
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4673,
        "spreadScale": 0.8208,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235061,
            "ecmwfAifs": 0.081501,
            "icon": 0.222901,
            "ukmo": 0.119038,
            "meteofrance": 0.15874,
            "gfs": 0.064269,
            "gem": 0.058862,
            "jma": 0.059628
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9254,
          "logisticSlope": 4.6068,
          "wetFractionWeight": 3.6654,
          "powerEta": 0.68,
          "rawBrier": 0.00967,
          "calibratedBrier": 0.00967
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.7502,
          "rawIfsRmseC": 2.3326,
          "rawEqualMaeC": 1.2479,
          "rawEqualRmseC": 1.7276,
          "cvSimplexMaeC": 1.0869,
          "cvCalibratedMaeC": 0.8117,
          "cvCalibratedRmseC": 1.0701
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.508266,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.049836,
          "gfs": 0.20213,
          "gem": 0.159768,
          "jma": 0.02
        },
        "intercept": -0.59,
        "betaDrivers": [
          0.0697,
          0.469,
          -0.0221,
          -0.4041,
          0.2178,
          0.2021
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4752,
        "spreadScale": 1.0894,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308651,
            "ecmwfAifs": 0.223258,
            "icon": 0.141296,
            "ukmo": 0.109455,
            "meteofrance": 0.04519,
            "gfs": 0.06402,
            "gem": 0.058633,
            "jma": 0.049497
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0047,
          "logisticSlope": 4.3603,
          "wetFractionWeight": 3.7735,
          "powerEta": 0.68,
          "rawBrier": 0.00967,
          "calibratedBrier": 0.00967
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.7502,
          "rawIfsRmseC": 2.3326,
          "rawEqualMaeC": 1.2479,
          "rawEqualRmseC": 1.7276,
          "cvSimplexMaeC": 1.0894,
          "cvCalibratedMaeC": 0.9,
          "cvCalibratedRmseC": 1.1726
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.218573,
          "icon": 0.039836,
          "ukmo": 0.239455,
          "meteofrance": 0.231673,
          "gfs": 0.210463,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2217,
        "betaDrivers": [
          0.1759,
          0.1298,
          -0.1379,
          -0.5656,
          0.1048,
          0.308
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9486,
        "spreadScale": 0.3092,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.228557,
            "ecmwfAifs": 0.082462,
            "icon": 0.220241,
            "ukmo": 0.124593,
            "meteofrance": 0.157718,
            "gfs": 0.067326,
            "gem": 0.060961,
            "jma": 0.058142
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.265,
          "logisticSlope": 2.8463,
          "wetFractionWeight": 3.5436,
          "powerEta": 0.68,
          "rawBrier": 0.03178,
          "calibratedBrier": 0.02967
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.278,
          "rawIfsRmseC": 1.6834,
          "rawEqualMaeC": 0.8818,
          "rawEqualRmseC": 1.2642,
          "cvSimplexMaeC": 0.8874,
          "cvCalibratedMaeC": 0.8606,
          "cvCalibratedRmseC": 1.2193
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.147079,
          "ecmwfAifs": 0.313696,
          "icon": 0.093082,
          "ukmo": 0.135711,
          "meteofrance": 0.119492,
          "gfs": 0.124685,
          "gem": 0.046255,
          "jma": 0.02
        },
        "intercept": -0.168,
        "betaDrivers": [
          0.0937,
          0.1171,
          -0.02,
          -0.2592,
          0.0373,
          0.1484
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0371,
        "spreadScale": 0.2505,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.299672,
            "ecmwfAifs": 0.22556,
            "icon": 0.139405,
            "ukmo": 0.114395,
            "meteofrance": 0.045173,
            "gfs": 0.066966,
            "gem": 0.060636,
            "jma": 0.048193
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.389,
          "logisticSlope": 2.4737,
          "wetFractionWeight": 3.8397,
          "powerEta": 0.68,
          "rawBrier": 0.03178,
          "calibratedBrier": 0.0287
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.278,
          "rawIfsRmseC": 1.6834,
          "rawEqualMaeC": 0.8818,
          "rawEqualRmseC": 1.2642,
          "cvSimplexMaeC": 0.8932,
          "cvCalibratedMaeC": 0.868,
          "cvCalibratedRmseC": 1.234
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.289599,
          "icon": 0.163443,
          "ukmo": 0.198501,
          "meteofrance": 0.150153,
          "gfs": 0.138304,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1605,
          0.0748,
          0,
          0
        ],
        "driverBetasC": [
          -0.1363,
          -0.0618,
          -0.2243,
          -0.1787
        ],
        "spreadBaseC2": 0.7526,
        "spreadScale": 0.351,
        "cvMaeC": 0.7862,
        "cvRmseC": 1.0486,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.093037,
          "ecmwfAifs": 0.314768,
          "icon": 0.148643,
          "ukmo": 0.166382,
          "meteofrance": 0.124552,
          "gfs": 0.112618,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0079,
        "diurnalHarmonicsC": [
          0.1281,
          0.0736,
          0,
          0
        ],
        "driverBetasC": [
          -0.0863,
          -0.0221,
          -0.1784,
          -0.1312
        ],
        "spreadBaseC2": 0.8074,
        "spreadScale": 0.2874,
        "cvMaeC": 0.7841,
        "cvRmseC": 1.0448,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.166073,
          "ecmwfAifs": 0.339938,
          "icon": 0.133843,
          "ukmo": 0.134263,
          "meteofrance": 0.098951,
          "gfs": 0.086932,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0158,
        "diurnalHarmonicsC": [
          0.0957,
          0.0725,
          0,
          0
        ],
        "driverBetasC": [
          -0.0362,
          0.0176,
          -0.1325,
          -0.0837
        ],
        "spreadBaseC2": 0.8622,
        "spreadScale": 0.2239,
        "cvMaeC": 0.7819,
        "cvRmseC": 1.0409,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.223088,
          "icon": 0.02,
          "ukmo": 0.028445,
          "meteofrance": 0.505532,
          "gfs": 0.162935,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.5213,
        "diurnalHarmonicsC": [
          0.2253,
          0.4482,
          0,
          0
        ],
        "driverBetasC": [
          -0.3584,
          0.3781,
          -0.568,
          0.5708
        ],
        "spreadBaseC2": 1.2499,
        "spreadScale": 0.1482,
        "cvMaeC": 0.8876,
        "cvRmseC": 1.1864,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.027791,
          "ecmwfAifs": 0.308915,
          "icon": 0.050259,
          "ukmo": 0.053715,
          "meteofrance": 0.372007,
          "gfs": 0.147313,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.4829,
        "diurnalHarmonicsC": [
          0.1636,
          0.3582,
          0,
          0
        ],
        "driverBetasC": [
          -0.2241,
          0.2655,
          -0.4485,
          0.4031
        ],
        "spreadBaseC2": 1.2613,
        "spreadScale": 0.22,
        "cvMaeC": 0.9121,
        "cvRmseC": 1.2223,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.035581,
          "ecmwfAifs": 0.394741,
          "icon": 0.080518,
          "ukmo": 0.078984,
          "meteofrance": 0.238485,
          "gfs": 0.131691,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.4446,
        "diurnalHarmonicsC": [
          0.1018,
          0.2683,
          0,
          0
        ],
        "driverBetasC": [
          -0.0898,
          0.1529,
          -0.3289,
          0.2353
        ],
        "spreadBaseC2": 1.2728,
        "spreadScale": 0.2919,
        "cvMaeC": 0.9365,
        "cvRmseC": 1.2582,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.496511,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.257697,
          "gem": 0.145792,
          "jma": 0.02
        },
        "interceptC": -0.7795,
        "diurnalHarmonicsC": [
          0.1336,
          0.9228,
          0,
          0
        ],
        "driverBetasC": [
          -0.1978,
          0.3671,
          -0.8994,
          0.4197
        ],
        "spreadBaseC2": 0.4673,
        "spreadScale": 0.8208,
        "cvMaeC": 0.8117,
        "cvRmseC": 1.0701,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.502388,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.034918,
          "gfs": 0.229914,
          "gem": 0.15278,
          "jma": 0.02
        },
        "interceptC": -0.6847,
        "diurnalHarmonicsC": [
          0.1016,
          0.6959,
          0,
          0
        ],
        "driverBetasC": [
          -0.11,
          0.2846,
          -0.6518,
          0.3187
        ],
        "spreadBaseC2": 0.4713,
        "spreadScale": 0.9551,
        "cvMaeC": 0.8558,
        "cvRmseC": 1.1214,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.508266,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.049836,
          "gfs": 0.20213,
          "gem": 0.159768,
          "jma": 0.02
        },
        "interceptC": -0.59,
        "diurnalHarmonicsC": [
          0.0697,
          0.469,
          0,
          0
        ],
        "driverBetasC": [
          -0.0221,
          0.2021,
          -0.4041,
          0.2178
        ],
        "spreadBaseC2": 0.4752,
        "spreadScale": 1.0894,
        "cvMaeC": 0.9,
        "cvRmseC": 1.1726,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.218573,
          "icon": 0.039836,
          "ukmo": 0.239455,
          "meteofrance": 0.231673,
          "gfs": 0.210463,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2217,
        "diurnalHarmonicsC": [
          0.1759,
          0.1298,
          0,
          0
        ],
        "driverBetasC": [
          -0.1379,
          0.308,
          -0.5656,
          0.1048
        ],
        "spreadBaseC2": 0.9486,
        "spreadScale": 0.3092,
        "cvMaeC": 0.8606,
        "cvRmseC": 1.2193,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.08354,
          "ecmwfAifs": 0.266134,
          "icon": 0.066459,
          "ukmo": 0.187582,
          "meteofrance": 0.175583,
          "gfs": 0.167574,
          "gem": 0.033128,
          "jma": 0.02
        },
        "interceptC": -0.1949,
        "diurnalHarmonicsC": [
          0.1348,
          0.1235,
          0,
          0
        ],
        "driverBetasC": [
          -0.0789,
          0.2282,
          -0.4124,
          0.0711
        ],
        "spreadBaseC2": 0.9929,
        "spreadScale": 0.2798,
        "cvMaeC": 0.8643,
        "cvRmseC": 1.2267,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.147079,
          "ecmwfAifs": 0.313696,
          "icon": 0.093082,
          "ukmo": 0.135711,
          "meteofrance": 0.119492,
          "gfs": 0.124685,
          "gem": 0.046255,
          "jma": 0.02
        },
        "interceptC": -0.168,
        "diurnalHarmonicsC": [
          0.0937,
          0.1171,
          0,
          0
        ],
        "driverBetasC": [
          -0.02,
          0.1484,
          -0.2592,
          0.0373
        ],
        "spreadBaseC2": 1.0371,
        "spreadScale": 0.2505,
        "cvMaeC": 0.868,
        "cvRmseC": 1.234,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.25492,
        "ecmwfAifs": 0.082351,
        "icon": 0.225432,
        "ukmo": 0.107144,
        "meteofrance": 0.155325,
        "gfs": 0.065716,
        "gem": 0.052721,
        "jma": 0.056391
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245101,
        "ecmwfAifs": 0.072632,
        "icon": 0.217433,
        "ukmo": 0.123911,
        "meteofrance": 0.159028,
        "gfs": 0.066978,
        "gem": 0.058859,
        "jma": 0.056058
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.235061,
        "ecmwfAifs": 0.081501,
        "icon": 0.222901,
        "ukmo": 0.119038,
        "meteofrance": 0.15874,
        "gfs": 0.064269,
        "gem": 0.058862,
        "jma": 0.059628
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.228557,
        "ecmwfAifs": 0.082462,
        "icon": 0.220241,
        "ukmo": 0.124593,
        "meteofrance": 0.157718,
        "gfs": 0.067326,
        "gem": 0.060961,
        "jma": 0.058142
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.212798,
    "ecmwfAifs": 0.069926,
    "icon": 0.279952,
    "ukmo": 0.166885,
    "meteofrance": 0.108774,
    "gfs": 0.083969,
    "gem": 0.038848,
    "jma": 0.038848
  },
  "pressureWeights": {
    "ecmwfIfs": 0.297301,
    "ecmwfAifs": 0.151058,
    "icon": 0.132211,
    "ukmo": 0.181701,
    "meteofrance": 0.079504,
    "gfs": 0.078721,
    "gem": 0.039752,
    "jma": 0.039752
  }
} as const;

export default PROVINCE_CALIBRATION_TR_59;
