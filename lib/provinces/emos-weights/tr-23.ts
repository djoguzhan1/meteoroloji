import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_23: ProvinceCalibrationBundle = {
  "provinceCode": "TR-23",
  "provinceName": "Elazığ",
  "plateNumber": 23,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17202",
  "stationLat": 38.6,
  "stationLon": 39.2833,
  "stationElevationM": 902,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.038498,
          "ecmwfAifs": 0.02,
          "icon": 0.12555,
          "ukmo": 0.101336,
          "meteofrance": 0.411554,
          "gfs": 0.02,
          "gem": 0.263062,
          "jma": 0.02
        },
        "intercept": 0.1639,
        "betaDrivers": [
          -0.1096,
          -0.1758,
          -0.7813,
          0.0067,
          0.3054,
          0.1197
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.3663,
        "spreadScale": 0.5511,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250808,
            "ecmwfAifs": 0.080237,
            "icon": 0.2171,
            "ukmo": 0.122521,
            "meteofrance": 0.156705,
            "gfs": 0.067519,
            "gem": 0.054962,
            "jma": 0.050148
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2701,
          "logisticSlope": 4.9904,
          "wetFractionWeight": 3.0833,
          "powerEta": 0.68,
          "rawBrier": 0.03754,
          "calibratedBrier": 0.03509
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.6429,
          "rawIfsRmseC": 2.1358,
          "rawEqualMaeC": 1.5169,
          "rawEqualRmseC": 1.9898,
          "cvSimplexMaeC": 1.3159,
          "cvCalibratedMaeC": 1.2753,
          "cvCalibratedRmseC": 1.615
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.217831,
          "ecmwfAifs": 0.034864,
          "icon": 0.185457,
          "ukmo": 0.142549,
          "meteofrance": 0.174881,
          "gfs": 0.02,
          "gem": 0.204418,
          "jma": 0.02
        },
        "intercept": 0.0668,
        "betaDrivers": [
          -0.1165,
          -0.1447,
          -0.2987,
          -0.0053,
          0.1432,
          0.095
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0765,
        "spreadScale": 0.7593,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.326531,
            "ecmwfAifs": 0.217928,
            "icon": 0.13645,
            "ukmo": 0.111701,
            "meteofrance": 0.045145,
            "gfs": 0.066686,
            "gem": 0.054284,
            "jma": 0.041275
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3182,
          "logisticSlope": 4.6846,
          "wetFractionWeight": 3.1112,
          "powerEta": 0.68,
          "rawBrier": 0.03754,
          "calibratedBrier": 0.03513
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.6429,
          "rawIfsRmseC": 2.1358,
          "rawEqualMaeC": 1.5169,
          "rawEqualRmseC": 1.9898,
          "cvSimplexMaeC": 1.338,
          "cvCalibratedMaeC": 1.3066,
          "cvCalibratedRmseC": 1.6718
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.391498,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.488502,
          "jma": 0.02
        },
        "intercept": -0.3876,
        "betaDrivers": [
          -0.1113,
          -0.6317,
          -0.4697,
          -0.1321,
          0.101,
          0.1157
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.9736,
        "spreadScale": 0.704,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247643,
            "ecmwfAifs": 0.072228,
            "icon": 0.216367,
            "ukmo": 0.118662,
            "meteofrance": 0.164526,
            "gfs": 0.064234,
            "gem": 0.061097,
            "jma": 0.055243
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9078,
          "logisticSlope": 3.6936,
          "wetFractionWeight": 2.6251,
          "powerEta": 0.68,
          "rawBrier": 0.05619,
          "calibratedBrier": 0.05141
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 2.0167,
          "rawIfsRmseC": 2.7226,
          "rawEqualMaeC": 1.9583,
          "rawEqualRmseC": 2.59,
          "cvSimplexMaeC": 1.5563,
          "cvCalibratedMaeC": 1.4503,
          "cvCalibratedRmseC": 1.8632
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.166936,
          "ecmwfAifs": 0.02,
          "icon": 0.324715,
          "ukmo": 0.099484,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.328865,
          "jma": 0.02
        },
        "intercept": -0.4067,
        "betaDrivers": [
          -0.114,
          -0.4187,
          -0.2278,
          -0.0614,
          0.091,
          0.0842
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.4748,
        "spreadScale": 1.0466,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330259,
            "ecmwfAifs": 0.200952,
            "icon": 0.139299,
            "ukmo": 0.110816,
            "meteofrance": 0.045302,
            "gfs": 0.064985,
            "gem": 0.061812,
            "jma": 0.046575
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9607,
          "logisticSlope": 3.6838,
          "wetFractionWeight": 2.6561,
          "powerEta": 0.68,
          "rawBrier": 0.05619,
          "calibratedBrier": 0.05134
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 2.0167,
          "rawIfsRmseC": 2.7226,
          "rawEqualMaeC": 1.9583,
          "rawEqualRmseC": 2.59,
          "cvSimplexMaeC": 1.6103,
          "cvCalibratedMaeC": 1.4899,
          "cvCalibratedRmseC": 1.9197
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.05603,
          "ecmwfAifs": 0.02,
          "icon": 0.610943,
          "ukmo": 0.186548,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.066479,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1289,
          -0.4772,
          -0.1966,
          -0.0271,
          0.2391,
          -0.2066
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8848,
        "spreadScale": 0.7343,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.226168,
            "ecmwfAifs": 0.080457,
            "icon": 0.223578,
            "ukmo": 0.123863,
            "meteofrance": 0.164163,
            "gfs": 0.068805,
            "gem": 0.052822,
            "jma": 0.060144
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.4378,
          "logisticSlope": 1.074,
          "wetFractionWeight": 0.4894,
          "powerEta": 0.68,
          "rawBrier": 0.00243,
          "calibratedBrier": 0.00162
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8937,
          "rawIfsRmseC": 2.6304,
          "rawEqualMaeC": 1.8186,
          "rawEqualRmseC": 2.3445,
          "cvSimplexMaeC": 1.5519,
          "cvCalibratedMaeC": 1.4863,
          "cvCalibratedRmseC": 1.9444
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.256631,
          "ecmwfAifs": 0.02,
          "icon": 0.333287,
          "ukmo": 0.194966,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.135116,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0062,
          -0.4802,
          -0.1746,
          -0.0403,
          0.1649,
          -0.0863
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6671,
        "spreadScale": 0.8526,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.300321,
            "ecmwfAifs": 0.222883,
            "icon": 0.143323,
            "ukmo": 0.115176,
            "meteofrance": 0.045288,
            "gfs": 0.069311,
            "gem": 0.05321,
            "jma": 0.050488
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.4426,
          "logisticSlope": 1.2281,
          "wetFractionWeight": 0.6186,
          "powerEta": 0.68,
          "rawBrier": 0.00243,
          "calibratedBrier": 0.00162
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8937,
          "rawIfsRmseC": 2.6304,
          "rawEqualMaeC": 1.8186,
          "rawEqualRmseC": 2.3445,
          "cvSimplexMaeC": 1.5739,
          "cvCalibratedMaeC": 1.5006,
          "cvCalibratedRmseC": 1.9625
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.486438,
          "ukmo": 0.231612,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.18195,
          "jma": 0.02
        },
        "intercept": 0.1555,
        "betaDrivers": [
          0.0972,
          -0.6899,
          -0.4581,
          0.0781,
          0.3922,
          -0.1382
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.7815,
        "spreadScale": 0.4827,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244711,
            "ecmwfAifs": 0.072226,
            "icon": 0.223058,
            "ukmo": 0.121017,
            "meteofrance": 0.156051,
            "gfs": 0.068951,
            "gem": 0.059252,
            "jma": 0.054734
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7911,
          "logisticSlope": 4.4727,
          "wetFractionWeight": 3.1983,
          "powerEta": 0.68,
          "rawBrier": 0.01955,
          "calibratedBrier": 0.01678
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.9098,
          "rawIfsRmseC": 2.512,
          "rawEqualMaeC": 1.863,
          "rawEqualRmseC": 2.3528,
          "cvSimplexMaeC": 1.5273,
          "cvCalibratedMaeC": 1.4219,
          "cvCalibratedRmseC": 1.816
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.188667,
          "ecmwfAifs": 0.02,
          "icon": 0.33175,
          "ukmo": 0.217842,
          "meteofrance": 0.022438,
          "gfs": 0.02,
          "gem": 0.179303,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0268,
          -0.4306,
          -0.2472,
          0.0093,
          0.1723,
          -0.0077
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.7127,
        "spreadScale": 0.5112,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324669,
            "ecmwfAifs": 0.19991,
            "icon": 0.142868,
            "ukmo": 0.112434,
            "meteofrance": 0.045176,
            "gfs": 0.069398,
            "gem": 0.059637,
            "jma": 0.045908
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9886,
          "logisticSlope": 4.1808,
          "wetFractionWeight": 3.489,
          "powerEta": 0.68,
          "rawBrier": 0.01955,
          "calibratedBrier": 0.01577
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.9098,
          "rawIfsRmseC": 2.512,
          "rawEqualMaeC": 1.863,
          "rawEqualRmseC": 2.3528,
          "cvSimplexMaeC": 1.5395,
          "cvCalibratedMaeC": 1.446,
          "cvCalibratedRmseC": 1.8208
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.038498,
          "ecmwfAifs": 0.02,
          "icon": 0.12555,
          "ukmo": 0.101336,
          "meteofrance": 0.411554,
          "gfs": 0.02,
          "gem": 0.263062,
          "jma": 0.02
        },
        "interceptC": 0.1639,
        "diurnalHarmonicsC": [
          -0.1096,
          -0.1758,
          0,
          0
        ],
        "driverBetasC": [
          -0.7813,
          0.1197,
          0.0067,
          0.3054
        ],
        "spreadBaseC2": 1.3663,
        "spreadScale": 0.5511,
        "cvMaeC": 1.2753,
        "cvRmseC": 1.615,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.128164,
          "ecmwfAifs": 0.027432,
          "icon": 0.155504,
          "ukmo": 0.121942,
          "meteofrance": 0.293218,
          "gfs": 0.02,
          "gem": 0.23374,
          "jma": 0.02
        },
        "interceptC": 0.1153,
        "diurnalHarmonicsC": [
          -0.1131,
          -0.1603,
          0,
          0
        ],
        "driverBetasC": [
          -0.54,
          0.1074,
          0.0007,
          0.2243
        ],
        "spreadBaseC2": 1.2214,
        "spreadScale": 0.6552,
        "cvMaeC": 1.291,
        "cvRmseC": 1.6434,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.217831,
          "ecmwfAifs": 0.034864,
          "icon": 0.185457,
          "ukmo": 0.142549,
          "meteofrance": 0.174881,
          "gfs": 0.02,
          "gem": 0.204418,
          "jma": 0.02
        },
        "interceptC": 0.0668,
        "diurnalHarmonicsC": [
          -0.1165,
          -0.1447,
          0,
          0
        ],
        "driverBetasC": [
          -0.2987,
          0.095,
          -0.0053,
          0.1432
        ],
        "spreadBaseC2": 1.0765,
        "spreadScale": 0.7593,
        "cvMaeC": 1.3066,
        "cvRmseC": 1.6718,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.391498,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.488502,
          "jma": 0.02
        },
        "interceptC": -0.3876,
        "diurnalHarmonicsC": [
          -0.1113,
          -0.6317,
          0,
          0
        ],
        "driverBetasC": [
          -0.4697,
          0.1157,
          -0.1321,
          0.101
        ],
        "spreadBaseC2": 1.9736,
        "spreadScale": 0.704,
        "cvMaeC": 1.4503,
        "cvRmseC": 1.8632,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.093468,
          "ecmwfAifs": 0.02,
          "icon": 0.358107,
          "ukmo": 0.059742,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.408683,
          "jma": 0.02
        },
        "interceptC": -0.3972,
        "diurnalHarmonicsC": [
          -0.1127,
          -0.5252,
          0,
          0
        ],
        "driverBetasC": [
          -0.3488,
          0.0999,
          -0.0968,
          0.096
        ],
        "spreadBaseC2": 1.7242,
        "spreadScale": 0.8753,
        "cvMaeC": 1.4701,
        "cvRmseC": 1.8914,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.166936,
          "ecmwfAifs": 0.02,
          "icon": 0.324715,
          "ukmo": 0.099484,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.328865,
          "jma": 0.02
        },
        "interceptC": -0.4067,
        "diurnalHarmonicsC": [
          -0.114,
          -0.4187,
          0,
          0
        ],
        "driverBetasC": [
          -0.2278,
          0.0842,
          -0.0614,
          0.091
        ],
        "spreadBaseC2": 1.4748,
        "spreadScale": 1.0466,
        "cvMaeC": 1.4899,
        "cvRmseC": 1.9197,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.05603,
          "ecmwfAifs": 0.02,
          "icon": 0.610943,
          "ukmo": 0.186548,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.066479,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1289,
          -0.4772,
          0,
          0
        ],
        "driverBetasC": [
          -0.1966,
          -0.2066,
          -0.0271,
          0.2391
        ],
        "spreadBaseC2": 1.8848,
        "spreadScale": 0.7343,
        "cvMaeC": 1.4863,
        "cvRmseC": 1.9444,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.156331,
          "ecmwfAifs": 0.02,
          "icon": 0.472114,
          "ukmo": 0.190757,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.100798,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0675,
          -0.4787,
          0,
          0
        ],
        "driverBetasC": [
          -0.1856,
          -0.1464,
          -0.0337,
          0.202
        ],
        "spreadBaseC2": 1.7759,
        "spreadScale": 0.7934,
        "cvMaeC": 1.4934,
        "cvRmseC": 1.9534,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.256631,
          "ecmwfAifs": 0.02,
          "icon": 0.333287,
          "ukmo": 0.194966,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.135116,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0062,
          -0.4802,
          0,
          0
        ],
        "driverBetasC": [
          -0.1746,
          -0.0863,
          -0.0403,
          0.1649
        ],
        "spreadBaseC2": 1.6671,
        "spreadScale": 0.8526,
        "cvMaeC": 1.5006,
        "cvRmseC": 1.9625,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.486438,
          "ukmo": 0.231612,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.18195,
          "jma": 0.02
        },
        "interceptC": 0.1555,
        "diurnalHarmonicsC": [
          0.0972,
          -0.6899,
          0,
          0
        ],
        "driverBetasC": [
          -0.4581,
          -0.1382,
          0.0781,
          0.3922
        ],
        "spreadBaseC2": 1.7815,
        "spreadScale": 0.4827,
        "cvMaeC": 1.4219,
        "cvRmseC": 1.816,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.104334,
          "ecmwfAifs": 0.02,
          "icon": 0.409093,
          "ukmo": 0.224727,
          "meteofrance": 0.021219,
          "gfs": 0.02,
          "gem": 0.180627,
          "jma": 0.02
        },
        "interceptC": 0.0777,
        "diurnalHarmonicsC": [
          0.0352,
          -0.5602,
          0,
          0
        ],
        "driverBetasC": [
          -0.3527,
          -0.073,
          0.0437,
          0.2823
        ],
        "spreadBaseC2": 1.7471,
        "spreadScale": 0.497,
        "cvMaeC": 1.4339,
        "cvRmseC": 1.8184,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.188667,
          "ecmwfAifs": 0.02,
          "icon": 0.33175,
          "ukmo": 0.217842,
          "meteofrance": 0.022438,
          "gfs": 0.02,
          "gem": 0.179303,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0268,
          -0.4306,
          0,
          0
        ],
        "driverBetasC": [
          -0.2472,
          -0.0077,
          0.0093,
          0.1723
        ],
        "spreadBaseC2": 1.7127,
        "spreadScale": 0.5112,
        "cvMaeC": 1.446,
        "cvRmseC": 1.8208,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.250808,
        "ecmwfAifs": 0.080237,
        "icon": 0.2171,
        "ukmo": 0.122521,
        "meteofrance": 0.156705,
        "gfs": 0.067519,
        "gem": 0.054962,
        "jma": 0.050148
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.247643,
        "ecmwfAifs": 0.072228,
        "icon": 0.216367,
        "ukmo": 0.118662,
        "meteofrance": 0.164526,
        "gfs": 0.064234,
        "gem": 0.061097,
        "jma": 0.055243
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.226168,
        "ecmwfAifs": 0.080457,
        "icon": 0.223578,
        "ukmo": 0.123863,
        "meteofrance": 0.164163,
        "gfs": 0.068805,
        "gem": 0.052822,
        "jma": 0.060144
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.244711,
        "ecmwfAifs": 0.072226,
        "icon": 0.223058,
        "ukmo": 0.121017,
        "meteofrance": 0.156051,
        "gfs": 0.068951,
        "gem": 0.059252,
        "jma": 0.054734
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.221958,
    "ecmwfAifs": 0.072381,
    "icon": 0.251357,
    "ukmo": 0.173514,
    "meteofrance": 0.112593,
    "gfs": 0.087773,
    "gem": 0.040212,
    "jma": 0.040212
  },
  "pressureWeights": {
    "ecmwfIfs": 0.292818,
    "ecmwfAifs": 0.156106,
    "icon": 0.146175,
    "ukmo": 0.192097,
    "meteofrance": 0.082161,
    "gfs": 0.048481,
    "gem": 0.041081,
    "jma": 0.041081
  }
} as const;

export default PROVINCE_CALIBRATION_TR_23;
