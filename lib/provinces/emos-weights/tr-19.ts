import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_19: ProvinceCalibrationBundle = {
  "provinceCode": "TR-19",
  "provinceName": "Çorum",
  "plateNumber": 19,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17084",
  "stationLat": 40.55,
  "stationLon": 34.9667,
  "stationElevationM": 776,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.460085,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.036601,
          "meteofrance": 0.02,
          "gfs": 0.403314,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.3755,
        "betaDrivers": [
          0.438,
          -0.0307,
          0.2836,
          0.0093,
          -0.5375,
          -0.1856
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7835,
        "spreadScale": 0.0608,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237839,
            "ecmwfAifs": 0.082295,
            "icon": 0.214535,
            "ukmo": 0.126699,
            "meteofrance": 0.153113,
            "gfs": 0.068664,
            "gem": 0.057461,
            "jma": 0.059394
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7901,
          "logisticSlope": 3.9196,
          "wetFractionWeight": 2.7981,
          "powerEta": 0.68,
          "rawBrier": 0.04684,
          "calibratedBrier": 0.0468
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 1.2192,
          "rawIfsRmseC": 1.5977,
          "rawEqualMaeC": 1.0386,
          "rawEqualRmseC": 1.3357,
          "cvSimplexMaeC": 0.8305,
          "cvCalibratedMaeC": 0.7291,
          "cvCalibratedRmseC": 0.963
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.404182,
          "ecmwfAifs": 0.154728,
          "icon": 0.02,
          "ukmo": 0.057882,
          "meteofrance": 0.02,
          "gfs": 0.299381,
          "gem": 0.02,
          "jma": 0.023827
        },
        "intercept": -0.2674,
        "betaDrivers": [
          0.267,
          -0.0208,
          0.1546,
          0.0091,
          -0.2174,
          -0.0914
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8393,
        "spreadScale": 0.1053,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308981,
            "ecmwfAifs": 0.223037,
            "icon": 0.134548,
            "ukmo": 0.115261,
            "meteofrance": 0.045093,
            "gfs": 0.067671,
            "gem": 0.05663,
            "jma": 0.048779
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8306,
          "logisticSlope": 3.8462,
          "wetFractionWeight": 2.7954,
          "powerEta": 0.68,
          "rawBrier": 0.04684,
          "calibratedBrier": 0.04637
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 1.2192,
          "rawIfsRmseC": 1.5977,
          "rawEqualMaeC": 1.0386,
          "rawEqualRmseC": 1.3357,
          "cvSimplexMaeC": 0.86,
          "cvCalibratedMaeC": 0.7881,
          "cvCalibratedRmseC": 1.0433
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.414565,
          "ecmwfAifs": 0.139625,
          "icon": 0.02,
          "ukmo": 0.075237,
          "meteofrance": 0.02,
          "gfs": 0.290573,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2411,
        "betaDrivers": [
          0.5502,
          -0.0256,
          0.1979,
          -0.0587,
          -0.2825,
          -0.4474
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3535,
        "spreadScale": 0.4465,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243358,
            "ecmwfAifs": 0.077034,
            "icon": 0.222838,
            "ukmo": 0.122315,
            "meteofrance": 0.154503,
            "gfs": 0.064104,
            "gem": 0.06096,
            "jma": 0.054888
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5543,
          "logisticSlope": 2.5776,
          "wetFractionWeight": 3.1209,
          "powerEta": 0.68,
          "rawBrier": 0.06596,
          "calibratedBrier": 0.05966
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 1.1718,
          "rawIfsRmseC": 1.5698,
          "rawEqualMaeC": 1.0919,
          "rawEqualRmseC": 1.4362,
          "cvSimplexMaeC": 0.9237,
          "cvCalibratedMaeC": 0.8352,
          "cvCalibratedRmseC": 1.1492
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.390628,
          "ecmwfAifs": 0.246713,
          "icon": 0.02,
          "ukmo": 0.078252,
          "meteofrance": 0.02,
          "gfs": 0.204407,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1771,
        "betaDrivers": [
          0.2894,
          -0.0517,
          0.091,
          -0.0043,
          -0.1095,
          -0.1855
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3216,
        "spreadScale": 0.522,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31969,
            "ecmwfAifs": 0.211117,
            "icon": 0.14132,
            "ukmo": 0.112519,
            "meteofrance": 0.045134,
            "gfs": 0.063885,
            "gem": 0.060751,
            "jma": 0.045584
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.659,
          "logisticSlope": 2.6912,
          "wetFractionWeight": 3.2023,
          "powerEta": 0.68,
          "rawBrier": 0.06596,
          "calibratedBrier": 0.05917
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 1.1718,
          "rawIfsRmseC": 1.5698,
          "rawEqualMaeC": 1.0919,
          "rawEqualRmseC": 1.4362,
          "cvSimplexMaeC": 0.9243,
          "cvCalibratedMaeC": 0.8637,
          "cvCalibratedRmseC": 1.2052
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.400265,
          "ecmwfAifs": 0.171375,
          "icon": 0.02,
          "ukmo": 0.047454,
          "meteofrance": 0.02,
          "gfs": 0.300906,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.4738,
          0.0597,
          -0.0535,
          0.3533,
          -0.272,
          -0.4583
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2149,
        "spreadScale": 0.2163,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23014,
            "ecmwfAifs": 0.08021,
            "icon": 0.23553,
            "ukmo": 0.113052,
            "meteofrance": 0.158277,
            "gfs": 0.064723,
            "gem": 0.059674,
            "jma": 0.058394
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4152,
          "logisticSlope": 3.8757,
          "wetFractionWeight": 2.7151,
          "powerEta": 0.68,
          "rawBrier": 0.02129,
          "calibratedBrier": 0.01883
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.9559,
          "rawIfsRmseC": 1.2656,
          "rawEqualMaeC": 0.872,
          "rawEqualRmseC": 1.1432,
          "cvSimplexMaeC": 0.6534,
          "cvCalibratedMaeC": 0.5721,
          "cvCalibratedRmseC": 0.8439
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.400085,
          "ecmwfAifs": 0.233951,
          "icon": 0.02,
          "ukmo": 0.067716,
          "meteofrance": 0.02,
          "gfs": 0.218248,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.2621,
          -0.0438,
          0.0283,
          0.1552,
          -0.1387,
          -0.2095
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1527,
        "spreadScale": 0.265,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304501,
            "ecmwfAifs": 0.221404,
            "icon": 0.150442,
            "ukmo": 0.104746,
            "meteofrance": 0.0452,
            "gfs": 0.064966,
            "gem": 0.059897,
            "jma": 0.048844
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4513,
          "logisticSlope": 3.8675,
          "wetFractionWeight": 2.4605,
          "powerEta": 0.68,
          "rawBrier": 0.02129,
          "calibratedBrier": 0.01873
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.9559,
          "rawIfsRmseC": 1.2656,
          "rawEqualMaeC": 0.872,
          "rawEqualRmseC": 1.1432,
          "cvSimplexMaeC": 0.6574,
          "cvCalibratedMaeC": 0.5845,
          "cvCalibratedRmseC": 0.8699
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.420217,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.088942,
          "meteofrance": 0.02,
          "gfs": 0.390841,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.4005,
        "betaDrivers": [
          0.622,
          -0.0917,
          0.1159,
          0.2319,
          -0.5848,
          -0.2007
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2824,
        "spreadScale": 0.3214,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242243,
            "ecmwfAifs": 0.077371,
            "icon": 0.220843,
            "ukmo": 0.123566,
            "meteofrance": 0.153193,
            "gfs": 0.069903,
            "gem": 0.057303,
            "jma": 0.055578
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2565,
          "logisticSlope": 4.1575,
          "wetFractionWeight": 2.9395,
          "powerEta": 0.68,
          "rawBrier": 0.03096,
          "calibratedBrier": 0.02884
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 1.2267,
          "rawIfsRmseC": 1.6447,
          "rawEqualMaeC": 1.1546,
          "rawEqualRmseC": 1.4982,
          "cvSimplexMaeC": 0.9441,
          "cvCalibratedMaeC": 0.7993,
          "cvCalibratedRmseC": 1.0636
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.392799,
          "ecmwfAifs": 0.152248,
          "icon": 0.02,
          "ukmo": 0.067006,
          "meteofrance": 0.02,
          "gfs": 0.307947,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2298,
        "betaDrivers": [
          0.3747,
          -0.0821,
          0.0774,
          0.0927,
          -0.2111,
          -0.101
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2058,
        "spreadScale": 0.4219,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31755,
            "ecmwfAifs": 0.211591,
            "icon": 0.139757,
            "ukmo": 0.113429,
            "meteofrance": 0.045112,
            "gfs": 0.069516,
            "gem": 0.056986,
            "jma": 0.046059
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4037,
          "logisticSlope": 3.9996,
          "wetFractionWeight": 3.0388,
          "powerEta": 0.68,
          "rawBrier": 0.03096,
          "calibratedBrier": 0.02763
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 1.2267,
          "rawIfsRmseC": 1.6447,
          "rawEqualMaeC": 1.1546,
          "rawEqualRmseC": 1.4982,
          "cvSimplexMaeC": 0.9518,
          "cvCalibratedMaeC": 0.8518,
          "cvCalibratedRmseC": 1.1489
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.460085,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.036601,
          "meteofrance": 0.02,
          "gfs": 0.403314,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3755,
        "diurnalHarmonicsC": [
          0.438,
          -0.0307,
          0,
          0
        ],
        "driverBetasC": [
          0.2836,
          -0.1856,
          0.0093,
          -0.5375
        ],
        "spreadBaseC2": 0.7835,
        "spreadScale": 0.0608,
        "cvMaeC": 0.7291,
        "cvRmseC": 0.963,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.432134,
          "ecmwfAifs": 0.087364,
          "icon": 0.02,
          "ukmo": 0.047241,
          "meteofrance": 0.02,
          "gfs": 0.351348,
          "gem": 0.02,
          "jma": 0.021913
        },
        "interceptC": -0.3215,
        "diurnalHarmonicsC": [
          0.3525,
          -0.0258,
          0,
          0
        ],
        "driverBetasC": [
          0.2191,
          -0.1385,
          0.0092,
          -0.3775
        ],
        "spreadBaseC2": 0.8114,
        "spreadScale": 0.083,
        "cvMaeC": 0.7586,
        "cvRmseC": 1.0031,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.404182,
          "ecmwfAifs": 0.154728,
          "icon": 0.02,
          "ukmo": 0.057882,
          "meteofrance": 0.02,
          "gfs": 0.299381,
          "gem": 0.02,
          "jma": 0.023827
        },
        "interceptC": -0.2674,
        "diurnalHarmonicsC": [
          0.267,
          -0.0208,
          0,
          0
        ],
        "driverBetasC": [
          0.1546,
          -0.0914,
          0.0091,
          -0.2174
        ],
        "spreadBaseC2": 0.8393,
        "spreadScale": 0.1053,
        "cvMaeC": 0.7881,
        "cvRmseC": 1.0433,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.414565,
          "ecmwfAifs": 0.139625,
          "icon": 0.02,
          "ukmo": 0.075237,
          "meteofrance": 0.02,
          "gfs": 0.290573,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2411,
        "diurnalHarmonicsC": [
          0.5502,
          -0.0256,
          0,
          0
        ],
        "driverBetasC": [
          0.1979,
          -0.4474,
          -0.0587,
          -0.2825
        ],
        "spreadBaseC2": 0.3535,
        "spreadScale": 0.4465,
        "cvMaeC": 0.8352,
        "cvRmseC": 1.1492,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.402596,
          "ecmwfAifs": 0.193169,
          "icon": 0.02,
          "ukmo": 0.076745,
          "meteofrance": 0.02,
          "gfs": 0.24749,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2091,
        "diurnalHarmonicsC": [
          0.4198,
          -0.0387,
          0,
          0
        ],
        "driverBetasC": [
          0.1444,
          -0.3165,
          -0.0315,
          -0.196
        ],
        "spreadBaseC2": 0.3376,
        "spreadScale": 0.4843,
        "cvMaeC": 0.8495,
        "cvRmseC": 1.1772,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.390628,
          "ecmwfAifs": 0.246713,
          "icon": 0.02,
          "ukmo": 0.078252,
          "meteofrance": 0.02,
          "gfs": 0.204407,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1771,
        "diurnalHarmonicsC": [
          0.2894,
          -0.0517,
          0,
          0
        ],
        "driverBetasC": [
          0.091,
          -0.1855,
          -0.0043,
          -0.1095
        ],
        "spreadBaseC2": 0.3216,
        "spreadScale": 0.522,
        "cvMaeC": 0.8637,
        "cvRmseC": 1.2052,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.400265,
          "ecmwfAifs": 0.171375,
          "icon": 0.02,
          "ukmo": 0.047454,
          "meteofrance": 0.02,
          "gfs": 0.300906,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.4738,
          0.0597,
          0,
          0
        ],
        "driverBetasC": [
          -0.0535,
          -0.4583,
          0.3533,
          -0.272
        ],
        "spreadBaseC2": 0.2149,
        "spreadScale": 0.2163,
        "cvMaeC": 0.5721,
        "cvRmseC": 0.8439,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.400175,
          "ecmwfAifs": 0.202663,
          "icon": 0.02,
          "ukmo": 0.057585,
          "meteofrance": 0.02,
          "gfs": 0.259577,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.3679,
          0.008,
          0,
          0
        ],
        "driverBetasC": [
          -0.0126,
          -0.3339,
          0.2542,
          -0.2054
        ],
        "spreadBaseC2": 0.1838,
        "spreadScale": 0.2407,
        "cvMaeC": 0.5783,
        "cvRmseC": 0.8569,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.400085,
          "ecmwfAifs": 0.233951,
          "icon": 0.02,
          "ukmo": 0.067716,
          "meteofrance": 0.02,
          "gfs": 0.218248,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.2621,
          -0.0438,
          0,
          0
        ],
        "driverBetasC": [
          0.0283,
          -0.2095,
          0.1552,
          -0.1387
        ],
        "spreadBaseC2": 0.1527,
        "spreadScale": 0.265,
        "cvMaeC": 0.5845,
        "cvRmseC": 0.8699,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.420217,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.088942,
          "meteofrance": 0.02,
          "gfs": 0.390841,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.4005,
        "diurnalHarmonicsC": [
          0.622,
          -0.0917,
          0,
          0
        ],
        "driverBetasC": [
          0.1159,
          -0.2007,
          0.2319,
          -0.5848
        ],
        "spreadBaseC2": 0.2824,
        "spreadScale": 0.3214,
        "cvMaeC": 0.7993,
        "cvRmseC": 1.0636,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.406508,
          "ecmwfAifs": 0.086124,
          "icon": 0.02,
          "ukmo": 0.077974,
          "meteofrance": 0.02,
          "gfs": 0.349394,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3152,
        "diurnalHarmonicsC": [
          0.4983,
          -0.0869,
          0,
          0
        ],
        "driverBetasC": [
          0.0966,
          -0.1508,
          0.1623,
          -0.398
        ],
        "spreadBaseC2": 0.2441,
        "spreadScale": 0.3717,
        "cvMaeC": 0.8256,
        "cvRmseC": 1.1063,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.392799,
          "ecmwfAifs": 0.152248,
          "icon": 0.02,
          "ukmo": 0.067006,
          "meteofrance": 0.02,
          "gfs": 0.307947,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2298,
        "diurnalHarmonicsC": [
          0.3747,
          -0.0821,
          0,
          0
        ],
        "driverBetasC": [
          0.0774,
          -0.101,
          0.0927,
          -0.2111
        ],
        "spreadBaseC2": 0.2058,
        "spreadScale": 0.4219,
        "cvMaeC": 0.8518,
        "cvRmseC": 1.1489,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.237839,
        "ecmwfAifs": 0.082295,
        "icon": 0.214535,
        "ukmo": 0.126699,
        "meteofrance": 0.153113,
        "gfs": 0.068664,
        "gem": 0.057461,
        "jma": 0.059394
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243358,
        "ecmwfAifs": 0.077034,
        "icon": 0.222838,
        "ukmo": 0.122315,
        "meteofrance": 0.154503,
        "gfs": 0.064104,
        "gem": 0.06096,
        "jma": 0.054888
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.23014,
        "ecmwfAifs": 0.08021,
        "icon": 0.23553,
        "ukmo": 0.113052,
        "meteofrance": 0.158277,
        "gfs": 0.064723,
        "gem": 0.059674,
        "jma": 0.058394
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.242243,
        "ecmwfAifs": 0.077371,
        "icon": 0.220843,
        "ukmo": 0.123566,
        "meteofrance": 0.153193,
        "gfs": 0.069903,
        "gem": 0.057303,
        "jma": 0.055578
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.250852,
    "ecmwfAifs": 0.070797,
    "icon": 0.207007,
    "ukmo": 0.1815,
    "meteofrance": 0.110129,
    "gfs": 0.101051,
    "gem": 0.039332,
    "jma": 0.039332
  },
  "pressureWeights": {
    "ecmwfIfs": 0.403842,
    "ecmwfAifs": 0.131346,
    "icon": 0.119314,
    "ukmo": 0.16026,
    "meteofrance": 0.069129,
    "gfs": 0.046979,
    "gem": 0.034565,
    "jma": 0.034565
  }
} as const;

export default PROVINCE_CALIBRATION_TR_19;
