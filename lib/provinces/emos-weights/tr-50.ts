import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_50: ProvinceCalibrationBundle = {
  "provinceCode": "TR-50",
  "provinceName": "Nevşehir",
  "plateNumber": 50,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17193",
  "stationLat": 38.6167,
  "stationLon": 34.7167,
  "stationElevationM": 1260,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.784991,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.050291,
          "gfs": 0.064718,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1698,
        "betaDrivers": [
          0.1237,
          -0.1706,
          0.0336,
          -0.1208,
          -0.3019,
          -0.1273
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.414,
        "spreadScale": 0.133,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242433,
            "ecmwfAifs": 0.086044,
            "icon": 0.214046,
            "ukmo": 0.117973,
            "meteofrance": 0.157466,
            "gfs": 0.068556,
            "gem": 0.055087,
            "jma": 0.058395
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8894,
          "logisticSlope": 4.8948,
          "wetFractionWeight": 2.8453,
          "powerEta": 0.68,
          "rawBrier": 0.04369,
          "calibratedBrier": 0.0433
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.606,
          "rawIfsRmseC": 0.8503,
          "rawEqualMaeC": 1.0743,
          "rawEqualRmseC": 1.3343,
          "cvSimplexMaeC": 0.5872,
          "cvCalibratedMaeC": 0.5439,
          "cvCalibratedRmseC": 0.7685
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.714496,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.081076,
          "gfs": 0.079449,
          "gem": 0.044979,
          "jma": 0.02
        },
        "intercept": -0.1675,
        "betaDrivers": [
          0.0763,
          -0.1116,
          0.0164,
          -0.0683,
          -0.1091,
          -0.0874
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4158,
        "spreadScale": 0.1306,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313418,
            "ecmwfAifs": 0.232065,
            "icon": 0.133588,
            "ukmo": 0.106801,
            "meteofrance": 0.04514,
            "gfs": 0.067236,
            "gem": 0.054027,
            "jma": 0.047725
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9211,
          "logisticSlope": 4.7767,
          "wetFractionWeight": 2.988,
          "powerEta": 0.68,
          "rawBrier": 0.04369,
          "calibratedBrier": 0.04231
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.606,
          "rawIfsRmseC": 0.8503,
          "rawEqualMaeC": 1.0743,
          "rawEqualRmseC": 1.3343,
          "cvSimplexMaeC": 0.5999,
          "cvCalibratedMaeC": 0.5532,
          "cvCalibratedRmseC": 0.7676
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.76156,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.078045,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.060395,
          "jma": 0.02
        },
        "intercept": -0.292,
        "betaDrivers": [
          0.137,
          -0.187,
          0.0671,
          -0.1054,
          -0.0536,
          -0.0917
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6765,
        "spreadScale": 0.1034,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255049,
            "ecmwfAifs": 0.079472,
            "icon": 0.20836,
            "ukmo": 0.124956,
            "meteofrance": 0.155341,
            "gfs": 0.063768,
            "gem": 0.055796,
            "jma": 0.057258
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.529,
          "logisticSlope": 2.9247,
          "wetFractionWeight": 2.9517,
          "powerEta": 0.68,
          "rawBrier": 0.06913,
          "calibratedBrier": 0.06297
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7071,
          "rawIfsRmseC": 1.0487,
          "rawEqualMaeC": 1.1189,
          "rawEqualRmseC": 1.434,
          "cvSimplexMaeC": 0.6945,
          "cvCalibratedMaeC": 0.6324,
          "cvCalibratedRmseC": 0.9666
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.674683,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.094099,
          "meteofrance": 0.02,
          "gfs": 0.042975,
          "gem": 0.108243,
          "jma": 0.02
        },
        "intercept": -0.2273,
        "betaDrivers": [
          0.0717,
          -0.1183,
          0.0091,
          -0.0533,
          -0.0145,
          -0.0868
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7074,
        "spreadScale": 0.0885,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330971,
            "ecmwfAifs": 0.21515,
            "icon": 0.13053,
            "ukmo": 0.113551,
            "meteofrance": 0.04512,
            "gfs": 0.062777,
            "gem": 0.054928,
            "jma": 0.046973
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5999,
          "logisticSlope": 3.2843,
          "wetFractionWeight": 2.7276,
          "powerEta": 0.68,
          "rawBrier": 0.06913,
          "calibratedBrier": 0.06118
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7071,
          "rawIfsRmseC": 1.0487,
          "rawEqualMaeC": 1.1189,
          "rawEqualRmseC": 1.434,
          "cvSimplexMaeC": 0.7067,
          "cvCalibratedMaeC": 0.6492,
          "cvCalibratedRmseC": 0.9692
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.664255,
          "ecmwfAifs": 0.046277,
          "icon": 0.048575,
          "ukmo": 0.028047,
          "meteofrance": 0.02,
          "gfs": 0.107139,
          "gem": 0.065707,
          "jma": 0.02
        },
        "intercept": -0.1331,
        "betaDrivers": [
          0.0843,
          0.0142,
          -0.1114,
          0.0339,
          -0.0625,
          -0.2032
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1596,
        "spreadScale": 0.1924,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235501,
            "ecmwfAifs": 0.082481,
            "icon": 0.22543,
            "ukmo": 0.12003,
            "meteofrance": 0.151925,
            "gfs": 0.06636,
            "gem": 0.05884,
            "jma": 0.059433
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9623,
          "logisticSlope": 3.7967,
          "wetFractionWeight": 3.2028,
          "powerEta": 0.68,
          "rawBrier": 0.0116,
          "calibratedBrier": 0.01069
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.5501,
          "rawIfsRmseC": 0.8274,
          "rawEqualMaeC": 0.6737,
          "rawEqualRmseC": 0.9339,
          "cvSimplexMaeC": 0.471,
          "cvCalibratedMaeC": 0.4645,
          "cvCalibratedRmseC": 0.7311
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.555094,
          "ecmwfAifs": 0.09891,
          "icon": 0.084464,
          "ukmo": 0.050313,
          "meteofrance": 0.02,
          "gfs": 0.102579,
          "gem": 0.06864,
          "jma": 0.02
        },
        "intercept": -0.1585,
        "betaDrivers": [
          0.0402,
          -0.0077,
          -0.0025,
          0.031,
          -0.0189,
          -0.17
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1536,
        "spreadScale": 0.1914,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306796,
            "ecmwfAifs": 0.224165,
            "icon": 0.141775,
            "ukmo": 0.109499,
            "meteofrance": 0.045083,
            "gfs": 0.065583,
            "gem": 0.058151,
            "jma": 0.048948
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0613,
          "logisticSlope": 3.8513,
          "wetFractionWeight": 3.6075,
          "powerEta": 0.68,
          "rawBrier": 0.0116,
          "calibratedBrier": 0.01023
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.5501,
          "rawIfsRmseC": 0.8274,
          "rawEqualMaeC": 0.6737,
          "rawEqualRmseC": 0.9339,
          "cvSimplexMaeC": 0.4832,
          "cvCalibratedMaeC": 0.4716,
          "cvCalibratedRmseC": 0.7246
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.775928,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.041566,
          "gem": 0.082506,
          "jma": 0.02
        },
        "intercept": -0.1578,
        "betaDrivers": [
          0.1445,
          -0.1077,
          0.1113,
          -0.1041,
          -0.055,
          -0.1099
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2193,
        "spreadScale": 0.2701,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232452,
            "ecmwfAifs": 0.082882,
            "icon": 0.220139,
            "ukmo": 0.120063,
            "meteofrance": 0.162945,
            "gfs": 0.065924,
            "gem": 0.059303,
            "jma": 0.056292
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4508,
          "logisticSlope": 5.166,
          "wetFractionWeight": 3.5251,
          "powerEta": 0.68,
          "rawBrier": 0.01959,
          "calibratedBrier": 0.01939
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6022,
          "rawIfsRmseC": 0.8846,
          "rawEqualMaeC": 0.9683,
          "rawEqualRmseC": 1.2424,
          "cvSimplexMaeC": 0.5892,
          "cvCalibratedMaeC": 0.5696,
          "cvCalibratedRmseC": 0.8332
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.81809,
          "ecmwfAifs": 0.020607,
          "icon": 0.029465,
          "ukmo": 0.020897,
          "meteofrance": 0.02,
          "gfs": 0.029264,
          "gem": 0.041677,
          "jma": 0.02
        },
        "intercept": -0.1012,
        "betaDrivers": [
          0.1036,
          -0.0795,
          0.0379,
          -0.061,
          -0.0418,
          -0.0582
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2157,
        "spreadScale": 0.2771,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305568,
            "ecmwfAifs": 0.227297,
            "icon": 0.139702,
            "ukmo": 0.110522,
            "meteofrance": 0.045249,
            "gfs": 0.065742,
            "gem": 0.059139,
            "jma": 0.046781
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5362,
          "logisticSlope": 5.2702,
          "wetFractionWeight": 3.401,
          "powerEta": 0.68,
          "rawBrier": 0.01959,
          "calibratedBrier": 0.01915
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6022,
          "rawIfsRmseC": 0.8846,
          "rawEqualMaeC": 0.9683,
          "rawEqualRmseC": 1.2424,
          "cvSimplexMaeC": 0.5894,
          "cvCalibratedMaeC": 0.5693,
          "cvCalibratedRmseC": 0.8384
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.784991,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.050291,
          "gfs": 0.064718,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1698,
        "diurnalHarmonicsC": [
          0.1237,
          -0.1706,
          0,
          0
        ],
        "driverBetasC": [
          0.0336,
          -0.1273,
          -0.1208,
          -0.3019
        ],
        "spreadBaseC2": 0.414,
        "spreadScale": 0.133,
        "cvMaeC": 0.5439,
        "cvRmseC": 0.7685,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.749743,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.065684,
          "gfs": 0.072084,
          "gem": 0.032489,
          "jma": 0.02
        },
        "interceptC": -0.1687,
        "diurnalHarmonicsC": [
          0.1,
          -0.1411,
          0,
          0
        ],
        "driverBetasC": [
          0.025,
          -0.1074,
          -0.0945,
          -0.2055
        ],
        "spreadBaseC2": 0.4149,
        "spreadScale": 0.1318,
        "cvMaeC": 0.5486,
        "cvRmseC": 0.768,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.714496,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.081076,
          "gfs": 0.079449,
          "gem": 0.044979,
          "jma": 0.02
        },
        "interceptC": -0.1675,
        "diurnalHarmonicsC": [
          0.0763,
          -0.1116,
          0,
          0
        ],
        "driverBetasC": [
          0.0164,
          -0.0874,
          -0.0683,
          -0.1091
        ],
        "spreadBaseC2": 0.4158,
        "spreadScale": 0.1306,
        "cvMaeC": 0.5532,
        "cvRmseC": 0.7676,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.76156,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.078045,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.060395,
          "jma": 0.02
        },
        "interceptC": -0.292,
        "diurnalHarmonicsC": [
          0.137,
          -0.187,
          0,
          0
        ],
        "driverBetasC": [
          0.0671,
          -0.0917,
          -0.1054,
          -0.0536
        ],
        "spreadBaseC2": 0.6765,
        "spreadScale": 0.1034,
        "cvMaeC": 0.6324,
        "cvRmseC": 0.9666,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.718122,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.086072,
          "meteofrance": 0.02,
          "gfs": 0.031487,
          "gem": 0.084319,
          "jma": 0.02
        },
        "interceptC": -0.2596,
        "diurnalHarmonicsC": [
          0.1043,
          -0.1527,
          0,
          0
        ],
        "driverBetasC": [
          0.0381,
          -0.0892,
          -0.0794,
          -0.0341
        ],
        "spreadBaseC2": 0.692,
        "spreadScale": 0.096,
        "cvMaeC": 0.6408,
        "cvRmseC": 0.9679,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.674683,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.094099,
          "meteofrance": 0.02,
          "gfs": 0.042975,
          "gem": 0.108243,
          "jma": 0.02
        },
        "interceptC": -0.2273,
        "diurnalHarmonicsC": [
          0.0717,
          -0.1183,
          0,
          0
        ],
        "driverBetasC": [
          0.0091,
          -0.0868,
          -0.0533,
          -0.0145
        ],
        "spreadBaseC2": 0.7074,
        "spreadScale": 0.0885,
        "cvMaeC": 0.6492,
        "cvRmseC": 0.9692,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.664255,
          "ecmwfAifs": 0.046277,
          "icon": 0.048575,
          "ukmo": 0.028047,
          "meteofrance": 0.02,
          "gfs": 0.107139,
          "gem": 0.065707,
          "jma": 0.02
        },
        "interceptC": -0.1331,
        "diurnalHarmonicsC": [
          0.0843,
          0.0142,
          0,
          0
        ],
        "driverBetasC": [
          -0.1114,
          -0.2032,
          0.0339,
          -0.0625
        ],
        "spreadBaseC2": 0.1596,
        "spreadScale": 0.1924,
        "cvMaeC": 0.4645,
        "cvRmseC": 0.7311,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.609674,
          "ecmwfAifs": 0.072594,
          "icon": 0.06652,
          "ukmo": 0.03918,
          "meteofrance": 0.02,
          "gfs": 0.104858,
          "gem": 0.067174,
          "jma": 0.02
        },
        "interceptC": -0.1458,
        "diurnalHarmonicsC": [
          0.0622,
          0.0033,
          0,
          0
        ],
        "driverBetasC": [
          -0.057,
          -0.1866,
          0.0324,
          -0.0407
        ],
        "spreadBaseC2": 0.1566,
        "spreadScale": 0.1919,
        "cvMaeC": 0.4681,
        "cvRmseC": 0.7278,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.555094,
          "ecmwfAifs": 0.09891,
          "icon": 0.084464,
          "ukmo": 0.050313,
          "meteofrance": 0.02,
          "gfs": 0.102579,
          "gem": 0.06864,
          "jma": 0.02
        },
        "interceptC": -0.1585,
        "diurnalHarmonicsC": [
          0.0402,
          -0.0077,
          0,
          0
        ],
        "driverBetasC": [
          -0.0025,
          -0.17,
          0.031,
          -0.0189
        ],
        "spreadBaseC2": 0.1536,
        "spreadScale": 0.1914,
        "cvMaeC": 0.4716,
        "cvRmseC": 0.7246,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.775928,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.041566,
          "gem": 0.082506,
          "jma": 0.02
        },
        "interceptC": -0.1578,
        "diurnalHarmonicsC": [
          0.1445,
          -0.1077,
          0,
          0
        ],
        "driverBetasC": [
          0.1113,
          -0.1099,
          -0.1041,
          -0.055
        ],
        "spreadBaseC2": 0.2193,
        "spreadScale": 0.2701,
        "cvMaeC": 0.5696,
        "cvRmseC": 0.8332,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.797008,
          "ecmwfAifs": 0.020304,
          "icon": 0.024733,
          "ukmo": 0.020449,
          "meteofrance": 0.02,
          "gfs": 0.035415,
          "gem": 0.062091,
          "jma": 0.02
        },
        "interceptC": -0.1295,
        "diurnalHarmonicsC": [
          0.124,
          -0.0936,
          0,
          0
        ],
        "driverBetasC": [
          0.0746,
          -0.084,
          -0.0825,
          -0.0484
        ],
        "spreadBaseC2": 0.2175,
        "spreadScale": 0.2736,
        "cvMaeC": 0.5695,
        "cvRmseC": 0.8358,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.81809,
          "ecmwfAifs": 0.020607,
          "icon": 0.029465,
          "ukmo": 0.020897,
          "meteofrance": 0.02,
          "gfs": 0.029264,
          "gem": 0.041677,
          "jma": 0.02
        },
        "interceptC": -0.1012,
        "diurnalHarmonicsC": [
          0.1036,
          -0.0795,
          0,
          0
        ],
        "driverBetasC": [
          0.0379,
          -0.0582,
          -0.061,
          -0.0418
        ],
        "spreadBaseC2": 0.2157,
        "spreadScale": 0.2771,
        "cvMaeC": 0.5693,
        "cvRmseC": 0.8384,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.242433,
        "ecmwfAifs": 0.086044,
        "icon": 0.214046,
        "ukmo": 0.117973,
        "meteofrance": 0.157466,
        "gfs": 0.068556,
        "gem": 0.055087,
        "jma": 0.058395
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.255049,
        "ecmwfAifs": 0.079472,
        "icon": 0.20836,
        "ukmo": 0.124956,
        "meteofrance": 0.155341,
        "gfs": 0.063768,
        "gem": 0.055796,
        "jma": 0.057258
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.235501,
        "ecmwfAifs": 0.082481,
        "icon": 0.22543,
        "ukmo": 0.12003,
        "meteofrance": 0.151925,
        "gfs": 0.06636,
        "gem": 0.05884,
        "jma": 0.059433
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.232452,
        "ecmwfAifs": 0.082882,
        "icon": 0.220139,
        "ukmo": 0.120063,
        "meteofrance": 0.162945,
        "gfs": 0.065924,
        "gem": 0.059303,
        "jma": 0.056292
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.267806,
    "ecmwfAifs": 0.067887,
    "icon": 0.230958,
    "ukmo": 0.159348,
    "meteofrance": 0.105603,
    "gfs": 0.092968,
    "gem": 0.037715,
    "jma": 0.037715
  },
  "pressureWeights": {
    "ecmwfIfs": 0.612053,
    "ecmwfAifs": 0.078368,
    "icon": 0.136368,
    "ukmo": 0.065802,
    "meteofrance": 0.041247,
    "gfs": 0.024916,
    "gem": 0.020623,
    "jma": 0.020623
  }
} as const;

export default PROVINCE_CALIBRATION_TR_50;
