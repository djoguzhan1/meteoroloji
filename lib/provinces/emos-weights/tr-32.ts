import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_32: ProvinceCalibrationBundle = {
  "provinceCode": "TR-32",
  "provinceName": "Isparta",
  "plateNumber": 32,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17240",
  "stationLat": 37.75,
  "stationLon": 30.55,
  "stationElevationM": 997,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.221117,
          "ukmo": 0.02,
          "meteofrance": 0.6217,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.057183
        },
        "intercept": 1.2221,
        "betaDrivers": [
          -0.1082,
          0.1679,
          -0.2028,
          -0.3103,
          -0.1473,
          0.0387
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9271,
        "spreadScale": 0.216,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259436,
            "ecmwfAifs": 0.081043,
            "icon": 0.212875,
            "ukmo": 0.123408,
            "meteofrance": 0.150067,
            "gfs": 0.065726,
            "gem": 0.052416,
            "jma": 0.055029
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1145,
          "logisticSlope": 3.9702,
          "wetFractionWeight": 3.4883,
          "powerEta": 0.68,
          "rawBrier": 0.04388,
          "calibratedBrier": 0.04078
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.2355,
          "rawIfsRmseC": 2.6699,
          "rawEqualMaeC": 1.736,
          "rawEqualRmseC": 2.0055,
          "cvSimplexMaeC": 1.404,
          "cvCalibratedMaeC": 0.8961,
          "cvCalibratedRmseC": 1.148
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.286127,
          "icon": 0.259501,
          "ukmo": 0.02,
          "meteofrance": 0.251953,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.122419
        },
        "intercept": 1.3676,
        "betaDrivers": [
          -0.0874,
          0.0403,
          -0.0678,
          -0.1556,
          -0.0426,
          -0.0243
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9096,
        "spreadScale": 0.2065,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33385,
            "ecmwfAifs": 0.217568,
            "icon": 0.132244,
            "ukmo": 0.111205,
            "meteofrance": 0.045034,
            "gfs": 0.064163,
            "gem": 0.051169,
            "jma": 0.044767
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3107,
          "logisticSlope": 4.156,
          "wetFractionWeight": 3.3112,
          "powerEta": 0.68,
          "rawBrier": 0.04388,
          "calibratedBrier": 0.03885
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.2355,
          "rawIfsRmseC": 2.6699,
          "rawEqualMaeC": 1.736,
          "rawEqualRmseC": 2.0055,
          "cvSimplexMaeC": 1.4676,
          "cvCalibratedMaeC": 0.8918,
          "cvCalibratedRmseC": 1.1324
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.147999,
          "ukmo": 0.02,
          "meteofrance": 0.732001,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.6841,
        "betaDrivers": [
          -0.0475,
          0.157,
          0.0998,
          -0.5508,
          -0.4553,
          -0.2134
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1228,
        "spreadScale": 0.3104,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254395,
            "ecmwfAifs": 0.072198,
            "icon": 0.222854,
            "ukmo": 0.12031,
            "meteofrance": 0.151432,
            "gfs": 0.064675,
            "gem": 0.057456,
            "jma": 0.05668
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1112,
          "logisticSlope": 2.7976,
          "wetFractionWeight": 4.4894,
          "powerEta": 0.68,
          "rawBrier": 0.0454,
          "calibratedBrier": 0.04012
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9825,
          "rawIfsRmseC": 2.4864,
          "rawEqualMaeC": 1.5403,
          "rawEqualRmseC": 1.8481,
          "cvSimplexMaeC": 1.2218,
          "cvCalibratedMaeC": 1.024,
          "cvCalibratedRmseC": 1.2983
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.041087,
          "ecmwfAifs": 0.164297,
          "icon": 0.254227,
          "ukmo": 0.02,
          "meteofrance": 0.374142,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.106247
        },
        "intercept": 0.9418,
        "betaDrivers": [
          -0.0558,
          0.1079,
          0.047,
          -0.2226,
          -0.1684,
          -0.1474
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9775,
        "spreadScale": 0.3328,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.334912,
            "ecmwfAifs": 0.198292,
            "icon": 0.141636,
            "ukmo": 0.110914,
            "meteofrance": 0.045097,
            "gfs": 0.064593,
            "gem": 0.057383,
            "jma": 0.047173
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2545,
          "logisticSlope": 2.5689,
          "wetFractionWeight": 4.6738,
          "powerEta": 0.68,
          "rawBrier": 0.0454,
          "calibratedBrier": 0.03912
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9825,
          "rawIfsRmseC": 2.4864,
          "rawEqualMaeC": 1.5403,
          "rawEqualRmseC": 1.8481,
          "cvSimplexMaeC": 1.3122,
          "cvCalibratedMaeC": 0.9938,
          "cvCalibratedRmseC": 1.2559
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.228018,
          "ukmo": 0.02,
          "meteofrance": 0.651982,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.2689,
        "betaDrivers": [
          -0.0352,
          0.0032,
          -0.1496,
          -0.5844,
          -0.2627,
          -0.0611
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.812,
        "spreadScale": 0.1808,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248914,
            "ecmwfAifs": 0.080425,
            "icon": 0.214442,
            "ukmo": 0.118897,
            "meteofrance": 0.159174,
            "gfs": 0.065511,
            "gem": 0.055108,
            "jma": 0.057529
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0949,
          "logisticSlope": 3.2659,
          "wetFractionWeight": 3.3572,
          "powerEta": 0.68,
          "rawBrier": 0.01391,
          "calibratedBrier": 0.01082
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6794,
          "rawIfsRmseC": 2.1116,
          "rawEqualMaeC": 1.5117,
          "rawEqualRmseC": 1.7916,
          "cvSimplexMaeC": 0.9256,
          "cvCalibratedMaeC": 0.85,
          "cvCalibratedRmseC": 1.1348
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.136387,
          "ecmwfAifs": 0.056433,
          "icon": 0.224263,
          "ukmo": 0.02,
          "meteofrance": 0.502917,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.6115,
        "betaDrivers": [
          -0.0033,
          0.0655,
          -0.0378,
          -0.1945,
          -0.0895,
          -0.0015
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7627,
        "spreadScale": 0.1932,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324968,
            "ecmwfAifs": 0.21905,
            "icon": 0.135155,
            "ukmo": 0.108699,
            "meteofrance": 0.045184,
            "gfs": 0.064883,
            "gem": 0.05458,
            "jma": 0.047481
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1863,
          "logisticSlope": 3.4843,
          "wetFractionWeight": 3.4707,
          "powerEta": 0.68,
          "rawBrier": 0.01391,
          "calibratedBrier": 0.01016
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6794,
          "rawIfsRmseC": 2.1116,
          "rawEqualMaeC": 1.5117,
          "rawEqualRmseC": 1.7916,
          "cvSimplexMaeC": 1.0113,
          "cvCalibratedMaeC": 0.8469,
          "cvCalibratedRmseC": 1.1252
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.255258,
          "ukmo": 0.02,
          "meteofrance": 0.624742,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.7201,
        "betaDrivers": [
          -0.2766,
          -0.1972,
          -0.0745,
          -0.6951,
          -0.3154,
          0.089
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7305,
        "spreadScale": 0.3135,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250603,
            "ecmwfAifs": 0.0676,
            "icon": 0.22417,
            "ukmo": 0.124137,
            "meteofrance": 0.154597,
            "gfs": 0.063659,
            "gem": 0.055002,
            "jma": 0.060232
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6912,
          "logisticSlope": 3.7441,
          "wetFractionWeight": 3.1072,
          "powerEta": 0.68,
          "rawBrier": 0.02324,
          "calibratedBrier": 0.0186
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.8028,
          "rawIfsRmseC": 2.247,
          "rawEqualMaeC": 1.5784,
          "rawEqualRmseC": 1.9136,
          "cvSimplexMaeC": 1.1685,
          "cvCalibratedMaeC": 0.9212,
          "cvCalibratedRmseC": 1.1912
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.078382,
          "ecmwfAifs": 0.166477,
          "icon": 0.293223,
          "ukmo": 0.02,
          "meteofrance": 0.381918,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.9312,
        "betaDrivers": [
          -0.1521,
          -0.0413,
          -0.017,
          -0.2178,
          -0.0976,
          0.0227
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5815,
        "spreadScale": 0.3572,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33472,
            "ecmwfAifs": 0.188365,
            "icon": 0.144545,
            "ukmo": 0.116107,
            "meteofrance": 0.04517,
            "gfs": 0.064503,
            "gem": 0.055731,
            "jma": 0.050859
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8763,
          "logisticSlope": 3.5417,
          "wetFractionWeight": 3.3218,
          "powerEta": 0.68,
          "rawBrier": 0.02324,
          "calibratedBrier": 0.01783
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.8028,
          "rawIfsRmseC": 2.247,
          "rawEqualMaeC": 1.5784,
          "rawEqualRmseC": 1.9136,
          "cvSimplexMaeC": 1.2585,
          "cvCalibratedMaeC": 0.8974,
          "cvCalibratedRmseC": 1.1688
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
          "icon": 0.221117,
          "ukmo": 0.02,
          "meteofrance": 0.6217,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.057183
        },
        "interceptC": 1.2221,
        "diurnalHarmonicsC": [
          -0.1082,
          0.1679,
          0,
          0
        ],
        "driverBetasC": [
          -0.2028,
          0.0387,
          -0.3103,
          -0.1473
        ],
        "spreadBaseC2": 0.9271,
        "spreadScale": 0.216,
        "cvMaeC": 0.8961,
        "cvRmseC": 1.148,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.153064,
          "icon": 0.240309,
          "ukmo": 0.02,
          "meteofrance": 0.436826,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.089801
        },
        "interceptC": 1.2948,
        "diurnalHarmonicsC": [
          -0.0978,
          0.1041,
          0,
          0
        ],
        "driverBetasC": [
          -0.1353,
          0.0072,
          -0.2329,
          -0.0949
        ],
        "spreadBaseC2": 0.9183,
        "spreadScale": 0.2112,
        "cvMaeC": 0.894,
        "cvRmseC": 1.1402,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.286127,
          "icon": 0.259501,
          "ukmo": 0.02,
          "meteofrance": 0.251953,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.122419
        },
        "interceptC": 1.3676,
        "diurnalHarmonicsC": [
          -0.0874,
          0.0403,
          0,
          0
        ],
        "driverBetasC": [
          -0.0678,
          -0.0243,
          -0.1556,
          -0.0426
        ],
        "spreadBaseC2": 0.9096,
        "spreadScale": 0.2065,
        "cvMaeC": 0.8918,
        "cvRmseC": 1.1324,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.147999,
          "ukmo": 0.02,
          "meteofrance": 0.732001,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.6841,
        "diurnalHarmonicsC": [
          -0.0475,
          0.157,
          0,
          0
        ],
        "driverBetasC": [
          0.0998,
          -0.2134,
          -0.5508,
          -0.4553
        ],
        "spreadBaseC2": 1.1228,
        "spreadScale": 0.3104,
        "cvMaeC": 1.024,
        "cvRmseC": 1.2983,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.030544,
          "ecmwfAifs": 0.092149,
          "icon": 0.201113,
          "ukmo": 0.02,
          "meteofrance": 0.55307,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.063124
        },
        "interceptC": 0.813,
        "diurnalHarmonicsC": [
          -0.0517,
          0.1325,
          0,
          0
        ],
        "driverBetasC": [
          0.0734,
          -0.1804,
          -0.3867,
          -0.3118
        ],
        "spreadBaseC2": 1.0501,
        "spreadScale": 0.3216,
        "cvMaeC": 1.0089,
        "cvRmseC": 1.2771,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.041087,
          "ecmwfAifs": 0.164297,
          "icon": 0.254227,
          "ukmo": 0.02,
          "meteofrance": 0.374142,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.106247
        },
        "interceptC": 0.9418,
        "diurnalHarmonicsC": [
          -0.0558,
          0.1079,
          0,
          0
        ],
        "driverBetasC": [
          0.047,
          -0.1474,
          -0.2226,
          -0.1684
        ],
        "spreadBaseC2": 0.9775,
        "spreadScale": 0.3328,
        "cvMaeC": 0.9938,
        "cvRmseC": 1.2559,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.228018,
          "ukmo": 0.02,
          "meteofrance": 0.651982,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.2689,
        "diurnalHarmonicsC": [
          -0.0352,
          0.0032,
          0,
          0
        ],
        "driverBetasC": [
          -0.1496,
          -0.0611,
          -0.5844,
          -0.2627
        ],
        "spreadBaseC2": 0.812,
        "spreadScale": 0.1808,
        "cvMaeC": 0.85,
        "cvRmseC": 1.1348,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.078194,
          "ecmwfAifs": 0.038217,
          "icon": 0.22614,
          "ukmo": 0.02,
          "meteofrance": 0.577449,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.4402,
        "diurnalHarmonicsC": [
          -0.0192,
          0.0343,
          0,
          0
        ],
        "driverBetasC": [
          -0.0937,
          -0.0313,
          -0.3895,
          -0.1761
        ],
        "spreadBaseC2": 0.7873,
        "spreadScale": 0.187,
        "cvMaeC": 0.8484,
        "cvRmseC": 1.13,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.136387,
          "ecmwfAifs": 0.056433,
          "icon": 0.224263,
          "ukmo": 0.02,
          "meteofrance": 0.502917,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.6115,
        "diurnalHarmonicsC": [
          -0.0033,
          0.0655,
          0,
          0
        ],
        "driverBetasC": [
          -0.0378,
          -0.0015,
          -0.1945,
          -0.0895
        ],
        "spreadBaseC2": 0.7627,
        "spreadScale": 0.1932,
        "cvMaeC": 0.8469,
        "cvRmseC": 1.1252,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.255258,
          "ukmo": 0.02,
          "meteofrance": 0.624742,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.7201,
        "diurnalHarmonicsC": [
          -0.2766,
          -0.1972,
          0,
          0
        ],
        "driverBetasC": [
          -0.0745,
          0.089,
          -0.6951,
          -0.3154
        ],
        "spreadBaseC2": 0.7305,
        "spreadScale": 0.3135,
        "cvMaeC": 0.9212,
        "cvRmseC": 1.1912,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.049191,
          "ecmwfAifs": 0.093239,
          "icon": 0.274241,
          "ukmo": 0.02,
          "meteofrance": 0.503329,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.8256,
        "diurnalHarmonicsC": [
          -0.2144,
          -0.1192,
          0,
          0
        ],
        "driverBetasC": [
          -0.0457,
          0.0558,
          -0.4565,
          -0.2065
        ],
        "spreadBaseC2": 0.656,
        "spreadScale": 0.3354,
        "cvMaeC": 0.9093,
        "cvRmseC": 1.18,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.078382,
          "ecmwfAifs": 0.166477,
          "icon": 0.293223,
          "ukmo": 0.02,
          "meteofrance": 0.381918,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.9312,
        "diurnalHarmonicsC": [
          -0.1521,
          -0.0413,
          0,
          0
        ],
        "driverBetasC": [
          -0.017,
          0.0227,
          -0.2178,
          -0.0976
        ],
        "spreadBaseC2": 0.5815,
        "spreadScale": 0.3572,
        "cvMaeC": 0.8974,
        "cvRmseC": 1.1688,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.259436,
        "ecmwfAifs": 0.081043,
        "icon": 0.212875,
        "ukmo": 0.123408,
        "meteofrance": 0.150067,
        "gfs": 0.065726,
        "gem": 0.052416,
        "jma": 0.055029
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.254395,
        "ecmwfAifs": 0.072198,
        "icon": 0.222854,
        "ukmo": 0.12031,
        "meteofrance": 0.151432,
        "gfs": 0.064675,
        "gem": 0.057456,
        "jma": 0.05668
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.248914,
        "ecmwfAifs": 0.080425,
        "icon": 0.214442,
        "ukmo": 0.118897,
        "meteofrance": 0.159174,
        "gfs": 0.065511,
        "gem": 0.055108,
        "jma": 0.057529
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.250603,
        "ecmwfAifs": 0.0676,
        "icon": 0.22417,
        "ukmo": 0.124137,
        "meteofrance": 0.154597,
        "gfs": 0.063659,
        "gem": 0.055002,
        "jma": 0.060232
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.233386,
    "ecmwfAifs": 0.070388,
    "icon": 0.247684,
    "ukmo": 0.154272,
    "meteofrance": 0.109493,
    "gfs": 0.106567,
    "gem": 0.039105,
    "jma": 0.039105
  },
  "pressureWeights": {
    "ecmwfIfs": 0.20261,
    "ecmwfAifs": 0.142883,
    "icon": 0.0978,
    "ukmo": 0.30224,
    "meteofrance": 0.075201,
    "gfs": 0.104064,
    "gem": 0.037601,
    "jma": 0.037601
  }
} as const;

export default PROVINCE_CALIBRATION_TR_32;
