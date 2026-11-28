import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_72: ProvinceCalibrationBundle = {
  "provinceCode": "TR-72",
  "provinceName": "Batman",
  "plateNumber": 72,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17282",
  "stationLat": 37.8667,
  "stationLon": 41.1667,
  "stationElevationM": 540,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17439,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.11969,
          "ecmwfAifs": 0.02,
          "icon": 0.20594,
          "ukmo": 0.197774,
          "meteofrance": 0.096494,
          "gfs": 0.02,
          "gem": 0.320102,
          "jma": 0.02
        },
        "intercept": 0.1482,
        "betaDrivers": [
          -0.2467,
          0.2722,
          -0.3052,
          -0.21,
          0.2628,
          -0.2316
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4044,
        "spreadScale": 0.2398,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244754,
            "ecmwfAifs": 0.091575,
            "icon": 0.212583,
            "ukmo": 0.120476,
            "meteofrance": 0.151828,
            "gfs": 0.063798,
            "gem": 0.056018,
            "jma": 0.058968
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1713,
          "logisticSlope": 4.4898,
          "wetFractionWeight": 2.794,
          "powerEta": 0.68,
          "rawBrier": 0.04591,
          "calibratedBrier": 0.04492
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4615,
          "rawIfsRmseC": 1.8903,
          "rawEqualMaeC": 1.3028,
          "rawEqualRmseC": 1.7027,
          "cvSimplexMaeC": 1.1081,
          "cvCalibratedMaeC": 1.0876,
          "cvCalibratedRmseC": 1.4321
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.244102,
          "ecmwfAifs": 0.125147,
          "icon": 0.142987,
          "ukmo": 0.169908,
          "meteofrance": 0.033087,
          "gfs": 0.02,
          "gem": 0.244769,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1661,
          0.1054,
          -0.1458,
          -0.0829,
          0.1447,
          -0.0777
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5171,
        "spreadScale": 0.2031,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311243,
            "ecmwfAifs": 0.242942,
            "icon": 0.130506,
            "ukmo": 0.107284,
            "meteofrance": 0.045033,
            "gfs": 0.061546,
            "gem": 0.054041,
            "jma": 0.047405
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1908,
          "logisticSlope": 4.4352,
          "wetFractionWeight": 2.8827,
          "powerEta": 0.68,
          "rawBrier": 0.04591,
          "calibratedBrier": 0.04335
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4615,
          "rawIfsRmseC": 1.8903,
          "rawEqualMaeC": 1.3028,
          "rawEqualRmseC": 1.7027,
          "cvSimplexMaeC": 1.113,
          "cvCalibratedMaeC": 1.0958,
          "cvCalibratedRmseC": 1.4369
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.034198,
          "icon": 0.239337,
          "ukmo": 0.266956,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.379509,
          "jma": 0.02
        },
        "intercept": 0.0013,
        "betaDrivers": [
          -0.1678,
          -0.0415,
          -0.096,
          -0.1952,
          0.2327,
          -0.0306
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1078,
        "spreadScale": 0.5124,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24692,
            "ecmwfAifs": 0.069215,
            "icon": 0.227937,
            "ukmo": 0.12597,
            "meteofrance": 0.157146,
            "gfs": 0.064316,
            "gem": 0.05368,
            "jma": 0.054816
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0293,
          "logisticSlope": 3.124,
          "wetFractionWeight": 3.3777,
          "powerEta": 0.68,
          "rawBrier": 0.05938,
          "calibratedBrier": 0.04972
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.8008,
          "rawIfsRmseC": 2.3032,
          "rawEqualMaeC": 1.4877,
          "rawEqualRmseC": 1.9112,
          "cvSimplexMaeC": 1.2568,
          "cvCalibratedMaeC": 1.2498,
          "cvCalibratedRmseC": 1.6728
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.15722,
          "ecmwfAifs": 0.104759,
          "icon": 0.163335,
          "ukmo": 0.232605,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.282081,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.201,
          -0.1032,
          -0.0784,
          -0.1009,
          0.1272,
          -0.0074
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2301,
        "spreadScale": 0.4732,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330315,
            "ecmwfAifs": 0.193166,
            "icon": 0.147202,
            "ukmo": 0.118005,
            "meteofrance": 0.045208,
            "gfs": 0.06527,
            "gem": 0.054477,
            "jma": 0.046357
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0372,
          "logisticSlope": 3.6631,
          "wetFractionWeight": 3.1305,
          "powerEta": 0.68,
          "rawBrier": 0.05938,
          "calibratedBrier": 0.04996
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.8008,
          "rawIfsRmseC": 2.3032,
          "rawEqualMaeC": 1.4877,
          "rawEqualRmseC": 1.9112,
          "cvSimplexMaeC": 1.2745,
          "cvCalibratedMaeC": 1.2537,
          "cvCalibratedRmseC": 1.6672
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.469555,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.410445,
          "jma": 0.02
        },
        "intercept": -0.138,
        "betaDrivers": [
          -0.1356,
          0.0028,
          0.0555,
          -0.1145,
          0.0182,
          0.1346
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2802,
        "spreadScale": 0.5351,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.222716,
            "ecmwfAifs": 0.080927,
            "icon": 0.225876,
            "ukmo": 0.129706,
            "meteofrance": 0.161769,
            "gfs": 0.068484,
            "gem": 0.05043,
            "jma": 0.060092
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.9897,
          "logisticSlope": 0.6292,
          "wetFractionWeight": 0.3711,
          "powerEta": 0.68,
          "rawBrier": 0.00224,
          "calibratedBrier": 0.00093
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.252,
          "rawIfsRmseC": 3.0164,
          "rawEqualMaeC": 2.1695,
          "rawEqualRmseC": 2.8022,
          "cvSimplexMaeC": 1.374,
          "cvCalibratedMaeC": 1.3435,
          "cvCalibratedRmseC": 1.8002
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.152229,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.428847,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.318924,
          "jma": 0.02
        },
        "intercept": -0.3894,
        "betaDrivers": [
          -0.2192,
          -0.0911,
          -0.0097,
          -0.0983,
          0.0576,
          0.1287
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3388,
        "spreadScale": 0.4764,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.295487,
            "ecmwfAifs": 0.223993,
            "icon": 0.144672,
            "ukmo": 0.120506,
            "meteofrance": 0.045253,
            "gfs": 0.068929,
            "gem": 0.050758,
            "jma": 0.050402
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.9916,
          "logisticSlope": 0.6872,
          "wetFractionWeight": 0.5476,
          "powerEta": 0.68,
          "rawBrier": 0.00224,
          "calibratedBrier": 0.00093
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.252,
          "rawIfsRmseC": 3.0164,
          "rawEqualMaeC": 2.1695,
          "rawEqualRmseC": 2.8022,
          "cvSimplexMaeC": 1.3878,
          "cvCalibratedMaeC": 1.3113,
          "cvCalibratedRmseC": 1.7528
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.101673,
          "ukmo": 0.335108,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.463219,
          "jma": 0.02
        },
        "intercept": 0.0022,
        "betaDrivers": [
          -0.2532,
          -0.0395,
          -0.063,
          -0.0809,
          0.1893,
          -0.0117
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8237,
        "spreadScale": 0.1724,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238798,
            "ecmwfAifs": 0.081364,
            "icon": 0.219285,
            "ukmo": 0.120641,
            "meteofrance": 0.152547,
            "gfs": 0.066738,
            "gem": 0.058422,
            "jma": 0.062205
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7032,
          "logisticSlope": 4.222,
          "wetFractionWeight": 3.2661,
          "powerEta": 0.68,
          "rawBrier": 0.02237,
          "calibratedBrier": 0.02114
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.9316,
          "rawIfsRmseC": 2.5156,
          "rawEqualMaeC": 1.9166,
          "rawEqualRmseC": 2.4308,
          "cvSimplexMaeC": 1.2213,
          "cvCalibratedMaeC": 1.2081,
          "cvCalibratedRmseC": 1.5695
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.13289,
          "ecmwfAifs": 0.02,
          "icon": 0.09699,
          "ukmo": 0.319448,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.370672,
          "jma": 0.02
        },
        "intercept": -0.0683,
        "betaDrivers": [
          -0.2675,
          -0.1102,
          -0.0983,
          -0.0394,
          0.1628,
          0.0233
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.7957,
        "spreadScale": 0.1803,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311026,
            "ecmwfAifs": 0.221082,
            "icon": 0.137881,
            "ukmo": 0.110033,
            "meteofrance": 0.045091,
            "gfs": 0.065943,
            "gem": 0.057725,
            "jma": 0.051219
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7827,
          "logisticSlope": 4.1269,
          "wetFractionWeight": 3.4494,
          "powerEta": 0.68,
          "rawBrier": 0.02237,
          "calibratedBrier": 0.02039
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.9316,
          "rawIfsRmseC": 2.5156,
          "rawEqualMaeC": 1.9166,
          "rawEqualRmseC": 2.4308,
          "cvSimplexMaeC": 1.2451,
          "cvCalibratedMaeC": 1.2107,
          "cvCalibratedRmseC": 1.5697
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.11969,
          "ecmwfAifs": 0.02,
          "icon": 0.20594,
          "ukmo": 0.197774,
          "meteofrance": 0.096494,
          "gfs": 0.02,
          "gem": 0.320102,
          "jma": 0.02
        },
        "interceptC": 0.1482,
        "diurnalHarmonicsC": [
          -0.2467,
          0.2722,
          0,
          0
        ],
        "driverBetasC": [
          -0.3052,
          -0.2316,
          -0.21,
          0.2628
        ],
        "spreadBaseC2": 1.4044,
        "spreadScale": 0.2398,
        "cvMaeC": 1.0876,
        "cvRmseC": 1.4321,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.181896,
          "ecmwfAifs": 0.072574,
          "icon": 0.174464,
          "ukmo": 0.18384,
          "meteofrance": 0.064791,
          "gfs": 0.02,
          "gem": 0.282435,
          "jma": 0.02
        },
        "interceptC": 0.0741,
        "diurnalHarmonicsC": [
          -0.2064,
          0.1888,
          0,
          0
        ],
        "driverBetasC": [
          -0.2255,
          -0.1547,
          -0.1464,
          0.2037
        ],
        "spreadBaseC2": 1.4607,
        "spreadScale": 0.2215,
        "cvMaeC": 1.0917,
        "cvRmseC": 1.4345,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.244102,
          "ecmwfAifs": 0.125147,
          "icon": 0.142987,
          "ukmo": 0.169908,
          "meteofrance": 0.033087,
          "gfs": 0.02,
          "gem": 0.244769,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1661,
          0.1054,
          0,
          0
        ],
        "driverBetasC": [
          -0.1458,
          -0.0777,
          -0.0829,
          0.1447
        ],
        "spreadBaseC2": 1.5171,
        "spreadScale": 0.2031,
        "cvMaeC": 1.0958,
        "cvRmseC": 1.4369,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.034198,
          "icon": 0.239337,
          "ukmo": 0.266956,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.379509,
          "jma": 0.02
        },
        "interceptC": 0.0013,
        "diurnalHarmonicsC": [
          -0.1678,
          -0.0415,
          0,
          0
        ],
        "driverBetasC": [
          -0.096,
          -0.0306,
          -0.1952,
          0.2327
        ],
        "spreadBaseC2": 1.1078,
        "spreadScale": 0.5124,
        "cvMaeC": 1.2498,
        "cvRmseC": 1.6728,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.08861,
          "ecmwfAifs": 0.069479,
          "icon": 0.201336,
          "ukmo": 0.249781,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.330794,
          "jma": 0.02
        },
        "interceptC": 0.0006,
        "diurnalHarmonicsC": [
          -0.1844,
          -0.0723,
          0,
          0
        ],
        "driverBetasC": [
          -0.0872,
          -0.019,
          -0.1481,
          0.1799
        ],
        "spreadBaseC2": 1.1689,
        "spreadScale": 0.4928,
        "cvMaeC": 1.2517,
        "cvRmseC": 1.67,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.15722,
          "ecmwfAifs": 0.104759,
          "icon": 0.163335,
          "ukmo": 0.232605,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.282081,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.201,
          -0.1032,
          0,
          0
        ],
        "driverBetasC": [
          -0.0784,
          -0.0074,
          -0.1009,
          0.1272
        ],
        "spreadBaseC2": 1.2301,
        "spreadScale": 0.4732,
        "cvMaeC": 1.2537,
        "cvRmseC": 1.6672,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.469555,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.410445,
          "jma": 0.02
        },
        "interceptC": -0.138,
        "diurnalHarmonicsC": [
          -0.1356,
          0.0028,
          0,
          0
        ],
        "driverBetasC": [
          0.0555,
          0.1346,
          -0.1145,
          0.0182
        ],
        "spreadBaseC2": 1.2802,
        "spreadScale": 0.5351,
        "cvMaeC": 1.3435,
        "cvRmseC": 1.8002,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.086115,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.449201,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.364684,
          "jma": 0.02
        },
        "interceptC": -0.2637,
        "diurnalHarmonicsC": [
          -0.1774,
          -0.0442,
          0,
          0
        ],
        "driverBetasC": [
          0.0229,
          0.1316,
          -0.1064,
          0.0379
        ],
        "spreadBaseC2": 1.3095,
        "spreadScale": 0.5058,
        "cvMaeC": 1.3274,
        "cvRmseC": 1.7765,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.152229,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.428847,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.318924,
          "jma": 0.02
        },
        "interceptC": -0.3894,
        "diurnalHarmonicsC": [
          -0.2192,
          -0.0911,
          0,
          0
        ],
        "driverBetasC": [
          -0.0097,
          0.1287,
          -0.0983,
          0.0576
        ],
        "spreadBaseC2": 1.3388,
        "spreadScale": 0.4764,
        "cvMaeC": 1.3113,
        "cvRmseC": 1.7528,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.101673,
          "ukmo": 0.335108,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.463219,
          "jma": 0.02
        },
        "interceptC": 0.0022,
        "diurnalHarmonicsC": [
          -0.2532,
          -0.0395,
          0,
          0
        ],
        "driverBetasC": [
          -0.063,
          -0.0117,
          -0.0809,
          0.1893
        ],
        "spreadBaseC2": 1.8237,
        "spreadScale": 0.1724,
        "cvMaeC": 1.2081,
        "cvRmseC": 1.5695,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.076445,
          "ecmwfAifs": 0.02,
          "icon": 0.099332,
          "ukmo": 0.327278,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.416945,
          "jma": 0.02
        },
        "interceptC": -0.0331,
        "diurnalHarmonicsC": [
          -0.2603,
          -0.0748,
          0,
          0
        ],
        "driverBetasC": [
          -0.0806,
          0.0058,
          -0.0601,
          0.176
        ],
        "spreadBaseC2": 1.8097,
        "spreadScale": 0.1764,
        "cvMaeC": 1.2094,
        "cvRmseC": 1.5696,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.13289,
          "ecmwfAifs": 0.02,
          "icon": 0.09699,
          "ukmo": 0.319448,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.370672,
          "jma": 0.02
        },
        "interceptC": -0.0683,
        "diurnalHarmonicsC": [
          -0.2675,
          -0.1102,
          0,
          0
        ],
        "driverBetasC": [
          -0.0983,
          0.0233,
          -0.0394,
          0.1628
        ],
        "spreadBaseC2": 1.7957,
        "spreadScale": 0.1803,
        "cvMaeC": 1.2107,
        "cvRmseC": 1.5697,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.244754,
        "ecmwfAifs": 0.091575,
        "icon": 0.212583,
        "ukmo": 0.120476,
        "meteofrance": 0.151828,
        "gfs": 0.063798,
        "gem": 0.056018,
        "jma": 0.058968
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.24692,
        "ecmwfAifs": 0.069215,
        "icon": 0.227937,
        "ukmo": 0.12597,
        "meteofrance": 0.157146,
        "gfs": 0.064316,
        "gem": 0.05368,
        "jma": 0.054816
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.222716,
        "ecmwfAifs": 0.080927,
        "icon": 0.225876,
        "ukmo": 0.129706,
        "meteofrance": 0.161769,
        "gfs": 0.068484,
        "gem": 0.05043,
        "jma": 0.060092
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.238798,
        "ecmwfAifs": 0.081364,
        "icon": 0.219285,
        "ukmo": 0.120641,
        "meteofrance": 0.152547,
        "gfs": 0.066738,
        "gem": 0.058422,
        "jma": 0.062205
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.224859,
    "ecmwfAifs": 0.071804,
    "icon": 0.250117,
    "ukmo": 0.166455,
    "meteofrance": 0.111695,
    "gfs": 0.095288,
    "gem": 0.039891,
    "jma": 0.039891
  },
  "pressureWeights": {
    "ecmwfIfs": 0.302767,
    "ecmwfAifs": 0.154075,
    "icon": 0.152373,
    "ukmo": 0.181633,
    "meteofrance": 0.081092,
    "gfs": 0.046968,
    "gem": 0.040546,
    "jma": 0.040546
  }
} as const;

export default PROVINCE_CALIBRATION_TR_72;
