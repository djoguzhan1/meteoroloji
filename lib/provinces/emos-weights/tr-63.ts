import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_63: ProvinceCalibrationBundle = {
  "provinceCode": "TR-63",
  "provinceName": "Şanlıurfa",
  "plateNumber": 63,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17270",
  "stationLat": 37.1333,
  "stationLon": 38.7667,
  "stationElevationM": 547,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.828257,
          "ecmwfAifs": 0.02,
          "icon": 0.027805,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.043938,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0088,
          -0.1236,
          -0.0908,
          -0.1058,
          0.0323,
          -0.0033
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3371,
        "spreadScale": 0.0501,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254446,
            "ecmwfAifs": 0.084285,
            "icon": 0.205395,
            "ukmo": 0.125179,
            "meteofrance": 0.15423,
            "gfs": 0.061951,
            "gem": 0.056272,
            "jma": 0.058242
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0222,
          "logisticSlope": 4.3915,
          "wetFractionWeight": 2.2011,
          "powerEta": 0.68,
          "rawBrier": 0.04943,
          "calibratedBrier": 0.04679
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4734,
          "rawIfsRmseC": 0.6566,
          "rawEqualMaeC": 0.9402,
          "rawEqualRmseC": 1.1386,
          "cvSimplexMaeC": 0.4689,
          "cvCalibratedMaeC": 0.4586,
          "cvCalibratedRmseC": 0.627
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
        "intercept": 0,
        "betaDrivers": [
          -0.0068,
          -0.0895,
          -0.0559,
          -0.0443,
          0.0195,
          0.0022
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3349,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.326753,
            "ecmwfAifs": 0.225804,
            "icon": 0.127334,
            "ukmo": 0.112569,
            "meteofrance": 0.045084,
            "gfs": 0.060353,
            "gem": 0.05482,
            "jma": 0.047283
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0387,
          "logisticSlope": 4.3941,
          "wetFractionWeight": 2.2126,
          "powerEta": 0.68,
          "rawBrier": 0.04943,
          "calibratedBrier": 0.04583
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4734,
          "rawIfsRmseC": 0.6566,
          "rawEqualMaeC": 0.9402,
          "rawEqualRmseC": 1.1386,
          "cvSimplexMaeC": 0.4647,
          "cvCalibratedMaeC": 0.4532,
          "cvCalibratedRmseC": 0.6252
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.803188,
          "ecmwfAifs": 0.02,
          "icon": 0.023149,
          "ukmo": 0.050661,
          "meteofrance": 0.02,
          "gfs": 0.029938,
          "gem": 0.033064,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0845,
          -0.2341,
          0.0625,
          -0.0464,
          0.0726,
          -0.0037
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3277,
        "spreadScale": 0.2076,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242908,
            "ecmwfAifs": 0.073755,
            "icon": 0.220777,
            "ukmo": 0.125248,
            "meteofrance": 0.158026,
            "gfs": 0.065237,
            "gem": 0.056625,
            "jma": 0.057424
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1773,
          "logisticSlope": 3.8468,
          "wetFractionWeight": 2.7627,
          "powerEta": 0.68,
          "rawBrier": 0.03657,
          "calibratedBrier": 0.03287
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5474,
          "rawIfsRmseC": 0.8327,
          "rawEqualMaeC": 0.9347,
          "rawEqualRmseC": 1.1855,
          "cvSimplexMaeC": 0.5375,
          "cvCalibratedMaeC": 0.5125,
          "cvCalibratedRmseC": 0.7888
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
        "intercept": 0,
        "betaDrivers": [
          -0.0523,
          -0.1228,
          0.0045,
          -0.0287,
          0.0315,
          0.0157
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3223,
        "spreadScale": 0.222,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.322207,
            "ecmwfAifs": 0.204097,
            "icon": 0.141375,
            "ukmo": 0.116338,
            "meteofrance": 0.045202,
            "gfs": 0.065647,
            "gem": 0.056981,
            "jma": 0.048153
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2277,
          "logisticSlope": 3.9455,
          "wetFractionWeight": 2.9486,
          "powerEta": 0.68,
          "rawBrier": 0.03657,
          "calibratedBrier": 0.03239
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5474,
          "rawIfsRmseC": 0.8327,
          "rawEqualMaeC": 0.9347,
          "rawEqualRmseC": 1.1855,
          "cvSimplexMaeC": 0.5337,
          "cvCalibratedMaeC": 0.512,
          "cvCalibratedRmseC": 0.7963
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.742909,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.105085,
          "gfs": 0.02,
          "gem": 0.052006,
          "jma": 0.02
        },
        "intercept": -0.0011,
        "betaDrivers": [
          -0.1926,
          -0.1299,
          0.0133,
          -0.2414,
          -0.0191,
          -0.1099
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.092,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.222276,
            "ecmwfAifs": 0.080621,
            "icon": 0.220933,
            "ukmo": 0.129021,
            "meteofrance": 0.162405,
            "gfs": 0.070074,
            "gem": 0.053768,
            "jma": 0.060902
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -7.2718,
          "logisticSlope": 0.2373,
          "wetFractionWeight": 0.1193,
          "powerEta": 0.68,
          "rawBrier": 0.00087,
          "calibratedBrier": 0.0007
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4321,
          "rawIfsRmseC": 0.5723,
          "rawEqualMaeC": 0.6275,
          "rawEqualRmseC": 0.7863,
          "cvSimplexMaeC": 0.4136,
          "cvCalibratedMaeC": 0.3516,
          "cvCalibratedRmseC": 0.4894
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
        "intercept": 0.0252,
        "betaDrivers": [
          -0.1161,
          -0.0387,
          -0.0262,
          -0.1343,
          0.0093,
          -0.0332
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.0751,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.294773,
            "ecmwfAifs": 0.22305,
            "icon": 0.141446,
            "ukmo": 0.119818,
            "meteofrance": 0.045261,
            "gfs": 0.070499,
            "gem": 0.054094,
            "jma": 0.051059
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -7.2718,
          "logisticSlope": 0.234,
          "wetFractionWeight": 0.1135,
          "powerEta": 0.68,
          "rawBrier": 0.00087,
          "calibratedBrier": 0.0007
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4321,
          "rawIfsRmseC": 0.5723,
          "rawEqualMaeC": 0.6275,
          "rawEqualRmseC": 0.7863,
          "cvSimplexMaeC": 0.4118,
          "cvCalibratedMaeC": 0.3588,
          "cvCalibratedRmseC": 0.4959
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.777597,
          "ecmwfAifs": 0.02,
          "icon": 0.026617,
          "ukmo": 0.068283,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.047503,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0095,
          -0.1345,
          0.0579,
          -0.0585,
          0.0376,
          -0.0497
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2855,
        "spreadScale": 0.1052,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237541,
            "ecmwfAifs": 0.078939,
            "icon": 0.222157,
            "ukmo": 0.125095,
            "meteofrance": 0.153631,
            "gfs": 0.065558,
            "gem": 0.060949,
            "jma": 0.05613
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7881,
          "logisticSlope": 3.5908,
          "wetFractionWeight": 3.1051,
          "powerEta": 0.68,
          "rawBrier": 0.01818,
          "calibratedBrier": 0.01468
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4843,
          "rawIfsRmseC": 0.6738,
          "rawEqualMaeC": 0.7986,
          "rawEqualRmseC": 1.0236,
          "cvSimplexMaeC": 0.4806,
          "cvCalibratedMaeC": 0.4658,
          "cvCalibratedRmseC": 0.6569
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
        "intercept": 0,
        "betaDrivers": [
          -0.0143,
          -0.1073,
          0.0053,
          -0.0602,
          0.0295,
          0.0007
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.266,
        "spreadScale": 0.1055,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311346,
            "ecmwfAifs": 0.215851,
            "icon": 0.14057,
            "ukmo": 0.114817,
            "meteofrance": 0.045118,
            "gfs": 0.065186,
            "gem": 0.060603,
            "jma": 0.046509
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8566,
          "logisticSlope": 3.8649,
          "wetFractionWeight": 2.904,
          "powerEta": 0.68,
          "rawBrier": 0.01818,
          "calibratedBrier": 0.01429
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4843,
          "rawIfsRmseC": 0.6738,
          "rawEqualMaeC": 0.7986,
          "rawEqualRmseC": 1.0236,
          "cvSimplexMaeC": 0.4646,
          "cvCalibratedMaeC": 0.4498,
          "cvCalibratedRmseC": 0.6424
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.828257,
          "ecmwfAifs": 0.02,
          "icon": 0.027805,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.043938,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0088,
          -0.1236,
          0,
          0
        ],
        "driverBetasC": [
          -0.0908,
          -0.0033,
          -0.1058,
          0.0323
        ],
        "spreadBaseC2": 0.3371,
        "spreadScale": 0.0501,
        "cvMaeC": 0.4586,
        "cvRmseC": 0.627,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.844129,
          "ecmwfAifs": 0.02,
          "icon": 0.023902,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.031969,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0078,
          -0.1066,
          0,
          0
        ],
        "driverBetasC": [
          -0.0733,
          -0.0005,
          -0.0751,
          0.0259
        ],
        "spreadBaseC2": 0.336,
        "spreadScale": 0.05,
        "cvMaeC": 0.4559,
        "cvRmseC": 0.6261,
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
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0068,
          -0.0895,
          0,
          0
        ],
        "driverBetasC": [
          -0.0559,
          0.0022,
          -0.0443,
          0.0195
        ],
        "spreadBaseC2": 0.3349,
        "spreadScale": 0.05,
        "cvMaeC": 0.4532,
        "cvRmseC": 0.6252,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.803188,
          "ecmwfAifs": 0.02,
          "icon": 0.023149,
          "ukmo": 0.050661,
          "meteofrance": 0.02,
          "gfs": 0.029938,
          "gem": 0.033064,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0845,
          -0.2341,
          0,
          0
        ],
        "driverBetasC": [
          0.0625,
          -0.0037,
          -0.0464,
          0.0726
        ],
        "spreadBaseC2": 0.3277,
        "spreadScale": 0.2076,
        "cvMaeC": 0.5125,
        "cvRmseC": 0.7888,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.831593,
          "ecmwfAifs": 0.02,
          "icon": 0.021575,
          "ukmo": 0.035331,
          "meteofrance": 0.02,
          "gfs": 0.024969,
          "gem": 0.026532,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0684,
          -0.1784,
          0,
          0
        ],
        "driverBetasC": [
          0.0335,
          0.006,
          -0.0376,
          0.052
        ],
        "spreadBaseC2": 0.325,
        "spreadScale": 0.2148,
        "cvMaeC": 0.5122,
        "cvRmseC": 0.7925,
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
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0523,
          -0.1228,
          0,
          0
        ],
        "driverBetasC": [
          0.0045,
          0.0157,
          -0.0287,
          0.0315
        ],
        "spreadBaseC2": 0.3223,
        "spreadScale": 0.222,
        "cvMaeC": 0.512,
        "cvRmseC": 0.7963,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.742909,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.105085,
          "gfs": 0.02,
          "gem": 0.052006,
          "jma": 0.02
        },
        "interceptC": -0.0011,
        "diurnalHarmonicsC": [
          -0.1926,
          -0.1299,
          0,
          0
        ],
        "driverBetasC": [
          0.0133,
          -0.1099,
          -0.2414,
          -0.0191
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.092,
        "cvMaeC": 0.3516,
        "cvRmseC": 0.4894,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.801454,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.062543,
          "gfs": 0.02,
          "gem": 0.036003,
          "jma": 0.02
        },
        "interceptC": 0.012,
        "diurnalHarmonicsC": [
          -0.1543,
          -0.0843,
          0,
          0
        ],
        "driverBetasC": [
          -0.0065,
          -0.0716,
          -0.1879,
          -0.0049
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.0835,
        "cvMaeC": 0.3552,
        "cvRmseC": 0.4927,
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
        "interceptC": 0.0252,
        "diurnalHarmonicsC": [
          -0.1161,
          -0.0387,
          0,
          0
        ],
        "driverBetasC": [
          -0.0262,
          -0.0332,
          -0.1343,
          0.0093
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.0751,
        "cvMaeC": 0.3588,
        "cvRmseC": 0.4959,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.777597,
          "ecmwfAifs": 0.02,
          "icon": 0.026617,
          "ukmo": 0.068283,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.047503,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0095,
          -0.1345,
          0,
          0
        ],
        "driverBetasC": [
          0.0579,
          -0.0497,
          -0.0585,
          0.0376
        ],
        "spreadBaseC2": 0.2855,
        "spreadScale": 0.1052,
        "cvMaeC": 0.4658,
        "cvRmseC": 0.6569,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.8188,
          "ecmwfAifs": 0.02,
          "icon": 0.023308,
          "ukmo": 0.044141,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.033751,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0119,
          -0.1209,
          0,
          0
        ],
        "driverBetasC": [
          0.0316,
          -0.0245,
          -0.0593,
          0.0335
        ],
        "spreadBaseC2": 0.2757,
        "spreadScale": 0.1053,
        "cvMaeC": 0.4578,
        "cvRmseC": 0.6497,
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
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0143,
          -0.1073,
          0,
          0
        ],
        "driverBetasC": [
          0.0053,
          0.0007,
          -0.0602,
          0.0295
        ],
        "spreadBaseC2": 0.266,
        "spreadScale": 0.1055,
        "cvMaeC": 0.4498,
        "cvRmseC": 0.6424,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.254446,
        "ecmwfAifs": 0.084285,
        "icon": 0.205395,
        "ukmo": 0.125179,
        "meteofrance": 0.15423,
        "gfs": 0.061951,
        "gem": 0.056272,
        "jma": 0.058242
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.242908,
        "ecmwfAifs": 0.073755,
        "icon": 0.220777,
        "ukmo": 0.125248,
        "meteofrance": 0.158026,
        "gfs": 0.065237,
        "gem": 0.056625,
        "jma": 0.057424
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.222276,
        "ecmwfAifs": 0.080621,
        "icon": 0.220933,
        "ukmo": 0.129021,
        "meteofrance": 0.162405,
        "gfs": 0.070074,
        "gem": 0.053768,
        "jma": 0.060902
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.237541,
        "ecmwfAifs": 0.078939,
        "icon": 0.222157,
        "ukmo": 0.125095,
        "meteofrance": 0.153631,
        "gfs": 0.065558,
        "gem": 0.060949,
        "jma": 0.05613
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.269554,
    "ecmwfAifs": 0.068637,
    "icon": 0.236856,
    "ukmo": 0.158836,
    "meteofrance": 0.106769,
    "gfs": 0.083084,
    "gem": 0.038132,
    "jma": 0.038132
  },
  "pressureWeights": {
    "ecmwfIfs": 0.449888,
    "ecmwfAifs": 0.121561,
    "icon": 0.130339,
    "ukmo": 0.129555,
    "meteofrance": 0.063979,
    "gfs": 0.040698,
    "gem": 0.03199,
    "jma": 0.03199
  }
} as const;

export default PROVINCE_CALIBRATION_TR_63;
