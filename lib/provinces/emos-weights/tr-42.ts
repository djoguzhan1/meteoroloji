import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_42: ProvinceCalibrationBundle = {
  "provinceCode": "TR-42",
  "provinceName": "Konya",
  "plateNumber": 42,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17244",
  "stationLat": 37.9667,
  "stationLon": 32.55,
  "stationElevationM": 1032,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.054296,
          "ecmwfAifs": 0.053376,
          "icon": 0.546594,
          "ukmo": 0.188422,
          "meteofrance": 0.034299,
          "gfs": 0.022225,
          "gem": 0.080788,
          "jma": 0.02
        },
        "intercept": 0.178,
        "betaDrivers": [
          0.0425,
          -0.0674,
          -0.1999,
          0.1653,
          0.068,
          -0.0423
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8273,
        "spreadScale": 0.2703,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237811,
            "ecmwfAifs": 0.081712,
            "icon": 0.210234,
            "ukmo": 0.12551,
            "meteofrance": 0.161001,
            "gfs": 0.06589,
            "gem": 0.057325,
            "jma": 0.060517
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9551,
          "logisticSlope": 4.8982,
          "wetFractionWeight": 2.1322,
          "powerEta": 0.68,
          "rawBrier": 0.038,
          "calibratedBrier": 0.03794
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3898,
          "rawIfsRmseC": 1.7919,
          "rawEqualMaeC": 1.0164,
          "rawEqualRmseC": 1.3001,
          "cvSimplexMaeC": 0.9043,
          "cvCalibratedMaeC": 0.8946,
          "cvCalibratedRmseC": 1.1615
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.142924,
          "ecmwfAifs": 0.193502,
          "icon": 0.314025,
          "ukmo": 0.137499,
          "meteofrance": 0.079721,
          "gfs": 0.02,
          "gem": 0.092329,
          "jma": 0.02
        },
        "intercept": 0.2353,
        "betaDrivers": [
          -0.0145,
          -0.0342,
          -0.0866,
          0.0288,
          0.0994,
          0.0064
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7749,
        "spreadScale": 0.3355,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311298,
            "ecmwfAifs": 0.223145,
            "icon": 0.132855,
            "ukmo": 0.11505,
            "meteofrance": 0.045214,
            "gfs": 0.065432,
            "gem": 0.056926,
            "jma": 0.05008
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0437,
          "logisticSlope": 4.9342,
          "wetFractionWeight": 2.0717,
          "powerEta": 0.68,
          "rawBrier": 0.038,
          "calibratedBrier": 0.03724
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3898,
          "rawIfsRmseC": 1.7919,
          "rawEqualMaeC": 1.0164,
          "rawEqualRmseC": 1.3001,
          "cvSimplexMaeC": 0.9342,
          "cvCalibratedMaeC": 0.9214,
          "cvCalibratedRmseC": 1.1928
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.075325,
          "ecmwfAifs": 0.055008,
          "icon": 0.415699,
          "ukmo": 0.177213,
          "meteofrance": 0.060645,
          "gfs": 0.032553,
          "gem": 0.163557,
          "jma": 0.02
        },
        "intercept": 0.067,
        "betaDrivers": [
          0.0908,
          -0.0639,
          -0.046,
          0.1036,
          0.0048,
          -0.0236
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0498,
        "spreadScale": 0.4172,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243874,
            "ecmwfAifs": 0.075137,
            "icon": 0.22167,
            "ukmo": 0.125669,
            "meteofrance": 0.15288,
            "gfs": 0.069184,
            "gem": 0.056325,
            "jma": 0.055261
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7762,
          "logisticSlope": 3.9232,
          "wetFractionWeight": 2.5252,
          "powerEta": 0.68,
          "rawBrier": 0.05224,
          "calibratedBrier": 0.04871
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3881,
          "rawIfsRmseC": 1.7958,
          "rawEqualMaeC": 1.0783,
          "rawEqualRmseC": 1.3837,
          "cvSimplexMaeC": 1.0054,
          "cvCalibratedMaeC": 1.0021,
          "cvCalibratedRmseC": 1.3157
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.190951,
          "ecmwfAifs": 0.134406,
          "icon": 0.268125,
          "ukmo": 0.14068,
          "meteofrance": 0.09261,
          "gfs": 0.030335,
          "gem": 0.122893,
          "jma": 0.02
        },
        "intercept": 0.1931,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9998,
        "spreadScale": 0.4671,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320852,
            "ecmwfAifs": 0.206231,
            "icon": 0.140792,
            "ukmo": 0.115779,
            "meteofrance": 0.045116,
            "gfs": 0.069051,
            "gem": 0.056217,
            "jma": 0.045962
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8946,
          "logisticSlope": 4.0705,
          "wetFractionWeight": 2.6595,
          "powerEta": 0.68,
          "rawBrier": 0.05224,
          "calibratedBrier": 0.04784
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3881,
          "rawIfsRmseC": 1.7958,
          "rawEqualMaeC": 1.0783,
          "rawEqualRmseC": 1.3837,
          "cvSimplexMaeC": 1.0293,
          "cvCalibratedMaeC": 1.0187,
          "cvCalibratedRmseC": 1.3268
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.219468,
          "ecmwfAifs": 0.02,
          "icon": 0.2868,
          "ukmo": 0.084127,
          "meteofrance": 0.038217,
          "gfs": 0.154779,
          "gem": 0.176609,
          "jma": 0.02
        },
        "intercept": -0.0002,
        "betaDrivers": [
          0.1771,
          -0.1649,
          -0.2086,
          0.0563,
          0.0659,
          -0.2124
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3261,
        "spreadScale": 0.7956,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240706,
            "ecmwfAifs": 0.082092,
            "icon": 0.222522,
            "ukmo": 0.123387,
            "meteofrance": 0.156231,
            "gfs": 0.065357,
            "gem": 0.056266,
            "jma": 0.053439
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5414,
          "logisticSlope": 3.4928,
          "wetFractionWeight": 3.5449,
          "powerEta": 0.68,
          "rawBrier": 0.01696,
          "calibratedBrier": 0.01542
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0857,
          "rawIfsRmseC": 1.4378,
          "rawEqualMaeC": 0.9271,
          "rawEqualRmseC": 1.2587,
          "cvSimplexMaeC": 0.8842,
          "cvCalibratedMaeC": 0.8661,
          "cvCalibratedRmseC": 1.2
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.293522,
          "ecmwfAifs": 0.103495,
          "icon": 0.198635,
          "ukmo": 0.093977,
          "meteofrance": 0.080424,
          "gfs": 0.09205,
          "gem": 0.117897,
          "jma": 0.02
        },
        "intercept": 0.1234,
        "betaDrivers": [
          0.0877,
          -0.1492,
          -0.0742,
          0.0059,
          0.0422,
          -0.0864
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3669,
        "spreadScale": 0.7662,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314057,
            "ecmwfAifs": 0.223449,
            "icon": 0.140159,
            "ukmo": 0.112733,
            "meteofrance": 0.045143,
            "gfs": 0.064689,
            "gem": 0.055692,
            "jma": 0.044078
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6172,
          "logisticSlope": 3.7138,
          "wetFractionWeight": 3.6769,
          "powerEta": 0.68,
          "rawBrier": 0.01696,
          "calibratedBrier": 0.01482
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0857,
          "rawIfsRmseC": 1.4378,
          "rawEqualMaeC": 0.9271,
          "rawEqualRmseC": 1.2587,
          "cvSimplexMaeC": 0.9001,
          "cvCalibratedMaeC": 0.8683,
          "cvCalibratedRmseC": 1.1999
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.122189,
          "ecmwfAifs": 0.02,
          "icon": 0.487273,
          "ukmo": 0.108139,
          "meteofrance": 0.027601,
          "gfs": 0.051858,
          "gem": 0.16294,
          "jma": 0.02
        },
        "intercept": 0.1463,
        "betaDrivers": [
          0.1065,
          -0.1761,
          -0.1593,
          0.0981,
          0.1834,
          -0.0818
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6241,
        "spreadScale": 0.5753,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240761,
            "ecmwfAifs": 0.079062,
            "icon": 0.224415,
            "ukmo": 0.121774,
            "meteofrance": 0.152172,
            "gfs": 0.067187,
            "gem": 0.057943,
            "jma": 0.056686
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5367,
          "logisticSlope": 4.1903,
          "wetFractionWeight": 2.1924,
          "powerEta": 0.68,
          "rawBrier": 0.02036,
          "calibratedBrier": 0.01806
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.3047,
          "rawIfsRmseC": 1.6377,
          "rawEqualMaeC": 1.0697,
          "rawEqualRmseC": 1.3849,
          "cvSimplexMaeC": 0.9737,
          "cvCalibratedMaeC": 0.9536,
          "cvCalibratedRmseC": 1.2567
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.236806,
          "ecmwfAifs": 0.098911,
          "icon": 0.298334,
          "ukmo": 0.086092,
          "meteofrance": 0.08373,
          "gfs": 0.049851,
          "gem": 0.126276,
          "jma": 0.02
        },
        "intercept": 0.2351,
        "betaDrivers": [
          0.0306,
          -0.1464,
          -0.083,
          -0.0181,
          0.1388,
          -0.0347
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6042,
        "spreadScale": 0.6135,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314905,
            "ecmwfAifs": 0.215734,
            "icon": 0.141702,
            "ukmo": 0.111535,
            "meteofrance": 0.045094,
            "gfs": 0.066665,
            "gem": 0.057493,
            "jma": 0.046872
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6256,
          "logisticSlope": 4.3958,
          "wetFractionWeight": 2.1351,
          "powerEta": 0.68,
          "rawBrier": 0.02036,
          "calibratedBrier": 0.01753
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.3047,
          "rawIfsRmseC": 1.6377,
          "rawEqualMaeC": 1.0697,
          "rawEqualRmseC": 1.3849,
          "cvSimplexMaeC": 1.0094,
          "cvCalibratedMaeC": 0.9744,
          "cvCalibratedRmseC": 1.2746
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.054296,
          "ecmwfAifs": 0.053376,
          "icon": 0.546594,
          "ukmo": 0.188422,
          "meteofrance": 0.034299,
          "gfs": 0.022225,
          "gem": 0.080788,
          "jma": 0.02
        },
        "interceptC": 0.178,
        "diurnalHarmonicsC": [
          0.0425,
          -0.0674,
          0,
          0
        ],
        "driverBetasC": [
          -0.1999,
          -0.0423,
          0.1653,
          0.068
        ],
        "spreadBaseC2": 0.8273,
        "spreadScale": 0.2703,
        "cvMaeC": 0.8946,
        "cvRmseC": 1.1615,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.09861,
          "ecmwfAifs": 0.123439,
          "icon": 0.430309,
          "ukmo": 0.16296,
          "meteofrance": 0.05701,
          "gfs": 0.021113,
          "gem": 0.086559,
          "jma": 0.02
        },
        "interceptC": 0.2067,
        "diurnalHarmonicsC": [
          0.014,
          -0.0508,
          0,
          0
        ],
        "driverBetasC": [
          -0.1432,
          -0.0179,
          0.097,
          0.0837
        ],
        "spreadBaseC2": 0.8011,
        "spreadScale": 0.3029,
        "cvMaeC": 0.908,
        "cvRmseC": 1.1772,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.142924,
          "ecmwfAifs": 0.193502,
          "icon": 0.314025,
          "ukmo": 0.137499,
          "meteofrance": 0.079721,
          "gfs": 0.02,
          "gem": 0.092329,
          "jma": 0.02
        },
        "interceptC": 0.2353,
        "diurnalHarmonicsC": [
          -0.0145,
          -0.0342,
          0,
          0
        ],
        "driverBetasC": [
          -0.0866,
          0.0064,
          0.0288,
          0.0994
        ],
        "spreadBaseC2": 0.7749,
        "spreadScale": 0.3355,
        "cvMaeC": 0.9214,
        "cvRmseC": 1.1928,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.075325,
          "ecmwfAifs": 0.055008,
          "icon": 0.415699,
          "ukmo": 0.177213,
          "meteofrance": 0.060645,
          "gfs": 0.032553,
          "gem": 0.163557,
          "jma": 0.02
        },
        "interceptC": 0.067,
        "diurnalHarmonicsC": [
          0.0908,
          -0.0639,
          0,
          0
        ],
        "driverBetasC": [
          -0.046,
          -0.0236,
          0.1036,
          0.0048
        ],
        "spreadBaseC2": 1.0498,
        "spreadScale": 0.4172,
        "cvMaeC": 1.0021,
        "cvRmseC": 1.3157,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.133138,
          "ecmwfAifs": 0.094707,
          "icon": 0.341911,
          "ukmo": 0.158947,
          "meteofrance": 0.076628,
          "gfs": 0.031444,
          "gem": 0.143225,
          "jma": 0.02
        },
        "interceptC": 0.13,
        "diurnalHarmonicsC": [
          0.0454,
          -0.0319,
          0,
          0
        ],
        "driverBetasC": [
          -0.023,
          -0.0118,
          0.0518,
          0.0024
        ],
        "spreadBaseC2": 1.0248,
        "spreadScale": 0.4422,
        "cvMaeC": 1.0104,
        "cvRmseC": 1.3213,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.190951,
          "ecmwfAifs": 0.134406,
          "icon": 0.268125,
          "ukmo": 0.14068,
          "meteofrance": 0.09261,
          "gfs": 0.030335,
          "gem": 0.122893,
          "jma": 0.02
        },
        "interceptC": 0.1931,
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
        "spreadBaseC2": 0.9998,
        "spreadScale": 0.4671,
        "cvMaeC": 1.0187,
        "cvRmseC": 1.3268,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.219468,
          "ecmwfAifs": 0.02,
          "icon": 0.2868,
          "ukmo": 0.084127,
          "meteofrance": 0.038217,
          "gfs": 0.154779,
          "gem": 0.176609,
          "jma": 0.02
        },
        "interceptC": -0.0002,
        "diurnalHarmonicsC": [
          0.1771,
          -0.1649,
          0,
          0
        ],
        "driverBetasC": [
          -0.2086,
          -0.2124,
          0.0563,
          0.0659
        ],
        "spreadBaseC2": 0.3261,
        "spreadScale": 0.7956,
        "cvMaeC": 0.8661,
        "cvRmseC": 1.2,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.256495,
          "ecmwfAifs": 0.061748,
          "icon": 0.242717,
          "ukmo": 0.089052,
          "meteofrance": 0.05932,
          "gfs": 0.123415,
          "gem": 0.147253,
          "jma": 0.02
        },
        "interceptC": 0.0616,
        "diurnalHarmonicsC": [
          0.1324,
          -0.157,
          0,
          0
        ],
        "driverBetasC": [
          -0.1414,
          -0.1494,
          0.0311,
          0.0541
        ],
        "spreadBaseC2": 0.3465,
        "spreadScale": 0.7809,
        "cvMaeC": 0.8672,
        "cvRmseC": 1.1999,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.293522,
          "ecmwfAifs": 0.103495,
          "icon": 0.198635,
          "ukmo": 0.093977,
          "meteofrance": 0.080424,
          "gfs": 0.09205,
          "gem": 0.117897,
          "jma": 0.02
        },
        "interceptC": 0.1234,
        "diurnalHarmonicsC": [
          0.0877,
          -0.1492,
          0,
          0
        ],
        "driverBetasC": [
          -0.0742,
          -0.0864,
          0.0059,
          0.0422
        ],
        "spreadBaseC2": 0.3669,
        "spreadScale": 0.7662,
        "cvMaeC": 0.8683,
        "cvRmseC": 1.1999,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.122189,
          "ecmwfAifs": 0.02,
          "icon": 0.487273,
          "ukmo": 0.108139,
          "meteofrance": 0.027601,
          "gfs": 0.051858,
          "gem": 0.16294,
          "jma": 0.02
        },
        "interceptC": 0.1463,
        "diurnalHarmonicsC": [
          0.1065,
          -0.1761,
          0,
          0
        ],
        "driverBetasC": [
          -0.1593,
          -0.0818,
          0.0981,
          0.1834
        ],
        "spreadBaseC2": 0.6241,
        "spreadScale": 0.5753,
        "cvMaeC": 0.9536,
        "cvRmseC": 1.2567,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.179497,
          "ecmwfAifs": 0.059456,
          "icon": 0.392803,
          "ukmo": 0.097116,
          "meteofrance": 0.055666,
          "gfs": 0.050855,
          "gem": 0.144607,
          "jma": 0.02
        },
        "interceptC": 0.1907,
        "diurnalHarmonicsC": [
          0.0685,
          -0.1613,
          0,
          0
        ],
        "driverBetasC": [
          -0.1212,
          -0.0582,
          0.04,
          0.1611
        ],
        "spreadBaseC2": 0.6141,
        "spreadScale": 0.5944,
        "cvMaeC": 0.964,
        "cvRmseC": 1.2656,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.236806,
          "ecmwfAifs": 0.098911,
          "icon": 0.298334,
          "ukmo": 0.086092,
          "meteofrance": 0.08373,
          "gfs": 0.049851,
          "gem": 0.126276,
          "jma": 0.02
        },
        "interceptC": 0.2351,
        "diurnalHarmonicsC": [
          0.0306,
          -0.1464,
          0,
          0
        ],
        "driverBetasC": [
          -0.083,
          -0.0347,
          -0.0181,
          0.1388
        ],
        "spreadBaseC2": 0.6042,
        "spreadScale": 0.6135,
        "cvMaeC": 0.9744,
        "cvRmseC": 1.2746,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.237811,
        "ecmwfAifs": 0.081712,
        "icon": 0.210234,
        "ukmo": 0.12551,
        "meteofrance": 0.161001,
        "gfs": 0.06589,
        "gem": 0.057325,
        "jma": 0.060517
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243874,
        "ecmwfAifs": 0.075137,
        "icon": 0.22167,
        "ukmo": 0.125669,
        "meteofrance": 0.15288,
        "gfs": 0.069184,
        "gem": 0.056325,
        "jma": 0.055261
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.240706,
        "ecmwfAifs": 0.082092,
        "icon": 0.222522,
        "ukmo": 0.123387,
        "meteofrance": 0.156231,
        "gfs": 0.065357,
        "gem": 0.056266,
        "jma": 0.053439
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.240761,
        "ecmwfAifs": 0.079062,
        "icon": 0.224415,
        "ukmo": 0.121774,
        "meteofrance": 0.152172,
        "gfs": 0.067187,
        "gem": 0.057943,
        "jma": 0.056686
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.214976,
    "ecmwfAifs": 0.070261,
    "icon": 0.26471,
    "ukmo": 0.166747,
    "meteofrance": 0.109295,
    "gfs": 0.095943,
    "gem": 0.039034,
    "jma": 0.039034
  },
  "pressureWeights": {
    "ecmwfIfs": 0.358931,
    "ecmwfAifs": 0.139608,
    "icon": 0.133831,
    "ukmo": 0.162282,
    "meteofrance": 0.073478,
    "gfs": 0.058392,
    "gem": 0.036739,
    "jma": 0.036739
  }
} as const;

export default PROVINCE_CALIBRATION_TR_42;
