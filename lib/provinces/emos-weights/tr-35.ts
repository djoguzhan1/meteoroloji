import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_35: ProvinceCalibrationBundle = {
  "provinceCode": "TR-35",
  "provinceName": "İzmir",
  "plateNumber": 35,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17220",
  "stationLat": 38.4333,
  "stationLon": 27.1667,
  "stationElevationM": 25,
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
        "intercept": -0.223,
        "betaDrivers": [
          -0.0487,
          -0.0806,
          0.0625,
          0.0611,
          0.0071,
          -0.1278
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1969,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243999,
            "ecmwfAifs": 0.078922,
            "icon": 0.208672,
            "ukmo": 0.120316,
            "meteofrance": 0.157307,
            "gfs": 0.069026,
            "gem": 0.060139,
            "jma": 0.061619
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9379,
          "logisticSlope": 3.302,
          "wetFractionWeight": 3.6361,
          "powerEta": 0.68,
          "rawBrier": 0.04857,
          "calibratedBrier": 0.04684
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.3848,
          "rawIfsRmseC": 0.5589,
          "rawEqualMaeC": 0.8632,
          "rawEqualRmseC": 1.039,
          "cvSimplexMaeC": 0.4259,
          "cvCalibratedMaeC": 0.3301,
          "cvCalibratedRmseC": 0.4863
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
        "intercept": -0.18,
        "betaDrivers": [
          -0.0356,
          -0.0551,
          0.0275,
          0.038,
          0.0022,
          -0.083
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1991,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318899,
            "ecmwfAifs": 0.215187,
            "icon": 0.131661,
            "ukmo": 0.110115,
            "meteofrance": 0.045161,
            "gfs": 0.068438,
            "gem": 0.059627,
            "jma": 0.050912
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0127,
          "logisticSlope": 3.0619,
          "wetFractionWeight": 3.3905,
          "powerEta": 0.68,
          "rawBrier": 0.04857,
          "calibratedBrier": 0.04708
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.3848,
          "rawIfsRmseC": 0.5589,
          "rawEqualMaeC": 0.8632,
          "rawEqualRmseC": 1.039,
          "cvSimplexMaeC": 0.4259,
          "cvCalibratedMaeC": 0.3302,
          "cvCalibratedRmseC": 0.4886
        }
      }
    },
    "MAM": {
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
        "intercept": -0.2882,
        "betaDrivers": [
          -0.0488,
          -0.1743,
          0.0912,
          0.1954,
          -0.0771,
          0.0671
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3022,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244208,
            "ecmwfAifs": 0.071778,
            "icon": 0.222432,
            "ukmo": 0.122236,
            "meteofrance": 0.157208,
            "gfs": 0.065749,
            "gem": 0.057715,
            "jma": 0.058674
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2766,
          "logisticSlope": 3.4165,
          "wetFractionWeight": 3.4112,
          "powerEta": 0.68,
          "rawBrier": 0.03547,
          "calibratedBrier": 0.0313
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.4564,
          "rawIfsRmseC": 0.6691,
          "rawEqualMaeC": 0.9201,
          "rawEqualRmseC": 1.1337,
          "cvSimplexMaeC": 0.4774,
          "cvCalibratedMaeC": 0.3938,
          "cvCalibratedRmseC": 0.5965
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
        "intercept": -0.2229,
        "betaDrivers": [
          -0.0252,
          -0.0917,
          0.029,
          0.0879,
          -0.0358,
          0.0307
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3096,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324892,
            "ecmwfAifs": 0.199217,
            "icon": 0.142859,
            "ukmo": 0.113879,
            "meteofrance": 0.045197,
            "gfs": 0.066359,
            "gem": 0.058249,
            "jma": 0.049348
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3816,
          "logisticSlope": 3.056,
          "wetFractionWeight": 3.7747,
          "powerEta": 0.68,
          "rawBrier": 0.03547,
          "calibratedBrier": 0.03052
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.4564,
          "rawIfsRmseC": 0.6691,
          "rawEqualMaeC": 0.9201,
          "rawEqualRmseC": 1.1337,
          "cvSimplexMaeC": 0.4774,
          "cvCalibratedMaeC": 0.3959,
          "cvCalibratedRmseC": 0.6027
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.725924,
          "ecmwfAifs": 0.02,
          "icon": 0.057953,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.091153,
          "gem": 0.02,
          "jma": 0.04497
        },
        "intercept": -0.1521,
        "betaDrivers": [
          -0.2166,
          -0.1503,
          0.2107,
          0.0022,
          -0.1316,
          -0.1249
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.217307,
            "ecmwfAifs": 0.077437,
            "icon": 0.224635,
            "ukmo": 0.127943,
            "meteofrance": 0.164974,
            "gfs": 0.067555,
            "gem": 0.061119,
            "jma": 0.05903
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.9452,
          "logisticSlope": 2.0145,
          "wetFractionWeight": 1.7674,
          "powerEta": 0.68,
          "rawBrier": 0.0035,
          "calibratedBrier": 0.00278
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3739,
          "rawIfsRmseC": 0.5578,
          "rawEqualMaeC": 0.6755,
          "rawEqualRmseC": 0.8284,
          "cvSimplexMaeC": 0.3399,
          "cvCalibratedMaeC": 0.2972,
          "cvCalibratedRmseC": 0.4488
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.657745,
          "ecmwfAifs": 0.031833,
          "icon": 0.086407,
          "ukmo": 0.035225,
          "meteofrance": 0.02,
          "gfs": 0.107926,
          "gem": 0.02,
          "jma": 0.040864
        },
        "intercept": -0.085,
        "betaDrivers": [
          -0.1091,
          -0.082,
          0.0764,
          0.004,
          -0.067,
          -0.0984
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1539,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.291445,
            "ecmwfAifs": 0.216665,
            "icon": 0.145442,
            "ukmo": 0.12016,
            "meteofrance": 0.045321,
            "gfs": 0.068733,
            "gem": 0.062185,
            "jma": 0.050049
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.9558,
          "logisticSlope": 1.8856,
          "wetFractionWeight": 1.7978,
          "powerEta": 0.68,
          "rawBrier": 0.0035,
          "calibratedBrier": 0.00278
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3739,
          "rawIfsRmseC": 0.5578,
          "rawEqualMaeC": 0.6755,
          "rawEqualRmseC": 0.8284,
          "cvSimplexMaeC": 0.355,
          "cvCalibratedMaeC": 0.3194,
          "cvCalibratedRmseC": 0.4632
        }
      }
    },
    "SON": {
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
        "intercept": -0.1804,
        "betaDrivers": [
          -0.0177,
          -0.0919,
          0.0398,
          0.1426,
          -0.054,
          -0.1554
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2224,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22987,
            "ecmwfAifs": 0.081116,
            "icon": 0.214922,
            "ukmo": 0.127859,
            "meteofrance": 0.153239,
            "gfs": 0.06839,
            "gem": 0.060836,
            "jma": 0.063768
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2731,
          "logisticSlope": 3.483,
          "wetFractionWeight": 3.6434,
          "powerEta": 0.68,
          "rawBrier": 0.03135,
          "calibratedBrier": 0.03107
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.3881,
          "rawIfsRmseC": 0.5801,
          "rawEqualMaeC": 0.8072,
          "rawEqualRmseC": 0.9993,
          "cvSimplexMaeC": 0.4071,
          "cvCalibratedMaeC": 0.3444,
          "cvCalibratedRmseC": 0.5223
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
        "intercept": -0.1737,
        "betaDrivers": [
          -0.0148,
          -0.0642,
          0.0163,
          0.0796,
          -0.0288,
          -0.1085
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.223,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.300387,
            "ecmwfAifs": 0.221136,
            "icon": 0.135584,
            "ukmo": 0.117001,
            "meteofrance": 0.045106,
            "gfs": 0.067798,
            "gem": 0.060309,
            "jma": 0.052679
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4184,
          "logisticSlope": 2.8936,
          "wetFractionWeight": 4.0146,
          "powerEta": 0.68,
          "rawBrier": 0.03135,
          "calibratedBrier": 0.03008
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.3881,
          "rawIfsRmseC": 0.5801,
          "rawEqualMaeC": 0.8072,
          "rawEqualRmseC": 0.9993,
          "cvSimplexMaeC": 0.4071,
          "cvCalibratedMaeC": 0.3445,
          "cvCalibratedRmseC": 0.5229
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
        "interceptC": -0.223,
        "diurnalHarmonicsC": [
          -0.0487,
          -0.0806,
          0,
          0
        ],
        "driverBetasC": [
          0.0625,
          -0.1278,
          0.0611,
          0.0071
        ],
        "spreadBaseC2": 0.1969,
        "spreadScale": 0.05,
        "cvMaeC": 0.3301,
        "cvRmseC": 0.4863,
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
        "interceptC": -0.2015,
        "diurnalHarmonicsC": [
          -0.0421,
          -0.0679,
          0,
          0
        ],
        "driverBetasC": [
          0.045,
          -0.1054,
          0.0495,
          0.0047
        ],
        "spreadBaseC2": 0.198,
        "spreadScale": 0.05,
        "cvMaeC": 0.3301,
        "cvRmseC": 0.4874,
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
        "interceptC": -0.18,
        "diurnalHarmonicsC": [
          -0.0356,
          -0.0551,
          0,
          0
        ],
        "driverBetasC": [
          0.0275,
          -0.083,
          0.038,
          0.0022
        ],
        "spreadBaseC2": 0.1991,
        "spreadScale": 0.05,
        "cvMaeC": 0.3302,
        "cvRmseC": 0.4886,
        "sampleHours": 4277
      }
    },
    "MAM": {
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
        "interceptC": -0.2882,
        "diurnalHarmonicsC": [
          -0.0488,
          -0.1743,
          0,
          0
        ],
        "driverBetasC": [
          0.0912,
          0.0671,
          0.1954,
          -0.0771
        ],
        "spreadBaseC2": 0.3022,
        "spreadScale": 0.05,
        "cvMaeC": 0.3938,
        "cvRmseC": 0.5965,
        "sampleHours": 4185
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
        "interceptC": -0.2555,
        "diurnalHarmonicsC": [
          -0.037,
          -0.133,
          0,
          0
        ],
        "driverBetasC": [
          0.0601,
          0.0489,
          0.1416,
          -0.0565
        ],
        "spreadBaseC2": 0.3059,
        "spreadScale": 0.05,
        "cvMaeC": 0.3948,
        "cvRmseC": 0.5996,
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
        "interceptC": -0.2229,
        "diurnalHarmonicsC": [
          -0.0252,
          -0.0917,
          0,
          0
        ],
        "driverBetasC": [
          0.029,
          0.0307,
          0.0879,
          -0.0358
        ],
        "spreadBaseC2": 0.3096,
        "spreadScale": 0.05,
        "cvMaeC": 0.3959,
        "cvRmseC": 0.6027,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.725924,
          "ecmwfAifs": 0.02,
          "icon": 0.057953,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.091153,
          "gem": 0.02,
          "jma": 0.04497
        },
        "interceptC": -0.1521,
        "diurnalHarmonicsC": [
          -0.2166,
          -0.1503,
          0,
          0
        ],
        "driverBetasC": [
          0.2107,
          -0.1249,
          0.0022,
          -0.1316
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "cvMaeC": 0.2972,
        "cvRmseC": 0.4488,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.691835,
          "ecmwfAifs": 0.025916,
          "icon": 0.07218,
          "ukmo": 0.027612,
          "meteofrance": 0.02,
          "gfs": 0.09954,
          "gem": 0.02,
          "jma": 0.042917
        },
        "interceptC": -0.1186,
        "diurnalHarmonicsC": [
          -0.1628,
          -0.1162,
          0,
          0
        ],
        "driverBetasC": [
          0.1436,
          -0.1116,
          0.0031,
          -0.0993
        ],
        "spreadBaseC2": 0.152,
        "spreadScale": 0.05,
        "cvMaeC": 0.3083,
        "cvRmseC": 0.456,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.657745,
          "ecmwfAifs": 0.031833,
          "icon": 0.086407,
          "ukmo": 0.035225,
          "meteofrance": 0.02,
          "gfs": 0.107926,
          "gem": 0.02,
          "jma": 0.040864
        },
        "interceptC": -0.085,
        "diurnalHarmonicsC": [
          -0.1091,
          -0.082,
          0,
          0
        ],
        "driverBetasC": [
          0.0764,
          -0.0984,
          0.004,
          -0.067
        ],
        "spreadBaseC2": 0.1539,
        "spreadScale": 0.05,
        "cvMaeC": 0.3194,
        "cvRmseC": 0.4632,
        "sampleHours": 4331
      }
    },
    "SON": {
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
        "interceptC": -0.1804,
        "diurnalHarmonicsC": [
          -0.0177,
          -0.0919,
          0,
          0
        ],
        "driverBetasC": [
          0.0398,
          -0.1554,
          0.1426,
          -0.054
        ],
        "spreadBaseC2": 0.2224,
        "spreadScale": 0.05,
        "cvMaeC": 0.3444,
        "cvRmseC": 0.5223,
        "sampleHours": 4290
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
        "interceptC": -0.177,
        "diurnalHarmonicsC": [
          -0.0163,
          -0.078,
          0,
          0
        ],
        "driverBetasC": [
          0.028,
          -0.132,
          0.1111,
          -0.0414
        ],
        "spreadBaseC2": 0.2227,
        "spreadScale": 0.05,
        "cvMaeC": 0.3444,
        "cvRmseC": 0.5226,
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
        "interceptC": -0.1737,
        "diurnalHarmonicsC": [
          -0.0148,
          -0.0642,
          0,
          0
        ],
        "driverBetasC": [
          0.0163,
          -0.1085,
          0.0796,
          -0.0288
        ],
        "spreadBaseC2": 0.223,
        "spreadScale": 0.05,
        "cvMaeC": 0.3445,
        "cvRmseC": 0.5229,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243999,
        "ecmwfAifs": 0.078922,
        "icon": 0.208672,
        "ukmo": 0.120316,
        "meteofrance": 0.157307,
        "gfs": 0.069026,
        "gem": 0.060139,
        "jma": 0.061619
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.244208,
        "ecmwfAifs": 0.071778,
        "icon": 0.222432,
        "ukmo": 0.122236,
        "meteofrance": 0.157208,
        "gfs": 0.065749,
        "gem": 0.057715,
        "jma": 0.058674
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.217307,
        "ecmwfAifs": 0.077437,
        "icon": 0.224635,
        "ukmo": 0.127943,
        "meteofrance": 0.164974,
        "gfs": 0.067555,
        "gem": 0.061119,
        "jma": 0.05903
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.22987,
        "ecmwfAifs": 0.081116,
        "icon": 0.214922,
        "ukmo": 0.127859,
        "meteofrance": 0.153239,
        "gfs": 0.06839,
        "gem": 0.060836,
        "jma": 0.063768
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.290036,
    "ecmwfAifs": 0.07049,
    "icon": 0.179579,
    "ukmo": 0.155816,
    "meteofrance": 0.109652,
    "gfs": 0.116105,
    "gem": 0.039161,
    "jma": 0.039161
  },
  "pressureWeights": {
    "ecmwfIfs": 0.373697,
    "ecmwfAifs": 0.135334,
    "icon": 0.122047,
    "ukmo": 0.166277,
    "meteofrance": 0.071229,
    "gfs": 0.060188,
    "gem": 0.035614,
    "jma": 0.035614
  }
} as const;

export default PROVINCE_CALIBRATION_TR_35;
