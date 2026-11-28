import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_20: ProvinceCalibrationBundle = {
  "provinceCode": "TR-20",
  "provinceName": "Denizli",
  "plateNumber": 20,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17237",
  "stationLat": 37.7667,
  "stationLon": 29.0833,
  "stationElevationM": 428,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.70349,
          "ecmwfAifs": 0.02,
          "icon": 0.057204,
          "ukmo": 0.024477,
          "meteofrance": 0.02,
          "gfs": 0.134829,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0058,
        "betaDrivers": [
          0.1075,
          -0.0859,
          0.2869,
          0.064,
          -0.0025,
          -0.1728
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4113,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258126,
            "ecmwfAifs": 0.090754,
            "icon": 0.215981,
            "ukmo": 0.106535,
            "meteofrance": 0.151849,
            "gfs": 0.064001,
            "gem": 0.054965,
            "jma": 0.057789
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0349,
          "logisticSlope": 4.3375,
          "wetFractionWeight": 3.0666,
          "powerEta": 0.68,
          "rawBrier": 0.04233,
          "calibratedBrier": 0.04174
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6359,
          "rawIfsRmseC": 0.8618,
          "rawEqualMaeC": 0.9409,
          "rawEqualRmseC": 1.1906,
          "cvSimplexMaeC": 0.5205,
          "cvCalibratedMaeC": 0.5072,
          "cvCalibratedRmseC": 0.7233
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.664771,
          "ecmwfAifs": 0.04576,
          "icon": 0.087755,
          "ukmo": 0.036685,
          "meteofrance": 0.02,
          "gfs": 0.105029,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0023,
        "betaDrivers": [
          0.0767,
          -0.0578,
          0.1165,
          0.0016,
          -0.0068,
          -0.1226
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.404,
        "spreadScale": 0.0559,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.327313,
            "ecmwfAifs": 0.24008,
            "icon": 0.132214,
            "ukmo": 0.094599,
            "meteofrance": 0.045028,
            "gfs": 0.061567,
            "gem": 0.052874,
            "jma": 0.046325
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.134,
          "logisticSlope": 4.0156,
          "wetFractionWeight": 3.3224,
          "powerEta": 0.68,
          "rawBrier": 0.04233,
          "calibratedBrier": 0.03914
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6359,
          "rawIfsRmseC": 0.8618,
          "rawEqualMaeC": 0.9409,
          "rawEqualRmseC": 1.1906,
          "cvSimplexMaeC": 0.5284,
          "cvCalibratedMaeC": 0.5148,
          "cvCalibratedRmseC": 0.7274
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.777551,
          "ecmwfAifs": 0.030414,
          "icon": 0.050299,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.024319,
          "gem": 0.02,
          "jma": 0.057417
        },
        "intercept": -0.1001,
        "betaDrivers": [
          0.1123,
          -0.0376,
          0.2801,
          -0.1149,
          0.1104,
          -0.136
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2801,
        "spreadScale": 0.1749,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.262761,
            "ecmwfAifs": 0.078134,
            "icon": 0.194546,
            "ukmo": 0.118624,
            "meteofrance": 0.158468,
            "gfs": 0.069436,
            "gem": 0.058612,
            "jma": 0.059419
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3302,
          "logisticSlope": 3.11,
          "wetFractionWeight": 3.7958,
          "powerEta": 0.68,
          "rawBrier": 0.04195,
          "calibratedBrier": 0.03506
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6502,
          "rawIfsRmseC": 0.9332,
          "rawEqualMaeC": 1.0687,
          "rawEqualRmseC": 1.3449,
          "cvSimplexMaeC": 0.5712,
          "cvCalibratedMaeC": 0.5599,
          "cvCalibratedRmseC": 0.8286
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.700734,
          "ecmwfAifs": 0.08898,
          "icon": 0.058211,
          "ukmo": 0.045844,
          "meteofrance": 0.02,
          "gfs": 0.030569,
          "gem": 0.027844,
          "jma": 0.027818
        },
        "intercept": -0.1044,
        "betaDrivers": [
          0.0574,
          -0.0339,
          0.1092,
          -0.0529,
          0.0315,
          -0.1114
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2862,
        "spreadScale": 0.1758,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.340219,
            "ecmwfAifs": 0.211054,
            "icon": 0.121604,
            "ukmo": 0.107555,
            "meteofrance": 0.045157,
            "gfs": 0.068203,
            "gem": 0.057571,
            "jma": 0.048637
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3529,
          "logisticSlope": 3.6111,
          "wetFractionWeight": 3.3929,
          "powerEta": 0.68,
          "rawBrier": 0.04195,
          "calibratedBrier": 0.03481
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6502,
          "rawIfsRmseC": 0.9332,
          "rawEqualMaeC": 1.0687,
          "rawEqualRmseC": 1.3449,
          "cvSimplexMaeC": 0.5906,
          "cvCalibratedMaeC": 0.5784,
          "cvCalibratedRmseC": 0.8334
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.659961,
          "ecmwfAifs": 0.132597,
          "icon": 0.069778,
          "ukmo": 0.022589,
          "meteofrance": 0.045702,
          "gfs": 0.029373,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1884,
        "betaDrivers": [
          -0.0341,
          0.0343,
          0.2528,
          -0.1145,
          -0.0059,
          -0.2056
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1598,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244461,
            "ecmwfAifs": 0.085409,
            "icon": 0.203554,
            "ukmo": 0.120965,
            "meteofrance": 0.166417,
            "gfs": 0.066633,
            "gem": 0.05452,
            "jma": 0.058041
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.6225,
          "logisticSlope": 2.7097,
          "wetFractionWeight": 1.9789,
          "powerEta": 0.68,
          "rawBrier": 0.00978,
          "calibratedBrier": 0.00453
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.5147,
          "rawIfsRmseC": 0.8215,
          "rawEqualMaeC": 0.9279,
          "rawEqualRmseC": 1.1532,
          "cvSimplexMaeC": 0.4591,
          "cvCalibratedMaeC": 0.4427,
          "cvCalibratedRmseC": 0.698
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.555587,
          "ecmwfAifs": 0.196695,
          "icon": 0.096453,
          "ukmo": 0.047835,
          "meteofrance": 0.03061,
          "gfs": 0.03282,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1025,
        "betaDrivers": [
          -0.0386,
          0.03,
          0.1029,
          -0.0524,
          -0.0108,
          -0.1215
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1398,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31788,
            "ecmwfAifs": 0.231694,
            "icon": 0.127781,
            "ukmo": 0.110148,
            "meteofrance": 0.045271,
            "gfs": 0.065731,
            "gem": 0.053782,
            "jma": 0.047713
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.6097,
          "logisticSlope": 2.867,
          "wetFractionWeight": 2.1164,
          "powerEta": 0.68,
          "rawBrier": 0.00978,
          "calibratedBrier": 0.00453
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.5147,
          "rawIfsRmseC": 0.8215,
          "rawEqualMaeC": 0.9279,
          "rawEqualRmseC": 1.1532,
          "cvSimplexMaeC": 0.4722,
          "cvCalibratedMaeC": 0.459,
          "cvCalibratedRmseC": 0.6895
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.744941,
          "ecmwfAifs": 0.095988,
          "icon": 0.059071,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0553,
        "betaDrivers": [
          0.226,
          0.0748,
          0.0633,
          -0.0039,
          0.0627,
          -0.2279
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1398,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244548,
            "ecmwfAifs": 0.082903,
            "icon": 0.206064,
            "ukmo": 0.123037,
            "meteofrance": 0.153718,
            "gfs": 0.067447,
            "gem": 0.061375,
            "jma": 0.060908
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.771,
          "logisticSlope": 4.8731,
          "wetFractionWeight": 3.6641,
          "powerEta": 0.68,
          "rawBrier": 0.01572,
          "calibratedBrier": 0.01572
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5528,
          "rawIfsRmseC": 0.8204,
          "rawEqualMaeC": 1.091,
          "rawEqualRmseC": 1.498,
          "cvSimplexMaeC": 0.5166,
          "cvCalibratedMaeC": 0.4942,
          "cvCalibratedRmseC": 0.7328
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.68855,
          "ecmwfAifs": 0.124239,
          "icon": 0.085921,
          "ukmo": 0.02,
          "meteofrance": 0.02129,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0973,
        "betaDrivers": [
          0.1532,
          0.03,
          0.0544,
          -0.0155,
          0.0217,
          -0.1755
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1516,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315838,
            "ecmwfAifs": 0.223372,
            "icon": 0.128479,
            "ukmo": 0.111276,
            "meteofrance": 0.045089,
            "gfs": 0.066083,
            "gem": 0.060133,
            "jma": 0.04973
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8614,
          "logisticSlope": 4.7365,
          "wetFractionWeight": 3.6119,
          "powerEta": 0.68,
          "rawBrier": 0.01572,
          "calibratedBrier": 0.01572
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5528,
          "rawIfsRmseC": 0.8204,
          "rawEqualMaeC": 1.091,
          "rawEqualRmseC": 1.498,
          "cvSimplexMaeC": 0.5248,
          "cvCalibratedMaeC": 0.5043,
          "cvCalibratedRmseC": 0.7377
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.70349,
          "ecmwfAifs": 0.02,
          "icon": 0.057204,
          "ukmo": 0.024477,
          "meteofrance": 0.02,
          "gfs": 0.134829,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0058,
        "diurnalHarmonicsC": [
          0.1075,
          -0.0859,
          0,
          0
        ],
        "driverBetasC": [
          0.2869,
          -0.1728,
          0.064,
          -0.0025
        ],
        "spreadBaseC2": 0.4113,
        "spreadScale": 0.05,
        "cvMaeC": 0.5072,
        "cvRmseC": 0.7233,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.68413,
          "ecmwfAifs": 0.03288,
          "icon": 0.07248,
          "ukmo": 0.030581,
          "meteofrance": 0.02,
          "gfs": 0.119929,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0017,
        "diurnalHarmonicsC": [
          0.0921,
          -0.0718,
          0,
          0
        ],
        "driverBetasC": [
          0.2017,
          -0.1477,
          0.0328,
          -0.0046
        ],
        "spreadBaseC2": 0.4077,
        "spreadScale": 0.0529,
        "cvMaeC": 0.511,
        "cvRmseC": 0.7254,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.664771,
          "ecmwfAifs": 0.04576,
          "icon": 0.087755,
          "ukmo": 0.036685,
          "meteofrance": 0.02,
          "gfs": 0.105029,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0023,
        "diurnalHarmonicsC": [
          0.0767,
          -0.0578,
          0,
          0
        ],
        "driverBetasC": [
          0.1165,
          -0.1226,
          0.0016,
          -0.0068
        ],
        "spreadBaseC2": 0.404,
        "spreadScale": 0.0559,
        "cvMaeC": 0.5148,
        "cvRmseC": 0.7274,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.777551,
          "ecmwfAifs": 0.030414,
          "icon": 0.050299,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.024319,
          "gem": 0.02,
          "jma": 0.057417
        },
        "interceptC": -0.1001,
        "diurnalHarmonicsC": [
          0.1123,
          -0.0376,
          0,
          0
        ],
        "driverBetasC": [
          0.2801,
          -0.136,
          -0.1149,
          0.1104
        ],
        "spreadBaseC2": 0.2801,
        "spreadScale": 0.1749,
        "cvMaeC": 0.5599,
        "cvRmseC": 0.8286,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.739142,
          "ecmwfAifs": 0.059697,
          "icon": 0.054255,
          "ukmo": 0.032922,
          "meteofrance": 0.02,
          "gfs": 0.027444,
          "gem": 0.023922,
          "jma": 0.042618
        },
        "interceptC": -0.1023,
        "diurnalHarmonicsC": [
          0.0848,
          -0.0358,
          0,
          0
        ],
        "driverBetasC": [
          0.1947,
          -0.1237,
          -0.0839,
          0.0709
        ],
        "spreadBaseC2": 0.2832,
        "spreadScale": 0.1754,
        "cvMaeC": 0.5692,
        "cvRmseC": 0.831,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.700734,
          "ecmwfAifs": 0.08898,
          "icon": 0.058211,
          "ukmo": 0.045844,
          "meteofrance": 0.02,
          "gfs": 0.030569,
          "gem": 0.027844,
          "jma": 0.027818
        },
        "interceptC": -0.1044,
        "diurnalHarmonicsC": [
          0.0574,
          -0.0339,
          0,
          0
        ],
        "driverBetasC": [
          0.1092,
          -0.1114,
          -0.0529,
          0.0315
        ],
        "spreadBaseC2": 0.2862,
        "spreadScale": 0.1758,
        "cvMaeC": 0.5784,
        "cvRmseC": 0.8334,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.659961,
          "ecmwfAifs": 0.132597,
          "icon": 0.069778,
          "ukmo": 0.022589,
          "meteofrance": 0.045702,
          "gfs": 0.029373,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1884,
        "diurnalHarmonicsC": [
          -0.0341,
          0.0343,
          0,
          0
        ],
        "driverBetasC": [
          0.2528,
          -0.2056,
          -0.1145,
          -0.0059
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1598,
        "cvMaeC": 0.4427,
        "cvRmseC": 0.698,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.607773,
          "ecmwfAifs": 0.164646,
          "icon": 0.083116,
          "ukmo": 0.035212,
          "meteofrance": 0.038156,
          "gfs": 0.031097,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1454,
        "diurnalHarmonicsC": [
          -0.0364,
          0.0321,
          0,
          0
        ],
        "driverBetasC": [
          0.1779,
          -0.1636,
          -0.0834,
          -0.0083
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1498,
        "cvMaeC": 0.4508,
        "cvRmseC": 0.6937,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.555587,
          "ecmwfAifs": 0.196695,
          "icon": 0.096453,
          "ukmo": 0.047835,
          "meteofrance": 0.03061,
          "gfs": 0.03282,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1025,
        "diurnalHarmonicsC": [
          -0.0386,
          0.03,
          0,
          0
        ],
        "driverBetasC": [
          0.1029,
          -0.1215,
          -0.0524,
          -0.0108
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1398,
        "cvMaeC": 0.459,
        "cvRmseC": 0.6895,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.744941,
          "ecmwfAifs": 0.095988,
          "icon": 0.059071,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0553,
        "diurnalHarmonicsC": [
          0.226,
          0.0748,
          0,
          0
        ],
        "driverBetasC": [
          0.0633,
          -0.2279,
          -0.0039,
          0.0627
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1398,
        "cvMaeC": 0.4942,
        "cvRmseC": 0.7328,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.716745,
          "ecmwfAifs": 0.110114,
          "icon": 0.072496,
          "ukmo": 0.02,
          "meteofrance": 0.020645,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0763,
        "diurnalHarmonicsC": [
          0.1896,
          0.0524,
          0,
          0
        ],
        "driverBetasC": [
          0.0588,
          -0.2017,
          -0.0097,
          0.0422
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1457,
        "cvMaeC": 0.4992,
        "cvRmseC": 0.7352,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.68855,
          "ecmwfAifs": 0.124239,
          "icon": 0.085921,
          "ukmo": 0.02,
          "meteofrance": 0.02129,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0973,
        "diurnalHarmonicsC": [
          0.1532,
          0.03,
          0,
          0
        ],
        "driverBetasC": [
          0.0544,
          -0.1755,
          -0.0155,
          0.0217
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1516,
        "cvMaeC": 0.5043,
        "cvRmseC": 0.7377,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.258126,
        "ecmwfAifs": 0.090754,
        "icon": 0.215981,
        "ukmo": 0.106535,
        "meteofrance": 0.151849,
        "gfs": 0.064001,
        "gem": 0.054965,
        "jma": 0.057789
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.262761,
        "ecmwfAifs": 0.078134,
        "icon": 0.194546,
        "ukmo": 0.118624,
        "meteofrance": 0.158468,
        "gfs": 0.069436,
        "gem": 0.058612,
        "jma": 0.059419
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.244461,
        "ecmwfAifs": 0.085409,
        "icon": 0.203554,
        "ukmo": 0.120965,
        "meteofrance": 0.166417,
        "gfs": 0.066633,
        "gem": 0.05452,
        "jma": 0.058041
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.244548,
        "ecmwfAifs": 0.082903,
        "icon": 0.206064,
        "ukmo": 0.123037,
        "meteofrance": 0.153718,
        "gfs": 0.067447,
        "gem": 0.061375,
        "jma": 0.060908
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.250923,
    "ecmwfAifs": 0.069344,
    "icon": 0.225274,
    "ukmo": 0.170936,
    "meteofrance": 0.107868,
    "gfs": 0.098607,
    "gem": 0.038524,
    "jma": 0.038524
  },
  "pressureWeights": {
    "ecmwfIfs": 0.466047,
    "ecmwfAifs": 0.114702,
    "icon": 0.095786,
    "ukmo": 0.143482,
    "meteofrance": 0.060369,
    "gfs": 0.059244,
    "gem": 0.030185,
    "jma": 0.030185
  }
} as const;

export default PROVINCE_CALIBRATION_TR_20;
