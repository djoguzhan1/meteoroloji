import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_57: ProvinceCalibrationBundle = {
  "provinceCode": "TR-57",
  "provinceName": "Sinop",
  "plateNumber": 57,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17026",
  "stationLat": 42.0333,
  "stationLon": 35.1667,
  "stationElevationM": 32,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.576941,
          "ukmo": 0.036488,
          "meteofrance": 0.227597,
          "gfs": 0.031592,
          "gem": 0.067382,
          "jma": 0.02
        },
        "intercept": 0.493,
        "betaDrivers": [
          -0.1227,
          -0.2965,
          -0.1316,
          0.5763,
          -0.1453,
          -0.4697
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.7364,
        "spreadScale": 0.3627,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255375,
            "ecmwfAifs": 0.088594,
            "icon": 0.225218,
            "ukmo": 0.098623,
            "meteofrance": 0.155288,
            "gfs": 0.064852,
            "gem": 0.05512,
            "jma": 0.05693
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0553,
          "logisticSlope": 5.3308,
          "wetFractionWeight": 2.7634,
          "powerEta": 0.68,
          "rawBrier": 0.06768,
          "calibratedBrier": 0.06339
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4758,
          "rawIfsRmseC": 1.9802,
          "rawEqualMaeC": 1.4046,
          "rawEqualRmseC": 1.8113,
          "cvSimplexMaeC": 1.202,
          "cvCalibratedMaeC": 1.1465,
          "cvCalibratedRmseC": 1.4938
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.212721,
          "ecmwfAifs": 0.201639,
          "icon": 0.343678,
          "ukmo": 0.02,
          "meteofrance": 0.081715,
          "gfs": 0.095424,
          "gem": 0.024823,
          "jma": 0.02
        },
        "intercept": 0.5091,
        "betaDrivers": [
          -0.0657,
          -0.148,
          0.0269,
          0.2819,
          -0.1302,
          -0.1436
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.7195,
        "spreadScale": 0.4227,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.327331,
            "ecmwfAifs": 0.236902,
            "icon": 0.139362,
            "ukmo": 0.088521,
            "meteofrance": 0.045094,
            "gfs": 0.063061,
            "gem": 0.053598,
            "jma": 0.046131
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1367,
          "logisticSlope": 5.8102,
          "wetFractionWeight": 2.3642,
          "powerEta": 0.68,
          "rawBrier": 0.06768,
          "calibratedBrier": 0.06282
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4758,
          "rawIfsRmseC": 1.9802,
          "rawEqualMaeC": 1.4046,
          "rawEqualRmseC": 1.8113,
          "cvSimplexMaeC": 1.2432,
          "cvCalibratedMaeC": 1.1643,
          "cvCalibratedRmseC": 1.5129
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.203016,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.273142,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.423842
        },
        "intercept": 0.9696,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.3918,
        "spreadScale": 0.3635,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255542,
            "ecmwfAifs": 0.069492,
            "icon": 0.219971,
            "ukmo": 0.12701,
            "meteofrance": 0.148884,
            "gfs": 0.06607,
            "gem": 0.058501,
            "jma": 0.05453
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3189,
          "logisticSlope": 3.7957,
          "wetFractionWeight": 3.9692,
          "powerEta": 0.68,
          "rawBrier": 0.04035,
          "calibratedBrier": 0.03649
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6875,
          "rawIfsRmseC": 2.1289,
          "rawEqualMaeC": 1.4687,
          "rawEqualRmseC": 1.8555,
          "cvSimplexMaeC": 1.3687,
          "cvCalibratedMaeC": 1.0789,
          "cvCalibratedRmseC": 1.406
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.160284,
          "ecmwfAifs": 0.336438,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.157153,
          "gfs": 0.02,
          "gem": 0.059662,
          "jma": 0.226463
        },
        "intercept": 1.1836,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3048,
        "spreadScale": 0.3164,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33676,
            "ecmwfAifs": 0.191052,
            "icon": 0.139945,
            "ukmo": 0.117209,
            "meteofrance": 0.045065,
            "gfs": 0.066053,
            "gem": 0.058486,
            "jma": 0.04543
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3385,
          "logisticSlope": 3.9671,
          "wetFractionWeight": 3.7952,
          "powerEta": 0.68,
          "rawBrier": 0.04035,
          "calibratedBrier": 0.03634
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6875,
          "rawIfsRmseC": 2.1289,
          "rawEqualMaeC": 1.4687,
          "rawEqualRmseC": 1.8555,
          "cvSimplexMaeC": 1.4073,
          "cvCalibratedMaeC": 1.0426,
          "cvCalibratedRmseC": 1.3476
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.114362,
          "icon": 0.02,
          "ukmo": 0.130783,
          "meteofrance": 0.649951,
          "gfs": 0.02,
          "gem": 0.024904,
          "jma": 0.02
        },
        "intercept": 0.8087,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.7912,
        "spreadScale": 0.8895,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235818,
            "ecmwfAifs": 0.08327,
            "icon": 0.222764,
            "ukmo": 0.113335,
            "meteofrance": 0.153827,
            "gfs": 0.068599,
            "gem": 0.062839,
            "jma": 0.059548
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4336,
          "logisticSlope": 3.038,
          "wetFractionWeight": 3.5905,
          "powerEta": 0.68,
          "rawBrier": 0.02691,
          "calibratedBrier": 0.02384
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6621,
          "rawIfsRmseC": 2.1739,
          "rawEqualMaeC": 1.6216,
          "rawEqualRmseC": 2.0862,
          "cvSimplexMaeC": 1.4993,
          "cvCalibratedMaeC": 1.29,
          "cvCalibratedRmseC": 1.6949
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.24465,
          "ecmwfAifs": 0.232369,
          "icon": 0.02,
          "ukmo": 0.108894,
          "meteofrance": 0.303845,
          "gfs": 0.02,
          "gem": 0.050242,
          "jma": 0.02
        },
        "intercept": 1.0417,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.9814,
        "spreadScale": 0.4874,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30687,
            "ecmwfAifs": 0.226061,
            "icon": 0.139943,
            "ukmo": 0.103277,
            "meteofrance": 0.045106,
            "gfs": 0.067721,
            "gem": 0.062034,
            "jma": 0.048988
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.516,
          "logisticSlope": 3.1394,
          "wetFractionWeight": 3.5681,
          "powerEta": 0.68,
          "rawBrier": 0.02691,
          "calibratedBrier": 0.02364
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6621,
          "rawIfsRmseC": 2.1739,
          "rawEqualMaeC": 1.6216,
          "rawEqualRmseC": 2.0862,
          "cvSimplexMaeC": 1.5218,
          "cvCalibratedMaeC": 1.2187,
          "cvCalibratedRmseC": 1.6038
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.03145,
          "ecmwfAifs": 0.094493,
          "icon": 0.275063,
          "ukmo": 0.02,
          "meteofrance": 0.436994,
          "gfs": 0.102,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.7314,
        "betaDrivers": [
          -0.0536,
          -0.5704,
          0.1713,
          0.2229,
          -0.0523,
          -0.4298
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5078,
        "spreadScale": 0.189,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.260343,
            "ecmwfAifs": 0.090111,
            "icon": 0.218174,
            "ukmo": 0.102895,
            "meteofrance": 0.141623,
            "gfs": 0.069886,
            "gem": 0.059,
            "jma": 0.057968
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.66,
          "logisticSlope": 3.7832,
          "wetFractionWeight": 3.1115,
          "powerEta": 0.68,
          "rawBrier": 0.07097,
          "calibratedBrier": 0.06823
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.3387,
          "rawIfsRmseC": 1.8316,
          "rawEqualMaeC": 1.2222,
          "rawEqualRmseC": 1.655,
          "cvSimplexMaeC": 1.1238,
          "cvCalibratedMaeC": 0.979,
          "cvCalibratedRmseC": 1.3175
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.231221,
          "ecmwfAifs": 0.251775,
          "icon": 0.183621,
          "ukmo": 0.02,
          "meteofrance": 0.199206,
          "gfs": 0.063627,
          "gem": 0.03055,
          "jma": 0.02
        },
        "intercept": 0.5773,
        "betaDrivers": [
          -0.0635,
          -0.3091,
          0.0776,
          0.0892,
          -0.0597,
          -0.109
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6256,
        "spreadScale": 0.2027,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.32801,
            "ecmwfAifs": 0.236849,
            "icon": 0.1327,
            "ukmo": 0.090781,
            "meteofrance": 0.042301,
            "gfs": 0.066796,
            "gem": 0.056392,
            "jma": 0.046171
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7724,
          "logisticSlope": 3.9954,
          "wetFractionWeight": 2.827,
          "powerEta": 0.68,
          "rawBrier": 0.07097,
          "calibratedBrier": 0.06634
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.3387,
          "rawIfsRmseC": 1.8316,
          "rawEqualMaeC": 1.2222,
          "rawEqualRmseC": 1.655,
          "cvSimplexMaeC": 1.1379,
          "cvCalibratedMaeC": 0.9742,
          "cvCalibratedRmseC": 1.3681
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.576941,
          "ukmo": 0.036488,
          "meteofrance": 0.227597,
          "gfs": 0.031592,
          "gem": 0.067382,
          "jma": 0.02
        },
        "interceptC": 0.493,
        "diurnalHarmonicsC": [
          -0.1227,
          -0.2965,
          0,
          0
        ],
        "driverBetasC": [
          -0.1316,
          -0.4697,
          0.5763,
          -0.1453
        ],
        "spreadBaseC2": 1.7364,
        "spreadScale": 0.3627,
        "cvMaeC": 1.1465,
        "cvRmseC": 1.4938,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.11636,
          "ecmwfAifs": 0.11082,
          "icon": 0.460309,
          "ukmo": 0.028244,
          "meteofrance": 0.154656,
          "gfs": 0.063508,
          "gem": 0.046103,
          "jma": 0.02
        },
        "interceptC": 0.501,
        "diurnalHarmonicsC": [
          -0.0942,
          -0.2223,
          0,
          0
        ],
        "driverBetasC": [
          -0.0523,
          -0.3066,
          0.4291,
          -0.1378
        ],
        "spreadBaseC2": 1.7279,
        "spreadScale": 0.3927,
        "cvMaeC": 1.1554,
        "cvRmseC": 1.5033,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.212721,
          "ecmwfAifs": 0.201639,
          "icon": 0.343678,
          "ukmo": 0.02,
          "meteofrance": 0.081715,
          "gfs": 0.095424,
          "gem": 0.024823,
          "jma": 0.02
        },
        "interceptC": 0.5091,
        "diurnalHarmonicsC": [
          -0.0657,
          -0.148,
          0,
          0
        ],
        "driverBetasC": [
          0.0269,
          -0.1436,
          0.2819,
          -0.1302
        ],
        "spreadBaseC2": 1.7195,
        "spreadScale": 0.4227,
        "cvMaeC": 1.1643,
        "cvRmseC": 1.5129,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.203016,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.273142,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.423842
        },
        "interceptC": 0.9696,
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
        "spreadBaseC2": 1.3918,
        "spreadScale": 0.3635,
        "cvMaeC": 1.0789,
        "cvRmseC": 1.406,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.090142,
          "ecmwfAifs": 0.269727,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.215147,
          "gfs": 0.02,
          "gem": 0.039831,
          "jma": 0.325153
        },
        "interceptC": 1.0766,
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
        "spreadBaseC2": 1.3483,
        "spreadScale": 0.3399,
        "cvMaeC": 1.0608,
        "cvRmseC": 1.3768,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.160284,
          "ecmwfAifs": 0.336438,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.157153,
          "gfs": 0.02,
          "gem": 0.059662,
          "jma": 0.226463
        },
        "interceptC": 1.1836,
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
        "spreadBaseC2": 1.3048,
        "spreadScale": 0.3164,
        "cvMaeC": 1.0426,
        "cvRmseC": 1.3476,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.114362,
          "icon": 0.02,
          "ukmo": 0.130783,
          "meteofrance": 0.649951,
          "gfs": 0.02,
          "gem": 0.024904,
          "jma": 0.02
        },
        "interceptC": 0.8087,
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
        "spreadBaseC2": 1.7912,
        "spreadScale": 0.8895,
        "cvMaeC": 1.29,
        "cvRmseC": 1.6949,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.132325,
          "ecmwfAifs": 0.173366,
          "icon": 0.02,
          "ukmo": 0.119839,
          "meteofrance": 0.476897,
          "gfs": 0.02,
          "gem": 0.037573,
          "jma": 0.02
        },
        "interceptC": 0.9252,
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
        "spreadBaseC2": 1.8863,
        "spreadScale": 0.6885,
        "cvMaeC": 1.2544,
        "cvRmseC": 1.6494,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.24465,
          "ecmwfAifs": 0.232369,
          "icon": 0.02,
          "ukmo": 0.108894,
          "meteofrance": 0.303845,
          "gfs": 0.02,
          "gem": 0.050242,
          "jma": 0.02
        },
        "interceptC": 1.0417,
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
        "spreadBaseC2": 1.9814,
        "spreadScale": 0.4874,
        "cvMaeC": 1.2187,
        "cvRmseC": 1.6038,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.03145,
          "ecmwfAifs": 0.094493,
          "icon": 0.275063,
          "ukmo": 0.02,
          "meteofrance": 0.436994,
          "gfs": 0.102,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.7314,
        "diurnalHarmonicsC": [
          -0.0536,
          -0.5704,
          0,
          0
        ],
        "driverBetasC": [
          0.1713,
          -0.4298,
          0.2229,
          -0.0523
        ],
        "spreadBaseC2": 1.5078,
        "spreadScale": 0.189,
        "cvMaeC": 0.979,
        "cvRmseC": 1.3175,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.131336,
          "ecmwfAifs": 0.173134,
          "icon": 0.229342,
          "ukmo": 0.02,
          "meteofrance": 0.318099,
          "gfs": 0.082814,
          "gem": 0.025275,
          "jma": 0.02
        },
        "interceptC": 0.6543,
        "diurnalHarmonicsC": [
          -0.0586,
          -0.4397,
          0,
          0
        ],
        "driverBetasC": [
          0.1245,
          -0.2694,
          0.156,
          -0.056
        ],
        "spreadBaseC2": 1.5667,
        "spreadScale": 0.1958,
        "cvMaeC": 0.9766,
        "cvRmseC": 1.3428,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.231221,
          "ecmwfAifs": 0.251775,
          "icon": 0.183621,
          "ukmo": 0.02,
          "meteofrance": 0.199206,
          "gfs": 0.063627,
          "gem": 0.03055,
          "jma": 0.02
        },
        "interceptC": 0.5773,
        "diurnalHarmonicsC": [
          -0.0635,
          -0.3091,
          0,
          0
        ],
        "driverBetasC": [
          0.0776,
          -0.109,
          0.0892,
          -0.0597
        ],
        "spreadBaseC2": 1.6256,
        "spreadScale": 0.2027,
        "cvMaeC": 0.9742,
        "cvRmseC": 1.3681,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.255375,
        "ecmwfAifs": 0.088594,
        "icon": 0.225218,
        "ukmo": 0.098623,
        "meteofrance": 0.155288,
        "gfs": 0.064852,
        "gem": 0.05512,
        "jma": 0.05693
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.255542,
        "ecmwfAifs": 0.069492,
        "icon": 0.219971,
        "ukmo": 0.12701,
        "meteofrance": 0.148884,
        "gfs": 0.06607,
        "gem": 0.058501,
        "jma": 0.05453
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.235818,
        "ecmwfAifs": 0.08327,
        "icon": 0.222764,
        "ukmo": 0.113335,
        "meteofrance": 0.153827,
        "gfs": 0.068599,
        "gem": 0.062839,
        "jma": 0.059548
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.260343,
        "ecmwfAifs": 0.090111,
        "icon": 0.218174,
        "ukmo": 0.102895,
        "meteofrance": 0.141623,
        "gfs": 0.069886,
        "gem": 0.059,
        "jma": 0.057968
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.218894,
    "ecmwfAifs": 0.065527,
    "icon": 0.209839,
    "ukmo": 0.239077,
    "meteofrance": 0.101931,
    "gfs": 0.091924,
    "gem": 0.036404,
    "jma": 0.036404
  },
  "pressureWeights": {
    "ecmwfIfs": 0.310908,
    "ecmwfAifs": 0.147668,
    "icon": 0.136641,
    "ukmo": 0.177104,
    "meteofrance": 0.07772,
    "gfs": 0.072239,
    "gem": 0.03886,
    "jma": 0.03886
  }
} as const;

export default PROVINCE_CALIBRATION_TR_57;
