import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_66: ProvinceCalibrationBundle = {
  "provinceCode": "TR-66",
  "provinceName": "Yozgat",
  "plateNumber": 66,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17140",
  "stationLat": 39.8333,
  "stationLon": 34.8167,
  "stationElevationM": 1298,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.698078,
          "ecmwfAifs": 0.02,
          "icon": 0.098754,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.103168,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.1616,
        "betaDrivers": [
          0.1364,
          -0.1824,
          0.171,
          -0.2252,
          -0.1106,
          -0.1961
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3241,
        "spreadScale": 0.1134,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241831,
            "ecmwfAifs": 0.086718,
            "icon": 0.215898,
            "ukmo": 0.113474,
            "meteofrance": 0.161602,
            "gfs": 0.067616,
            "gem": 0.054773,
            "jma": 0.058088
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9238,
          "logisticSlope": 5.5614,
          "wetFractionWeight": 2.3969,
          "powerEta": 0.68,
          "rawBrier": 0.04783,
          "calibratedBrier": 0.04719
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6073,
          "rawIfsRmseC": 0.8399,
          "rawEqualMaeC": 0.8536,
          "rawEqualRmseC": 1.0913,
          "cvSimplexMaeC": 0.5265,
          "cvCalibratedMaeC": 0.4947,
          "cvCalibratedRmseC": 0.6893
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.633425,
          "ecmwfAifs": 0.096975,
          "icon": 0.081239,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.108361,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.1182,
        "betaDrivers": [
          0.096,
          -0.1184,
          0.0659,
          -0.1068,
          -0.0576,
          -0.1352
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3449,
        "spreadScale": 0.1137,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313723,
            "ecmwfAifs": 0.234693,
            "icon": 0.135211,
            "ukmo": 0.103084,
            "meteofrance": 0.045202,
            "gfs": 0.066543,
            "gem": 0.053905,
            "jma": 0.047639
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9702,
          "logisticSlope": 5.7006,
          "wetFractionWeight": 2.4128,
          "powerEta": 0.68,
          "rawBrier": 0.04783,
          "calibratedBrier": 0.04612
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6073,
          "rawIfsRmseC": 0.8399,
          "rawEqualMaeC": 0.8536,
          "rawEqualRmseC": 1.0913,
          "cvSimplexMaeC": 0.5425,
          "cvCalibratedMaeC": 0.5111,
          "cvCalibratedRmseC": 0.7045
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.65626,
          "ecmwfAifs": 0.029705,
          "icon": 0.116463,
          "ukmo": 0.02,
          "meteofrance": 0.058679,
          "gfs": 0.048633,
          "gem": 0.05026,
          "jma": 0.02
        },
        "intercept": 0.0574,
        "betaDrivers": [
          0.0534,
          -0.2159,
          0.0558,
          -0.072,
          0.063,
          -0.0073
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.272,
        "spreadScale": 0.2816,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245355,
            "ecmwfAifs": 0.082655,
            "icon": 0.216158,
            "ukmo": 0.117932,
            "meteofrance": 0.160266,
            "gfs": 0.065095,
            "gem": 0.055566,
            "jma": 0.056973
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7322,
          "logisticSlope": 3.6203,
          "wetFractionWeight": 2.7593,
          "powerEta": 0.68,
          "rawBrier": 0.06281,
          "calibratedBrier": 0.0596
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7165,
          "rawIfsRmseC": 1.0048,
          "rawEqualMaeC": 0.8296,
          "rawEqualRmseC": 1.0969,
          "cvSimplexMaeC": 0.5902,
          "cvCalibratedMaeC": 0.5668,
          "cvCalibratedRmseC": 0.8336
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.56363,
          "ecmwfAifs": 0.139963,
          "icon": 0.072294,
          "ukmo": 0.02,
          "meteofrance": 0.047787,
          "gfs": 0.064853,
          "gem": 0.071473,
          "jma": 0.02
        },
        "intercept": 0.029,
        "betaDrivers": [
          0.0279,
          -0.1246,
          0.0197,
          -0.022,
          0.0389,
          -0.0258
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3142,
        "spreadScale": 0.2615,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319915,
            "ecmwfAifs": 0.224834,
            "icon": 0.136062,
            "ukmo": 0.10768,
            "meteofrance": 0.045195,
            "gfs": 0.064389,
            "gem": 0.054963,
            "jma": 0.046962
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8087,
          "logisticSlope": 3.8361,
          "wetFractionWeight": 2.7067,
          "powerEta": 0.68,
          "rawBrier": 0.06281,
          "calibratedBrier": 0.05826
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.7165,
          "rawIfsRmseC": 1.0048,
          "rawEqualMaeC": 0.8296,
          "rawEqualRmseC": 1.0969,
          "cvSimplexMaeC": 0.6057,
          "cvCalibratedMaeC": 0.5885,
          "cvCalibratedRmseC": 0.8416
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.536158,
          "ecmwfAifs": 0.051061,
          "icon": 0.200799,
          "ukmo": 0.02,
          "meteofrance": 0.100016,
          "gfs": 0.02,
          "gem": 0.051966,
          "jma": 0.02
        },
        "intercept": 0.0377,
        "betaDrivers": [
          0.1043,
          -0.1185,
          0.0969,
          -0.168,
          -0.0122,
          -0.294
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2267,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227623,
            "ecmwfAifs": 0.079385,
            "icon": 0.235957,
            "ukmo": 0.120493,
            "meteofrance": 0.160361,
            "gfs": 0.06524,
            "gem": 0.057045,
            "jma": 0.053896
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5307,
          "logisticSlope": 3.36,
          "wetFractionWeight": 3.0391,
          "powerEta": 0.68,
          "rawBrier": 0.02033,
          "calibratedBrier": 0.01712
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7498,
          "rawIfsRmseC": 0.9256,
          "rawEqualMaeC": 0.6321,
          "rawEqualRmseC": 0.873,
          "cvSimplexMaeC": 0.4932,
          "cvCalibratedMaeC": 0.4326,
          "cvCalibratedRmseC": 0.6872
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.492275,
          "ecmwfAifs": 0.151604,
          "icon": 0.157655,
          "ukmo": 0.02,
          "meteofrance": 0.075351,
          "gfs": 0.021152,
          "gem": 0.061963,
          "jma": 0.02
        },
        "intercept": 0.0841,
        "betaDrivers": [
          0.0388,
          -0.0604,
          0.0636,
          -0.0484,
          -0.0068,
          -0.169
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2204,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.302529,
            "ecmwfAifs": 0.220114,
            "icon": 0.151395,
            "ukmo": 0.112144,
            "meteofrance": 0.045238,
            "gfs": 0.065779,
            "gem": 0.057516,
            "jma": 0.045285
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.577,
          "logisticSlope": 3.2333,
          "wetFractionWeight": 3.0917,
          "powerEta": 0.68,
          "rawBrier": 0.02033,
          "calibratedBrier": 0.0171
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7498,
          "rawIfsRmseC": 0.9256,
          "rawEqualMaeC": 0.6321,
          "rawEqualRmseC": 0.873,
          "cvSimplexMaeC": 0.4988,
          "cvCalibratedMaeC": 0.4446,
          "cvCalibratedRmseC": 0.6895
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.646915,
          "ecmwfAifs": 0.02,
          "icon": 0.154552,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.098533,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.1108,
        "betaDrivers": [
          0.1364,
          -0.1953,
          0.1284,
          -0.2084,
          0.0836,
          -0.1624
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2572,
        "spreadScale": 0.1334,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240663,
            "ecmwfAifs": 0.081995,
            "icon": 0.223227,
            "ukmo": 0.11806,
            "meteofrance": 0.158951,
            "gfs": 0.06486,
            "gem": 0.056656,
            "jma": 0.055588
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4833,
          "logisticSlope": 4.4618,
          "wetFractionWeight": 3.2934,
          "powerEta": 0.68,
          "rawBrier": 0.02522,
          "calibratedBrier": 0.02343
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6569,
          "rawIfsRmseC": 0.8792,
          "rawEqualMaeC": 0.8003,
          "rawEqualRmseC": 1.063,
          "cvSimplexMaeC": 0.5419,
          "cvCalibratedMaeC": 0.5047,
          "cvCalibratedRmseC": 0.7178
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.592357,
          "ecmwfAifs": 0.107096,
          "icon": 0.121155,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.099392,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.1136,
        "betaDrivers": [
          0.0955,
          -0.1116,
          0.0723,
          -0.0804,
          0.0328,
          -0.1078
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2597,
        "spreadScale": 0.1381,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315002,
            "ecmwfAifs": 0.223895,
            "icon": 0.141052,
            "ukmo": 0.10821,
            "meteofrance": 0.045186,
            "gfs": 0.064403,
            "gem": 0.056256,
            "jma": 0.045996
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6022,
          "logisticSlope": 4.3148,
          "wetFractionWeight": 3.4571,
          "powerEta": 0.68,
          "rawBrier": 0.02522,
          "calibratedBrier": 0.02271
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.6569,
          "rawIfsRmseC": 0.8792,
          "rawEqualMaeC": 0.8003,
          "rawEqualRmseC": 1.063,
          "cvSimplexMaeC": 0.549,
          "cvCalibratedMaeC": 0.5184,
          "cvCalibratedRmseC": 0.7259
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.698078,
          "ecmwfAifs": 0.02,
          "icon": 0.098754,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.103168,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1616,
        "diurnalHarmonicsC": [
          0.1364,
          -0.1824,
          0,
          0
        ],
        "driverBetasC": [
          0.171,
          -0.1961,
          -0.2252,
          -0.1106
        ],
        "spreadBaseC2": 0.3241,
        "spreadScale": 0.1134,
        "cvMaeC": 0.4947,
        "cvRmseC": 0.6893,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.665753,
          "ecmwfAifs": 0.058487,
          "icon": 0.089996,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.105764,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1399,
        "diurnalHarmonicsC": [
          0.1162,
          -0.1504,
          0,
          0
        ],
        "driverBetasC": [
          0.1184,
          -0.1656,
          -0.166,
          -0.0841
        ],
        "spreadBaseC2": 0.3345,
        "spreadScale": 0.1135,
        "cvMaeC": 0.5029,
        "cvRmseC": 0.6969,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.633425,
          "ecmwfAifs": 0.096975,
          "icon": 0.081239,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.108361,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1182,
        "diurnalHarmonicsC": [
          0.096,
          -0.1184,
          0,
          0
        ],
        "driverBetasC": [
          0.0659,
          -0.1352,
          -0.1068,
          -0.0576
        ],
        "spreadBaseC2": 0.3449,
        "spreadScale": 0.1137,
        "cvMaeC": 0.5111,
        "cvRmseC": 0.7045,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.65626,
          "ecmwfAifs": 0.029705,
          "icon": 0.116463,
          "ukmo": 0.02,
          "meteofrance": 0.058679,
          "gfs": 0.048633,
          "gem": 0.05026,
          "jma": 0.02
        },
        "interceptC": 0.0574,
        "diurnalHarmonicsC": [
          0.0534,
          -0.2159,
          0,
          0
        ],
        "driverBetasC": [
          0.0558,
          -0.0073,
          -0.072,
          0.063
        ],
        "spreadBaseC2": 0.272,
        "spreadScale": 0.2816,
        "cvMaeC": 0.5668,
        "cvRmseC": 0.8336,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.609944,
          "ecmwfAifs": 0.084834,
          "icon": 0.094379,
          "ukmo": 0.02,
          "meteofrance": 0.053233,
          "gfs": 0.056743,
          "gem": 0.060867,
          "jma": 0.02
        },
        "interceptC": 0.0432,
        "diurnalHarmonicsC": [
          0.0407,
          -0.1703,
          0,
          0
        ],
        "driverBetasC": [
          0.0377,
          -0.0165,
          -0.047,
          0.0509
        ],
        "spreadBaseC2": 0.2931,
        "spreadScale": 0.2716,
        "cvMaeC": 0.5776,
        "cvRmseC": 0.8376,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.56363,
          "ecmwfAifs": 0.139963,
          "icon": 0.072294,
          "ukmo": 0.02,
          "meteofrance": 0.047787,
          "gfs": 0.064853,
          "gem": 0.071473,
          "jma": 0.02
        },
        "interceptC": 0.029,
        "diurnalHarmonicsC": [
          0.0279,
          -0.1246,
          0,
          0
        ],
        "driverBetasC": [
          0.0197,
          -0.0258,
          -0.022,
          0.0389
        ],
        "spreadBaseC2": 0.3142,
        "spreadScale": 0.2615,
        "cvMaeC": 0.5885,
        "cvRmseC": 0.8416,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.536158,
          "ecmwfAifs": 0.051061,
          "icon": 0.200799,
          "ukmo": 0.02,
          "meteofrance": 0.100016,
          "gfs": 0.02,
          "gem": 0.051966,
          "jma": 0.02
        },
        "interceptC": 0.0377,
        "diurnalHarmonicsC": [
          0.1043,
          -0.1185,
          0,
          0
        ],
        "driverBetasC": [
          0.0969,
          -0.294,
          -0.168,
          -0.0122
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2267,
        "cvMaeC": 0.4326,
        "cvRmseC": 0.6872,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.514218,
          "ecmwfAifs": 0.101332,
          "icon": 0.179227,
          "ukmo": 0.02,
          "meteofrance": 0.087683,
          "gfs": 0.020576,
          "gem": 0.056964,
          "jma": 0.02
        },
        "interceptC": 0.0609,
        "diurnalHarmonicsC": [
          0.0716,
          -0.0895,
          0,
          0
        ],
        "driverBetasC": [
          0.0803,
          -0.2315,
          -0.1082,
          -0.0095
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2236,
        "cvMaeC": 0.4386,
        "cvRmseC": 0.6884,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.492275,
          "ecmwfAifs": 0.151604,
          "icon": 0.157655,
          "ukmo": 0.02,
          "meteofrance": 0.075351,
          "gfs": 0.021152,
          "gem": 0.061963,
          "jma": 0.02
        },
        "interceptC": 0.0841,
        "diurnalHarmonicsC": [
          0.0388,
          -0.0604,
          0,
          0
        ],
        "driverBetasC": [
          0.0636,
          -0.169,
          -0.0484,
          -0.0068
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2204,
        "cvMaeC": 0.4446,
        "cvRmseC": 0.6895,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.646915,
          "ecmwfAifs": 0.02,
          "icon": 0.154552,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.098533,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1108,
        "diurnalHarmonicsC": [
          0.1364,
          -0.1953,
          0,
          0
        ],
        "driverBetasC": [
          0.1284,
          -0.1624,
          -0.2084,
          0.0836
        ],
        "spreadBaseC2": 0.2572,
        "spreadScale": 0.1334,
        "cvMaeC": 0.5047,
        "cvRmseC": 0.7178,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.619635,
          "ecmwfAifs": 0.063548,
          "icon": 0.137854,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.098963,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1122,
        "diurnalHarmonicsC": [
          0.1159,
          -0.1535,
          0,
          0
        ],
        "driverBetasC": [
          0.1003,
          -0.1351,
          -0.1444,
          0.0582
        ],
        "spreadBaseC2": 0.2584,
        "spreadScale": 0.1357,
        "cvMaeC": 0.5115,
        "cvRmseC": 0.7218,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.592357,
          "ecmwfAifs": 0.107096,
          "icon": 0.121155,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.099392,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1136,
        "diurnalHarmonicsC": [
          0.0955,
          -0.1116,
          0,
          0
        ],
        "driverBetasC": [
          0.0723,
          -0.1078,
          -0.0804,
          0.0328
        ],
        "spreadBaseC2": 0.2597,
        "spreadScale": 0.1381,
        "cvMaeC": 0.5184,
        "cvRmseC": 0.7259,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.241831,
        "ecmwfAifs": 0.086718,
        "icon": 0.215898,
        "ukmo": 0.113474,
        "meteofrance": 0.161602,
        "gfs": 0.067616,
        "gem": 0.054773,
        "jma": 0.058088
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245355,
        "ecmwfAifs": 0.082655,
        "icon": 0.216158,
        "ukmo": 0.117932,
        "meteofrance": 0.160266,
        "gfs": 0.065095,
        "gem": 0.055566,
        "jma": 0.056973
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.227623,
        "ecmwfAifs": 0.079385,
        "icon": 0.235957,
        "ukmo": 0.120493,
        "meteofrance": 0.160361,
        "gfs": 0.06524,
        "gem": 0.057045,
        "jma": 0.053896
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.240663,
        "ecmwfAifs": 0.081995,
        "icon": 0.223227,
        "ukmo": 0.11806,
        "meteofrance": 0.158951,
        "gfs": 0.06486,
        "gem": 0.056656,
        "jma": 0.055588
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.288575,
    "ecmwfAifs": 0.065947,
    "icon": 0.228055,
    "ukmo": 0.152292,
    "meteofrance": 0.102584,
    "gfs": 0.089273,
    "gem": 0.036637,
    "jma": 0.036637
  },
  "pressureWeights": {
    "ecmwfIfs": 0.608407,
    "ecmwfAifs": 0.083631,
    "icon": 0.122627,
    "ukmo": 0.07499,
    "meteofrance": 0.044016,
    "gfs": 0.022313,
    "gem": 0.022008,
    "jma": 0.022008
  }
} as const;

export default PROVINCE_CALIBRATION_TR_66;
