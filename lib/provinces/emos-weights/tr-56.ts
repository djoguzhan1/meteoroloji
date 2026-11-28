import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_56: ProvinceCalibrationBundle = {
  "provinceCode": "TR-56",
  "provinceName": "Siirt",
  "plateNumber": 56,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17210",
  "stationLat": 37.9333,
  "stationLon": 42,
  "stationElevationM": 895,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.853544,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.026456,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.4551,
          -0.0064,
          -0.1013,
          -0.1474,
          0.1233,
          0.0048
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4363,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247491,
            "ecmwfAifs": 0.089428,
            "icon": 0.214683,
            "ukmo": 0.116391,
            "meteofrance": 0.155199,
            "gfs": 0.060411,
            "gem": 0.056929,
            "jma": 0.059468
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4139,
          "logisticSlope": 3.9545,
          "wetFractionWeight": 3.5372,
          "powerEta": 0.68,
          "rawBrier": 0.0426,
          "calibratedBrier": 0.04039
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6139,
          "rawIfsRmseC": 0.8583,
          "rawEqualMaeC": 1.6462,
          "rawEqualRmseC": 2.0847,
          "cvSimplexMaeC": 0.5825,
          "cvCalibratedMaeC": 0.5129,
          "cvCalibratedRmseC": 0.7294
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.811936,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.068064,
          "jma": 0.02
        },
        "intercept": -0.0161,
        "betaDrivers": [
          -0.2658,
          -0.0134,
          -0.0476,
          -0.034,
          0.0232,
          -0.023
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4512,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.316878,
            "ecmwfAifs": 0.238872,
            "icon": 0.132697,
            "ukmo": 0.104355,
            "meteofrance": 0.045091,
            "gfs": 0.058677,
            "gem": 0.055295,
            "jma": 0.048135
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3279,
          "logisticSlope": 4.0874,
          "wetFractionWeight": 3.3971,
          "powerEta": 0.68,
          "rawBrier": 0.0426,
          "calibratedBrier": 0.03927
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6139,
          "rawIfsRmseC": 0.8583,
          "rawEqualMaeC": 1.6462,
          "rawEqualRmseC": 2.0847,
          "cvSimplexMaeC": 0.5881,
          "cvCalibratedMaeC": 0.5238,
          "cvCalibratedRmseC": 0.7396
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
        "intercept": 0,
        "betaDrivers": [
          -0.3522,
          -0.215,
          0.2397,
          -0.0122,
          -0.0036,
          -0.1114
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5135,
        "spreadScale": 0.1156,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252453,
            "ecmwfAifs": 0.066583,
            "icon": 0.220622,
            "ukmo": 0.124653,
            "meteofrance": 0.160093,
            "gfs": 0.062741,
            "gem": 0.057132,
            "jma": 0.055723
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0869,
          "logisticSlope": 2.9118,
          "wetFractionWeight": 3.1444,
          "powerEta": 0.68,
          "rawBrier": 0.06743,
          "calibratedBrier": 0.05568
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6526,
          "rawIfsRmseC": 0.9519,
          "rawEqualMaeC": 1.6451,
          "rawEqualRmseC": 2.1113,
          "cvSimplexMaeC": 0.6421,
          "cvCalibratedMaeC": 0.5684,
          "cvCalibratedRmseC": 0.8778
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.830603,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.049397,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2042,
          -0.1086,
          0.0706,
          0.0071,
          -0.0065,
          -0.0787
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5213,
        "spreadScale": 0.1216,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.338846,
            "ecmwfAifs": 0.18644,
            "icon": 0.142955,
            "ukmo": 0.117162,
            "meteofrance": 0.045256,
            "gfs": 0.063885,
            "gem": 0.058173,
            "jma": 0.047283
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.113,
          "logisticSlope": 3.6652,
          "wetFractionWeight": 2.7093,
          "powerEta": 0.68,
          "rawBrier": 0.06743,
          "calibratedBrier": 0.05508
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6526,
          "rawIfsRmseC": 0.9519,
          "rawEqualMaeC": 1.6451,
          "rawEqualRmseC": 2.1113,
          "cvSimplexMaeC": 0.6515,
          "cvCalibratedMaeC": 0.5878,
          "cvCalibratedRmseC": 0.8883
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
        "intercept": -0.0135,
        "betaDrivers": [
          -0.3733,
          -0.1112,
          0.2517,
          -0.1271,
          -0.0718,
          -0.1431
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1248,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230451,
            "ecmwfAifs": 0.08251,
            "icon": 0.223524,
            "ukmo": 0.124494,
            "meteofrance": 0.158598,
            "gfs": 0.069793,
            "gem": 0.055002,
            "jma": 0.055628
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.3261,
          "logisticSlope": 1.6448,
          "wetFractionWeight": 1.515,
          "powerEta": 0.68,
          "rawBrier": 0.00343,
          "calibratedBrier": 0.00185
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4949,
          "rawIfsRmseC": 0.7214,
          "rawEqualMaeC": 1.1159,
          "rawEqualRmseC": 1.501,
          "cvSimplexMaeC": 0.4982,
          "cvCalibratedMaeC": 0.414,
          "cvCalibratedRmseC": 0.6422
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
          -0.2064,
          -0.0399,
          0.0841,
          -0.0405,
          -0.0181,
          -0.089
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1246,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.302454,
            "ecmwfAifs": 0.225914,
            "icon": 0.141623,
            "ukmo": 0.114417,
            "meteofrance": 0.045187,
            "gfs": 0.069488,
            "gem": 0.054762,
            "jma": 0.046155
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.3364,
          "logisticSlope": 1.8057,
          "wetFractionWeight": 1.8485,
          "powerEta": 0.68,
          "rawBrier": 0.00343,
          "calibratedBrier": 0.00185
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4949,
          "rawIfsRmseC": 0.7214,
          "rawEqualMaeC": 1.1159,
          "rawEqualRmseC": 1.501,
          "cvSimplexMaeC": 0.4982,
          "cvCalibratedMaeC": 0.4234,
          "cvCalibratedRmseC": 0.6466
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
        "intercept": -0.0726,
        "betaDrivers": [
          -0.3048,
          -0.1789,
          0.1609,
          -0.0232,
          0.0262,
          -0.1004
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2618,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239588,
            "ecmwfAifs": 0.084043,
            "icon": 0.226395,
            "ukmo": 0.114928,
            "meteofrance": 0.156064,
            "gfs": 0.064121,
            "gem": 0.054189,
            "jma": 0.060672
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0932,
          "logisticSlope": 3.7616,
          "wetFractionWeight": 3.5017,
          "powerEta": 0.68,
          "rawBrier": 0.02558,
          "calibratedBrier": 0.01977
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4526,
          "rawIfsRmseC": 0.6593,
          "rawEqualMaeC": 1.3449,
          "rawEqualRmseC": 1.7481,
          "cvSimplexMaeC": 0.4713,
          "cvCalibratedMaeC": 0.3994,
          "cvCalibratedRmseC": 0.6027
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
        "intercept": -0.0145,
        "betaDrivers": [
          -0.1726,
          -0.0837,
          0.0527,
          -0.0007,
          0.0113,
          -0.0635
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2776,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.312189,
            "ecmwfAifs": 0.228463,
            "icon": 0.142414,
            "ukmo": 0.104867,
            "meteofrance": 0.045138,
            "gfs": 0.063384,
            "gem": 0.053566,
            "jma": 0.049979
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1163,
          "logisticSlope": 3.3872,
          "wetFractionWeight": 3.9484,
          "powerEta": 0.68,
          "rawBrier": 0.02558,
          "calibratedBrier": 0.01965
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4526,
          "rawIfsRmseC": 0.6593,
          "rawEqualMaeC": 1.3449,
          "rawEqualRmseC": 1.7481,
          "cvSimplexMaeC": 0.4713,
          "cvCalibratedMaeC": 0.4117,
          "cvCalibratedRmseC": 0.6156
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.853544,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.026456,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.4551,
          -0.0064,
          0,
          0
        ],
        "driverBetasC": [
          -0.1013,
          0.0048,
          -0.1474,
          0.1233
        ],
        "spreadBaseC2": 0.4363,
        "spreadScale": 0.05,
        "cvMaeC": 0.5129,
        "cvRmseC": 0.7294,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.83274,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.04726,
          "jma": 0.02
        },
        "interceptC": -0.008,
        "diurnalHarmonicsC": [
          -0.3604,
          -0.0099,
          0,
          0
        ],
        "driverBetasC": [
          -0.0745,
          -0.0091,
          -0.0907,
          0.0733
        ],
        "spreadBaseC2": 0.4437,
        "spreadScale": 0.05,
        "cvMaeC": 0.5184,
        "cvRmseC": 0.7345,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.811936,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.068064,
          "jma": 0.02
        },
        "interceptC": -0.0161,
        "diurnalHarmonicsC": [
          -0.2658,
          -0.0134,
          0,
          0
        ],
        "driverBetasC": [
          -0.0476,
          -0.023,
          -0.034,
          0.0232
        ],
        "spreadBaseC2": 0.4512,
        "spreadScale": 0.05,
        "cvMaeC": 0.5238,
        "cvRmseC": 0.7396,
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
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.3522,
          -0.215,
          0,
          0
        ],
        "driverBetasC": [
          0.2397,
          -0.1114,
          -0.0122,
          -0.0036
        ],
        "spreadBaseC2": 0.5135,
        "spreadScale": 0.1156,
        "cvMaeC": 0.5684,
        "cvRmseC": 0.8778,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.845301,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.034699,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2782,
          -0.1618,
          0,
          0
        ],
        "driverBetasC": [
          0.1552,
          -0.095,
          -0.0026,
          -0.005
        ],
        "spreadBaseC2": 0.5174,
        "spreadScale": 0.1186,
        "cvMaeC": 0.5781,
        "cvRmseC": 0.8831,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.830603,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.049397,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2042,
          -0.1086,
          0,
          0
        ],
        "driverBetasC": [
          0.0706,
          -0.0787,
          0.0071,
          -0.0065
        ],
        "spreadBaseC2": 0.5213,
        "spreadScale": 0.1216,
        "cvMaeC": 0.5878,
        "cvRmseC": 0.8883,
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
        "interceptC": -0.0135,
        "diurnalHarmonicsC": [
          -0.3733,
          -0.1112,
          0,
          0
        ],
        "driverBetasC": [
          0.2517,
          -0.1431,
          -0.1271,
          -0.0718
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1248,
        "cvMaeC": 0.414,
        "cvRmseC": 0.6422,
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
        "interceptC": -0.0067,
        "diurnalHarmonicsC": [
          -0.2898,
          -0.0755,
          0,
          0
        ],
        "driverBetasC": [
          0.1679,
          -0.1161,
          -0.0838,
          -0.045
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1247,
        "cvMaeC": 0.4187,
        "cvRmseC": 0.6444,
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
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2064,
          -0.0399,
          0,
          0
        ],
        "driverBetasC": [
          0.0841,
          -0.089,
          -0.0405,
          -0.0181
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1246,
        "cvMaeC": 0.4234,
        "cvRmseC": 0.6466,
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
        "interceptC": -0.0726,
        "diurnalHarmonicsC": [
          -0.3048,
          -0.1789,
          0,
          0
        ],
        "driverBetasC": [
          0.1609,
          -0.1004,
          -0.0232,
          0.0262
        ],
        "spreadBaseC2": 0.2618,
        "spreadScale": 0.05,
        "cvMaeC": 0.3994,
        "cvRmseC": 0.6027,
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
        "interceptC": -0.0435,
        "diurnalHarmonicsC": [
          -0.2387,
          -0.1313,
          0,
          0
        ],
        "driverBetasC": [
          0.1068,
          -0.0819,
          -0.0119,
          0.0187
        ],
        "spreadBaseC2": 0.2697,
        "spreadScale": 0.05,
        "cvMaeC": 0.4055,
        "cvRmseC": 0.6092,
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
        "interceptC": -0.0145,
        "diurnalHarmonicsC": [
          -0.1726,
          -0.0837,
          0,
          0
        ],
        "driverBetasC": [
          0.0527,
          -0.0635,
          -0.0007,
          0.0113
        ],
        "spreadBaseC2": 0.2776,
        "spreadScale": 0.05,
        "cvMaeC": 0.4117,
        "cvRmseC": 0.6156,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.247491,
        "ecmwfAifs": 0.089428,
        "icon": 0.214683,
        "ukmo": 0.116391,
        "meteofrance": 0.155199,
        "gfs": 0.060411,
        "gem": 0.056929,
        "jma": 0.059468
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.252453,
        "ecmwfAifs": 0.066583,
        "icon": 0.220622,
        "ukmo": 0.124653,
        "meteofrance": 0.160093,
        "gfs": 0.062741,
        "gem": 0.057132,
        "jma": 0.055723
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.230451,
        "ecmwfAifs": 0.08251,
        "icon": 0.223524,
        "ukmo": 0.124494,
        "meteofrance": 0.158598,
        "gfs": 0.069793,
        "gem": 0.055002,
        "jma": 0.055628
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.239588,
        "ecmwfAifs": 0.084043,
        "icon": 0.226395,
        "ukmo": 0.114928,
        "meteofrance": 0.156064,
        "gfs": 0.064121,
        "gem": 0.054189,
        "jma": 0.060672
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.292898,
    "ecmwfAifs": 0.064928,
    "icon": 0.265582,
    "ukmo": 0.116634,
    "meteofrance": 0.100999,
    "gfs": 0.086817,
    "gem": 0.036071,
    "jma": 0.036071
  },
  "pressureWeights": {
    "ecmwfIfs": 0.50746,
    "ecmwfAifs": 0.111512,
    "icon": 0.1188,
    "ukmo": 0.119385,
    "meteofrance": 0.058691,
    "gfs": 0.025462,
    "gem": 0.029345,
    "jma": 0.029345
  }
} as const;

export default PROVINCE_CALIBRATION_TR_56;
