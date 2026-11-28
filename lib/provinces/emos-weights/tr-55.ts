import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_55: ProvinceCalibrationBundle = {
  "provinceCode": "TR-55",
  "provinceName": "Samsun",
  "plateNumber": 55,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17030",
  "stationLat": 41.2833,
  "stationLon": 36.3333,
  "stationElevationM": 4,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.111885,
          "icon": 0.476719,
          "ukmo": 0.02,
          "meteofrance": 0.094686,
          "gfs": 0.087362,
          "gem": 0.121274,
          "jma": 0.068074
        },
        "intercept": 0,
        "betaDrivers": [
          0.1053,
          0.0455,
          -0.0538,
          0.5807,
          0.1551,
          -0.1559
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4254,
        "spreadScale": 0.1518,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256069,
            "ecmwfAifs": 0.082563,
            "icon": 0.217872,
            "ukmo": 0.110093,
            "meteofrance": 0.158358,
            "gfs": 0.068312,
            "gem": 0.055542,
            "jma": 0.051191
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0389,
          "logisticSlope": 4.1028,
          "wetFractionWeight": 3.2229,
          "powerEta": 0.68,
          "rawBrier": 0.062,
          "calibratedBrier": 0.05678
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3477,
          "rawIfsRmseC": 1.7816,
          "rawEqualMaeC": 0.819,
          "rawEqualRmseC": 1.1263,
          "cvSimplexMaeC": 0.6541,
          "cvCalibratedMaeC": 0.609,
          "cvCalibratedRmseC": 0.827
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.079237,
          "ecmwfAifs": 0.254094,
          "icon": 0.341841,
          "ukmo": 0.02,
          "meteofrance": 0.064448,
          "gfs": 0.087705,
          "gem": 0.066173,
          "jma": 0.086502
        },
        "intercept": 0.1576,
        "betaDrivers": [
          0.0725,
          0.0158,
          0.0063,
          0.3037,
          0.1231,
          -0.1468
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4157,
        "spreadScale": 0.1846,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.3318,
            "ecmwfAifs": 0.223184,
            "icon": 0.136286,
            "ukmo": 0.099895,
            "meteofrance": 0.045157,
            "gfs": 0.067149,
            "gem": 0.054596,
            "jma": 0.041933
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0902,
          "logisticSlope": 3.8411,
          "wetFractionWeight": 3.3264,
          "powerEta": 0.68,
          "rawBrier": 0.062,
          "calibratedBrier": 0.05586
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3477,
          "rawIfsRmseC": 1.7816,
          "rawEqualMaeC": 0.819,
          "rawEqualRmseC": 1.1263,
          "cvSimplexMaeC": 0.6774,
          "cvCalibratedMaeC": 0.6263,
          "cvCalibratedRmseC": 0.8545
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.09218,
          "ecmwfAifs": 0.128968,
          "icon": 0.336385,
          "ukmo": 0.02,
          "meteofrance": 0.068221,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.314246
        },
        "intercept": 0.0311,
        "betaDrivers": [
          -0.0233,
          0.0312,
          -0.0533,
          -0.069,
          0.0697,
          0.0248
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.349,
        "spreadScale": 0.263,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240252,
            "ecmwfAifs": 0.066554,
            "icon": 0.23393,
            "ukmo": 0.117242,
            "meteofrance": 0.159801,
            "gfs": 0.065243,
            "gem": 0.06115,
            "jma": 0.055828
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1756,
          "logisticSlope": 3.1937,
          "wetFractionWeight": 3.6495,
          "powerEta": 0.68,
          "rawBrier": 0.0515,
          "calibratedBrier": 0.04382
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3359,
          "rawIfsRmseC": 1.88,
          "rawEqualMaeC": 0.9574,
          "rawEqualRmseC": 1.3842,
          "cvSimplexMaeC": 0.6959,
          "cvCalibratedMaeC": 0.6947,
          "cvCalibratedRmseC": 0.9885
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.167268,
          "ecmwfAifs": 0.174875,
          "icon": 0.270473,
          "ukmo": 0.02,
          "meteofrance": 0.039943,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.287441
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0257,
          0.0794,
          -0.0298,
          -0.0723,
          0.0995,
          0.0484
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2825,
        "spreadScale": 0.3053,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325215,
            "ecmwfAifs": 0.187946,
            "icon": 0.152869,
            "ukmo": 0.111135,
            "meteofrance": 0.04527,
            "gfs": 0.066997,
            "gem": 0.062794,
            "jma": 0.047774
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2823,
          "logisticSlope": 2.8314,
          "wetFractionWeight": 4.0485,
          "powerEta": 0.68,
          "rawBrier": 0.0515,
          "calibratedBrier": 0.04416
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3359,
          "rawIfsRmseC": 1.88,
          "rawEqualMaeC": 0.9574,
          "rawEqualRmseC": 1.3842,
          "cvSimplexMaeC": 0.7068,
          "cvCalibratedMaeC": 0.7034,
          "cvCalibratedRmseC": 1.0037
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.188813,
          "ecmwfAifs": 0.070852,
          "icon": 0.257579,
          "ukmo": 0.02,
          "meteofrance": 0.302985,
          "gfs": 0.02,
          "gem": 0.054238,
          "jma": 0.085533
        },
        "intercept": -0.0087,
        "betaDrivers": [
          -0.2205,
          -0.1069,
          -0.0253,
          -0.3082,
          -0.1206,
          0.5794
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.292,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231719,
            "ecmwfAifs": 0.070036,
            "icon": 0.232239,
            "ukmo": 0.118464,
            "meteofrance": 0.164965,
            "gfs": 0.069294,
            "gem": 0.057298,
            "jma": 0.055985
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1402,
          "logisticSlope": 2.445,
          "wetFractionWeight": 3.8411,
          "powerEta": 0.68,
          "rawBrier": 0.04212,
          "calibratedBrier": 0.03649
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 0.9576,
          "rawIfsRmseC": 1.2126,
          "rawEqualMaeC": 0.6935,
          "rawEqualRmseC": 0.8821,
          "cvSimplexMaeC": 0.6167,
          "cvCalibratedMaeC": 0.5642,
          "cvCalibratedRmseC": 0.7425
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.253825,
          "ecmwfAifs": 0.19864,
          "icon": 0.227465,
          "ukmo": 0.02,
          "meteofrance": 0.173888,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.086182
        },
        "intercept": 0.0847,
        "betaDrivers": [
          -0.1378,
          -0.0065,
          0.0178,
          -0.1153,
          0.0015,
          0.2551
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.3054,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314073,
            "ecmwfAifs": 0.198039,
            "icon": 0.151963,
            "ukmo": 0.11244,
            "meteofrance": 0.045345,
            "gfs": 0.071251,
            "gem": 0.058917,
            "jma": 0.047972
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3363,
          "logisticSlope": 2.0174,
          "wetFractionWeight": 4.0557,
          "powerEta": 0.68,
          "rawBrier": 0.04212,
          "calibratedBrier": 0.03555
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 0.9576,
          "rawIfsRmseC": 1.2126,
          "rawEqualMaeC": 0.6935,
          "rawEqualRmseC": 0.8821,
          "cvSimplexMaeC": 0.6264,
          "cvCalibratedMaeC": 0.5729,
          "cvCalibratedRmseC": 0.7555
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.137053,
          "ecmwfAifs": 0.082015,
          "icon": 0.419413,
          "ukmo": 0.02,
          "meteofrance": 0.15477,
          "gfs": 0.074262,
          "gem": 0.073805,
          "jma": 0.038682
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0489,
          -0.0092,
          0.1111,
          0.1496,
          0.1102,
          -0.106
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.241,
        "spreadScale": 0.273,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.262156,
            "ecmwfAifs": 0.076561,
            "icon": 0.210971,
            "ukmo": 0.123235,
            "meteofrance": 0.153065,
            "gfs": 0.066576,
            "gem": 0.055628,
            "jma": 0.051808
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9039,
          "logisticSlope": 2.4124,
          "wetFractionWeight": 4.0823,
          "powerEta": 0.68,
          "rawBrier": 0.06337,
          "calibratedBrier": 0.05478
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.1477,
          "rawIfsRmseC": 1.4827,
          "rawEqualMaeC": 0.6647,
          "rawEqualRmseC": 0.9288,
          "cvSimplexMaeC": 0.6181,
          "cvCalibratedMaeC": 0.6151,
          "cvCalibratedRmseC": 0.843
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.21626,
          "ecmwfAifs": 0.190854,
          "icon": 0.29698,
          "ukmo": 0.02,
          "meteofrance": 0.09778,
          "gfs": 0.064137,
          "gem": 0.043089,
          "jma": 0.0709
        },
        "intercept": 0.1369,
        "betaDrivers": [
          -0.0466,
          0.0006,
          0.075,
          0.1415,
          0.1274,
          -0.1269
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.222,
        "spreadScale": 0.2917,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.340368,
            "ecmwfAifs": 0.207375,
            "icon": 0.132234,
            "ukmo": 0.112044,
            "meteofrance": 0.045091,
            "gfs": 0.065574,
            "gem": 0.05479,
            "jma": 0.042524
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1691,
          "logisticSlope": 2.0355,
          "wetFractionWeight": 4.4456,
          "powerEta": 0.68,
          "rawBrier": 0.06337,
          "calibratedBrier": 0.05192
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.1477,
          "rawIfsRmseC": 1.4827,
          "rawEqualMaeC": 0.6647,
          "rawEqualRmseC": 0.9288,
          "cvSimplexMaeC": 0.6241,
          "cvCalibratedMaeC": 0.6176,
          "cvCalibratedRmseC": 0.8509
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.111885,
          "icon": 0.476719,
          "ukmo": 0.02,
          "meteofrance": 0.094686,
          "gfs": 0.087362,
          "gem": 0.121274,
          "jma": 0.068074
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1053,
          0.0455,
          0,
          0
        ],
        "driverBetasC": [
          -0.0538,
          -0.1559,
          0.5807,
          0.1551
        ],
        "spreadBaseC2": 0.4254,
        "spreadScale": 0.1518,
        "cvMaeC": 0.609,
        "cvRmseC": 0.827,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.049618,
          "ecmwfAifs": 0.18299,
          "icon": 0.409279,
          "ukmo": 0.02,
          "meteofrance": 0.079567,
          "gfs": 0.087534,
          "gem": 0.093724,
          "jma": 0.077288
        },
        "interceptC": 0.0788,
        "diurnalHarmonicsC": [
          0.0889,
          0.0307,
          0,
          0
        ],
        "driverBetasC": [
          -0.0238,
          -0.1514,
          0.4422,
          0.1391
        ],
        "spreadBaseC2": 0.4205,
        "spreadScale": 0.1682,
        "cvMaeC": 0.6177,
        "cvRmseC": 0.8407,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.079237,
          "ecmwfAifs": 0.254094,
          "icon": 0.341841,
          "ukmo": 0.02,
          "meteofrance": 0.064448,
          "gfs": 0.087705,
          "gem": 0.066173,
          "jma": 0.086502
        },
        "interceptC": 0.1576,
        "diurnalHarmonicsC": [
          0.0725,
          0.0158,
          0,
          0
        ],
        "driverBetasC": [
          0.0063,
          -0.1468,
          0.3037,
          0.1231
        ],
        "spreadBaseC2": 0.4157,
        "spreadScale": 0.1846,
        "cvMaeC": 0.6263,
        "cvRmseC": 0.8545,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.09218,
          "ecmwfAifs": 0.128968,
          "icon": 0.336385,
          "ukmo": 0.02,
          "meteofrance": 0.068221,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.314246
        },
        "interceptC": 0.0311,
        "diurnalHarmonicsC": [
          -0.0233,
          0.0312,
          0,
          0
        ],
        "driverBetasC": [
          -0.0533,
          0.0248,
          -0.069,
          0.0697
        ],
        "spreadBaseC2": 0.349,
        "spreadScale": 0.263,
        "cvMaeC": 0.6947,
        "cvRmseC": 0.9885,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.129724,
          "ecmwfAifs": 0.151921,
          "icon": 0.303429,
          "ukmo": 0.02,
          "meteofrance": 0.054082,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.300844
        },
        "interceptC": 0.0155,
        "diurnalHarmonicsC": [
          -0.0245,
          0.0553,
          0,
          0
        ],
        "driverBetasC": [
          -0.0416,
          0.0366,
          -0.0707,
          0.0846
        ],
        "spreadBaseC2": 0.3157,
        "spreadScale": 0.2842,
        "cvMaeC": 0.699,
        "cvRmseC": 0.9961,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.167268,
          "ecmwfAifs": 0.174875,
          "icon": 0.270473,
          "ukmo": 0.02,
          "meteofrance": 0.039943,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.287441
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0257,
          0.0794,
          0,
          0
        ],
        "driverBetasC": [
          -0.0298,
          0.0484,
          -0.0723,
          0.0995
        ],
        "spreadBaseC2": 0.2825,
        "spreadScale": 0.3053,
        "cvMaeC": 0.7034,
        "cvRmseC": 1.0037,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.188813,
          "ecmwfAifs": 0.070852,
          "icon": 0.257579,
          "ukmo": 0.02,
          "meteofrance": 0.302985,
          "gfs": 0.02,
          "gem": 0.054238,
          "jma": 0.085533
        },
        "interceptC": -0.0087,
        "diurnalHarmonicsC": [
          -0.2205,
          -0.1069,
          0,
          0
        ],
        "driverBetasC": [
          -0.0253,
          0.5794,
          -0.3082,
          -0.1206
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.292,
        "cvMaeC": 0.5642,
        "cvRmseC": 0.7425,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.221319,
          "ecmwfAifs": 0.134746,
          "icon": 0.242523,
          "ukmo": 0.02,
          "meteofrance": 0.238436,
          "gfs": 0.02,
          "gem": 0.037119,
          "jma": 0.085857
        },
        "interceptC": 0.038,
        "diurnalHarmonicsC": [
          -0.1792,
          -0.0567,
          0,
          0
        ],
        "driverBetasC": [
          -0.0037,
          0.4173,
          -0.2117,
          -0.0595
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2987,
        "cvMaeC": 0.5685,
        "cvRmseC": 0.749,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.253825,
          "ecmwfAifs": 0.19864,
          "icon": 0.227465,
          "ukmo": 0.02,
          "meteofrance": 0.173888,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.086182
        },
        "interceptC": 0.0847,
        "diurnalHarmonicsC": [
          -0.1378,
          -0.0065,
          0,
          0
        ],
        "driverBetasC": [
          0.0178,
          0.2551,
          -0.1153,
          0.0015
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.3054,
        "cvMaeC": 0.5729,
        "cvRmseC": 0.7555,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.137053,
          "ecmwfAifs": 0.082015,
          "icon": 0.419413,
          "ukmo": 0.02,
          "meteofrance": 0.15477,
          "gfs": 0.074262,
          "gem": 0.073805,
          "jma": 0.038682
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0489,
          -0.0092,
          0,
          0
        ],
        "driverBetasC": [
          0.1111,
          -0.106,
          0.1496,
          0.1102
        ],
        "spreadBaseC2": 0.241,
        "spreadScale": 0.273,
        "cvMaeC": 0.6151,
        "cvRmseC": 0.843,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.176656,
          "ecmwfAifs": 0.136435,
          "icon": 0.358196,
          "ukmo": 0.02,
          "meteofrance": 0.126275,
          "gfs": 0.0692,
          "gem": 0.058447,
          "jma": 0.054791
        },
        "interceptC": 0.0684,
        "diurnalHarmonicsC": [
          -0.0478,
          -0.0043,
          0,
          0
        ],
        "driverBetasC": [
          0.093,
          -0.1164,
          0.1456,
          0.1188
        ],
        "spreadBaseC2": 0.2315,
        "spreadScale": 0.2823,
        "cvMaeC": 0.6163,
        "cvRmseC": 0.8469,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.21626,
          "ecmwfAifs": 0.190854,
          "icon": 0.29698,
          "ukmo": 0.02,
          "meteofrance": 0.09778,
          "gfs": 0.064137,
          "gem": 0.043089,
          "jma": 0.0709
        },
        "interceptC": 0.1369,
        "diurnalHarmonicsC": [
          -0.0466,
          0.0006,
          0,
          0
        ],
        "driverBetasC": [
          0.075,
          -0.1269,
          0.1415,
          0.1274
        ],
        "spreadBaseC2": 0.222,
        "spreadScale": 0.2917,
        "cvMaeC": 0.6176,
        "cvRmseC": 0.8509,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.256069,
        "ecmwfAifs": 0.082563,
        "icon": 0.217872,
        "ukmo": 0.110093,
        "meteofrance": 0.158358,
        "gfs": 0.068312,
        "gem": 0.055542,
        "jma": 0.051191
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.240252,
        "ecmwfAifs": 0.066554,
        "icon": 0.23393,
        "ukmo": 0.117242,
        "meteofrance": 0.159801,
        "gfs": 0.065243,
        "gem": 0.06115,
        "jma": 0.055828
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.231719,
        "ecmwfAifs": 0.070036,
        "icon": 0.232239,
        "ukmo": 0.118464,
        "meteofrance": 0.164965,
        "gfs": 0.069294,
        "gem": 0.057298,
        "jma": 0.055985
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.262156,
        "ecmwfAifs": 0.076561,
        "icon": 0.210971,
        "ukmo": 0.123235,
        "meteofrance": 0.153065,
        "gfs": 0.066576,
        "gem": 0.055628,
        "jma": 0.051808
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.233977,
    "ecmwfAifs": 0.067263,
    "icon": 0.2082,
    "ukmo": 0.219289,
    "meteofrance": 0.104632,
    "gfs": 0.091901,
    "gem": 0.037369,
    "jma": 0.037369
  },
  "pressureWeights": {
    "ecmwfIfs": 0.324549,
    "ecmwfAifs": 0.146358,
    "icon": 0.134467,
    "ukmo": 0.167812,
    "meteofrance": 0.07703,
    "gfs": 0.072754,
    "gem": 0.038515,
    "jma": 0.038515
  }
} as const;

export default PROVINCE_CALIBRATION_TR_55;
