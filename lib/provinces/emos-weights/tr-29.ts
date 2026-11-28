import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_29: ProvinceCalibrationBundle = {
  "provinceCode": "TR-29",
  "provinceName": "Gümüşhane",
  "plateNumber": 29,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17088",
  "stationLat": 40.45,
  "stationLon": 39.45,
  "stationElevationM": 1219,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.620478,
          "ecmwfAifs": 0.087332,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.085234,
          "gfs": 0.126956,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0361,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5796,
        "spreadScale": 0.1331,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246986,
            "ecmwfAifs": 0.083824,
            "icon": 0.227264,
            "ukmo": 0.102849,
            "meteofrance": 0.151623,
            "gfs": 0.066076,
            "gem": 0.060435,
            "jma": 0.060943
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2012,
          "logisticSlope": 5.9902,
          "wetFractionWeight": 3.7711,
          "powerEta": 0.68,
          "rawBrier": 0.04521,
          "calibratedBrier": 0.03944
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.9928,
          "rawIfsRmseC": 1.3621,
          "rawEqualMaeC": 1.4108,
          "rawEqualRmseC": 1.7865,
          "cvSimplexMaeC": 0.7714,
          "cvCalibratedMaeC": 0.7706,
          "cvCalibratedRmseC": 1.0098
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.606074,
          "ecmwfAifs": 0.11507,
          "icon": 0.02265,
          "ukmo": 0.046752,
          "meteofrance": 0.060851,
          "gfs": 0.108603,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0242,
          -0.0038,
          0.0371,
          0.0249,
          -0.0154,
          -0.0051
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5878,
        "spreadScale": 0.1313,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319545,
            "ecmwfAifs": 0.22625,
            "icon": 0.141946,
            "ukmo": 0.09318,
            "meteofrance": 0.045065,
            "gfs": 0.064853,
            "gem": 0.059316,
            "jma": 0.049845
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3974,
          "logisticSlope": 5.9153,
          "wetFractionWeight": 3.6449,
          "powerEta": 0.68,
          "rawBrier": 0.04521,
          "calibratedBrier": 0.03776
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.9928,
          "rawIfsRmseC": 1.3621,
          "rawEqualMaeC": 1.4108,
          "rawEqualRmseC": 1.7865,
          "cvSimplexMaeC": 0.7711,
          "cvCalibratedMaeC": 0.771,
          "cvCalibratedRmseC": 1.011
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.661412,
          "ecmwfAifs": 0.218588,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 0.5,
        "spreadBaseC2": 0.6983,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259754,
            "ecmwfAifs": 0.070497,
            "icon": 0.215625,
            "ukmo": 0.119879,
            "meteofrance": 0.155889,
            "gfs": 0.066009,
            "gem": 0.055053,
            "jma": 0.057294
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5388,
          "logisticSlope": 3.4606,
          "wetFractionWeight": 2.8767,
          "powerEta": 0.68,
          "rawBrier": 0.07523,
          "calibratedBrier": 0.07036
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.9782,
          "rawIfsRmseC": 1.2863,
          "rawEqualMaeC": 1.3066,
          "rawEqualRmseC": 1.6812,
          "cvSimplexMaeC": 0.6399,
          "cvCalibratedMaeC": 0.6399,
          "cvCalibratedRmseC": 0.951
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.639099,
          "ecmwfAifs": 0.21754,
          "icon": 0.02,
          "ukmo": 0.043361,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0232,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7122,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.34308,
            "ecmwfAifs": 0.194251,
            "icon": 0.137488,
            "ukmo": 0.110877,
            "meteofrance": 0.045164,
            "gfs": 0.066139,
            "gem": 0.055162,
            "jma": 0.047839
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7182,
          "logisticSlope": 4.0329,
          "wetFractionWeight": 2.6761,
          "powerEta": 0.68,
          "rawBrier": 0.07523,
          "calibratedBrier": 0.06818
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.9782,
          "rawIfsRmseC": 1.2863,
          "rawEqualMaeC": 1.3066,
          "rawEqualRmseC": 1.6812,
          "cvSimplexMaeC": 0.6466,
          "cvCalibratedMaeC": 0.6465,
          "cvCalibratedRmseC": 0.9586
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.659879,
          "ecmwfAifs": 0.184492,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.032758,
          "gem": 0.02,
          "jma": 0.042871
        },
        "intercept": 0.0711,
        "betaDrivers": [
          0.1696,
          -0.0458,
          0.0515,
          0.3964,
          -0.0437,
          -0.0948
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2367,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.257002,
            "ecmwfAifs": 0.059711,
            "icon": 0.225019,
            "ukmo": 0.127126,
            "meteofrance": 0.157547,
            "gfs": 0.063191,
            "gem": 0.055299,
            "jma": 0.055105
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2066,
          "logisticSlope": 4.2865,
          "wetFractionWeight": 3.6965,
          "powerEta": 0.68,
          "rawBrier": 0.0353,
          "calibratedBrier": 0.03211
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.8792,
          "rawIfsRmseC": 1.0888,
          "rawEqualMaeC": 0.7387,
          "rawEqualRmseC": 0.9367,
          "cvSimplexMaeC": 0.4708,
          "cvCalibratedMaeC": 0.4487,
          "cvCalibratedRmseC": 0.6181
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.612966,
          "ecmwfAifs": 0.172857,
          "icon": 0.03014,
          "ukmo": 0.024248,
          "meteofrance": 0.02,
          "gfs": 0.07354,
          "gem": 0.02,
          "jma": 0.046249
        },
        "intercept": 0.0278,
        "betaDrivers": [
          0.105,
          -0.0271,
          0.0144,
          0.138,
          -0.0442,
          -0.062
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.246,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.348567,
            "ecmwfAifs": 0.168952,
            "icon": 0.147334,
            "ukmo": 0.120739,
            "meteofrance": 0.045244,
            "gfs": 0.065018,
            "gem": 0.056898,
            "jma": 0.047248
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5681,
          "logisticSlope": 4.1383,
          "wetFractionWeight": 4.078,
          "powerEta": 0.68,
          "rawBrier": 0.0353,
          "calibratedBrier": 0.02964
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.8792,
          "rawIfsRmseC": 1.0888,
          "rawEqualMaeC": 0.7387,
          "rawEqualRmseC": 0.9367,
          "cvSimplexMaeC": 0.4787,
          "cvCalibratedMaeC": 0.462,
          "cvCalibratedRmseC": 0.6255
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.573751,
          "ecmwfAifs": 0.166478,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.159771,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.2499,
          -0.0838,
          0.2221,
          0.1256,
          -0.2189,
          -0.1866
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.352,
        "spreadScale": 0.07,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.261448,
            "ecmwfAifs": 0.066613,
            "icon": 0.219435,
            "ukmo": 0.121263,
            "meteofrance": 0.151426,
            "gfs": 0.067037,
            "gem": 0.054953,
            "jma": 0.057825
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1447,
          "logisticSlope": 4.6551,
          "wetFractionWeight": 3.05,
          "powerEta": 0.68,
          "rawBrier": 0.04019,
          "calibratedBrier": 0.03728
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.9319,
          "rawIfsRmseC": 1.2127,
          "rawEqualMaeC": 0.9604,
          "rawEqualRmseC": 1.2176,
          "cvSimplexMaeC": 0.5678,
          "cvCalibratedMaeC": 0.5417,
          "cvCalibratedRmseC": 0.7287
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.568978,
          "ecmwfAifs": 0.174709,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.156313,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1335,
          -0.0433,
          0.0859,
          0.0483,
          -0.075,
          -0.0965
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3423,
        "spreadScale": 0.0784,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.346564,
            "ecmwfAifs": 0.184211,
            "icon": 0.140422,
            "ukmo": 0.112562,
            "meteofrance": 0.045111,
            "gfs": 0.067412,
            "gem": 0.055261,
            "jma": 0.048457
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4245,
          "logisticSlope": 4.553,
          "wetFractionWeight": 3.211,
          "powerEta": 0.68,
          "rawBrier": 0.04019,
          "calibratedBrier": 0.03498
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.9319,
          "rawIfsRmseC": 1.2127,
          "rawEqualMaeC": 0.9604,
          "rawEqualRmseC": 1.2176,
          "cvSimplexMaeC": 0.57,
          "cvCalibratedMaeC": 0.5494,
          "cvCalibratedRmseC": 0.7368
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.620478,
          "ecmwfAifs": 0.087332,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.085234,
          "gfs": 0.126956,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0361,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.5796,
        "spreadScale": 0.1331,
        "cvMaeC": 0.7706,
        "cvRmseC": 1.0098,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.613275,
          "ecmwfAifs": 0.101201,
          "icon": 0.021325,
          "ukmo": 0.033376,
          "meteofrance": 0.073043,
          "gfs": 0.11778,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0181,
        "diurnalHarmonicsC": [
          0.0121,
          -0.0019,
          0,
          0
        ],
        "driverBetasC": [
          0.0186,
          -0.0026,
          0.0124,
          -0.0077
        ],
        "spreadBaseC2": 0.5837,
        "spreadScale": 0.1322,
        "cvMaeC": 0.7708,
        "cvRmseC": 1.0104,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.606074,
          "ecmwfAifs": 0.11507,
          "icon": 0.02265,
          "ukmo": 0.046752,
          "meteofrance": 0.060851,
          "gfs": 0.108603,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0242,
          -0.0038,
          0,
          0
        ],
        "driverBetasC": [
          0.0371,
          -0.0051,
          0.0249,
          -0.0154
        ],
        "spreadBaseC2": 0.5878,
        "spreadScale": 0.1313,
        "cvMaeC": 0.771,
        "cvRmseC": 1.011,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.661412,
          "ecmwfAifs": 0.218588,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.6983,
        "spreadScale": 0.05,
        "cvMaeC": 0.6399,
        "cvRmseC": 0.951,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.650255,
          "ecmwfAifs": 0.218064,
          "icon": 0.02,
          "ukmo": 0.031681,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0116,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.7053,
        "spreadScale": 0.05,
        "cvMaeC": 0.6432,
        "cvRmseC": 0.9548,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.639099,
          "ecmwfAifs": 0.21754,
          "icon": 0.02,
          "ukmo": 0.043361,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0232,
        "diurnalHarmonicsC": [
          0,
          0,
          0,
          0
        ],
        "driverBetasC": [
          0,
          0,
          0,
          0
        ],
        "spreadBaseC2": 0.7122,
        "spreadScale": 0.05,
        "cvMaeC": 0.6465,
        "cvRmseC": 0.9586,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.659879,
          "ecmwfAifs": 0.184492,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.032758,
          "gem": 0.02,
          "jma": 0.042871
        },
        "interceptC": 0.0711,
        "diurnalHarmonicsC": [
          0.1696,
          -0.0458,
          0,
          0
        ],
        "driverBetasC": [
          0.0515,
          -0.0948,
          0.3964,
          -0.0437
        ],
        "spreadBaseC2": 0.2367,
        "spreadScale": 0.05,
        "cvMaeC": 0.4487,
        "cvRmseC": 0.6181,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.636422,
          "ecmwfAifs": 0.178675,
          "icon": 0.02507,
          "ukmo": 0.022124,
          "meteofrance": 0.02,
          "gfs": 0.053149,
          "gem": 0.02,
          "jma": 0.04456
        },
        "interceptC": 0.0494,
        "diurnalHarmonicsC": [
          0.1373,
          -0.0364,
          0,
          0
        ],
        "driverBetasC": [
          0.033,
          -0.0784,
          0.2672,
          -0.044
        ],
        "spreadBaseC2": 0.2414,
        "spreadScale": 0.05,
        "cvMaeC": 0.4554,
        "cvRmseC": 0.6218,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.612966,
          "ecmwfAifs": 0.172857,
          "icon": 0.03014,
          "ukmo": 0.024248,
          "meteofrance": 0.02,
          "gfs": 0.07354,
          "gem": 0.02,
          "jma": 0.046249
        },
        "interceptC": 0.0278,
        "diurnalHarmonicsC": [
          0.105,
          -0.0271,
          0,
          0
        ],
        "driverBetasC": [
          0.0144,
          -0.062,
          0.138,
          -0.0442
        ],
        "spreadBaseC2": 0.246,
        "spreadScale": 0.05,
        "cvMaeC": 0.462,
        "cvRmseC": 0.6255,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.573751,
          "ecmwfAifs": 0.166478,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.159771,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.2499,
          -0.0838,
          0,
          0
        ],
        "driverBetasC": [
          0.2221,
          -0.1866,
          0.1256,
          -0.2189
        ],
        "spreadBaseC2": 0.352,
        "spreadScale": 0.07,
        "cvMaeC": 0.5417,
        "cvRmseC": 0.7287,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.571365,
          "ecmwfAifs": 0.170593,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.158042,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1917,
          -0.0635,
          0,
          0
        ],
        "driverBetasC": [
          0.154,
          -0.1416,
          0.0869,
          -0.1469
        ],
        "spreadBaseC2": 0.3471,
        "spreadScale": 0.0742,
        "cvMaeC": 0.5455,
        "cvRmseC": 0.7328,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.568978,
          "ecmwfAifs": 0.174709,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.156313,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1335,
          -0.0433,
          0,
          0
        ],
        "driverBetasC": [
          0.0859,
          -0.0965,
          0.0483,
          -0.075
        ],
        "spreadBaseC2": 0.3423,
        "spreadScale": 0.0784,
        "cvMaeC": 0.5494,
        "cvRmseC": 0.7368,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.246986,
        "ecmwfAifs": 0.083824,
        "icon": 0.227264,
        "ukmo": 0.102849,
        "meteofrance": 0.151623,
        "gfs": 0.066076,
        "gem": 0.060435,
        "jma": 0.060943
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.259754,
        "ecmwfAifs": 0.070497,
        "icon": 0.215625,
        "ukmo": 0.119879,
        "meteofrance": 0.155889,
        "gfs": 0.066009,
        "gem": 0.055053,
        "jma": 0.057294
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.257002,
        "ecmwfAifs": 0.059711,
        "icon": 0.225019,
        "ukmo": 0.127126,
        "meteofrance": 0.157547,
        "gfs": 0.063191,
        "gem": 0.055299,
        "jma": 0.055105
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.261448,
        "ecmwfAifs": 0.066613,
        "icon": 0.219435,
        "ukmo": 0.121263,
        "meteofrance": 0.151426,
        "gfs": 0.067037,
        "gem": 0.054953,
        "jma": 0.057825
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.273771,
    "ecmwfAifs": 0.066332,
    "icon": 0.2268,
    "ukmo": 0.152936,
    "meteofrance": 0.103183,
    "gfs": 0.103276,
    "gem": 0.036851,
    "jma": 0.036851
  },
  "pressureWeights": {
    "ecmwfIfs": 0.493372,
    "ecmwfAifs": 0.110499,
    "icon": 0.140609,
    "ukmo": 0.106054,
    "meteofrance": 0.058157,
    "gfs": 0.033151,
    "gem": 0.029079,
    "jma": 0.029079
  }
} as const;

export default PROVINCE_CALIBRATION_TR_29;
