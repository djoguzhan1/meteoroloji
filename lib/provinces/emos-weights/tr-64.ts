import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_64: ProvinceCalibrationBundle = {
  "provinceCode": "TR-64",
  "provinceName": "Uşak",
  "plateNumber": 64,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17188",
  "stationLat": 38.6667,
  "stationLon": 29.4167,
  "stationElevationM": 919,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17302,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.49635,
          "ecmwfAifs": 0.040557,
          "icon": 0.189009,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.194084,
          "jma": 0.02
        },
        "intercept": 0.1577,
        "betaDrivers": [
          -0.168,
          -0.2156,
          0.165,
          0.2351,
          -0.1088,
          -0.2501
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2622,
        "spreadScale": 1.4643,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237917,
            "ecmwfAifs": 0.090246,
            "icon": 0.218531,
            "ukmo": 0.11271,
            "meteofrance": 0.161334,
            "gfs": 0.06475,
            "gem": 0.054572,
            "jma": 0.05994
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8097,
          "logisticSlope": 4.4324,
          "wetFractionWeight": 2.417,
          "powerEta": 0.68,
          "rawBrier": 0.05154,
          "calibratedBrier": 0.05154
        },
        "verification": {
          "sampleHours": 4321,
          "rawIfsMaeC": 1.3353,
          "rawIfsRmseC": 1.8882,
          "rawEqualMaeC": 1.3934,
          "rawEqualRmseC": 1.9456,
          "cvSimplexMaeC": 1.2389,
          "cvCalibratedMaeC": 1.2176,
          "cvCalibratedRmseC": 1.754
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.438993,
          "ecmwfAifs": 0.152516,
          "icon": 0.133908,
          "ukmo": 0.036965,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.177618,
          "jma": 0.02
        },
        "intercept": 0.0105,
        "betaDrivers": [
          -0.0954,
          -0.1489,
          0.0284,
          0.0933,
          -0.0222,
          -0.1371
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3213,
        "spreadScale": 1.4325,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.307386,
            "ecmwfAifs": 0.243244,
            "icon": 0.136301,
            "ukmo": 0.101972,
            "meteofrance": 0.04519,
            "gfs": 0.063463,
            "gem": 0.053487,
            "jma": 0.048957
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8432,
          "logisticSlope": 3.9872,
          "wetFractionWeight": 2.8209,
          "powerEta": 0.68,
          "rawBrier": 0.05154,
          "calibratedBrier": 0.05154
        },
        "verification": {
          "sampleHours": 4321,
          "rawIfsMaeC": 1.3353,
          "rawIfsRmseC": 1.8882,
          "rawEqualMaeC": 1.3934,
          "rawEqualRmseC": 1.9456,
          "cvSimplexMaeC": 1.2508,
          "cvCalibratedMaeC": 1.2279,
          "cvCalibratedRmseC": 1.7573
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.483014,
          "ecmwfAifs": 0.02,
          "icon": 0.199216,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.21777,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0428,
          -0.0917,
          0.1347,
          0.067,
          -0.0207,
          -0.0628
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.787,
        "spreadScale": 2.0195,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243367,
            "ecmwfAifs": 0.079271,
            "icon": 0.219831,
            "ukmo": 0.117639,
            "meteofrance": 0.162515,
            "gfs": 0.065648,
            "gem": 0.054934,
            "jma": 0.056795
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8235,
          "logisticSlope": 4.401,
          "wetFractionWeight": 2.5113,
          "powerEta": 0.68,
          "rawBrier": 0.0502,
          "calibratedBrier": 0.04803
        },
        "verification": {
          "sampleHours": 4271,
          "rawIfsMaeC": 1.4126,
          "rawIfsRmseC": 2.0792,
          "rawEqualMaeC": 1.5497,
          "rawEqualRmseC": 2.2245,
          "cvSimplexMaeC": 1.3543,
          "cvCalibratedMaeC": 1.3513,
          "cvCalibratedRmseC": 1.9875
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.436538,
          "ecmwfAifs": 0.070648,
          "icon": 0.174115,
          "ukmo": 0.077112,
          "meteofrance": 0.02,
          "gfs": 0.031885,
          "gem": 0.169702,
          "jma": 0.02
        },
        "intercept": -0.0328,
        "betaDrivers": [
          -0.0644,
          -0.1322,
          0.0911,
          0.076,
          -0.0165,
          -0.1056
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7151,
        "spreadScale": 2.1292,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320657,
            "ecmwfAifs": 0.217894,
            "icon": 0.139828,
            "ukmo": 0.10854,
            "meteofrance": 0.045248,
            "gfs": 0.065618,
            "gem": 0.054908,
            "jma": 0.047307
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9095,
          "logisticSlope": 4.3247,
          "wetFractionWeight": 2.6382,
          "powerEta": 0.68,
          "rawBrier": 0.0502,
          "calibratedBrier": 0.04763
        },
        "verification": {
          "sampleHours": 4271,
          "rawIfsMaeC": 1.4126,
          "rawIfsRmseC": 2.0792,
          "rawEqualMaeC": 1.5497,
          "rawEqualRmseC": 2.2245,
          "cvSimplexMaeC": 1.376,
          "cvCalibratedMaeC": 1.3666,
          "cvCalibratedRmseC": 2.0147
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.530864,
          "ecmwfAifs": 0.02,
          "icon": 0.142983,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.064618,
          "gem": 0.181535,
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
        "spreadBaseC2": 0.8174,
        "spreadScale": 1.1361,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238706,
            "ecmwfAifs": 0.084989,
            "icon": 0.221661,
            "ukmo": 0.120988,
            "meteofrance": 0.1567,
            "gfs": 0.065123,
            "gem": 0.055172,
            "jma": 0.056661
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0351,
          "logisticSlope": 3.1644,
          "wetFractionWeight": 2.4116,
          "powerEta": 0.68,
          "rawBrier": 0.01329,
          "calibratedBrier": 0.00909
        },
        "verification": {
          "sampleHours": 4379,
          "rawIfsMaeC": 1.1286,
          "rawIfsRmseC": 1.7533,
          "rawEqualMaeC": 1.225,
          "rawEqualRmseC": 1.8693,
          "cvSimplexMaeC": 1.097,
          "cvCalibratedMaeC": 1.097,
          "cvCalibratedRmseC": 1.666
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.429586,
          "ecmwfAifs": 0.077121,
          "icon": 0.148019,
          "ukmo": 0.078027,
          "meteofrance": 0.02,
          "gfs": 0.081492,
          "gem": 0.145755,
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
        "spreadBaseC2": 0.8399,
        "spreadScale": 1.1809,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.310185,
            "ecmwfAifs": 0.230398,
            "icon": 0.139052,
            "ukmo": 0.110093,
            "meteofrance": 0.045141,
            "gfs": 0.064197,
            "gem": 0.054388,
            "jma": 0.046546
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0447,
          "logisticSlope": 3.4321,
          "wetFractionWeight": 2.5146,
          "powerEta": 0.68,
          "rawBrier": 0.01329,
          "calibratedBrier": 0.00882
        },
        "verification": {
          "sampleHours": 4379,
          "rawIfsMaeC": 1.1286,
          "rawIfsRmseC": 1.7533,
          "rawEqualMaeC": 1.225,
          "rawEqualRmseC": 1.8693,
          "cvSimplexMaeC": 1.1107,
          "cvCalibratedMaeC": 1.1107,
          "cvCalibratedRmseC": 1.697
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.584142,
          "ecmwfAifs": 0.02,
          "icon": 0.043726,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.106163,
          "gem": 0.185969,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.073,
          -0.1459,
          0.2618,
          0.1033,
          -0.0026,
          -0.1017
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0744,
        "spreadScale": 1.8711,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238512,
            "ecmwfAifs": 0.084446,
            "icon": 0.220224,
            "ukmo": 0.121079,
            "meteofrance": 0.147173,
            "gfs": 0.070138,
            "gem": 0.057259,
            "jma": 0.061169
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3865,
          "logisticSlope": 4.3307,
          "wetFractionWeight": 2.7095,
          "powerEta": 0.68,
          "rawBrier": 0.02692,
          "calibratedBrier": 0.0255
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 1.3252,
          "rawIfsRmseC": 2.0267,
          "rawEqualMaeC": 1.5113,
          "rawEqualRmseC": 2.2043,
          "cvSimplexMaeC": 1.3164,
          "cvCalibratedMaeC": 1.3102,
          "cvCalibratedRmseC": 2.016
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.478978,
          "ecmwfAifs": 0.038669,
          "icon": 0.131725,
          "ukmo": 0.03554,
          "meteofrance": 0.02,
          "gfs": 0.109809,
          "gem": 0.165279,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.04,
          -0.1237,
          0.1331,
          0.0754,
          -0.0094,
          -0.1202
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0024,
        "spreadScale": 1.9478,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.307365,
            "ecmwfAifs": 0.227027,
            "icon": 0.137005,
            "ukmo": 0.109263,
            "meteofrance": 0.044962,
            "gfs": 0.068568,
            "gem": 0.055977,
            "jma": 0.049833
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4379,
          "logisticSlope": 4.3686,
          "wetFractionWeight": 2.8289,
          "powerEta": 0.68,
          "rawBrier": 0.02692,
          "calibratedBrier": 0.02499
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 1.3252,
          "rawIfsRmseC": 2.0267,
          "rawEqualMaeC": 1.5113,
          "rawEqualRmseC": 2.2043,
          "cvSimplexMaeC": 1.319,
          "cvCalibratedMaeC": 1.3118,
          "cvCalibratedRmseC": 2.0138
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.49635,
          "ecmwfAifs": 0.040557,
          "icon": 0.189009,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.194084,
          "jma": 0.02
        },
        "interceptC": 0.1577,
        "diurnalHarmonicsC": [
          -0.168,
          -0.2156,
          0,
          0
        ],
        "driverBetasC": [
          0.165,
          -0.2501,
          0.2351,
          -0.1088
        ],
        "spreadBaseC2": 1.2622,
        "spreadScale": 1.4643,
        "cvMaeC": 1.2176,
        "cvRmseC": 1.754,
        "sampleHours": 4321
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.467671,
          "ecmwfAifs": 0.096537,
          "icon": 0.161459,
          "ukmo": 0.028483,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.18585,
          "jma": 0.02
        },
        "interceptC": 0.0841,
        "diurnalHarmonicsC": [
          -0.1317,
          -0.1823,
          0,
          0
        ],
        "driverBetasC": [
          0.0967,
          -0.1936,
          0.1642,
          -0.0655
        ],
        "spreadBaseC2": 1.2917,
        "spreadScale": 1.4484,
        "cvMaeC": 1.2228,
        "cvRmseC": 1.7557,
        "sampleHours": 4321
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.438993,
          "ecmwfAifs": 0.152516,
          "icon": 0.133908,
          "ukmo": 0.036965,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.177618,
          "jma": 0.02
        },
        "interceptC": 0.0105,
        "diurnalHarmonicsC": [
          -0.0954,
          -0.1489,
          0,
          0
        ],
        "driverBetasC": [
          0.0284,
          -0.1371,
          0.0933,
          -0.0222
        ],
        "spreadBaseC2": 1.3213,
        "spreadScale": 1.4325,
        "cvMaeC": 1.2279,
        "cvRmseC": 1.7573,
        "sampleHours": 4321
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.483014,
          "ecmwfAifs": 0.02,
          "icon": 0.199216,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.21777,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0428,
          -0.0917,
          0,
          0
        ],
        "driverBetasC": [
          0.1347,
          -0.0628,
          0.067,
          -0.0207
        ],
        "spreadBaseC2": 0.787,
        "spreadScale": 2.0195,
        "cvMaeC": 1.3513,
        "cvRmseC": 1.9875,
        "sampleHours": 4271
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.459776,
          "ecmwfAifs": 0.045324,
          "icon": 0.186665,
          "ukmo": 0.048556,
          "meteofrance": 0.02,
          "gfs": 0.025943,
          "gem": 0.193736,
          "jma": 0.02
        },
        "interceptC": -0.0164,
        "diurnalHarmonicsC": [
          -0.0536,
          -0.112,
          0,
          0
        ],
        "driverBetasC": [
          0.1129,
          -0.0842,
          0.0715,
          -0.0186
        ],
        "spreadBaseC2": 0.751,
        "spreadScale": 2.0743,
        "cvMaeC": 1.359,
        "cvRmseC": 2.0011,
        "sampleHours": 4271
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.436538,
          "ecmwfAifs": 0.070648,
          "icon": 0.174115,
          "ukmo": 0.077112,
          "meteofrance": 0.02,
          "gfs": 0.031885,
          "gem": 0.169702,
          "jma": 0.02
        },
        "interceptC": -0.0328,
        "diurnalHarmonicsC": [
          -0.0644,
          -0.1322,
          0,
          0
        ],
        "driverBetasC": [
          0.0911,
          -0.1056,
          0.076,
          -0.0165
        ],
        "spreadBaseC2": 0.7151,
        "spreadScale": 2.1292,
        "cvMaeC": 1.3666,
        "cvRmseC": 2.0147,
        "sampleHours": 4271
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.530864,
          "ecmwfAifs": 0.02,
          "icon": 0.142983,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.064618,
          "gem": 0.181535,
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
        "spreadBaseC2": 0.8174,
        "spreadScale": 1.1361,
        "cvMaeC": 1.097,
        "cvRmseC": 1.666,
        "sampleHours": 4379
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.480224,
          "ecmwfAifs": 0.048561,
          "icon": 0.145501,
          "ukmo": 0.049014,
          "meteofrance": 0.02,
          "gfs": 0.073055,
          "gem": 0.163645,
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
        "spreadBaseC2": 0.8286,
        "spreadScale": 1.1585,
        "cvMaeC": 1.1038,
        "cvRmseC": 1.6815,
        "sampleHours": 4379
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.429586,
          "ecmwfAifs": 0.077121,
          "icon": 0.148019,
          "ukmo": 0.078027,
          "meteofrance": 0.02,
          "gfs": 0.081492,
          "gem": 0.145755,
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
        "spreadBaseC2": 0.8399,
        "spreadScale": 1.1809,
        "cvMaeC": 1.1107,
        "cvRmseC": 1.697,
        "sampleHours": 4379
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.584142,
          "ecmwfAifs": 0.02,
          "icon": 0.043726,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.106163,
          "gem": 0.185969,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.073,
          -0.1459,
          0,
          0
        ],
        "driverBetasC": [
          0.2618,
          -0.1017,
          0.1033,
          -0.0026
        ],
        "spreadBaseC2": 1.0744,
        "spreadScale": 1.8711,
        "cvMaeC": 1.3102,
        "cvRmseC": 2.016,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.53156,
          "ecmwfAifs": 0.029334,
          "icon": 0.087726,
          "ukmo": 0.02777,
          "meteofrance": 0.02,
          "gfs": 0.107986,
          "gem": 0.175624,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0565,
          -0.1348,
          0,
          0
        ],
        "driverBetasC": [
          0.1974,
          -0.1109,
          0.0893,
          -0.006
        ],
        "spreadBaseC2": 1.0384,
        "spreadScale": 1.9095,
        "cvMaeC": 1.311,
        "cvRmseC": 2.0149,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.478978,
          "ecmwfAifs": 0.038669,
          "icon": 0.131725,
          "ukmo": 0.03554,
          "meteofrance": 0.02,
          "gfs": 0.109809,
          "gem": 0.165279,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.04,
          -0.1237,
          0,
          0
        ],
        "driverBetasC": [
          0.1331,
          -0.1202,
          0.0754,
          -0.0094
        ],
        "spreadBaseC2": 1.0024,
        "spreadScale": 1.9478,
        "cvMaeC": 1.3118,
        "cvRmseC": 2.0138,
        "sampleHours": 4331
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.237917,
        "ecmwfAifs": 0.090246,
        "icon": 0.218531,
        "ukmo": 0.11271,
        "meteofrance": 0.161334,
        "gfs": 0.06475,
        "gem": 0.054572,
        "jma": 0.05994
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243367,
        "ecmwfAifs": 0.079271,
        "icon": 0.219831,
        "ukmo": 0.117639,
        "meteofrance": 0.162515,
        "gfs": 0.065648,
        "gem": 0.054934,
        "jma": 0.056795
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.238706,
        "ecmwfAifs": 0.084989,
        "icon": 0.221661,
        "ukmo": 0.120988,
        "meteofrance": 0.1567,
        "gfs": 0.065123,
        "gem": 0.055172,
        "jma": 0.056661
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.238512,
        "ecmwfAifs": 0.084446,
        "icon": 0.220224,
        "ukmo": 0.121079,
        "meteofrance": 0.147173,
        "gfs": 0.070138,
        "gem": 0.057259,
        "jma": 0.061169
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.233783,
    "ecmwfAifs": 0.072314,
    "icon": 0.238493,
    "ukmo": 0.178459,
    "meteofrance": 0.112489,
    "gfs": 0.084112,
    "gem": 0.040175,
    "jma": 0.040175
  },
  "pressureWeights": {
    "ecmwfIfs": 0.351068,
    "ecmwfAifs": 0.143772,
    "icon": 0.14154,
    "ukmo": 0.163447,
    "meteofrance": 0.07567,
    "gfs": 0.048833,
    "gem": 0.037835,
    "jma": 0.037835
  }
} as const;

export default PROVINCE_CALIBRATION_TR_64;
