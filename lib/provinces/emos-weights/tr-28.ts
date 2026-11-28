import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_28: ProvinceCalibrationBundle = {
  "provinceCode": "TR-28",
  "provinceName": "Giresun",
  "plateNumber": 28,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17034",
  "stationLat": 40.9167,
  "stationLon": 38.4,
  "stationElevationM": 38,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.67883,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.077243,
          "gem": 0.02,
          "jma": 0.143927
        },
        "intercept": -0.0362,
        "betaDrivers": [
          -0.0261,
          0.0231,
          -0.0116,
          0.0055,
          -0.0005,
          0.059
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2764,
        "spreadScale": 0.0796,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247741,
            "ecmwfAifs": 0.084104,
            "icon": 0.219731,
            "ukmo": 0.113233,
            "meteofrance": 0.158944,
            "gfs": 0.062637,
            "gem": 0.056364,
            "jma": 0.057246
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8704,
          "logisticSlope": 4.0693,
          "wetFractionWeight": 3.5896,
          "powerEta": 0.68,
          "rawBrier": 0.06129,
          "calibratedBrier": 0.05643
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6827,
          "rawIfsRmseC": 0.9027,
          "rawEqualMaeC": 0.7799,
          "rawEqualRmseC": 1.0632,
          "cvSimplexMaeC": 0.4437,
          "cvCalibratedMaeC": 0.4427,
          "cvCalibratedRmseC": 0.6364
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.59116,
          "ecmwfAifs": 0.137903,
          "icon": 0.043296,
          "ukmo": 0.02,
          "meteofrance": 0.036325,
          "gfs": 0.037729,
          "gem": 0.02,
          "jma": 0.113587
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0231,
          0.0016,
          -0.0175,
          -0.0524,
          -0.0323,
          0.0519
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2658,
        "spreadScale": 0.103,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.321822,
            "ecmwfAifs": 0.227926,
            "icon": 0.137796,
            "ukmo": 0.103004,
            "meteofrance": 0.04517,
            "gfs": 0.061726,
            "gem": 0.055545,
            "jma": 0.047011
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9988,
          "logisticSlope": 3.8665,
          "wetFractionWeight": 3.8685,
          "powerEta": 0.68,
          "rawBrier": 0.06129,
          "calibratedBrier": 0.05437
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6827,
          "rawIfsRmseC": 0.9027,
          "rawEqualMaeC": 0.7799,
          "rawEqualRmseC": 1.0632,
          "cvSimplexMaeC": 0.4701,
          "cvCalibratedMaeC": 0.4666,
          "cvCalibratedRmseC": 0.6575
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.565649,
          "ecmwfAifs": 0.078505,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.066742,
          "gem": 0.08074,
          "jma": 0.148364
        },
        "intercept": -0.1302,
        "betaDrivers": [
          -0.0506,
          0.0893,
          -0.0762,
          -0.1481,
          -0.0808,
          0.1946
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3059,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.273091,
            "ecmwfAifs": 0.071081,
            "icon": 0.207905,
            "ukmo": 0.122859,
            "meteofrance": 0.150356,
            "gfs": 0.060796,
            "gem": 0.05543,
            "jma": 0.058482
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6929,
          "logisticSlope": 3.4559,
          "wetFractionWeight": 3.5256,
          "powerEta": 0.68,
          "rawBrier": 0.06228,
          "calibratedBrier": 0.05805
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7928,
          "rawIfsRmseC": 1.0779,
          "rawEqualMaeC": 0.6678,
          "rawEqualRmseC": 0.9242,
          "cvSimplexMaeC": 0.4723,
          "cvCalibratedMaeC": 0.4628,
          "cvCalibratedRmseC": 0.6644
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.541108,
          "ecmwfAifs": 0.199984,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.023159,
          "gfs": 0.055046,
          "gem": 0.037455,
          "jma": 0.103248
        },
        "intercept": -0.0439,
        "betaDrivers": [
          -0.0321,
          0.0391,
          -0.021,
          -0.0712,
          -0.0542,
          0.1095
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3245,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.355815,
            "ecmwfAifs": 0.193208,
            "icon": 0.130771,
            "ukmo": 0.112094,
            "meteofrance": 0.045062,
            "gfs": 0.060091,
            "gem": 0.054788,
            "jma": 0.048171
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.817,
          "logisticSlope": 3.7111,
          "wetFractionWeight": 3.459,
          "powerEta": 0.68,
          "rawBrier": 0.06228,
          "calibratedBrier": 0.05605
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7928,
          "rawIfsRmseC": 1.0779,
          "rawEqualMaeC": 0.6678,
          "rawEqualRmseC": 0.9242,
          "cvSimplexMaeC": 0.4832,
          "cvCalibratedMaeC": 0.4754,
          "cvCalibratedRmseC": 0.6782
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.601375,
          "ecmwfAifs": 0.085261,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.135165,
          "gem": 0.02,
          "jma": 0.098199
        },
        "intercept": -0.0798,
        "betaDrivers": [
          -0.0754,
          0.1172,
          0.022,
          -0.1399,
          -0.1234,
          0.0591
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1692,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.276881,
            "ecmwfAifs": 0.086009,
            "icon": 0.198134,
            "ukmo": 0.118707,
            "meteofrance": 0.150583,
            "gfs": 0.062222,
            "gem": 0.056484,
            "jma": 0.05098
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6953,
          "logisticSlope": 2.5427,
          "wetFractionWeight": 4.7249,
          "powerEta": 0.68,
          "rawBrier": 0.07186,
          "calibratedBrier": 0.06541
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.613,
          "rawIfsRmseC": 0.7683,
          "rawEqualMaeC": 0.5499,
          "rawEqualRmseC": 0.7344,
          "cvSimplexMaeC": 0.3679,
          "cvCalibratedMaeC": 0.3586,
          "cvCalibratedRmseC": 0.4894
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.507171,
          "ecmwfAifs": 0.223422,
          "icon": 0.026164,
          "ukmo": 0.02,
          "meteofrance": 0.062875,
          "gfs": 0.088784,
          "gem": 0.02,
          "jma": 0.051584
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0402,
          0.0532,
          0.0008,
          -0.048,
          -0.0489,
          0.0464
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1921,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.349127,
            "ecmwfAifs": 0.226254,
            "icon": 0.12061,
            "ukmo": 0.104817,
            "meteofrance": 0.045001,
            "gfs": 0.05952,
            "gem": 0.054032,
            "jma": 0.040639
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9788,
          "logisticSlope": 3.037,
          "wetFractionWeight": 3.9544,
          "powerEta": 0.68,
          "rawBrier": 0.07186,
          "calibratedBrier": 0.06271
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.613,
          "rawIfsRmseC": 0.7683,
          "rawEqualMaeC": 0.5499,
          "rawEqualRmseC": 0.7344,
          "cvSimplexMaeC": 0.3882,
          "cvCalibratedMaeC": 0.3822,
          "cvCalibratedRmseC": 0.5123
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.677859,
          "ecmwfAifs": 0.0304,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.033731,
          "gfs": 0.06274,
          "gem": 0.02,
          "jma": 0.13527
        },
        "intercept": -0.0433,
        "betaDrivers": [
          -0.0338,
          0.0273,
          -0.0405,
          0.0752,
          -0.0146,
          0.1393
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2005,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.264641,
            "ecmwfAifs": 0.077548,
            "icon": 0.197693,
            "ukmo": 0.120496,
            "meteofrance": 0.154493,
            "gfs": 0.071283,
            "gem": 0.058351,
            "jma": 0.055495
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9778,
          "logisticSlope": 4.1751,
          "wetFractionWeight": 3.5142,
          "powerEta": 0.68,
          "rawBrier": 0.05616,
          "calibratedBrier": 0.05163
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6388,
          "rawIfsRmseC": 0.8112,
          "rawEqualMaeC": 0.719,
          "rawEqualRmseC": 0.9414,
          "cvSimplexMaeC": 0.3868,
          "cvCalibratedMaeC": 0.3846,
          "cvCalibratedRmseC": 0.5292
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.594676,
          "ecmwfAifs": 0.128385,
          "icon": 0.050892,
          "ukmo": 0.02,
          "meteofrance": 0.049466,
          "gfs": 0.039769,
          "gem": 0.02,
          "jma": 0.096812
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0217,
          0.009,
          -0.0221,
          -0.0063,
          -0.0352,
          0.0981
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2139,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.341647,
            "ecmwfAifs": 0.208859,
            "icon": 0.12321,
            "ukmo": 0.108933,
            "meteofrance": 0.045098,
            "gfs": 0.069813,
            "gem": 0.057148,
            "jma": 0.045292
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2679,
          "logisticSlope": 3.9473,
          "wetFractionWeight": 3.6111,
          "powerEta": 0.68,
          "rawBrier": 0.05616,
          "calibratedBrier": 0.04994
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6388,
          "rawIfsRmseC": 0.8112,
          "rawEqualMaeC": 0.719,
          "rawEqualRmseC": 0.9414,
          "cvSimplexMaeC": 0.4101,
          "cvCalibratedMaeC": 0.405,
          "cvCalibratedRmseC": 0.5417
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.67883,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.077243,
          "gem": 0.02,
          "jma": 0.143927
        },
        "interceptC": -0.0362,
        "diurnalHarmonicsC": [
          -0.0261,
          0.0231,
          0,
          0
        ],
        "driverBetasC": [
          -0.0116,
          0.059,
          0.0055,
          -0.0005
        ],
        "spreadBaseC2": 0.2764,
        "spreadScale": 0.0796,
        "cvMaeC": 0.4427,
        "cvRmseC": 0.6364,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.634994,
          "ecmwfAifs": 0.078952,
          "icon": 0.031648,
          "ukmo": 0.02,
          "meteofrance": 0.028163,
          "gfs": 0.057486,
          "gem": 0.02,
          "jma": 0.128757
        },
        "interceptC": -0.0181,
        "diurnalHarmonicsC": [
          -0.0246,
          0.0123,
          0,
          0
        ],
        "driverBetasC": [
          -0.0146,
          0.0554,
          -0.0235,
          -0.0164
        ],
        "spreadBaseC2": 0.2711,
        "spreadScale": 0.0913,
        "cvMaeC": 0.4546,
        "cvRmseC": 0.6469,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.59116,
          "ecmwfAifs": 0.137903,
          "icon": 0.043296,
          "ukmo": 0.02,
          "meteofrance": 0.036325,
          "gfs": 0.037729,
          "gem": 0.02,
          "jma": 0.113587
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0231,
          0.0016,
          0,
          0
        ],
        "driverBetasC": [
          -0.0175,
          0.0519,
          -0.0524,
          -0.0323
        ],
        "spreadBaseC2": 0.2658,
        "spreadScale": 0.103,
        "cvMaeC": 0.4666,
        "cvRmseC": 0.6575,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.565649,
          "ecmwfAifs": 0.078505,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.066742,
          "gem": 0.08074,
          "jma": 0.148364
        },
        "interceptC": -0.1302,
        "diurnalHarmonicsC": [
          -0.0506,
          0.0893,
          0,
          0
        ],
        "driverBetasC": [
          -0.0762,
          0.1946,
          -0.1481,
          -0.0808
        ],
        "spreadBaseC2": 0.3059,
        "spreadScale": 0.05,
        "cvMaeC": 0.4628,
        "cvRmseC": 0.6644,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.553378,
          "ecmwfAifs": 0.139244,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02158,
          "gfs": 0.060894,
          "gem": 0.059098,
          "jma": 0.125806
        },
        "interceptC": -0.0871,
        "diurnalHarmonicsC": [
          -0.0413,
          0.0642,
          0,
          0
        ],
        "driverBetasC": [
          -0.0486,
          0.152,
          -0.1096,
          -0.0675
        ],
        "spreadBaseC2": 0.3152,
        "spreadScale": 0.05,
        "cvMaeC": 0.4691,
        "cvRmseC": 0.6713,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.541108,
          "ecmwfAifs": 0.199984,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.023159,
          "gfs": 0.055046,
          "gem": 0.037455,
          "jma": 0.103248
        },
        "interceptC": -0.0439,
        "diurnalHarmonicsC": [
          -0.0321,
          0.0391,
          0,
          0
        ],
        "driverBetasC": [
          -0.021,
          0.1095,
          -0.0712,
          -0.0542
        ],
        "spreadBaseC2": 0.3245,
        "spreadScale": 0.05,
        "cvMaeC": 0.4754,
        "cvRmseC": 0.6782,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.601375,
          "ecmwfAifs": 0.085261,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.135165,
          "gem": 0.02,
          "jma": 0.098199
        },
        "interceptC": -0.0798,
        "diurnalHarmonicsC": [
          -0.0754,
          0.1172,
          0,
          0
        ],
        "driverBetasC": [
          0.022,
          0.0591,
          -0.1399,
          -0.1234
        ],
        "spreadBaseC2": 0.1692,
        "spreadScale": 0.05,
        "cvMaeC": 0.3586,
        "cvRmseC": 0.4894,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.554272,
          "ecmwfAifs": 0.154341,
          "icon": 0.023082,
          "ukmo": 0.02,
          "meteofrance": 0.041438,
          "gfs": 0.111975,
          "gem": 0.02,
          "jma": 0.074892
        },
        "interceptC": -0.0399,
        "diurnalHarmonicsC": [
          -0.0578,
          0.0852,
          0,
          0
        ],
        "driverBetasC": [
          0.0114,
          0.0527,
          -0.094,
          -0.0862
        ],
        "spreadBaseC2": 0.1806,
        "spreadScale": 0.05,
        "cvMaeC": 0.3704,
        "cvRmseC": 0.5009,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.507171,
          "ecmwfAifs": 0.223422,
          "icon": 0.026164,
          "ukmo": 0.02,
          "meteofrance": 0.062875,
          "gfs": 0.088784,
          "gem": 0.02,
          "jma": 0.051584
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0402,
          0.0532,
          0,
          0
        ],
        "driverBetasC": [
          0.0008,
          0.0464,
          -0.048,
          -0.0489
        ],
        "spreadBaseC2": 0.1921,
        "spreadScale": 0.05,
        "cvMaeC": 0.3822,
        "cvRmseC": 0.5123,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.677859,
          "ecmwfAifs": 0.0304,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.033731,
          "gfs": 0.06274,
          "gem": 0.02,
          "jma": 0.13527
        },
        "interceptC": -0.0433,
        "diurnalHarmonicsC": [
          -0.0338,
          0.0273,
          0,
          0
        ],
        "driverBetasC": [
          -0.0405,
          0.1393,
          0.0752,
          -0.0146
        ],
        "spreadBaseC2": 0.2005,
        "spreadScale": 0.05,
        "cvMaeC": 0.3846,
        "cvRmseC": 0.5292,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.636267,
          "ecmwfAifs": 0.079393,
          "icon": 0.035446,
          "ukmo": 0.02,
          "meteofrance": 0.041599,
          "gfs": 0.051255,
          "gem": 0.02,
          "jma": 0.11604
        },
        "interceptC": -0.0216,
        "diurnalHarmonicsC": [
          -0.0277,
          0.0181,
          0,
          0
        ],
        "driverBetasC": [
          -0.0313,
          0.1187,
          0.0345,
          -0.0249
        ],
        "spreadBaseC2": 0.2072,
        "spreadScale": 0.05,
        "cvMaeC": 0.3948,
        "cvRmseC": 0.5354,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.594676,
          "ecmwfAifs": 0.128385,
          "icon": 0.050892,
          "ukmo": 0.02,
          "meteofrance": 0.049466,
          "gfs": 0.039769,
          "gem": 0.02,
          "jma": 0.096812
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0217,
          0.009,
          0,
          0
        ],
        "driverBetasC": [
          -0.0221,
          0.0981,
          -0.0063,
          -0.0352
        ],
        "spreadBaseC2": 0.2139,
        "spreadScale": 0.05,
        "cvMaeC": 0.405,
        "cvRmseC": 0.5417,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.247741,
        "ecmwfAifs": 0.084104,
        "icon": 0.219731,
        "ukmo": 0.113233,
        "meteofrance": 0.158944,
        "gfs": 0.062637,
        "gem": 0.056364,
        "jma": 0.057246
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.273091,
        "ecmwfAifs": 0.071081,
        "icon": 0.207905,
        "ukmo": 0.122859,
        "meteofrance": 0.150356,
        "gfs": 0.060796,
        "gem": 0.05543,
        "jma": 0.058482
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.276881,
        "ecmwfAifs": 0.086009,
        "icon": 0.198134,
        "ukmo": 0.118707,
        "meteofrance": 0.150583,
        "gfs": 0.062222,
        "gem": 0.056484,
        "jma": 0.05098
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.264641,
        "ecmwfAifs": 0.077548,
        "icon": 0.197693,
        "ukmo": 0.120496,
        "meteofrance": 0.154493,
        "gfs": 0.071283,
        "gem": 0.058351,
        "jma": 0.055495
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.25715,
    "ecmwfAifs": 0.06988,
    "icon": 0.207132,
    "ukmo": 0.134448,
    "meteofrance": 0.108703,
    "gfs": 0.145043,
    "gem": 0.038822,
    "jma": 0.038822
  },
  "pressureWeights": {
    "ecmwfIfs": 0.366867,
    "ecmwfAifs": 0.144081,
    "icon": 0.123917,
    "ukmo": 0.137008,
    "meteofrance": 0.075832,
    "gfs": 0.076463,
    "gem": 0.037916,
    "jma": 0.037916
  }
} as const;

export default PROVINCE_CALIBRATION_TR_28;
