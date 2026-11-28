import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_12: ProvinceCalibrationBundle = {
  "provinceCode": "TR-12",
  "provinceName": "Bingöl",
  "plateNumber": 12,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17203",
  "stationLat": 38.8667,
  "stationLon": 40.5,
  "stationElevationM": 1177,
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
        "intercept": -0.0148,
        "betaDrivers": [
          -0.1178,
          -0.0154,
          -0.0869,
          0.1715,
          -0.2387,
          -0.2231
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4013,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.268096,
            "ecmwfAifs": 0.085752,
            "icon": 0.213096,
            "ukmo": 0.114359,
            "meteofrance": 0.144965,
            "gfs": 0.062119,
            "gem": 0.054776,
            "jma": 0.056837
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6041,
          "logisticSlope": 4.2907,
          "wetFractionWeight": 3.9054,
          "powerEta": 0.68,
          "rawBrier": 0.04067,
          "calibratedBrier": 0.03498
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4982,
          "rawIfsRmseC": 0.7523,
          "rawEqualMaeC": 1.2759,
          "rawEqualRmseC": 1.6476,
          "cvSimplexMaeC": 0.5097,
          "cvCalibratedMaeC": 0.4872,
          "cvCalibratedRmseC": 0.7168
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
        "intercept": -0.0134,
        "betaDrivers": [
          -0.0682,
          -0.0188,
          -0.0368,
          0.0667,
          -0.0906,
          -0.1146
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4137,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.339824,
            "ecmwfAifs": 0.22676,
            "icon": 0.130398,
            "ukmo": 0.101507,
            "meteofrance": 0.043561,
            "gfs": 0.059733,
            "gem": 0.052672,
            "jma": 0.045545
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6292,
          "logisticSlope": 4.8397,
          "wetFractionWeight": 3.4313,
          "powerEta": 0.68,
          "rawBrier": 0.04067,
          "calibratedBrier": 0.03394
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.4982,
          "rawIfsRmseC": 0.7523,
          "rawEqualMaeC": 1.2759,
          "rawEqualRmseC": 1.6476,
          "cvSimplexMaeC": 0.5097,
          "cvCalibratedMaeC": 0.4909,
          "cvCalibratedRmseC": 0.7255
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
        "intercept": -0.1727,
        "betaDrivers": [
          -0.0954,
          -0.1348,
          -0.0248,
          0.0416,
          -0.1325,
          -0.0537
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5934,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258849,
            "ecmwfAifs": 0.071347,
            "icon": 0.222126,
            "ukmo": 0.121259,
            "meteofrance": 0.145415,
            "gfs": 0.066731,
            "gem": 0.055255,
            "jma": 0.059018
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.879,
          "logisticSlope": 2.9537,
          "wetFractionWeight": 3.1536,
          "powerEta": 0.68,
          "rawBrier": 0.06887,
          "calibratedBrier": 0.06067
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5314,
          "rawIfsRmseC": 0.8676,
          "rawEqualMaeC": 1.2856,
          "rawEqualRmseC": 1.6393,
          "cvSimplexMaeC": 0.5567,
          "cvCalibratedMaeC": 0.5225,
          "cvCalibratedRmseC": 0.83
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
        "intercept": -0.1279,
        "betaDrivers": [
          -0.0524,
          -0.0759,
          -0.0174,
          0.0182,
          -0.0469,
          -0.0311
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5955,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.338771,
            "ecmwfAifs": 0.194802,
            "icon": 0.140343,
            "ukmo": 0.111132,
            "meteofrance": 0.045005,
            "gfs": 0.066255,
            "gem": 0.054861,
            "jma": 0.048831
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9399,
          "logisticSlope": 3.0976,
          "wetFractionWeight": 3.3333,
          "powerEta": 0.68,
          "rawBrier": 0.06887,
          "calibratedBrier": 0.05841
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5314,
          "rawIfsRmseC": 0.8676,
          "rawEqualMaeC": 1.2856,
          "rawEqualRmseC": 1.6393,
          "cvSimplexMaeC": 0.5567,
          "cvCalibratedMaeC": 0.5262,
          "cvCalibratedRmseC": 0.8316
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.8332,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.039917,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.026883,
          "jma": 0.02
        },
        "intercept": -0.1496,
        "betaDrivers": [
          -0.0672,
          -0.0399,
          0.0413,
          0.0042,
          -0.1079,
          -0.1254
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1075,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236724,
            "ecmwfAifs": 0.082421,
            "icon": 0.226701,
            "ukmo": 0.123723,
            "meteofrance": 0.157304,
            "gfs": 0.066707,
            "gem": 0.048551,
            "jma": 0.057869
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.4584,
          "logisticSlope": 3.6315,
          "wetFractionWeight": 2.6384,
          "powerEta": 0.68,
          "rawBrier": 0.00723,
          "calibratedBrier": 0.00555
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3457,
          "rawIfsRmseC": 0.5822,
          "rawEqualMaeC": 0.7491,
          "rawEqualRmseC": 0.9578,
          "cvSimplexMaeC": 0.3449,
          "cvCalibratedMaeC": 0.3279,
          "cvCalibratedRmseC": 0.5458
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.831391,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.034741,
          "meteofrance": 0.021968,
          "gfs": 0.025123,
          "gem": 0.026777,
          "jma": 0.02
        },
        "intercept": -0.1234,
        "betaDrivers": [
          -0.0527,
          -0.0331,
          0.0164,
          0.0104,
          -0.0565,
          -0.076
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1075,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.310155,
            "ecmwfAifs": 0.225283,
            "icon": 0.14339,
            "ukmo": 0.113514,
            "meteofrance": 0.045166,
            "gfs": 0.066303,
            "gem": 0.048257,
            "jma": 0.047932
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.5006,
          "logisticSlope": 3.4421,
          "wetFractionWeight": 3.1182,
          "powerEta": 0.68,
          "rawBrier": 0.00723,
          "calibratedBrier": 0.00538
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3457,
          "rawIfsRmseC": 0.5822,
          "rawEqualMaeC": 0.7491,
          "rawEqualRmseC": 0.9578,
          "cvSimplexMaeC": 0.3455,
          "cvCalibratedMaeC": 0.3313,
          "cvCalibratedRmseC": 0.5468
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.827941,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.052059,
          "jma": 0.02
        },
        "intercept": -0.1465,
        "betaDrivers": [
          0.0193,
          -0.1039,
          0.0243,
          -0.0605,
          -0.1149,
          -0.1268
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2797,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249773,
            "ecmwfAifs": 0.080163,
            "icon": 0.216052,
            "ukmo": 0.120169,
            "meteofrance": 0.147743,
            "gfs": 0.070052,
            "gem": 0.058457,
            "jma": 0.057591
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4024,
          "logisticSlope": 3.7895,
          "wetFractionWeight": 2.5709,
          "powerEta": 0.68,
          "rawBrier": 0.03049,
          "calibratedBrier": 0.02647
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.3994,
          "rawIfsRmseC": 0.6621,
          "rawEqualMaeC": 0.9618,
          "rawEqualRmseC": 1.216,
          "cvSimplexMaeC": 0.4145,
          "cvCalibratedMaeC": 0.3958,
          "cvCalibratedRmseC": 0.6246
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.839942,
          "ecmwfAifs": 0.02,
          "icon": 0.020194,
          "ukmo": 0.025385,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.034479,
          "jma": 0.02
        },
        "intercept": -0.1336,
        "betaDrivers": [
          0.0048,
          -0.0791,
          0.002,
          -0.019,
          -0.0453,
          -0.0813
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2834,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.322618,
            "ecmwfAifs": 0.21601,
            "icon": 0.13472,
            "ukmo": 0.108693,
            "meteofrance": 0.04501,
            "gfs": 0.068642,
            "gem": 0.057281,
            "jma": 0.047026
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4539,
          "logisticSlope": 3.6826,
          "wetFractionWeight": 2.7869,
          "powerEta": 0.68,
          "rawBrier": 0.03049,
          "calibratedBrier": 0.02588
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.3994,
          "rawIfsRmseC": 0.6621,
          "rawEqualMaeC": 0.9618,
          "rawEqualRmseC": 1.216,
          "cvSimplexMaeC": 0.4166,
          "cvCalibratedMaeC": 0.3967,
          "cvCalibratedRmseC": 0.6275
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
        "interceptC": -0.0148,
        "diurnalHarmonicsC": [
          -0.1178,
          -0.0154,
          0,
          0
        ],
        "driverBetasC": [
          -0.0869,
          -0.2231,
          0.1715,
          -0.2387
        ],
        "spreadBaseC2": 0.4013,
        "spreadScale": 0.05,
        "cvMaeC": 0.4872,
        "cvRmseC": 0.7168,
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
        "interceptC": -0.0141,
        "diurnalHarmonicsC": [
          -0.093,
          -0.0171,
          0,
          0
        ],
        "driverBetasC": [
          -0.0619,
          -0.1689,
          0.1191,
          -0.1646
        ],
        "spreadBaseC2": 0.4075,
        "spreadScale": 0.05,
        "cvMaeC": 0.489,
        "cvRmseC": 0.7211,
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
        "interceptC": -0.0134,
        "diurnalHarmonicsC": [
          -0.0682,
          -0.0188,
          0,
          0
        ],
        "driverBetasC": [
          -0.0368,
          -0.1146,
          0.0667,
          -0.0906
        ],
        "spreadBaseC2": 0.4137,
        "spreadScale": 0.05,
        "cvMaeC": 0.4909,
        "cvRmseC": 0.7255,
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
        "interceptC": -0.1727,
        "diurnalHarmonicsC": [
          -0.0954,
          -0.1348,
          0,
          0
        ],
        "driverBetasC": [
          -0.0248,
          -0.0537,
          0.0416,
          -0.1325
        ],
        "spreadBaseC2": 0.5934,
        "spreadScale": 0.05,
        "cvMaeC": 0.5225,
        "cvRmseC": 0.83,
        "sampleHours": 4185
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
        "interceptC": -0.1503,
        "diurnalHarmonicsC": [
          -0.0739,
          -0.1053,
          0,
          0
        ],
        "driverBetasC": [
          -0.0211,
          -0.0424,
          0.0299,
          -0.0897
        ],
        "spreadBaseC2": 0.5945,
        "spreadScale": 0.05,
        "cvMaeC": 0.5243,
        "cvRmseC": 0.8308,
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
        "interceptC": -0.1279,
        "diurnalHarmonicsC": [
          -0.0524,
          -0.0759,
          0,
          0
        ],
        "driverBetasC": [
          -0.0174,
          -0.0311,
          0.0182,
          -0.0469
        ],
        "spreadBaseC2": 0.5955,
        "spreadScale": 0.05,
        "cvMaeC": 0.5262,
        "cvRmseC": 0.8316,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.8332,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.039917,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.026883,
          "jma": 0.02
        },
        "interceptC": -0.1496,
        "diurnalHarmonicsC": [
          -0.0672,
          -0.0399,
          0,
          0
        ],
        "driverBetasC": [
          0.0413,
          -0.1254,
          0.0042,
          -0.1079
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1075,
        "cvMaeC": 0.3279,
        "cvRmseC": 0.5458,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.832296,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.037329,
          "meteofrance": 0.020984,
          "gfs": 0.022561,
          "gem": 0.02683,
          "jma": 0.02
        },
        "interceptC": -0.1365,
        "diurnalHarmonicsC": [
          -0.0599,
          -0.0365,
          0,
          0
        ],
        "driverBetasC": [
          0.0289,
          -0.1007,
          0.0073,
          -0.0822
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1075,
        "cvMaeC": 0.3296,
        "cvRmseC": 0.5463,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.831391,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.034741,
          "meteofrance": 0.021968,
          "gfs": 0.025123,
          "gem": 0.026777,
          "jma": 0.02
        },
        "interceptC": -0.1234,
        "diurnalHarmonicsC": [
          -0.0527,
          -0.0331,
          0,
          0
        ],
        "driverBetasC": [
          0.0164,
          -0.076,
          0.0104,
          -0.0565
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1075,
        "cvMaeC": 0.3313,
        "cvRmseC": 0.5468,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.827941,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.052059,
          "jma": 0.02
        },
        "interceptC": -0.1465,
        "diurnalHarmonicsC": [
          0.0193,
          -0.1039,
          0,
          0
        ],
        "driverBetasC": [
          0.0243,
          -0.1268,
          -0.0605,
          -0.1149
        ],
        "spreadBaseC2": 0.2797,
        "spreadScale": 0.05,
        "cvMaeC": 0.3958,
        "cvRmseC": 0.6246,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.833941,
          "ecmwfAifs": 0.02,
          "icon": 0.020097,
          "ukmo": 0.022693,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.043269,
          "jma": 0.02
        },
        "interceptC": -0.1401,
        "diurnalHarmonicsC": [
          0.012,
          -0.0915,
          0,
          0
        ],
        "driverBetasC": [
          0.0131,
          -0.1041,
          -0.0398,
          -0.0801
        ],
        "spreadBaseC2": 0.2815,
        "spreadScale": 0.05,
        "cvMaeC": 0.3962,
        "cvRmseC": 0.626,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.839942,
          "ecmwfAifs": 0.02,
          "icon": 0.020194,
          "ukmo": 0.025385,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.034479,
          "jma": 0.02
        },
        "interceptC": -0.1336,
        "diurnalHarmonicsC": [
          0.0048,
          -0.0791,
          0,
          0
        ],
        "driverBetasC": [
          0.002,
          -0.0813,
          -0.019,
          -0.0453
        ],
        "spreadBaseC2": 0.2834,
        "spreadScale": 0.05,
        "cvMaeC": 0.3967,
        "cvRmseC": 0.6275,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.268096,
        "ecmwfAifs": 0.085752,
        "icon": 0.213096,
        "ukmo": 0.114359,
        "meteofrance": 0.144965,
        "gfs": 0.062119,
        "gem": 0.054776,
        "jma": 0.056837
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.258849,
        "ecmwfAifs": 0.071347,
        "icon": 0.222126,
        "ukmo": 0.121259,
        "meteofrance": 0.145415,
        "gfs": 0.066731,
        "gem": 0.055255,
        "jma": 0.059018
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.236724,
        "ecmwfAifs": 0.082421,
        "icon": 0.226701,
        "ukmo": 0.123723,
        "meteofrance": 0.157304,
        "gfs": 0.066707,
        "gem": 0.048551,
        "jma": 0.057869
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.249773,
        "ecmwfAifs": 0.080163,
        "icon": 0.216052,
        "ukmo": 0.120169,
        "meteofrance": 0.147743,
        "gfs": 0.070052,
        "gem": 0.058457,
        "jma": 0.057591
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.319365,
    "ecmwfAifs": 0.062154,
    "icon": 0.222905,
    "ukmo": 0.137381,
    "meteofrance": 0.096683,
    "gfs": 0.092452,
    "gem": 0.03453,
    "jma": 0.03453
  },
  "pressureWeights": {
    "ecmwfIfs": 0.587071,
    "ecmwfAifs": 0.09405,
    "icon": 0.101075,
    "ukmo": 0.100152,
    "meteofrance": 0.049172,
    "gfs": 0.02,
    "gem": 0.02424,
    "jma": 0.02424
  }
} as const;

export default PROVINCE_CALIBRATION_TR_12;
