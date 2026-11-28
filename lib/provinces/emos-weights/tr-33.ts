import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_33: ProvinceCalibrationBundle = {
  "provinceCode": "TR-33",
  "provinceName": "Mersin",
  "plateNumber": 33,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17340",
  "stationLat": 36.8167,
  "stationLon": 34.6,
  "stationElevationM": 3,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17088,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.790626,
          "ecmwfAifs": 0.072009,
          "icon": 0.02,
          "ukmo": 0.037365,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1326,
        "betaDrivers": [
          -0.0876,
          -0.0301,
          -0.007,
          0.0615,
          0.06,
          0.015
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.372,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238904,
            "ecmwfAifs": 0.07395,
            "icon": 0.225417,
            "ukmo": 0.12748,
            "meteofrance": 0.154788,
            "gfs": 0.070449,
            "gem": 0.058715,
            "jma": 0.050297
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5191,
          "logisticSlope": 3.8621,
          "wetFractionWeight": 3.3788,
          "powerEta": 0.68,
          "rawBrier": 0.03551,
          "calibratedBrier": 0.03215
        },
        "verification": {
          "sampleHours": 4282,
          "rawIfsMaeC": 0.5457,
          "rawIfsRmseC": 0.7404,
          "rawEqualMaeC": 1.1541,
          "rawEqualRmseC": 1.4888,
          "cvSimplexMaeC": 0.5023,
          "cvCalibratedMaeC": 0.4846,
          "cvCalibratedRmseC": 0.666
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.718555,
          "ecmwfAifs": 0.086421,
          "icon": 0.02,
          "ukmo": 0.095024,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.126,
        "betaDrivers": [
          -0.0913,
          -0.0395,
          -0.0516,
          0.0453,
          0.0515,
          -0.0151
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3705,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.316364,
            "ecmwfAifs": 0.204296,
            "icon": 0.144106,
            "ukmo": 0.118215,
            "meteofrance": 0.045155,
            "gfs": 0.070772,
            "gem": 0.058985,
            "jma": 0.042107
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5734,
          "logisticSlope": 3.6352,
          "wetFractionWeight": 3.3725,
          "powerEta": 0.68,
          "rawBrier": 0.03551,
          "calibratedBrier": 0.03223
        },
        "verification": {
          "sampleHours": 4282,
          "rawIfsMaeC": 0.5457,
          "rawIfsRmseC": 0.7404,
          "rawEqualMaeC": 1.1541,
          "rawEqualRmseC": 1.4888,
          "cvSimplexMaeC": 0.5139,
          "cvCalibratedMaeC": 0.4897,
          "cvCalibratedRmseC": 0.6649
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.72468,
          "ecmwfAifs": 0.086837,
          "icon": 0.049583,
          "ukmo": 0.0589,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1267,
        "betaDrivers": [
          -0.1702,
          -0.1423,
          0.1465,
          0.189,
          -0.0503,
          0.1283
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2788,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251189,
            "ecmwfAifs": 0.078443,
            "icon": 0.223359,
            "ukmo": 0.126039,
            "meteofrance": 0.152358,
            "gfs": 0.061613,
            "gem": 0.059476,
            "jma": 0.047523
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8248,
          "logisticSlope": 2.8553,
          "wetFractionWeight": 2.5972,
          "powerEta": 0.68,
          "rawBrier": 0.05496,
          "calibratedBrier": 0.04449
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6731,
          "rawIfsRmseC": 0.9605,
          "rawEqualMaeC": 0.9455,
          "rawEqualRmseC": 1.301,
          "cvSimplexMaeC": 0.626,
          "cvCalibratedMaeC": 0.6143,
          "cvCalibratedRmseC": 0.8818
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.644178,
          "ecmwfAifs": 0.094426,
          "icon": 0.061928,
          "ukmo": 0.119468,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0772,
        "betaDrivers": [
          -0.1088,
          -0.0729,
          0.0395,
          0.068,
          -0.0233,
          0.0462
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2851,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.327312,
            "ecmwfAifs": 0.213241,
            "icon": 0.140505,
            "ukmo": 0.115008,
            "meteofrance": 0.045089,
            "gfs": 0.060905,
            "gem": 0.058793,
            "jma": 0.039147
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9333,
          "logisticSlope": 2.893,
          "wetFractionWeight": 2.8179,
          "powerEta": 0.68,
          "rawBrier": 0.05496,
          "calibratedBrier": 0.04274
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6731,
          "rawIfsRmseC": 0.9605,
          "rawEqualMaeC": 0.9455,
          "rawEqualRmseC": 1.301,
          "cvSimplexMaeC": 0.6312,
          "cvCalibratedMaeC": 0.6241,
          "cvCalibratedRmseC": 0.8882
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.59289,
          "ecmwfAifs": 0.084256,
          "icon": 0.18754,
          "ukmo": 0.040836,
          "meteofrance": 0.034478,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0713,
        "betaDrivers": [
          -0.212,
          -0.101,
          0.1841,
          0.1771,
          -0.2213,
          0.0225
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1371,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247376,
            "ecmwfAifs": 0.070597,
            "icon": 0.229661,
            "ukmo": 0.130682,
            "meteofrance": 0.148176,
            "gfs": 0.065092,
            "gem": 0.062168,
            "jma": 0.046248
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.3847,
          "logisticSlope": 2.8286,
          "wetFractionWeight": 1.6705,
          "powerEta": 0.68,
          "rawBrier": 0.01377,
          "calibratedBrier": 0.00594
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.6003,
          "rawIfsRmseC": 0.7777,
          "rawEqualMaeC": 0.5898,
          "rawEqualRmseC": 0.7855,
          "cvSimplexMaeC": 0.4238,
          "cvCalibratedMaeC": 0.4138,
          "cvCalibratedRmseC": 0.5564
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.567441,
          "ecmwfAifs": 0.097339,
          "icon": 0.144465,
          "ukmo": 0.068159,
          "meteofrance": 0.062596,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0192,
        "betaDrivers": [
          -0.0947,
          -0.0108,
          0.0717,
          0.053,
          -0.0796,
          0.0008
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1366,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.326815,
            "ecmwfAifs": 0.194576,
            "icon": 0.146475,
            "ukmo": 0.1209,
            "meteofrance": 0.045061,
            "gfs": 0.065238,
            "gem": 0.062308,
            "jma": 0.038627
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.4653,
          "logisticSlope": 3.196,
          "wetFractionWeight": 2.0269,
          "powerEta": 0.68,
          "rawBrier": 0.01377,
          "calibratedBrier": 0.00589
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.6003,
          "rawIfsRmseC": 0.7777,
          "rawEqualMaeC": 0.5898,
          "rawEqualRmseC": 0.7855,
          "cvSimplexMaeC": 0.4219,
          "cvCalibratedMaeC": 0.4182,
          "cvCalibratedRmseC": 0.5614
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.772534,
          "ecmwfAifs": 0.084938,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.042528,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0778,
        "betaDrivers": [
          -0.1858,
          -0.0559,
          0.0935,
          0.0336,
          -0.1509,
          0.1193
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2487,
        "spreadScale": 0.069,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25011,
            "ecmwfAifs": 0.070719,
            "icon": 0.222506,
            "ukmo": 0.127428,
            "meteofrance": 0.150768,
            "gfs": 0.060506,
            "gem": 0.065431,
            "jma": 0.052532
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4041,
          "logisticSlope": 2.7019,
          "wetFractionWeight": 3.2779,
          "powerEta": 0.68,
          "rawBrier": 0.03065,
          "calibratedBrier": 0.02282
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5422,
          "rawIfsRmseC": 0.713,
          "rawEqualMaeC": 0.9395,
          "rawEqualRmseC": 1.2275,
          "cvSimplexMaeC": 0.471,
          "cvCalibratedMaeC": 0.4554,
          "cvCalibratedRmseC": 0.6098
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.693492,
          "ecmwfAifs": 0.092372,
          "icon": 0.037931,
          "ukmo": 0.083068,
          "meteofrance": 0.033137,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0505,
        "betaDrivers": [
          -0.1368,
          -0.0351,
          0.0288,
          0.0092,
          -0.074,
          0.058
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2346,
        "spreadScale": 0.0862,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330313,
            "ecmwfAifs": 0.194845,
            "icon": 0.141863,
            "ukmo": 0.117848,
            "meteofrance": 0.045095,
            "gfs": 0.060621,
            "gem": 0.065555,
            "jma": 0.04386
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5129,
          "logisticSlope": 2.453,
          "wetFractionWeight": 3.729,
          "powerEta": 0.68,
          "rawBrier": 0.03065,
          "calibratedBrier": 0.022
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5422,
          "rawIfsRmseC": 0.713,
          "rawEqualMaeC": 0.9395,
          "rawEqualRmseC": 1.2275,
          "cvSimplexMaeC": 0.4816,
          "cvCalibratedMaeC": 0.4678,
          "cvCalibratedRmseC": 0.6232
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.790626,
          "ecmwfAifs": 0.072009,
          "icon": 0.02,
          "ukmo": 0.037365,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1326,
        "diurnalHarmonicsC": [
          -0.0876,
          -0.0301,
          0,
          0
        ],
        "driverBetasC": [
          -0.007,
          0.015,
          0.0615,
          0.06
        ],
        "spreadBaseC2": 0.372,
        "spreadScale": 0.05,
        "cvMaeC": 0.4846,
        "cvRmseC": 0.666,
        "sampleHours": 4282
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.754591,
          "ecmwfAifs": 0.079215,
          "icon": 0.02,
          "ukmo": 0.066194,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1293,
        "diurnalHarmonicsC": [
          -0.0895,
          -0.0348,
          0,
          0
        ],
        "driverBetasC": [
          -0.0293,
          -0.0001,
          0.0534,
          0.0557
        ],
        "spreadBaseC2": 0.3712,
        "spreadScale": 0.05,
        "cvMaeC": 0.4871,
        "cvRmseC": 0.6655,
        "sampleHours": 4282
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.718555,
          "ecmwfAifs": 0.086421,
          "icon": 0.02,
          "ukmo": 0.095024,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.126,
        "diurnalHarmonicsC": [
          -0.0913,
          -0.0395,
          0,
          0
        ],
        "driverBetasC": [
          -0.0516,
          -0.0151,
          0.0453,
          0.0515
        ],
        "spreadBaseC2": 0.3705,
        "spreadScale": 0.05,
        "cvMaeC": 0.4897,
        "cvRmseC": 0.6649,
        "sampleHours": 4282
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.72468,
          "ecmwfAifs": 0.086837,
          "icon": 0.049583,
          "ukmo": 0.0589,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1267,
        "diurnalHarmonicsC": [
          -0.1702,
          -0.1423,
          0,
          0
        ],
        "driverBetasC": [
          0.1465,
          0.1283,
          0.189,
          -0.0503
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2788,
        "cvMaeC": 0.6143,
        "cvRmseC": 0.8818,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.684428,
          "ecmwfAifs": 0.090632,
          "icon": 0.055756,
          "ukmo": 0.089184,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.102,
        "diurnalHarmonicsC": [
          -0.1395,
          -0.1076,
          0,
          0
        ],
        "driverBetasC": [
          0.093,
          0.0872,
          0.1285,
          -0.0368
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.282,
        "cvMaeC": 0.6192,
        "cvRmseC": 0.885,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.644178,
          "ecmwfAifs": 0.094426,
          "icon": 0.061928,
          "ukmo": 0.119468,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0772,
        "diurnalHarmonicsC": [
          -0.1088,
          -0.0729,
          0,
          0
        ],
        "driverBetasC": [
          0.0395,
          0.0462,
          0.068,
          -0.0233
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.2851,
        "cvMaeC": 0.6241,
        "cvRmseC": 0.8882,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.59289,
          "ecmwfAifs": 0.084256,
          "icon": 0.18754,
          "ukmo": 0.040836,
          "meteofrance": 0.034478,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0713,
        "diurnalHarmonicsC": [
          -0.212,
          -0.101,
          0,
          0
        ],
        "driverBetasC": [
          0.1841,
          0.0225,
          0.1771,
          -0.2213
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1371,
        "cvMaeC": 0.4138,
        "cvRmseC": 0.5564,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.580165,
          "ecmwfAifs": 0.090798,
          "icon": 0.166002,
          "ukmo": 0.054498,
          "meteofrance": 0.048537,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0452,
        "diurnalHarmonicsC": [
          -0.1533,
          -0.0559,
          0,
          0
        ],
        "driverBetasC": [
          0.1279,
          0.0116,
          0.115,
          -0.1505
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1368,
        "cvMaeC": 0.416,
        "cvRmseC": 0.5589,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.567441,
          "ecmwfAifs": 0.097339,
          "icon": 0.144465,
          "ukmo": 0.068159,
          "meteofrance": 0.062596,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0192,
        "diurnalHarmonicsC": [
          -0.0947,
          -0.0108,
          0,
          0
        ],
        "driverBetasC": [
          0.0717,
          0.0008,
          0.053,
          -0.0796
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1366,
        "cvMaeC": 0.4182,
        "cvRmseC": 0.5614,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.772534,
          "ecmwfAifs": 0.084938,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.042528,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0778,
        "diurnalHarmonicsC": [
          -0.1858,
          -0.0559,
          0,
          0
        ],
        "driverBetasC": [
          0.0935,
          0.1193,
          0.0336,
          -0.1509
        ],
        "spreadBaseC2": 0.2487,
        "spreadScale": 0.069,
        "cvMaeC": 0.4554,
        "cvRmseC": 0.6098,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.733012,
          "ecmwfAifs": 0.088655,
          "icon": 0.028966,
          "ukmo": 0.051534,
          "meteofrance": 0.037833,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0641,
        "diurnalHarmonicsC": [
          -0.1613,
          -0.0455,
          0,
          0
        ],
        "driverBetasC": [
          0.0611,
          0.0887,
          0.0214,
          -0.1124
        ],
        "spreadBaseC2": 0.2417,
        "spreadScale": 0.0776,
        "cvMaeC": 0.4616,
        "cvRmseC": 0.6165,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.693492,
          "ecmwfAifs": 0.092372,
          "icon": 0.037931,
          "ukmo": 0.083068,
          "meteofrance": 0.033137,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0505,
        "diurnalHarmonicsC": [
          -0.1368,
          -0.0351,
          0,
          0
        ],
        "driverBetasC": [
          0.0288,
          0.058,
          0.0092,
          -0.074
        ],
        "spreadBaseC2": 0.2346,
        "spreadScale": 0.0862,
        "cvMaeC": 0.4678,
        "cvRmseC": 0.6232,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.238904,
        "ecmwfAifs": 0.07395,
        "icon": 0.225417,
        "ukmo": 0.12748,
        "meteofrance": 0.154788,
        "gfs": 0.070449,
        "gem": 0.058715,
        "jma": 0.050297
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.251189,
        "ecmwfAifs": 0.078443,
        "icon": 0.223359,
        "ukmo": 0.126039,
        "meteofrance": 0.152358,
        "gfs": 0.061613,
        "gem": 0.059476,
        "jma": 0.047523
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.247376,
        "ecmwfAifs": 0.070597,
        "icon": 0.229661,
        "ukmo": 0.130682,
        "meteofrance": 0.148176,
        "gfs": 0.065092,
        "gem": 0.062168,
        "jma": 0.046248
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.25011,
        "ecmwfAifs": 0.070719,
        "icon": 0.222506,
        "ukmo": 0.127428,
        "meteofrance": 0.150768,
        "gfs": 0.060506,
        "gem": 0.065431,
        "jma": 0.052532
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.23045,
    "ecmwfAifs": 0.070248,
    "icon": 0.258147,
    "ukmo": 0.155862,
    "meteofrance": 0.109274,
    "gfs": 0.097965,
    "gem": 0.039027,
    "jma": 0.039027
  },
  "pressureWeights": {
    "ecmwfIfs": 0.341389,
    "ecmwfAifs": 0.142129,
    "icon": 0.114071,
    "ukmo": 0.180468,
    "meteofrance": 0.074805,
    "gfs": 0.072334,
    "gem": 0.037402,
    "jma": 0.037402
  }
} as const;

export default PROVINCE_CALIBRATION_TR_33;
