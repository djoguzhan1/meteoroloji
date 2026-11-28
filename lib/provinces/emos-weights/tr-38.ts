import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_38: ProvinceCalibrationBundle = {
  "provinceCode": "TR-38",
  "provinceName": "Kayseri",
  "plateNumber": 38,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17195",
  "stationLat": 38.7833,
  "stationLon": 35.4833,
  "stationElevationM": 1053,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.074893,
          "ecmwfAifs": 0.02,
          "icon": 0.351804,
          "ukmo": 0.02,
          "meteofrance": 0.144425,
          "gfs": 0.02,
          "gem": 0.348878,
          "jma": 0.02
        },
        "intercept": 0.0927,
        "betaDrivers": [
          -0.2252,
          0.1472,
          -0.4085,
          0.4427,
          0.233,
          0.0201
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2244,
        "spreadScale": 0.4269,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232704,
            "ecmwfAifs": 0.084695,
            "icon": 0.22187,
            "ukmo": 0.120816,
            "meteofrance": 0.15889,
            "gfs": 0.066908,
            "gem": 0.056507,
            "jma": 0.05761
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.004,
          "logisticSlope": 4.4501,
          "wetFractionWeight": 3.2686,
          "powerEta": 0.68,
          "rawBrier": 0.04145,
          "calibratedBrier": 0.0401
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.6934,
          "rawIfsRmseC": 2.1697,
          "rawEqualMaeC": 1.3817,
          "rawEqualRmseC": 1.8042,
          "cvSimplexMaeC": 1.1783,
          "cvCalibratedMaeC": 1.1665,
          "cvCalibratedRmseC": 1.5153
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.203517,
          "ecmwfAifs": 0.038798,
          "icon": 0.282965,
          "ukmo": 0.056455,
          "meteofrance": 0.100581,
          "gfs": 0.02,
          "gem": 0.277684,
          "jma": 0.02
        },
        "intercept": 0.0474,
        "betaDrivers": [
          -0.2106,
          0.0686,
          -0.1739,
          0.1272,
          0.0867,
          0.0928
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3854,
        "spreadScale": 0.3836,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.303891,
            "ecmwfAifs": 0.230743,
            "icon": 0.139875,
            "ukmo": 0.110484,
            "meteofrance": 0.04518,
            "gfs": 0.066285,
            "gem": 0.055981,
            "jma": 0.047561
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.069,
          "logisticSlope": 4.2456,
          "wetFractionWeight": 3.3702,
          "powerEta": 0.68,
          "rawBrier": 0.04145,
          "calibratedBrier": 0.03908
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.6934,
          "rawIfsRmseC": 2.1697,
          "rawEqualMaeC": 1.3817,
          "rawEqualRmseC": 1.8042,
          "cvSimplexMaeC": 1.2057,
          "cvCalibratedMaeC": 1.186,
          "cvCalibratedRmseC": 1.5328
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.407181,
          "ukmo": 0.093414,
          "meteofrance": 0.120168,
          "gfs": 0.02,
          "gem": 0.299237,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0776,
          0.0877,
          -0.096,
          0.0461,
          -0.0314,
          -0.1122
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6246,
        "spreadScale": 0.4994,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246233,
            "ecmwfAifs": 0.077525,
            "icon": 0.220377,
            "ukmo": 0.128287,
            "meteofrance": 0.155298,
            "gfs": 0.063519,
            "gem": 0.051992,
            "jma": 0.056769
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5822,
          "logisticSlope": 2.3459,
          "wetFractionWeight": 3.3225,
          "powerEta": 0.68,
          "rawBrier": 0.07288,
          "calibratedBrier": 0.06315
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6642,
          "rawIfsRmseC": 2.2302,
          "rawEqualMaeC": 1.3148,
          "rawEqualRmseC": 1.6903,
          "cvSimplexMaeC": 1.1214,
          "cvCalibratedMaeC": 1.1181,
          "cvCalibratedRmseC": 1.4669
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.160257,
          "ecmwfAifs": 0.02,
          "icon": 0.315219,
          "ukmo": 0.145371,
          "meteofrance": 0.104043,
          "gfs": 0.02,
          "gem": 0.21511,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1532,
          0.0544,
          -0.0487,
          0.0315,
          -0.0073,
          -0.0272
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.454,
        "spreadScale": 0.5813,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.323092,
            "ecmwfAifs": 0.212219,
            "icon": 0.139598,
            "ukmo": 0.117876,
            "meteofrance": 0.045142,
            "gfs": 0.063228,
            "gem": 0.051754,
            "jma": 0.047091
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7057,
          "logisticSlope": 2.1772,
          "wetFractionWeight": 3.6829,
          "powerEta": 0.68,
          "rawBrier": 0.07288,
          "calibratedBrier": 0.06083
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.6642,
          "rawIfsRmseC": 2.2302,
          "rawEqualMaeC": 1.3148,
          "rawEqualRmseC": 1.6903,
          "cvSimplexMaeC": 1.145,
          "cvCalibratedMaeC": 1.1368,
          "cvCalibratedRmseC": 1.4937
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.061237,
          "ecmwfAifs": 0.02,
          "icon": 0.479722,
          "ukmo": 0.118213,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.260828,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.3167,
          0.0428,
          -0.1965,
          0.0505,
          0.1262,
          -0.025
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6848,
        "spreadScale": 0.4318,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237262,
            "ecmwfAifs": 0.077061,
            "icon": 0.227227,
            "ukmo": 0.122207,
            "meteofrance": 0.155559,
            "gfs": 0.067535,
            "gem": 0.056077,
            "jma": 0.057072
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9106,
          "logisticSlope": 3.737,
          "wetFractionWeight": 3.0487,
          "powerEta": 0.68,
          "rawBrier": 0.01489,
          "calibratedBrier": 0.01232
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5344,
          "rawIfsRmseC": 2.058,
          "rawEqualMaeC": 1.2642,
          "rawEqualRmseC": 1.6327,
          "cvSimplexMaeC": 1.0827,
          "cvCalibratedMaeC": 1.0598,
          "cvCalibratedRmseC": 1.3852
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.252226,
          "ecmwfAifs": 0.02,
          "icon": 0.277064,
          "ukmo": 0.155328,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.235382,
          "jma": 0.02
        },
        "intercept": -0.009,
        "betaDrivers": [
          -0.258,
          -0.0081,
          -0.09,
          0.0032,
          0.0828,
          0.0297
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4886,
        "spreadScale": 0.5119,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313279,
            "ecmwfAifs": 0.21227,
            "icon": 0.14484,
            "ukmo": 0.112995,
            "meteofrance": 0.045159,
            "gfs": 0.067647,
            "gem": 0.05617,
            "jma": 0.04764
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9712,
          "logisticSlope": 3.382,
          "wetFractionWeight": 3.4949,
          "powerEta": 0.68,
          "rawBrier": 0.01489,
          "calibratedBrier": 0.0124
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5344,
          "rawIfsRmseC": 2.058,
          "rawEqualMaeC": 1.2642,
          "rawEqualRmseC": 1.6327,
          "cvSimplexMaeC": 1.0979,
          "cvCalibratedMaeC": 1.0755,
          "cvCalibratedRmseC": 1.3966
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.378604,
          "ukmo": 0.040531,
          "meteofrance": 0.057047,
          "gfs": 0.02,
          "gem": 0.443818,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2771,
          -0.0224,
          -0.3412,
          0.1441,
          -0.0107,
          0.0858
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5136,
        "spreadScale": 0.3818,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23892,
            "ecmwfAifs": 0.08012,
            "icon": 0.220136,
            "ukmo": 0.12219,
            "meteofrance": 0.15258,
            "gfs": 0.070097,
            "gem": 0.057804,
            "jma": 0.058153
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.563,
          "logisticSlope": 5.2341,
          "wetFractionWeight": 3.0836,
          "powerEta": 0.68,
          "rawBrier": 0.02023,
          "calibratedBrier": 0.02023
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.8567,
          "rawIfsRmseC": 2.4867,
          "rawEqualMaeC": 1.6352,
          "rawEqualRmseC": 2.1164,
          "cvSimplexMaeC": 1.2664,
          "cvCalibratedMaeC": 1.2548,
          "cvCalibratedRmseC": 1.6505
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.158372,
          "ecmwfAifs": 0.02,
          "icon": 0.287227,
          "ukmo": 0.083335,
          "meteofrance": 0.046051,
          "gfs": 0.02,
          "gem": 0.365015,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2724,
          -0.0738,
          -0.2138,
          0.0563,
          0.0322,
          0.1049
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2607,
        "spreadScale": 0.4787,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311803,
            "ecmwfAifs": 0.218137,
            "icon": 0.138692,
            "ukmo": 0.111668,
            "meteofrance": 0.045095,
            "gfs": 0.069399,
            "gem": 0.057228,
            "jma": 0.047978
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7333,
          "logisticSlope": 5.0434,
          "wetFractionWeight": 3.2541,
          "powerEta": 0.68,
          "rawBrier": 0.02023,
          "calibratedBrier": 0.01976
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.8567,
          "rawIfsRmseC": 2.4867,
          "rawEqualMaeC": 1.6352,
          "rawEqualRmseC": 2.1164,
          "cvSimplexMaeC": 1.3015,
          "cvCalibratedMaeC": 1.2726,
          "cvCalibratedRmseC": 1.6637
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.074893,
          "ecmwfAifs": 0.02,
          "icon": 0.351804,
          "ukmo": 0.02,
          "meteofrance": 0.144425,
          "gfs": 0.02,
          "gem": 0.348878,
          "jma": 0.02
        },
        "interceptC": 0.0927,
        "diurnalHarmonicsC": [
          -0.2252,
          0.1472,
          0,
          0
        ],
        "driverBetasC": [
          -0.4085,
          0.0201,
          0.4427,
          0.233
        ],
        "spreadBaseC2": 1.2244,
        "spreadScale": 0.4269,
        "cvMaeC": 1.1665,
        "cvRmseC": 1.5153,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.139205,
          "ecmwfAifs": 0.029399,
          "icon": 0.317385,
          "ukmo": 0.038227,
          "meteofrance": 0.122503,
          "gfs": 0.02,
          "gem": 0.313281,
          "jma": 0.02
        },
        "interceptC": 0.0701,
        "diurnalHarmonicsC": [
          -0.2179,
          0.1079,
          0,
          0
        ],
        "driverBetasC": [
          -0.2912,
          0.0565,
          0.2849,
          0.1598
        ],
        "spreadBaseC2": 1.3049,
        "spreadScale": 0.4052,
        "cvMaeC": 1.1763,
        "cvRmseC": 1.524,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.203517,
          "ecmwfAifs": 0.038798,
          "icon": 0.282965,
          "ukmo": 0.056455,
          "meteofrance": 0.100581,
          "gfs": 0.02,
          "gem": 0.277684,
          "jma": 0.02
        },
        "interceptC": 0.0474,
        "diurnalHarmonicsC": [
          -0.2106,
          0.0686,
          0,
          0
        ],
        "driverBetasC": [
          -0.1739,
          0.0928,
          0.1272,
          0.0867
        ],
        "spreadBaseC2": 1.3854,
        "spreadScale": 0.3836,
        "cvMaeC": 1.186,
        "cvRmseC": 1.5328,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.407181,
          "ukmo": 0.093414,
          "meteofrance": 0.120168,
          "gfs": 0.02,
          "gem": 0.299237,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0776,
          0.0877,
          0,
          0
        ],
        "driverBetasC": [
          -0.096,
          -0.1122,
          0.0461,
          -0.0314
        ],
        "spreadBaseC2": 0.6246,
        "spreadScale": 0.4994,
        "cvMaeC": 1.1181,
        "cvRmseC": 1.4669,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.090129,
          "ecmwfAifs": 0.02,
          "icon": 0.361199,
          "ukmo": 0.119393,
          "meteofrance": 0.112106,
          "gfs": 0.02,
          "gem": 0.257173,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1154,
          0.0711,
          0,
          0
        ],
        "driverBetasC": [
          -0.0723,
          -0.0697,
          0.0388,
          -0.0193
        ],
        "spreadBaseC2": 0.5393,
        "spreadScale": 0.5403,
        "cvMaeC": 1.1275,
        "cvRmseC": 1.4803,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.160257,
          "ecmwfAifs": 0.02,
          "icon": 0.315219,
          "ukmo": 0.145371,
          "meteofrance": 0.104043,
          "gfs": 0.02,
          "gem": 0.21511,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1532,
          0.0544,
          0,
          0
        ],
        "driverBetasC": [
          -0.0487,
          -0.0272,
          0.0315,
          -0.0073
        ],
        "spreadBaseC2": 0.454,
        "spreadScale": 0.5813,
        "cvMaeC": 1.1368,
        "cvRmseC": 1.4937,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.061237,
          "ecmwfAifs": 0.02,
          "icon": 0.479722,
          "ukmo": 0.118213,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.260828,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.3167,
          0.0428,
          0,
          0
        ],
        "driverBetasC": [
          -0.1965,
          -0.025,
          0.0505,
          0.1262
        ],
        "spreadBaseC2": 0.6848,
        "spreadScale": 0.4318,
        "cvMaeC": 1.0598,
        "cvRmseC": 1.3852,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.156732,
          "ecmwfAifs": 0.02,
          "icon": 0.378392,
          "ukmo": 0.136771,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.248105,
          "jma": 0.02
        },
        "interceptC": -0.0045,
        "diurnalHarmonicsC": [
          -0.2873,
          0.0173,
          0,
          0
        ],
        "driverBetasC": [
          -0.1432,
          0.0023,
          0.0269,
          0.1045
        ],
        "spreadBaseC2": 0.5867,
        "spreadScale": 0.4718,
        "cvMaeC": 1.0676,
        "cvRmseC": 1.3909,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.252226,
          "ecmwfAifs": 0.02,
          "icon": 0.277064,
          "ukmo": 0.155328,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.235382,
          "jma": 0.02
        },
        "interceptC": -0.009,
        "diurnalHarmonicsC": [
          -0.258,
          -0.0081,
          0,
          0
        ],
        "driverBetasC": [
          -0.09,
          0.0297,
          0.0032,
          0.0828
        ],
        "spreadBaseC2": 0.4886,
        "spreadScale": 0.5119,
        "cvMaeC": 1.0755,
        "cvRmseC": 1.3966,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.378604,
          "ukmo": 0.040531,
          "meteofrance": 0.057047,
          "gfs": 0.02,
          "gem": 0.443818,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2771,
          -0.0224,
          0,
          0
        ],
        "driverBetasC": [
          -0.3412,
          0.0858,
          0.1441,
          -0.0107
        ],
        "spreadBaseC2": 1.5136,
        "spreadScale": 0.3818,
        "cvMaeC": 1.2548,
        "cvRmseC": 1.6505,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.089186,
          "ecmwfAifs": 0.02,
          "icon": 0.332916,
          "ukmo": 0.061933,
          "meteofrance": 0.051549,
          "gfs": 0.02,
          "gem": 0.404416,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2747,
          -0.0481,
          0,
          0
        ],
        "driverBetasC": [
          -0.2775,
          0.0953,
          0.1002,
          0.0107
        ],
        "spreadBaseC2": 1.3872,
        "spreadScale": 0.4303,
        "cvMaeC": 1.2637,
        "cvRmseC": 1.6571,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.158372,
          "ecmwfAifs": 0.02,
          "icon": 0.287227,
          "ukmo": 0.083335,
          "meteofrance": 0.046051,
          "gfs": 0.02,
          "gem": 0.365015,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2724,
          -0.0738,
          0,
          0
        ],
        "driverBetasC": [
          -0.2138,
          0.1049,
          0.0563,
          0.0322
        ],
        "spreadBaseC2": 1.2607,
        "spreadScale": 0.4787,
        "cvMaeC": 1.2726,
        "cvRmseC": 1.6637,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.232704,
        "ecmwfAifs": 0.084695,
        "icon": 0.22187,
        "ukmo": 0.120816,
        "meteofrance": 0.15889,
        "gfs": 0.066908,
        "gem": 0.056507,
        "jma": 0.05761
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.246233,
        "ecmwfAifs": 0.077525,
        "icon": 0.220377,
        "ukmo": 0.128287,
        "meteofrance": 0.155298,
        "gfs": 0.063519,
        "gem": 0.051992,
        "jma": 0.056769
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.237262,
        "ecmwfAifs": 0.077061,
        "icon": 0.227227,
        "ukmo": 0.122207,
        "meteofrance": 0.155559,
        "gfs": 0.067535,
        "gem": 0.056077,
        "jma": 0.057072
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.23892,
        "ecmwfAifs": 0.08012,
        "icon": 0.220136,
        "ukmo": 0.12219,
        "meteofrance": 0.15258,
        "gfs": 0.070097,
        "gem": 0.057804,
        "jma": 0.058153
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.219826,
    "ecmwfAifs": 0.071834,
    "icon": 0.249987,
    "ukmo": 0.17151,
    "meteofrance": 0.111741,
    "gfs": 0.095286,
    "gem": 0.039908,
    "jma": 0.039908
  },
  "pressureWeights": {
    "ecmwfIfs": 0.316369,
    "ecmwfAifs": 0.150458,
    "icon": 0.150462,
    "ukmo": 0.168907,
    "meteofrance": 0.079189,
    "gfs": 0.055427,
    "gem": 0.039594,
    "jma": 0.039594
  }
} as const;

export default PROVINCE_CALIBRATION_TR_38;
