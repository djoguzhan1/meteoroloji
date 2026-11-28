import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_18: ProvinceCalibrationBundle = {
  "provinceCode": "TR-18",
  "provinceName": "Çankırı",
  "plateNumber": 18,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17080",
  "stationLat": 40.6,
  "stationLon": 33.6167,
  "stationElevationM": 751,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0878,
        "betaDrivers": [
          0.0874,
          -0.1411,
          0.0299,
          0.0162,
          -0.0791,
          -0.0591
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.425,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245356,
            "ecmwfAifs": 0.084094,
            "icon": 0.216536,
            "ukmo": 0.119584,
            "meteofrance": 0.158903,
            "gfs": 0.062699,
            "gem": 0.056077,
            "jma": 0.056751
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2803,
          "logisticSlope": 4.3158,
          "wetFractionWeight": 3.2423,
          "powerEta": 0.68,
          "rawBrier": 0.03502,
          "calibratedBrier": 0.03253
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4936,
          "rawIfsRmseC": 0.7545,
          "rawEqualMaeC": 1.0009,
          "rawEqualRmseC": 1.265,
          "cvSimplexMaeC": 0.5109,
          "cvCalibratedMaeC": 0.4911,
          "cvCalibratedRmseC": 0.719
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0798,
        "betaDrivers": [
          0.0608,
          -0.0976,
          0.0087,
          0.0108,
          -0.0363,
          -0.035
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4264,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318718,
            "ecmwfAifs": 0.227894,
            "icon": 0.135791,
            "ukmo": 0.108778,
            "meteofrance": 0.045169,
            "gfs": 0.061786,
            "gem": 0.05526,
            "jma": 0.046604
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3293,
          "logisticSlope": 4.1191,
          "wetFractionWeight": 3.2965,
          "powerEta": 0.68,
          "rawBrier": 0.03502,
          "calibratedBrier": 0.03199
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4936,
          "rawIfsRmseC": 0.7545,
          "rawEqualMaeC": 1.0009,
          "rawEqualRmseC": 1.265,
          "cvSimplexMaeC": 0.5109,
          "cvCalibratedMaeC": 0.4914,
          "cvCalibratedRmseC": 0.72
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.850138,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.029862,
          "jma": 0.02
        },
        "intercept": -0.1722,
        "betaDrivers": [
          0.0706,
          -0.1821,
          0.0274,
          0.1743,
          -0.0399,
          -0.0552
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5167,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.267619,
            "ecmwfAifs": 0.07346,
            "icon": 0.219633,
            "ukmo": 0.115867,
            "meteofrance": 0.141332,
            "gfs": 0.066827,
            "gem": 0.058323,
            "jma": 0.056939
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0514,
          "logisticSlope": 2.7366,
          "wetFractionWeight": 3.6246,
          "powerEta": 0.68,
          "rawBrier": 0.05447,
          "calibratedBrier": 0.04492
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5118,
          "rawIfsRmseC": 0.8267,
          "rawEqualMaeC": 1.1367,
          "rawEqualRmseC": 1.4213,
          "cvSimplexMaeC": 0.5426,
          "cvCalibratedMaeC": 0.4964,
          "cvCalibratedRmseC": 0.7814
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1775,
        "betaDrivers": [
          0.0373,
          -0.1033,
          0.0059,
          0.0719,
          -0.0197,
          -0.0285
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5261,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.34644,
            "ecmwfAifs": 0.19839,
            "icon": 0.137258,
            "ukmo": 0.105035,
            "meteofrance": 0.043374,
            "gfs": 0.065628,
            "gem": 0.057277,
            "jma": 0.046598
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1012,
          "logisticSlope": 2.9773,
          "wetFractionWeight": 3.5719,
          "powerEta": 0.68,
          "rawBrier": 0.05447,
          "calibratedBrier": 0.04343
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5118,
          "rawIfsRmseC": 0.8267,
          "rawEqualMaeC": 1.1367,
          "rawEqualRmseC": 1.4213,
          "cvSimplexMaeC": 0.5429,
          "cvCalibratedMaeC": 0.4994,
          "cvCalibratedRmseC": 0.7874
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1415,
        "betaDrivers": [
          0.0471,
          -0.0974,
          0.1291,
          0.1632,
          -0.1139,
          -0.1516
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1357,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24922,
            "ecmwfAifs": 0.080527,
            "icon": 0.227162,
            "ukmo": 0.116141,
            "meteofrance": 0.155638,
            "gfs": 0.063243,
            "gem": 0.052425,
            "jma": 0.055644
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0129,
          "logisticSlope": 3.6674,
          "wetFractionWeight": 3.1831,
          "powerEta": 0.68,
          "rawBrier": 0.01849,
          "calibratedBrier": 0.01386
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3728,
          "rawIfsRmseC": 0.685,
          "rawEqualMaeC": 0.8631,
          "rawEqualRmseC": 1.0646,
          "cvSimplexMaeC": 0.387,
          "cvCalibratedMaeC": 0.3542,
          "cvCalibratedRmseC": 0.6438
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0985,
        "betaDrivers": [
          0.0298,
          -0.0683,
          0.0575,
          0.0937,
          -0.0806,
          -0.0964
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1374,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325482,
            "ecmwfAifs": 0.219403,
            "icon": 0.143222,
            "ukmo": 0.106216,
            "meteofrance": 0.045137,
            "gfs": 0.062658,
            "gem": 0.051941,
            "jma": 0.045941
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1165,
          "logisticSlope": 3.363,
          "wetFractionWeight": 3.6747,
          "powerEta": 0.68,
          "rawBrier": 0.01849,
          "calibratedBrier": 0.0131
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3728,
          "rawIfsRmseC": 0.685,
          "rawEqualMaeC": 0.8631,
          "rawEqualRmseC": 1.0646,
          "cvSimplexMaeC": 0.387,
          "cvCalibratedMaeC": 0.3558,
          "cvCalibratedRmseC": 0.6473
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.852596,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.027404,
          "jma": 0.02
        },
        "intercept": -0.0885,
        "betaDrivers": [
          0.0402,
          -0.1391,
          0.067,
          0.082,
          -0.0315,
          -0.0542
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3193,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256804,
            "ecmwfAifs": 0.07822,
            "icon": 0.214198,
            "ukmo": 0.117497,
            "meteofrance": 0.151124,
            "gfs": 0.070539,
            "gem": 0.053924,
            "jma": 0.057694
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4109,
          "logisticSlope": 3.3843,
          "wetFractionWeight": 3.6549,
          "powerEta": 0.68,
          "rawBrier": 0.02873,
          "calibratedBrier": 0.02598
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4258,
          "rawIfsRmseC": 0.6608,
          "rawEqualMaeC": 0.9484,
          "rawEqualRmseC": 1.1744,
          "cvSimplexMaeC": 0.4576,
          "cvCalibratedMaeC": 0.4339,
          "cvCalibratedRmseC": 0.6501
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0842,
        "betaDrivers": [
          0.0369,
          -0.1256,
          0.0329,
          0.0543,
          -0.0274,
          -0.0489
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3206,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.332941,
            "ecmwfAifs": 0.211562,
            "icon": 0.134063,
            "ukmo": 0.106672,
            "meteofrance": 0.045062,
            "gfs": 0.069377,
            "gem": 0.053036,
            "jma": 0.047287
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5545,
          "logisticSlope": 3.3136,
          "wetFractionWeight": 3.8208,
          "powerEta": 0.68,
          "rawBrier": 0.02873,
          "calibratedBrier": 0.02457
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4258,
          "rawIfsRmseC": 0.6608,
          "rawEqualMaeC": 0.9484,
          "rawEqualRmseC": 1.1744,
          "cvSimplexMaeC": 0.4577,
          "cvCalibratedMaeC": 0.4355,
          "cvCalibratedRmseC": 0.6511
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0878,
        "diurnalHarmonicsC": [
          0.0874,
          -0.1411,
          0,
          0
        ],
        "driverBetasC": [
          0.0299,
          -0.0591,
          0.0162,
          -0.0791
        ],
        "spreadBaseC2": 0.425,
        "spreadScale": 0.05,
        "cvMaeC": 0.4911,
        "cvRmseC": 0.719,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0838,
        "diurnalHarmonicsC": [
          0.0741,
          -0.1194,
          0,
          0
        ],
        "driverBetasC": [
          0.0193,
          -0.0471,
          0.0135,
          -0.0577
        ],
        "spreadBaseC2": 0.4257,
        "spreadScale": 0.05,
        "cvMaeC": 0.4912,
        "cvRmseC": 0.7195,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0798,
        "diurnalHarmonicsC": [
          0.0608,
          -0.0976,
          0,
          0
        ],
        "driverBetasC": [
          0.0087,
          -0.035,
          0.0108,
          -0.0363
        ],
        "spreadBaseC2": 0.4264,
        "spreadScale": 0.05,
        "cvMaeC": 0.4914,
        "cvRmseC": 0.72,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.850138,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.029862,
          "jma": 0.02
        },
        "interceptC": -0.1722,
        "diurnalHarmonicsC": [
          0.0706,
          -0.1821,
          0,
          0
        ],
        "driverBetasC": [
          0.0274,
          -0.0552,
          0.1743,
          -0.0399
        ],
        "spreadBaseC2": 0.5167,
        "spreadScale": 0.05,
        "cvMaeC": 0.4964,
        "cvRmseC": 0.7814,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.855069,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.024931,
          "jma": 0.02
        },
        "interceptC": -0.1749,
        "diurnalHarmonicsC": [
          0.0539,
          -0.1427,
          0,
          0
        ],
        "driverBetasC": [
          0.0167,
          -0.0418,
          0.1231,
          -0.0298
        ],
        "spreadBaseC2": 0.5214,
        "spreadScale": 0.05,
        "cvMaeC": 0.4979,
        "cvRmseC": 0.7844,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1775,
        "diurnalHarmonicsC": [
          0.0373,
          -0.1033,
          0,
          0
        ],
        "driverBetasC": [
          0.0059,
          -0.0285,
          0.0719,
          -0.0197
        ],
        "spreadBaseC2": 0.5261,
        "spreadScale": 0.05,
        "cvMaeC": 0.4994,
        "cvRmseC": 0.7874,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1415,
        "diurnalHarmonicsC": [
          0.0471,
          -0.0974,
          0,
          0
        ],
        "driverBetasC": [
          0.1291,
          -0.1516,
          0.1632,
          -0.1139
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1357,
        "cvMaeC": 0.3542,
        "cvRmseC": 0.6438,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.12,
        "diurnalHarmonicsC": [
          0.0384,
          -0.0829,
          0,
          0
        ],
        "driverBetasC": [
          0.0933,
          -0.124,
          0.1285,
          -0.0973
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1366,
        "cvMaeC": 0.355,
        "cvRmseC": 0.6456,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0985,
        "diurnalHarmonicsC": [
          0.0298,
          -0.0683,
          0,
          0
        ],
        "driverBetasC": [
          0.0575,
          -0.0964,
          0.0937,
          -0.0806
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1374,
        "cvMaeC": 0.3558,
        "cvRmseC": 0.6473,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.852596,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.027404,
          "jma": 0.02
        },
        "interceptC": -0.0885,
        "diurnalHarmonicsC": [
          0.0402,
          -0.1391,
          0,
          0
        ],
        "driverBetasC": [
          0.067,
          -0.0542,
          0.082,
          -0.0315
        ],
        "spreadBaseC2": 0.3193,
        "spreadScale": 0.05,
        "cvMaeC": 0.4339,
        "cvRmseC": 0.6501,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.856298,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.023702,
          "jma": 0.02
        },
        "interceptC": -0.0863,
        "diurnalHarmonicsC": [
          0.0386,
          -0.1323,
          0,
          0
        ],
        "driverBetasC": [
          0.05,
          -0.0515,
          0.0682,
          -0.0295
        ],
        "spreadBaseC2": 0.3199,
        "spreadScale": 0.05,
        "cvMaeC": 0.4347,
        "cvRmseC": 0.6506,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0842,
        "diurnalHarmonicsC": [
          0.0369,
          -0.1256,
          0,
          0
        ],
        "driverBetasC": [
          0.0329,
          -0.0489,
          0.0543,
          -0.0274
        ],
        "spreadBaseC2": 0.3206,
        "spreadScale": 0.05,
        "cvMaeC": 0.4355,
        "cvRmseC": 0.6511,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.245356,
        "ecmwfAifs": 0.084094,
        "icon": 0.216536,
        "ukmo": 0.119584,
        "meteofrance": 0.158903,
        "gfs": 0.062699,
        "gem": 0.056077,
        "jma": 0.056751
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.267619,
        "ecmwfAifs": 0.07346,
        "icon": 0.219633,
        "ukmo": 0.115867,
        "meteofrance": 0.141332,
        "gfs": 0.066827,
        "gem": 0.058323,
        "jma": 0.056939
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.24922,
        "ecmwfAifs": 0.080527,
        "icon": 0.227162,
        "ukmo": 0.116141,
        "meteofrance": 0.155638,
        "gfs": 0.063243,
        "gem": 0.052425,
        "jma": 0.055644
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.256804,
        "ecmwfAifs": 0.07822,
        "icon": 0.214198,
        "ukmo": 0.117497,
        "meteofrance": 0.151124,
        "gfs": 0.070539,
        "gem": 0.053924,
        "jma": 0.057694
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.278563,
    "ecmwfAifs": 0.066501,
    "icon": 0.240933,
    "ukmo": 0.147021,
    "meteofrance": 0.103446,
    "gfs": 0.089646,
    "gem": 0.036945,
    "jma": 0.036945
  },
  "pressureWeights": {
    "ecmwfIfs": 0.526479,
    "ecmwfAifs": 0.101301,
    "icon": 0.084257,
    "ukmo": 0.135434,
    "meteofrance": 0.053316,
    "gfs": 0.045897,
    "gem": 0.026658,
    "jma": 0.026658
  }
} as const;

export default PROVINCE_CALIBRATION_TR_18;
