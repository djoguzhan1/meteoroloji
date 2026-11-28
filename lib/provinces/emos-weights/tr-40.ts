import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_40: ProvinceCalibrationBundle = {
  "provinceCode": "TR-40",
  "provinceName": "Kırşehir",
  "plateNumber": 40,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17160",
  "stationLat": 39.1333,
  "stationLon": 34.1667,
  "stationElevationM": 995,
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
        "intercept": -0.1196,
        "betaDrivers": [
          -0.0515,
          -0.1833,
          -0.0143,
          0.0622,
          -0.0965,
          -0.0961
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5331,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242386,
            "ecmwfAifs": 0.086217,
            "icon": 0.21349,
            "ukmo": 0.117468,
            "meteofrance": 0.159844,
            "gfs": 0.064943,
            "gem": 0.056896,
            "jma": 0.058756
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0849,
          "logisticSlope": 5.2941,
          "wetFractionWeight": 2.6173,
          "powerEta": 0.68,
          "rawBrier": 0.03793,
          "calibratedBrier": 0.03756
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5706,
          "rawIfsRmseC": 0.8302,
          "rawEqualMaeC": 1.0224,
          "rawEqualRmseC": 1.3022,
          "cvSimplexMaeC": 0.5727,
          "cvCalibratedMaeC": 0.5381,
          "cvCalibratedRmseC": 0.7774
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
        "intercept": -0.0859,
        "betaDrivers": [
          -0.0293,
          -0.1029,
          -0.0132,
          0.0335,
          -0.0405,
          -0.0536
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5351,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313961,
            "ecmwfAifs": 0.232979,
            "icon": 0.133498,
            "ukmo": 0.106549,
            "meteofrance": 0.045176,
            "gfs": 0.063816,
            "gem": 0.055908,
            "jma": 0.048113
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.139,
          "logisticSlope": 4.998,
          "wetFractionWeight": 2.9126,
          "powerEta": 0.68,
          "rawBrier": 0.03793,
          "calibratedBrier": 0.03647
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5706,
          "rawIfsRmseC": 0.8302,
          "rawEqualMaeC": 1.0224,
          "rawEqualRmseC": 1.3022,
          "cvSimplexMaeC": 0.5727,
          "cvCalibratedMaeC": 0.5384,
          "cvCalibratedRmseC": 0.7787
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.762797,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.053474,
          "meteofrance": 0.02,
          "gfs": 0.040658,
          "gem": 0.063071,
          "jma": 0.02
        },
        "intercept": -0.0128,
        "betaDrivers": [
          -0.0394,
          -0.158,
          0.0658,
          0.237,
          0.033,
          -0.0283
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5804,
        "spreadScale": 0.1074,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.2387,
            "ecmwfAifs": 0.077619,
            "icon": 0.220292,
            "ukmo": 0.12569,
            "meteofrance": 0.162477,
            "gfs": 0.062893,
            "gem": 0.056436,
            "jma": 0.055893
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8073,
          "logisticSlope": 4.0977,
          "wetFractionWeight": 2.1036,
          "powerEta": 0.68,
          "rawBrier": 0.05531,
          "calibratedBrier": 0.0506
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6272,
          "rawIfsRmseC": 0.9574,
          "rawEqualMaeC": 0.9428,
          "rawEqualRmseC": 1.2155,
          "cvSimplexMaeC": 0.6088,
          "cvCalibratedMaeC": 0.5888,
          "cvCalibratedRmseC": 0.8847
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.807421,
          "ecmwfAifs": 0.03429,
          "icon": 0.025503,
          "ukmo": 0.030842,
          "meteofrance": 0.02,
          "gfs": 0.027183,
          "gem": 0.034761,
          "jma": 0.02
        },
        "intercept": -0.0445,
        "betaDrivers": [
          -0.0352,
          -0.1073,
          0.0086,
          0.106,
          0.0251,
          0.0133
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5983,
        "spreadScale": 0.1023,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.316147,
            "ecmwfAifs": 0.214468,
            "icon": 0.140854,
            "ukmo": 0.116574,
            "meteofrance": 0.045259,
            "gfs": 0.063193,
            "gem": 0.056705,
            "jma": 0.0468
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8417,
          "logisticSlope": 4.344,
          "wetFractionWeight": 1.8556,
          "powerEta": 0.68,
          "rawBrier": 0.05531,
          "calibratedBrier": 0.05054
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6272,
          "rawIfsRmseC": 0.9574,
          "rawEqualMaeC": 0.9428,
          "rawEqualRmseC": 1.2155,
          "cvSimplexMaeC": 0.6071,
          "cvCalibratedMaeC": 0.5874,
          "cvCalibratedRmseC": 0.8903
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.783802,
          "ecmwfAifs": 0.020455,
          "icon": 0.032413,
          "ukmo": 0.068635,
          "meteofrance": 0.02,
          "gfs": 0.029466,
          "gem": 0.025229,
          "jma": 0.02
        },
        "intercept": 0.0322,
        "betaDrivers": [
          -0.0723,
          -0.0751,
          0.0045,
          0.1144,
          -0.0138,
          -0.061
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2095,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.233295,
            "ecmwfAifs": 0.080619,
            "icon": 0.228571,
            "ukmo": 0.124001,
            "meteofrance": 0.159897,
            "gfs": 0.06687,
            "gem": 0.05324,
            "jma": 0.053507
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1632,
          "logisticSlope": 4.217,
          "wetFractionWeight": 2.9937,
          "powerEta": 0.68,
          "rawBrier": 0.0118,
          "calibratedBrier": 0.00964
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.41,
          "rawIfsRmseC": 0.6804,
          "rawEqualMaeC": 0.6906,
          "rawEqualRmseC": 0.896,
          "cvSimplexMaeC": 0.3995,
          "cvCalibratedMaeC": 0.3836,
          "cvCalibratedRmseC": 0.6352
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
          -0.0294,
          -0.0366,
          -0.014,
          0.0397,
          0.003,
          -0.0047
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2209,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30783,
            "ecmwfAifs": 0.221921,
            "icon": 0.145597,
            "ukmo": 0.114576,
            "meteofrance": 0.045216,
            "gfs": 0.066935,
            "gem": 0.053292,
            "jma": 0.044633
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.2523,
          "logisticSlope": 4.0571,
          "wetFractionWeight": 3.3134,
          "powerEta": 0.68,
          "rawBrier": 0.0118,
          "calibratedBrier": 0.00915
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.41,
          "rawIfsRmseC": 0.6804,
          "rawEqualMaeC": 0.6906,
          "rawEqualRmseC": 0.896,
          "cvSimplexMaeC": 0.3912,
          "cvCalibratedMaeC": 0.3823,
          "cvCalibratedRmseC": 0.6403
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.802621,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.03775,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.059629,
          "jma": 0.02
        },
        "intercept": -0.0433,
        "betaDrivers": [
          -0.0121,
          -0.1093,
          0.0189,
          0.113,
          0.0576,
          -0.0953
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2151,
        "spreadScale": 0.147,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231019,
            "ecmwfAifs": 0.080551,
            "icon": 0.226994,
            "ukmo": 0.121284,
            "meteofrance": 0.156314,
            "gfs": 0.065534,
            "gem": 0.059869,
            "jma": 0.058435
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7445,
          "logisticSlope": 4.7109,
          "wetFractionWeight": 3.343,
          "powerEta": 0.68,
          "rawBrier": 0.01598,
          "calibratedBrier": 0.01567
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4696,
          "rawIfsRmseC": 0.7064,
          "rawEqualMaeC": 0.858,
          "rawEqualRmseC": 1.0843,
          "cvSimplexMaeC": 0.4679,
          "cvCalibratedMaeC": 0.454,
          "cvCalibratedRmseC": 0.6668
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
        "intercept": -0.0477,
        "betaDrivers": [
          -0.0227,
          -0.0955,
          -0.0153,
          0.0636,
          0.0471,
          -0.0415
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2136,
        "spreadScale": 0.1491,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.303981,
            "ecmwfAifs": 0.221121,
            "icon": 0.144193,
            "ukmo": 0.111755,
            "meteofrance": 0.045162,
            "gfs": 0.065417,
            "gem": 0.059762,
            "jma": 0.048609
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8322,
          "logisticSlope": 4.6314,
          "wetFractionWeight": 3.3689,
          "powerEta": 0.68,
          "rawBrier": 0.01598,
          "calibratedBrier": 0.01536
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4696,
          "rawIfsRmseC": 0.7064,
          "rawEqualMaeC": 0.858,
          "rawEqualRmseC": 1.0843,
          "cvSimplexMaeC": 0.4657,
          "cvCalibratedMaeC": 0.4479,
          "cvCalibratedRmseC": 0.6681
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
        "interceptC": -0.1196,
        "diurnalHarmonicsC": [
          -0.0515,
          -0.1833,
          0,
          0
        ],
        "driverBetasC": [
          -0.0143,
          -0.0961,
          0.0622,
          -0.0965
        ],
        "spreadBaseC2": 0.5331,
        "spreadScale": 0.05,
        "cvMaeC": 0.5381,
        "cvRmseC": 0.7774,
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
        "interceptC": -0.1028,
        "diurnalHarmonicsC": [
          -0.0404,
          -0.1431,
          0,
          0
        ],
        "driverBetasC": [
          -0.0138,
          -0.0748,
          0.0479,
          -0.0685
        ],
        "spreadBaseC2": 0.5341,
        "spreadScale": 0.05,
        "cvMaeC": 0.5383,
        "cvRmseC": 0.778,
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
        "interceptC": -0.0859,
        "diurnalHarmonicsC": [
          -0.0293,
          -0.1029,
          0,
          0
        ],
        "driverBetasC": [
          -0.0132,
          -0.0536,
          0.0335,
          -0.0405
        ],
        "spreadBaseC2": 0.5351,
        "spreadScale": 0.05,
        "cvMaeC": 0.5384,
        "cvRmseC": 0.7787,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.762797,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.053474,
          "meteofrance": 0.02,
          "gfs": 0.040658,
          "gem": 0.063071,
          "jma": 0.02
        },
        "interceptC": -0.0128,
        "diurnalHarmonicsC": [
          -0.0394,
          -0.158,
          0,
          0
        ],
        "driverBetasC": [
          0.0658,
          -0.0283,
          0.237,
          0.033
        ],
        "spreadBaseC2": 0.5804,
        "spreadScale": 0.1074,
        "cvMaeC": 0.5888,
        "cvRmseC": 0.8847,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.78511,
          "ecmwfAifs": 0.027145,
          "icon": 0.022751,
          "ukmo": 0.042158,
          "meteofrance": 0.02,
          "gfs": 0.03392,
          "gem": 0.048916,
          "jma": 0.02
        },
        "interceptC": -0.0286,
        "diurnalHarmonicsC": [
          -0.0373,
          -0.1326,
          0,
          0
        ],
        "driverBetasC": [
          0.0372,
          -0.0075,
          0.1715,
          0.029
        ],
        "spreadBaseC2": 0.5894,
        "spreadScale": 0.1048,
        "cvMaeC": 0.5881,
        "cvRmseC": 0.8875,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.807421,
          "ecmwfAifs": 0.03429,
          "icon": 0.025503,
          "ukmo": 0.030842,
          "meteofrance": 0.02,
          "gfs": 0.027183,
          "gem": 0.034761,
          "jma": 0.02
        },
        "interceptC": -0.0445,
        "diurnalHarmonicsC": [
          -0.0352,
          -0.1073,
          0,
          0
        ],
        "driverBetasC": [
          0.0086,
          0.0133,
          0.106,
          0.0251
        ],
        "spreadBaseC2": 0.5983,
        "spreadScale": 0.1023,
        "cvMaeC": 0.5874,
        "cvRmseC": 0.8903,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.783802,
          "ecmwfAifs": 0.020455,
          "icon": 0.032413,
          "ukmo": 0.068635,
          "meteofrance": 0.02,
          "gfs": 0.029466,
          "gem": 0.025229,
          "jma": 0.02
        },
        "interceptC": 0.0322,
        "diurnalHarmonicsC": [
          -0.0723,
          -0.0751,
          0,
          0
        ],
        "driverBetasC": [
          0.0045,
          -0.061,
          0.1144,
          -0.0138
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2095,
        "cvMaeC": 0.3836,
        "cvRmseC": 0.6352,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.8219,
          "ecmwfAifs": 0.020228,
          "icon": 0.026207,
          "ukmo": 0.044317,
          "meteofrance": 0.02,
          "gfs": 0.024733,
          "gem": 0.022615,
          "jma": 0.02
        },
        "interceptC": 0.0161,
        "diurnalHarmonicsC": [
          -0.0508,
          -0.0558,
          0,
          0
        ],
        "driverBetasC": [
          -0.0048,
          -0.0328,
          0.0771,
          -0.0054
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2152,
        "cvMaeC": 0.383,
        "cvRmseC": 0.6378,
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
          -0.0294,
          -0.0366,
          0,
          0
        ],
        "driverBetasC": [
          -0.014,
          -0.0047,
          0.0397,
          0.003
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2209,
        "cvMaeC": 0.3823,
        "cvRmseC": 0.6403,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.802621,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.03775,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.059629,
          "jma": 0.02
        },
        "interceptC": -0.0433,
        "diurnalHarmonicsC": [
          -0.0121,
          -0.1093,
          0,
          0
        ],
        "driverBetasC": [
          0.0189,
          -0.0953,
          0.113,
          0.0576
        ],
        "spreadBaseC2": 0.2151,
        "spreadScale": 0.147,
        "cvMaeC": 0.454,
        "cvRmseC": 0.6668,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.83131,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.028875,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.039815,
          "jma": 0.02
        },
        "interceptC": -0.0455,
        "diurnalHarmonicsC": [
          -0.0174,
          -0.1024,
          0,
          0
        ],
        "driverBetasC": [
          0.0018,
          -0.0684,
          0.0883,
          0.0524
        ],
        "spreadBaseC2": 0.2144,
        "spreadScale": 0.1481,
        "cvMaeC": 0.451,
        "cvRmseC": 0.6674,
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
        "interceptC": -0.0477,
        "diurnalHarmonicsC": [
          -0.0227,
          -0.0955,
          0,
          0
        ],
        "driverBetasC": [
          -0.0153,
          -0.0415,
          0.0636,
          0.0471
        ],
        "spreadBaseC2": 0.2136,
        "spreadScale": 0.1491,
        "cvMaeC": 0.4479,
        "cvRmseC": 0.6681,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.242386,
        "ecmwfAifs": 0.086217,
        "icon": 0.21349,
        "ukmo": 0.117468,
        "meteofrance": 0.159844,
        "gfs": 0.064943,
        "gem": 0.056896,
        "jma": 0.058756
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.2387,
        "ecmwfAifs": 0.077619,
        "icon": 0.220292,
        "ukmo": 0.12569,
        "meteofrance": 0.162477,
        "gfs": 0.062893,
        "gem": 0.056436,
        "jma": 0.055893
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.233295,
        "ecmwfAifs": 0.080619,
        "icon": 0.228571,
        "ukmo": 0.124001,
        "meteofrance": 0.159897,
        "gfs": 0.06687,
        "gem": 0.05324,
        "jma": 0.053507
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.231019,
        "ecmwfAifs": 0.080551,
        "icon": 0.226994,
        "ukmo": 0.121284,
        "meteofrance": 0.156314,
        "gfs": 0.065534,
        "gem": 0.059869,
        "jma": 0.058435
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.276147,
    "ecmwfAifs": 0.068566,
    "icon": 0.222258,
    "ukmo": 0.169431,
    "meteofrance": 0.106658,
    "gfs": 0.080756,
    "gem": 0.038092,
    "jma": 0.038092
  },
  "pressureWeights": {
    "ecmwfIfs": 0.558312,
    "ecmwfAifs": 0.094552,
    "icon": 0.123814,
    "ukmo": 0.089404,
    "meteofrance": 0.049764,
    "gfs": 0.03439,
    "gem": 0.024882,
    "jma": 0.024882
  }
} as const;

export default PROVINCE_CALIBRATION_TR_40;
