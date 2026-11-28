import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_54: ProvinceCalibrationBundle = {
  "provinceCode": "TR-54",
  "provinceName": "Sakarya",
  "plateNumber": 54,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17069",
  "stationLat": 40.7833,
  "stationLon": 30.4167,
  "stationElevationM": 30,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.779832,
          "ecmwfAifs": 0.024502,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.095666,
          "jma": 0.02
        },
        "intercept": -0.1693,
        "betaDrivers": [
          -0.0171,
          -0.096,
          -0.0438,
          -0.0727,
          -0.0507,
          0.127
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4197,
        "spreadScale": 0.0698,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25148,
            "ecmwfAifs": 0.085686,
            "icon": 0.208939,
            "ukmo": 0.11314,
            "meteofrance": 0.166186,
            "gfs": 0.06374,
            "gem": 0.056804,
            "jma": 0.054025
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7817,
          "logisticSlope": 3.8469,
          "wetFractionWeight": 3.3881,
          "powerEta": 0.68,
          "rawBrier": 0.07205,
          "calibratedBrier": 0.06769
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5502,
          "rawIfsRmseC": 0.7871,
          "rawEqualMaeC": 0.9273,
          "rawEqualRmseC": 1.1664,
          "cvSimplexMaeC": 0.5113,
          "cvCalibratedMaeC": 0.4994,
          "cvCalibratedRmseC": 0.7194
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.722769,
          "ecmwfAifs": 0.041975,
          "icon": 0.022635,
          "ukmo": 0.033039,
          "meteofrance": 0.02,
          "gfs": 0.0453,
          "gem": 0.094282,
          "jma": 0.02
        },
        "intercept": -0.0708,
        "betaDrivers": [
          -0.0138,
          -0.0759,
          -0.0517,
          -0.0409,
          0.001,
          0.0526
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4295,
        "spreadScale": 0.0798,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.32625,
            "ecmwfAifs": 0.231905,
            "icon": 0.130856,
            "ukmo": 0.102784,
            "meteofrance": 0.045263,
            "gfs": 0.06273,
            "gem": 0.055904,
            "jma": 0.044308
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8563,
          "logisticSlope": 3.672,
          "wetFractionWeight": 3.4249,
          "powerEta": 0.68,
          "rawBrier": 0.07205,
          "calibratedBrier": 0.06661
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5502,
          "rawIfsRmseC": 0.7871,
          "rawEqualMaeC": 0.9273,
          "rawEqualRmseC": 1.1664,
          "cvSimplexMaeC": 0.5271,
          "cvCalibratedMaeC": 0.5181,
          "cvCalibratedRmseC": 0.7357
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.798922,
          "ecmwfAifs": 0.039936,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.055065,
          "gem": 0.026077,
          "jma": 0.02
        },
        "intercept": -0.0341,
        "betaDrivers": [
          0.0233,
          -0.0623,
          0.0396,
          -0.014,
          0.0241,
          0.0756
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2718,
        "spreadScale": 0.1458,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255116,
            "ecmwfAifs": 0.068554,
            "icon": 0.218939,
            "ukmo": 0.119336,
            "meteofrance": 0.157184,
            "gfs": 0.065482,
            "gem": 0.057151,
            "jma": 0.058238
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0702,
          "logisticSlope": 2.8112,
          "wetFractionWeight": 4.0759,
          "powerEta": 0.68,
          "rawBrier": 0.04926,
          "calibratedBrier": 0.04232
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5406,
          "rawIfsRmseC": 0.7818,
          "rawEqualMaeC": 0.9178,
          "rawEqualRmseC": 1.1783,
          "cvSimplexMaeC": 0.4883,
          "cvCalibratedMaeC": 0.487,
          "cvCalibratedRmseC": 0.7259
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.723291,
          "ecmwfAifs": 0.043528,
          "icon": 0.035368,
          "ukmo": 0.024191,
          "meteofrance": 0.02,
          "gfs": 0.061686,
          "gem": 0.060744,
          "jma": 0.031192
        },
        "intercept": 0,
        "betaDrivers": [
          0.0393,
          -0.0545,
          0.0226,
          -0.0163,
          0.0232,
          0.0479
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2441,
        "spreadScale": 0.1678,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.339614,
            "ecmwfAifs": 0.190388,
            "icon": 0.140701,
            "ukmo": 0.111244,
            "meteofrance": 0.045198,
            "gfs": 0.066129,
            "gem": 0.057715,
            "jma": 0.049011
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1782,
          "logisticSlope": 3.0052,
          "wetFractionWeight": 4.1882,
          "powerEta": 0.68,
          "rawBrier": 0.04926,
          "calibratedBrier": 0.04145
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5406,
          "rawIfsRmseC": 0.7818,
          "rawEqualMaeC": 0.9178,
          "rawEqualRmseC": 1.1783,
          "cvSimplexMaeC": 0.5059,
          "cvCalibratedMaeC": 0.5019,
          "cvCalibratedRmseC": 0.7333
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.798619,
          "ecmwfAifs": 0.062723,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.038658,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0758,
          -0.0774,
          0.1603,
          0.0542,
          -0.1067,
          0.0535
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244041,
            "ecmwfAifs": 0.078689,
            "icon": 0.224107,
            "ukmo": 0.116645,
            "meteofrance": 0.152654,
            "gfs": 0.06806,
            "gem": 0.057723,
            "jma": 0.058081
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6821,
          "logisticSlope": 3.4804,
          "wetFractionWeight": 3.7825,
          "powerEta": 0.68,
          "rawBrier": 0.02391,
          "calibratedBrier": 0.02013
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4004,
          "rawIfsRmseC": 0.5771,
          "rawEqualMaeC": 0.765,
          "rawEqualRmseC": 0.9641,
          "cvSimplexMaeC": 0.3391,
          "cvCalibratedMaeC": 0.3233,
          "cvCalibratedRmseC": 0.5023
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.712762,
          "ecmwfAifs": 0.082655,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.070892,
          "gfs": 0.024972,
          "gem": 0.048036,
          "jma": 0.020683
        },
        "intercept": 0.0493,
        "betaDrivers": [
          0.0675,
          -0.0467,
          0.0704,
          0.03,
          -0.0497,
          0.0261
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319132,
            "ecmwfAifs": 0.214674,
            "icon": 0.141479,
            "ukmo": 0.106816,
            "meteofrance": 0.0451,
            "gfs": 0.067519,
            "gem": 0.057264,
            "jma": 0.048016
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7945,
          "logisticSlope": 3.3907,
          "wetFractionWeight": 3.91,
          "powerEta": 0.68,
          "rawBrier": 0.02391,
          "calibratedBrier": 0.01935
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4004,
          "rawIfsRmseC": 0.5771,
          "rawEqualMaeC": 0.765,
          "rawEqualRmseC": 0.9641,
          "cvSimplexMaeC": 0.3628,
          "cvCalibratedMaeC": 0.3404,
          "cvCalibratedRmseC": 0.5054
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.811696,
          "ecmwfAifs": 0.041246,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.047058,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0809,
        "betaDrivers": [
          0.0544,
          -0.134,
          0.1454,
          0.0537,
          0.0812,
          0.1471
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2229,
        "spreadScale": 0.0933,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248678,
            "ecmwfAifs": 0.079913,
            "icon": 0.222244,
            "ukmo": 0.112462,
            "meteofrance": 0.150863,
            "gfs": 0.067148,
            "gem": 0.059603,
            "jma": 0.059089
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.031,
          "logisticSlope": 2.4746,
          "wetFractionWeight": 4.1534,
          "powerEta": 0.68,
          "rawBrier": 0.05289,
          "calibratedBrier": 0.04871
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4847,
          "rawIfsRmseC": 0.6756,
          "rawEqualMaeC": 0.8714,
          "rawEqualRmseC": 1.1058,
          "cvSimplexMaeC": 0.4449,
          "cvCalibratedMaeC": 0.4381,
          "cvCalibratedRmseC": 0.622
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.724831,
          "ecmwfAifs": 0.045816,
          "icon": 0.02,
          "ukmo": 0.051872,
          "meteofrance": 0.02,
          "gfs": 0.062924,
          "gem": 0.04221,
          "jma": 0.032347
        },
        "intercept": 0,
        "betaDrivers": [
          0.0574,
          -0.0742,
          0.075,
          0.0352,
          0.0248,
          0.0459
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2118,
        "spreadScale": 0.1135,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.323115,
            "ecmwfAifs": 0.216618,
            "icon": 0.139405,
            "ukmo": 0.102326,
            "meteofrance": 0.045063,
            "gfs": 0.066187,
            "gem": 0.05875,
            "jma": 0.048536
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2502,
          "logisticSlope": 2.5283,
          "wetFractionWeight": 4.3223,
          "powerEta": 0.68,
          "rawBrier": 0.05289,
          "calibratedBrier": 0.04631
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4847,
          "rawIfsRmseC": 0.6756,
          "rawEqualMaeC": 0.8714,
          "rawEqualRmseC": 1.1058,
          "cvSimplexMaeC": 0.4693,
          "cvCalibratedMaeC": 0.4618,
          "cvCalibratedRmseC": 0.6393
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.779832,
          "ecmwfAifs": 0.024502,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.095666,
          "jma": 0.02
        },
        "interceptC": -0.1693,
        "diurnalHarmonicsC": [
          -0.0171,
          -0.096,
          0,
          0
        ],
        "driverBetasC": [
          -0.0438,
          0.127,
          -0.0727,
          -0.0507
        ],
        "spreadBaseC2": 0.4197,
        "spreadScale": 0.0698,
        "cvMaeC": 0.4994,
        "cvRmseC": 0.7194,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.7513,
          "ecmwfAifs": 0.033239,
          "icon": 0.021318,
          "ukmo": 0.02652,
          "meteofrance": 0.02,
          "gfs": 0.03265,
          "gem": 0.094973,
          "jma": 0.02
        },
        "interceptC": -0.1201,
        "diurnalHarmonicsC": [
          -0.0155,
          -0.0859,
          0,
          0
        ],
        "driverBetasC": [
          -0.0478,
          0.0898,
          -0.0568,
          -0.0249
        ],
        "spreadBaseC2": 0.4246,
        "spreadScale": 0.0748,
        "cvMaeC": 0.5088,
        "cvRmseC": 0.7276,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.722769,
          "ecmwfAifs": 0.041975,
          "icon": 0.022635,
          "ukmo": 0.033039,
          "meteofrance": 0.02,
          "gfs": 0.0453,
          "gem": 0.094282,
          "jma": 0.02
        },
        "interceptC": -0.0708,
        "diurnalHarmonicsC": [
          -0.0138,
          -0.0759,
          0,
          0
        ],
        "driverBetasC": [
          -0.0517,
          0.0526,
          -0.0409,
          0.001
        ],
        "spreadBaseC2": 0.4295,
        "spreadScale": 0.0798,
        "cvMaeC": 0.5181,
        "cvRmseC": 0.7357,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.798922,
          "ecmwfAifs": 0.039936,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.055065,
          "gem": 0.026077,
          "jma": 0.02
        },
        "interceptC": -0.0341,
        "diurnalHarmonicsC": [
          0.0233,
          -0.0623,
          0,
          0
        ],
        "driverBetasC": [
          0.0396,
          0.0756,
          -0.014,
          0.0241
        ],
        "spreadBaseC2": 0.2718,
        "spreadScale": 0.1458,
        "cvMaeC": 0.487,
        "cvRmseC": 0.7259,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.761108,
          "ecmwfAifs": 0.041732,
          "icon": 0.027684,
          "ukmo": 0.022095,
          "meteofrance": 0.02,
          "gfs": 0.058375,
          "gem": 0.04341,
          "jma": 0.025596
        },
        "interceptC": -0.017,
        "diurnalHarmonicsC": [
          0.0313,
          -0.0584,
          0,
          0
        ],
        "driverBetasC": [
          0.0311,
          0.0617,
          -0.0152,
          0.0236
        ],
        "spreadBaseC2": 0.258,
        "spreadScale": 0.1568,
        "cvMaeC": 0.4945,
        "cvRmseC": 0.7296,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.723291,
          "ecmwfAifs": 0.043528,
          "icon": 0.035368,
          "ukmo": 0.024191,
          "meteofrance": 0.02,
          "gfs": 0.061686,
          "gem": 0.060744,
          "jma": 0.031192
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0393,
          -0.0545,
          0,
          0
        ],
        "driverBetasC": [
          0.0226,
          0.0479,
          -0.0163,
          0.0232
        ],
        "spreadBaseC2": 0.2441,
        "spreadScale": 0.1678,
        "cvMaeC": 0.5019,
        "cvRmseC": 0.7333,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.798619,
          "ecmwfAifs": 0.062723,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.038658,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0758,
          -0.0774,
          0,
          0
        ],
        "driverBetasC": [
          0.1603,
          0.0535,
          0.0542,
          -0.1067
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "cvMaeC": 0.3233,
        "cvRmseC": 0.5023,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.75569,
          "ecmwfAifs": 0.072689,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.054775,
          "gfs": 0.022486,
          "gem": 0.034018,
          "jma": 0.020342
        },
        "interceptC": 0.0246,
        "diurnalHarmonicsC": [
          0.0717,
          -0.062,
          0,
          0
        ],
        "driverBetasC": [
          0.1154,
          0.0398,
          0.0421,
          -0.0782
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "cvMaeC": 0.3318,
        "cvRmseC": 0.5038,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.712762,
          "ecmwfAifs": 0.082655,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.070892,
          "gfs": 0.024972,
          "gem": 0.048036,
          "jma": 0.020683
        },
        "interceptC": 0.0493,
        "diurnalHarmonicsC": [
          0.0675,
          -0.0467,
          0,
          0
        ],
        "driverBetasC": [
          0.0704,
          0.0261,
          0.03,
          -0.0497
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.05,
        "cvMaeC": 0.3404,
        "cvRmseC": 0.5054,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.811696,
          "ecmwfAifs": 0.041246,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.047058,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0809,
        "diurnalHarmonicsC": [
          0.0544,
          -0.134,
          0,
          0
        ],
        "driverBetasC": [
          0.1454,
          0.1471,
          0.0537,
          0.0812
        ],
        "spreadBaseC2": 0.2229,
        "spreadScale": 0.0933,
        "cvMaeC": 0.4381,
        "cvRmseC": 0.622,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.768263,
          "ecmwfAifs": 0.043531,
          "icon": 0.02,
          "ukmo": 0.035936,
          "meteofrance": 0.02,
          "gfs": 0.054991,
          "gem": 0.031105,
          "jma": 0.026174
        },
        "interceptC": -0.0404,
        "diurnalHarmonicsC": [
          0.0559,
          -0.1041,
          0,
          0
        ],
        "driverBetasC": [
          0.1102,
          0.0965,
          0.0445,
          0.053
        ],
        "spreadBaseC2": 0.2173,
        "spreadScale": 0.1034,
        "cvMaeC": 0.4499,
        "cvRmseC": 0.6306,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.724831,
          "ecmwfAifs": 0.045816,
          "icon": 0.02,
          "ukmo": 0.051872,
          "meteofrance": 0.02,
          "gfs": 0.062924,
          "gem": 0.04221,
          "jma": 0.032347
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0574,
          -0.0742,
          0,
          0
        ],
        "driverBetasC": [
          0.075,
          0.0459,
          0.0352,
          0.0248
        ],
        "spreadBaseC2": 0.2118,
        "spreadScale": 0.1135,
        "cvMaeC": 0.4618,
        "cvRmseC": 0.6393,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.25148,
        "ecmwfAifs": 0.085686,
        "icon": 0.208939,
        "ukmo": 0.11314,
        "meteofrance": 0.166186,
        "gfs": 0.06374,
        "gem": 0.056804,
        "jma": 0.054025
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.255116,
        "ecmwfAifs": 0.068554,
        "icon": 0.218939,
        "ukmo": 0.119336,
        "meteofrance": 0.157184,
        "gfs": 0.065482,
        "gem": 0.057151,
        "jma": 0.058238
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.244041,
        "ecmwfAifs": 0.078689,
        "icon": 0.224107,
        "ukmo": 0.116645,
        "meteofrance": 0.152654,
        "gfs": 0.06806,
        "gem": 0.057723,
        "jma": 0.058081
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.248678,
        "ecmwfAifs": 0.079913,
        "icon": 0.222244,
        "ukmo": 0.112462,
        "meteofrance": 0.150863,
        "gfs": 0.067148,
        "gem": 0.059603,
        "jma": 0.059089
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.253314,
    "ecmwfAifs": 0.071362,
    "icon": 0.243168,
    "ukmo": 0.167232,
    "meteofrance": 0.111007,
    "gfs": 0.074627,
    "gem": 0.039645,
    "jma": 0.039645
  },
  "pressureWeights": {
    "ecmwfIfs": 0.362507,
    "ecmwfAifs": 0.136056,
    "icon": 0.113176,
    "ukmo": 0.177586,
    "meteofrance": 0.071609,
    "gfs": 0.067458,
    "gem": 0.035804,
    "jma": 0.035804
  }
} as const;

export default PROVINCE_CALIBRATION_TR_54;
