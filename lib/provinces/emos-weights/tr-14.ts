import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_14: ProvinceCalibrationBundle = {
  "provinceCode": "TR-14",
  "provinceName": "Bolu",
  "plateNumber": 14,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17070",
  "stationLat": 40.7333,
  "stationLon": 31.6,
  "stationElevationM": 742,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.253573,
          "icon": 0.370187,
          "ukmo": 0.178308,
          "meteofrance": 0.117932,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0783,
        "betaDrivers": [
          -0.4037,
          0.3615,
          -0.3581,
          0.0348,
          0.2331,
          0.3589
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9546,
        "spreadScale": 0.5658,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.257353,
            "ecmwfAifs": 0.082647,
            "icon": 0.213625,
            "ukmo": 0.115629,
            "meteofrance": 0.149336,
            "gfs": 0.067919,
            "gem": 0.059076,
            "jma": 0.054415
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9194,
          "logisticSlope": 4.6929,
          "wetFractionWeight": 3.2803,
          "powerEta": 0.68,
          "rawBrier": 0.06577,
          "calibratedBrier": 0.06082
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8141,
          "rawIfsRmseC": 2.5086,
          "rawEqualMaeC": 1.196,
          "rawEqualRmseC": 1.6,
          "cvSimplexMaeC": 1.1048,
          "cvCalibratedMaeC": 1.0571,
          "cvCalibratedRmseC": 1.3726
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.03337,
          "ecmwfAifs": 0.352004,
          "icon": 0.248985,
          "ukmo": 0.158732,
          "meteofrance": 0.098756,
          "gfs": 0.02,
          "gem": 0.053246,
          "jma": 0.034907
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2476,
          0.1705,
          -0.1121,
          0.0166,
          0.0811,
          0.1522
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9814,
        "spreadScale": 0.605,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330061,
            "ecmwfAifs": 0.221131,
            "icon": 0.132266,
            "ukmo": 0.103847,
            "meteofrance": 0.045017,
            "gfs": 0.066081,
            "gem": 0.057478,
            "jma": 0.044119
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0319,
          "logisticSlope": 4.7201,
          "wetFractionWeight": 2.9289,
          "powerEta": 0.68,
          "rawBrier": 0.06577,
          "calibratedBrier": 0.06076
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8141,
          "rawIfsRmseC": 2.5086,
          "rawEqualMaeC": 1.196,
          "rawEqualRmseC": 1.6,
          "cvSimplexMaeC": 1.115,
          "cvCalibratedMaeC": 1.0755,
          "cvCalibratedRmseC": 1.4059
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.38364,
          "ukmo": 0.225325,
          "meteofrance": 0.291035,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1267,
        "betaDrivers": [
          -0.6976,
          0.3755,
          0.0828,
          0.0674,
          0.1006,
          -0.1165
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5871,
        "spreadScale": 0.2486,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250211,
            "ecmwfAifs": 0.074044,
            "icon": 0.215848,
            "ukmo": 0.120562,
            "meteofrance": 0.15839,
            "gfs": 0.067073,
            "gem": 0.063509,
            "jma": 0.050363
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5016,
          "logisticSlope": 3.4221,
          "wetFractionWeight": 3.6567,
          "powerEta": 0.68,
          "rawBrier": 0.06865,
          "calibratedBrier": 0.06445
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9199,
          "rawIfsRmseC": 2.5258,
          "rawEqualMaeC": 1.4057,
          "rawEqualRmseC": 1.8187,
          "cvSimplexMaeC": 1.2102,
          "cvCalibratedMaeC": 1.1054,
          "cvCalibratedRmseC": 1.4405
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.093945,
          "ecmwfAifs": 0.063824,
          "icon": 0.307931,
          "ukmo": 0.213741,
          "meteofrance": 0.198736,
          "gfs": 0.02,
          "gem": 0.081823,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.4196,
          0.2114,
          0.0611,
          0.0174,
          0.0462,
          -0.0513
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5421,
        "spreadScale": 0.3693,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.329882,
            "ecmwfAifs": 0.203655,
            "icon": 0.137382,
            "ukmo": 0.111307,
            "meteofrance": 0.045194,
            "gfs": 0.067084,
            "gem": 0.06352,
            "jma": 0.041976
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6282,
          "logisticSlope": 3.5079,
          "wetFractionWeight": 3.5214,
          "powerEta": 0.68,
          "rawBrier": 0.06865,
          "calibratedBrier": 0.06336
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9199,
          "rawIfsRmseC": 2.5258,
          "rawEqualMaeC": 1.4057,
          "rawEqualRmseC": 1.8187,
          "cvSimplexMaeC": 1.2391,
          "cvCalibratedMaeC": 1.1503,
          "cvCalibratedRmseC": 1.5025
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.153611,
          "ukmo": 0.273492,
          "meteofrance": 0.472897,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2148,
        "betaDrivers": [
          -0.9314,
          0.3423,
          0.1178,
          -0.2445,
          0.2046,
          0.3095
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5766,
        "spreadScale": 0.4256,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.261126,
            "ecmwfAifs": 0.078834,
            "icon": 0.205346,
            "ukmo": 0.128526,
            "meteofrance": 0.1577,
            "gfs": 0.061803,
            "gem": 0.058072,
            "jma": 0.048593
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4028,
          "logisticSlope": 4.4261,
          "wetFractionWeight": 4.7643,
          "powerEta": 0.68,
          "rawBrier": 0.03331,
          "calibratedBrier": 0.02998
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6889,
          "rawIfsRmseC": 2.0991,
          "rawEqualMaeC": 1.4073,
          "rawEqualRmseC": 1.8368,
          "cvSimplexMaeC": 1.0951,
          "cvCalibratedMaeC": 0.916,
          "cvCalibratedRmseC": 1.2113
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.138793,
          "ecmwfAifs": 0.02,
          "icon": 0.175301,
          "ukmo": 0.255071,
          "meteofrance": 0.328407,
          "gfs": 0.02,
          "gem": 0.042428,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.5466,
          0.2644,
          0.0474,
          -0.0493,
          0.0972,
          0.1585
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5375,
        "spreadScale": 0.5568,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.338593,
            "ecmwfAifs": 0.213257,
            "icon": 0.128543,
            "ukmo": 0.116704,
            "meteofrance": 0.04515,
            "gfs": 0.060795,
            "gem": 0.057125,
            "jma": 0.039833
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6517,
          "logisticSlope": 4.6736,
          "wetFractionWeight": 4.0975,
          "powerEta": 0.68,
          "rawBrier": 0.03331,
          "calibratedBrier": 0.02802
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6889,
          "rawIfsRmseC": 2.0991,
          "rawEqualMaeC": 1.4073,
          "rawEqualRmseC": 1.8368,
          "cvSimplexMaeC": 1.1432,
          "cvCalibratedMaeC": 0.9822,
          "cvCalibratedRmseC": 1.302
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.156757,
          "ukmo": 0.386259,
          "meteofrance": 0.356984,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2019,
        "betaDrivers": [
          -0.5456,
          0.3616,
          -0.2331,
          0.1252,
          0.2054,
          0.0969
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8525,
        "spreadScale": 0.6576,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.27569,
            "ecmwfAifs": 0.085222,
            "icon": 0.191144,
            "ukmo": 0.112095,
            "meteofrance": 0.146287,
            "gfs": 0.068982,
            "gem": 0.064521,
            "jma": 0.056059
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9461,
          "logisticSlope": 4.3715,
          "wetFractionWeight": 3.897,
          "powerEta": 0.68,
          "rawBrier": 0.05409,
          "calibratedBrier": 0.05132
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.7972,
          "rawIfsRmseC": 2.3791,
          "rawEqualMaeC": 1.3303,
          "rawEqualRmseC": 1.778,
          "cvSimplexMaeC": 1.1671,
          "cvCalibratedMaeC": 1.0961,
          "cvCalibratedRmseC": 1.4259
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.086474,
          "ecmwfAifs": 0.148318,
          "icon": 0.188882,
          "ukmo": 0.282503,
          "meteofrance": 0.199432,
          "gfs": 0.02,
          "gem": 0.054391,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.3806,
          0.185,
          -0.0607,
          0.0493,
          0.0954,
          0.0504
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.952,
        "spreadScale": 0.6765,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.346497,
            "ecmwfAifs": 0.223453,
            "icon": 0.115976,
            "ukmo": 0.098656,
            "meteofrance": 0.043587,
            "gfs": 0.065771,
            "gem": 0.061518,
            "jma": 0.044542
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1698,
          "logisticSlope": 4.0518,
          "wetFractionWeight": 3.6615,
          "powerEta": 0.68,
          "rawBrier": 0.05409,
          "calibratedBrier": 0.04987
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.7972,
          "rawIfsRmseC": 2.3791,
          "rawEqualMaeC": 1.3303,
          "rawEqualRmseC": 1.778,
          "cvSimplexMaeC": 1.195,
          "cvCalibratedMaeC": 1.1227,
          "cvCalibratedRmseC": 1.4721
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.253573,
          "icon": 0.370187,
          "ukmo": 0.178308,
          "meteofrance": 0.117932,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0783,
        "diurnalHarmonicsC": [
          -0.4037,
          0.3615,
          0,
          0
        ],
        "driverBetasC": [
          -0.3581,
          0.3589,
          0.0348,
          0.2331
        ],
        "spreadBaseC2": 0.9546,
        "spreadScale": 0.5658,
        "cvMaeC": 1.0571,
        "cvRmseC": 1.3726,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.026685,
          "ecmwfAifs": 0.302789,
          "icon": 0.309586,
          "ukmo": 0.16852,
          "meteofrance": 0.108344,
          "gfs": 0.02,
          "gem": 0.036623,
          "jma": 0.027453
        },
        "interceptC": -0.0391,
        "diurnalHarmonicsC": [
          -0.3256,
          0.266,
          0,
          0
        ],
        "driverBetasC": [
          -0.2351,
          0.2555,
          0.0257,
          0.1571
        ],
        "spreadBaseC2": 0.968,
        "spreadScale": 0.5854,
        "cvMaeC": 1.0663,
        "cvRmseC": 1.3893,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.03337,
          "ecmwfAifs": 0.352004,
          "icon": 0.248985,
          "ukmo": 0.158732,
          "meteofrance": 0.098756,
          "gfs": 0.02,
          "gem": 0.053246,
          "jma": 0.034907
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2476,
          0.1705,
          0,
          0
        ],
        "driverBetasC": [
          -0.1121,
          0.1522,
          0.0166,
          0.0811
        ],
        "spreadBaseC2": 0.9814,
        "spreadScale": 0.605,
        "cvMaeC": 1.0755,
        "cvRmseC": 1.4059,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.38364,
          "ukmo": 0.225325,
          "meteofrance": 0.291035,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1267,
        "diurnalHarmonicsC": [
          -0.6976,
          0.3755,
          0,
          0
        ],
        "driverBetasC": [
          0.0828,
          -0.1165,
          0.0674,
          0.1006
        ],
        "spreadBaseC2": 1.5871,
        "spreadScale": 0.2486,
        "cvMaeC": 1.1054,
        "cvRmseC": 1.4405,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.056973,
          "ecmwfAifs": 0.041912,
          "icon": 0.345784,
          "ukmo": 0.219533,
          "meteofrance": 0.244886,
          "gfs": 0.02,
          "gem": 0.050912,
          "jma": 0.02
        },
        "interceptC": -0.0634,
        "diurnalHarmonicsC": [
          -0.5586,
          0.2934,
          0,
          0
        ],
        "driverBetasC": [
          0.072,
          -0.0839,
          0.0424,
          0.0734
        ],
        "spreadBaseC2": 1.5646,
        "spreadScale": 0.309,
        "cvMaeC": 1.1279,
        "cvRmseC": 1.4715,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.093945,
          "ecmwfAifs": 0.063824,
          "icon": 0.307931,
          "ukmo": 0.213741,
          "meteofrance": 0.198736,
          "gfs": 0.02,
          "gem": 0.081823,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.4196,
          0.2114,
          0,
          0
        ],
        "driverBetasC": [
          0.0611,
          -0.0513,
          0.0174,
          0.0462
        ],
        "spreadBaseC2": 1.5421,
        "spreadScale": 0.3693,
        "cvMaeC": 1.1503,
        "cvRmseC": 1.5025,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.153611,
          "ukmo": 0.273492,
          "meteofrance": 0.472897,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2148,
        "diurnalHarmonicsC": [
          -0.9314,
          0.3423,
          0,
          0
        ],
        "driverBetasC": [
          0.1178,
          0.3095,
          -0.2445,
          0.2046
        ],
        "spreadBaseC2": 0.5766,
        "spreadScale": 0.4256,
        "cvMaeC": 0.916,
        "cvRmseC": 1.2113,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.079397,
          "ecmwfAifs": 0.02,
          "icon": 0.164456,
          "ukmo": 0.264282,
          "meteofrance": 0.400651,
          "gfs": 0.02,
          "gem": 0.031214,
          "jma": 0.02
        },
        "interceptC": -0.1074,
        "diurnalHarmonicsC": [
          -0.739,
          0.3034,
          0,
          0
        ],
        "driverBetasC": [
          0.0826,
          0.234,
          -0.1469,
          0.1509
        ],
        "spreadBaseC2": 0.5571,
        "spreadScale": 0.4912,
        "cvMaeC": 0.9491,
        "cvRmseC": 1.2567,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.138793,
          "ecmwfAifs": 0.02,
          "icon": 0.175301,
          "ukmo": 0.255071,
          "meteofrance": 0.328407,
          "gfs": 0.02,
          "gem": 0.042428,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.5466,
          0.2644,
          0,
          0
        ],
        "driverBetasC": [
          0.0474,
          0.1585,
          -0.0493,
          0.0972
        ],
        "spreadBaseC2": 0.5375,
        "spreadScale": 0.5568,
        "cvMaeC": 0.9822,
        "cvRmseC": 1.302,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.156757,
          "ukmo": 0.386259,
          "meteofrance": 0.356984,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2019,
        "diurnalHarmonicsC": [
          -0.5456,
          0.3616,
          0,
          0
        ],
        "driverBetasC": [
          -0.2331,
          0.0969,
          0.1252,
          0.2054
        ],
        "spreadBaseC2": 0.8525,
        "spreadScale": 0.6576,
        "cvMaeC": 1.0961,
        "cvRmseC": 1.4259,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.053237,
          "ecmwfAifs": 0.084159,
          "icon": 0.17282,
          "ukmo": 0.33438,
          "meteofrance": 0.278208,
          "gfs": 0.02,
          "gem": 0.037196,
          "jma": 0.02
        },
        "interceptC": -0.1009,
        "diurnalHarmonicsC": [
          -0.4631,
          0.2733,
          0,
          0
        ],
        "driverBetasC": [
          -0.1469,
          0.0736,
          0.0872,
          0.1504
        ],
        "spreadBaseC2": 0.9022,
        "spreadScale": 0.667,
        "cvMaeC": 1.1094,
        "cvRmseC": 1.449,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.086474,
          "ecmwfAifs": 0.148318,
          "icon": 0.188882,
          "ukmo": 0.282503,
          "meteofrance": 0.199432,
          "gfs": 0.02,
          "gem": 0.054391,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.3806,
          0.185,
          0,
          0
        ],
        "driverBetasC": [
          -0.0607,
          0.0504,
          0.0493,
          0.0954
        ],
        "spreadBaseC2": 0.952,
        "spreadScale": 0.6765,
        "cvMaeC": 1.1227,
        "cvRmseC": 1.4721,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.257353,
        "ecmwfAifs": 0.082647,
        "icon": 0.213625,
        "ukmo": 0.115629,
        "meteofrance": 0.149336,
        "gfs": 0.067919,
        "gem": 0.059076,
        "jma": 0.054415
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.250211,
        "ecmwfAifs": 0.074044,
        "icon": 0.215848,
        "ukmo": 0.120562,
        "meteofrance": 0.15839,
        "gfs": 0.067073,
        "gem": 0.063509,
        "jma": 0.050363
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.261126,
        "ecmwfAifs": 0.078834,
        "icon": 0.205346,
        "ukmo": 0.128526,
        "meteofrance": 0.1577,
        "gfs": 0.061803,
        "gem": 0.058072,
        "jma": 0.048593
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.27569,
        "ecmwfAifs": 0.085222,
        "icon": 0.191144,
        "ukmo": 0.112095,
        "meteofrance": 0.146287,
        "gfs": 0.068982,
        "gem": 0.064521,
        "jma": 0.056059
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.242567,
    "ecmwfAifs": 0.070407,
    "icon": 0.219646,
    "ukmo": 0.187824,
    "meteofrance": 0.109522,
    "gfs": 0.091804,
    "gem": 0.039115,
    "jma": 0.039115
  },
  "pressureWeights": {
    "ecmwfIfs": 0.223632,
    "ecmwfAifs": 0.143178,
    "icon": 0.113025,
    "ukmo": 0.285522,
    "meteofrance": 0.075357,
    "gfs": 0.08393,
    "gem": 0.037678,
    "jma": 0.037678
  }
} as const;

export default PROVINCE_CALIBRATION_TR_14;
