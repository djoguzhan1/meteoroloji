import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_65: ProvinceCalibrationBundle = {
  "provinceCode": "TR-65",
  "provinceName": "Van",
  "plateNumber": 65,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17170",
  "stationLat": 38.45,
  "stationLon": 43.3167,
  "stationElevationM": 1667,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.062959,
          "ecmwfAifs": 0.418387,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.042144,
          "gfs": 0.02,
          "gem": 0.371015,
          "jma": 0.045495
        },
        "intercept": 0.7422,
        "betaDrivers": [
          0.0158,
          -0.3397,
          -0.9141,
          -0.0916,
          0.1205,
          -0.1773
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5771,
        "spreadScale": 0.3986,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259416,
            "ecmwfAifs": 0.0816,
            "icon": 0.219753,
            "ukmo": 0.109746,
            "meteofrance": 0.155041,
            "gfs": 0.062025,
            "gem": 0.053983,
            "jma": 0.058436
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7384,
          "logisticSlope": 6.2844,
          "wetFractionWeight": 2.6896,
          "powerEta": 0.68,
          "rawBrier": 0.04902,
          "calibratedBrier": 0.04531
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8548,
          "rawIfsRmseC": 2.4562,
          "rawEqualMaeC": 1.5888,
          "rawEqualRmseC": 1.9128,
          "cvSimplexMaeC": 1.5037,
          "cvCalibratedMaeC": 1.3486,
          "cvCalibratedRmseC": 1.7353
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.230411,
          "ecmwfAifs": 0.385926,
          "icon": 0.035239,
          "ukmo": 0.039503,
          "meteofrance": 0.026516,
          "gfs": 0.02,
          "gem": 0.208255,
          "jma": 0.05415
        },
        "intercept": 0.6118,
        "betaDrivers": [
          -0.026,
          -0.272,
          -0.3487,
          -0.0042,
          0.0646,
          -0.0138
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.4904,
        "spreadScale": 0.4605,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.335864,
            "ecmwfAifs": 0.220402,
            "icon": 0.137352,
            "ukmo": 0.0995,
            "meteofrance": 0.045111,
            "gfs": 0.060921,
            "gem": 0.053021,
            "jma": 0.047829
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8172,
          "logisticSlope": 6.4788,
          "wetFractionWeight": 2.2899,
          "powerEta": 0.68,
          "rawBrier": 0.04902,
          "calibratedBrier": 0.04556
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8548,
          "rawIfsRmseC": 2.4562,
          "rawEqualMaeC": 1.5888,
          "rawEqualRmseC": 1.9128,
          "cvSimplexMaeC": 1.5176,
          "cvCalibratedMaeC": 1.394,
          "cvCalibratedRmseC": 1.7719
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.221759,
          "ecmwfAifs": 0.272688,
          "icon": 0.079976,
          "ukmo": 0.150724,
          "meteofrance": 0.04744,
          "gfs": 0.021818,
          "gem": 0.166067,
          "jma": 0.039528
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0172,
          -0.2593,
          -0.4844,
          -0.2253,
          0.049,
          0.3266
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5965,
        "spreadScale": 0.4138,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24257,
            "ecmwfAifs": 0.076853,
            "icon": 0.219281,
            "ukmo": 0.119421,
            "meteofrance": 0.160199,
            "gfs": 0.064672,
            "gem": 0.057637,
            "jma": 0.059367
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6205,
          "logisticSlope": 2.9194,
          "wetFractionWeight": 3.1905,
          "powerEta": 0.68,
          "rawBrier": 0.06503,
          "calibratedBrier": 0.05906
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8633,
          "rawIfsRmseC": 2.4553,
          "rawEqualMaeC": 1.3574,
          "rawEqualRmseC": 1.7071,
          "cvSimplexMaeC": 1.3441,
          "cvCalibratedMaeC": 1.3205,
          "cvCalibratedRmseC": 1.6963
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.254969,
          "ecmwfAifs": 0.300013,
          "icon": 0.102395,
          "ukmo": 0.126014,
          "meteofrance": 0.02973,
          "gfs": 0.037413,
          "gem": 0.109746,
          "jma": 0.03972
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0044,
          -0.1586,
          -0.159,
          -0.0532,
          0.0183,
          0.1649
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6648,
        "spreadScale": 0.3821,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320463,
            "ecmwfAifs": 0.211817,
            "icon": 0.139853,
            "ukmo": 0.11048,
            "meteofrance": 0.045223,
            "gfs": 0.064816,
            "gem": 0.057765,
            "jma": 0.049583
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6654,
          "logisticSlope": 3.1081,
          "wetFractionWeight": 3.1236,
          "powerEta": 0.68,
          "rawBrier": 0.06503,
          "calibratedBrier": 0.05882
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8633,
          "rawIfsRmseC": 2.4553,
          "rawEqualMaeC": 1.3574,
          "rawEqualRmseC": 1.7071,
          "cvSimplexMaeC": 1.3338,
          "cvCalibratedMaeC": 1.3212,
          "cvCalibratedRmseC": 1.6872
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.518084,
          "ecmwfAifs": 0.02,
          "icon": 0.021312,
          "ukmo": 0.02,
          "meteofrance": 0.142008,
          "gfs": 0.02,
          "gem": 0.238596,
          "jma": 0.02
        },
        "intercept": -0.2899,
        "betaDrivers": [
          0.0053,
          -0.1452,
          -0.417,
          -0.109,
          0.1304,
          0.0316
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.9748,
        "spreadScale": 0.1081,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231954,
            "ecmwfAifs": 0.08515,
            "icon": 0.215435,
            "ukmo": 0.12305,
            "meteofrance": 0.166317,
            "gfs": 0.06839,
            "gem": 0.053863,
            "jma": 0.055841
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8343,
          "logisticSlope": 2.8353,
          "wetFractionWeight": 1.147,
          "powerEta": 0.68,
          "rawBrier": 0.01257,
          "calibratedBrier": 0.00888
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5464,
          "rawIfsRmseC": 1.9794,
          "rawEqualMaeC": 1.6829,
          "rawEqualRmseC": 2.169,
          "cvSimplexMaeC": 1.4633,
          "cvCalibratedMaeC": 1.4265,
          "cvCalibratedRmseC": 1.8311
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.454365,
          "ecmwfAifs": 0.08529,
          "icon": 0.100055,
          "ukmo": 0.02,
          "meteofrance": 0.102503,
          "gfs": 0.029893,
          "gem": 0.187894,
          "jma": 0.02
        },
        "intercept": -0.5109,
        "betaDrivers": [
          0.0032,
          -0.1528,
          -0.1709,
          -0.0321,
          0.0554,
          -0.0136
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 3.0292,
        "spreadScale": 0.0684,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304268,
            "ecmwfAifs": 0.233021,
            "icon": 0.136426,
            "ukmo": 0.113031,
            "meteofrance": 0.045289,
            "gfs": 0.068057,
            "gem": 0.053601,
            "jma": 0.046307
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8359,
          "logisticSlope": 2.9491,
          "wetFractionWeight": 1.263,
          "powerEta": 0.68,
          "rawBrier": 0.01257,
          "calibratedBrier": 0.00888
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5464,
          "rawIfsRmseC": 1.9794,
          "rawEqualMaeC": 1.6829,
          "rawEqualRmseC": 2.169,
          "cvSimplexMaeC": 1.4813,
          "cvCalibratedMaeC": 1.4113,
          "cvCalibratedRmseC": 1.808
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.520406,
          "ecmwfAifs": 0.09933,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.280264,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.3368,
          -0.3687,
          -0.5024,
          -0.1641,
          0.1319,
          0.0158
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.3675,
        "spreadScale": 0.7746,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.228354,
            "ecmwfAifs": 0.084396,
            "icon": 0.225956,
            "ukmo": 0.119258,
            "meteofrance": 0.160393,
            "gfs": 0.067354,
            "gem": 0.056228,
            "jma": 0.058061
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0596,
          "logisticSlope": 5.3506,
          "wetFractionWeight": 2.5285,
          "powerEta": 0.68,
          "rawBrier": 0.03049,
          "calibratedBrier": 0.03049
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.5473,
          "rawIfsRmseC": 2.0745,
          "rawEqualMaeC": 1.8346,
          "rawEqualRmseC": 2.2511,
          "cvSimplexMaeC": 1.5263,
          "cvCalibratedMaeC": 1.4772,
          "cvCalibratedRmseC": 1.9432
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.481453,
          "ecmwfAifs": 0.157591,
          "icon": 0.059748,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.221208,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1671,
          -0.2924,
          -0.2114,
          -0.0244,
          0.0519,
          -0.051
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5585,
        "spreadScale": 0.6522,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.29971,
            "ecmwfAifs": 0.231083,
            "icon": 0.143167,
            "ukmo": 0.109608,
            "meteofrance": 0.045211,
            "gfs": 0.067062,
            "gem": 0.055985,
            "jma": 0.048174
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1561,
          "logisticSlope": 5.0776,
          "wetFractionWeight": 2.546,
          "powerEta": 0.68,
          "rawBrier": 0.03049,
          "calibratedBrier": 0.03028
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.5473,
          "rawIfsRmseC": 2.0745,
          "rawEqualMaeC": 1.8346,
          "rawEqualRmseC": 2.2511,
          "cvSimplexMaeC": 1.5295,
          "cvCalibratedMaeC": 1.4676,
          "cvCalibratedRmseC": 1.8898
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.062959,
          "ecmwfAifs": 0.418387,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.042144,
          "gfs": 0.02,
          "gem": 0.371015,
          "jma": 0.045495
        },
        "interceptC": 0.7422,
        "diurnalHarmonicsC": [
          0.0158,
          -0.3397,
          0,
          0
        ],
        "driverBetasC": [
          -0.9141,
          -0.1773,
          -0.0916,
          0.1205
        ],
        "spreadBaseC2": 1.5771,
        "spreadScale": 0.3986,
        "cvMaeC": 1.3486,
        "cvRmseC": 1.7353,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.146685,
          "ecmwfAifs": 0.402156,
          "icon": 0.02762,
          "ukmo": 0.029752,
          "meteofrance": 0.03433,
          "gfs": 0.02,
          "gem": 0.289634,
          "jma": 0.049823
        },
        "interceptC": 0.677,
        "diurnalHarmonicsC": [
          -0.0051,
          -0.3059,
          0,
          0
        ],
        "driverBetasC": [
          -0.6314,
          -0.0956,
          -0.0479,
          0.0925
        ],
        "spreadBaseC2": 1.5337,
        "spreadScale": 0.4295,
        "cvMaeC": 1.3713,
        "cvRmseC": 1.7536,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.230411,
          "ecmwfAifs": 0.385926,
          "icon": 0.035239,
          "ukmo": 0.039503,
          "meteofrance": 0.026516,
          "gfs": 0.02,
          "gem": 0.208255,
          "jma": 0.05415
        },
        "interceptC": 0.6118,
        "diurnalHarmonicsC": [
          -0.026,
          -0.272,
          0,
          0
        ],
        "driverBetasC": [
          -0.3487,
          -0.0138,
          -0.0042,
          0.0646
        ],
        "spreadBaseC2": 1.4904,
        "spreadScale": 0.4605,
        "cvMaeC": 1.394,
        "cvRmseC": 1.7719,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.221759,
          "ecmwfAifs": 0.272688,
          "icon": 0.079976,
          "ukmo": 0.150724,
          "meteofrance": 0.04744,
          "gfs": 0.021818,
          "gem": 0.166067,
          "jma": 0.039528
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0172,
          -0.2593,
          0,
          0
        ],
        "driverBetasC": [
          -0.4844,
          0.3266,
          -0.2253,
          0.049
        ],
        "spreadBaseC2": 1.5965,
        "spreadScale": 0.4138,
        "cvMaeC": 1.3205,
        "cvRmseC": 1.6963,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.238364,
          "ecmwfAifs": 0.286349,
          "icon": 0.091186,
          "ukmo": 0.138369,
          "meteofrance": 0.038585,
          "gfs": 0.029616,
          "gem": 0.137907,
          "jma": 0.039624
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0108,
          -0.2089,
          0,
          0
        ],
        "driverBetasC": [
          -0.3217,
          0.2457,
          -0.1392,
          0.0336
        ],
        "spreadBaseC2": 1.6307,
        "spreadScale": 0.398,
        "cvMaeC": 1.3209,
        "cvRmseC": 1.6917,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.254969,
          "ecmwfAifs": 0.300013,
          "icon": 0.102395,
          "ukmo": 0.126014,
          "meteofrance": 0.02973,
          "gfs": 0.037413,
          "gem": 0.109746,
          "jma": 0.03972
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0044,
          -0.1586,
          0,
          0
        ],
        "driverBetasC": [
          -0.159,
          0.1649,
          -0.0532,
          0.0183
        ],
        "spreadBaseC2": 1.6648,
        "spreadScale": 0.3821,
        "cvMaeC": 1.3212,
        "cvRmseC": 1.6872,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.518084,
          "ecmwfAifs": 0.02,
          "icon": 0.021312,
          "ukmo": 0.02,
          "meteofrance": 0.142008,
          "gfs": 0.02,
          "gem": 0.238596,
          "jma": 0.02
        },
        "interceptC": -0.2899,
        "diurnalHarmonicsC": [
          0.0053,
          -0.1452,
          0,
          0
        ],
        "driverBetasC": [
          -0.417,
          0.0316,
          -0.109,
          0.1304
        ],
        "spreadBaseC2": 2.9748,
        "spreadScale": 0.1081,
        "cvMaeC": 1.4265,
        "cvRmseC": 1.8311,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.486224,
          "ecmwfAifs": 0.052645,
          "icon": 0.060684,
          "ukmo": 0.02,
          "meteofrance": 0.122255,
          "gfs": 0.024947,
          "gem": 0.213245,
          "jma": 0.02
        },
        "interceptC": -0.4004,
        "diurnalHarmonicsC": [
          0.0043,
          -0.149,
          0,
          0
        ],
        "driverBetasC": [
          -0.2939,
          0.009,
          -0.0706,
          0.0929
        ],
        "spreadBaseC2": 3.002,
        "spreadScale": 0.0882,
        "cvMaeC": 1.4189,
        "cvRmseC": 1.8196,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.454365,
          "ecmwfAifs": 0.08529,
          "icon": 0.100055,
          "ukmo": 0.02,
          "meteofrance": 0.102503,
          "gfs": 0.029893,
          "gem": 0.187894,
          "jma": 0.02
        },
        "interceptC": -0.5109,
        "diurnalHarmonicsC": [
          0.0032,
          -0.1528,
          0,
          0
        ],
        "driverBetasC": [
          -0.1709,
          -0.0136,
          -0.0321,
          0.0554
        ],
        "spreadBaseC2": 3.0292,
        "spreadScale": 0.0684,
        "cvMaeC": 1.4113,
        "cvRmseC": 1.808,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.520406,
          "ecmwfAifs": 0.09933,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.280264,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.3368,
          -0.3687,
          0,
          0
        ],
        "driverBetasC": [
          -0.5024,
          0.0158,
          -0.1641,
          0.1319
        ],
        "spreadBaseC2": 1.3675,
        "spreadScale": 0.7746,
        "cvMaeC": 1.4772,
        "cvRmseC": 1.9432,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.500929,
          "ecmwfAifs": 0.128461,
          "icon": 0.039874,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.250736,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.252,
          -0.3306,
          0,
          0
        ],
        "driverBetasC": [
          -0.3569,
          -0.0176,
          -0.0943,
          0.0919
        ],
        "spreadBaseC2": 1.463,
        "spreadScale": 0.7134,
        "cvMaeC": 1.4724,
        "cvRmseC": 1.9165,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.481453,
          "ecmwfAifs": 0.157591,
          "icon": 0.059748,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.221208,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1671,
          -0.2924,
          0,
          0
        ],
        "driverBetasC": [
          -0.2114,
          -0.051,
          -0.0244,
          0.0519
        ],
        "spreadBaseC2": 1.5585,
        "spreadScale": 0.6522,
        "cvMaeC": 1.4676,
        "cvRmseC": 1.8898,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.259416,
        "ecmwfAifs": 0.0816,
        "icon": 0.219753,
        "ukmo": 0.109746,
        "meteofrance": 0.155041,
        "gfs": 0.062025,
        "gem": 0.053983,
        "jma": 0.058436
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.24257,
        "ecmwfAifs": 0.076853,
        "icon": 0.219281,
        "ukmo": 0.119421,
        "meteofrance": 0.160199,
        "gfs": 0.064672,
        "gem": 0.057637,
        "jma": 0.059367
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.231954,
        "ecmwfAifs": 0.08515,
        "icon": 0.215435,
        "ukmo": 0.12305,
        "meteofrance": 0.166317,
        "gfs": 0.06839,
        "gem": 0.053863,
        "jma": 0.055841
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.228354,
        "ecmwfAifs": 0.084396,
        "icon": 0.225956,
        "ukmo": 0.119258,
        "meteofrance": 0.160393,
        "gfs": 0.067354,
        "gem": 0.056228,
        "jma": 0.058061
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.239285,
    "ecmwfAifs": 0.071303,
    "icon": 0.218376,
    "ukmo": 0.175418,
    "meteofrance": 0.110915,
    "gfs": 0.105477,
    "gem": 0.039613,
    "jma": 0.039613
  },
  "pressureWeights": {
    "ecmwfIfs": 0.35404,
    "ecmwfAifs": 0.140265,
    "icon": 0.18234,
    "ukmo": 0.138326,
    "meteofrance": 0.073824,
    "gfs": 0.037381,
    "gem": 0.036912,
    "jma": 0.036912
  }
} as const;

export default PROVINCE_CALIBRATION_TR_65;
