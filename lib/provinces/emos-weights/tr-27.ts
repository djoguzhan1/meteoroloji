import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_27: ProvinceCalibrationBundle = {
  "provinceCode": "TR-27",
  "provinceName": "Gaziantep",
  "plateNumber": 27,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17260",
  "stationLat": 37.0833,
  "stationLon": 37.3667,
  "stationElevationM": 701,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.143678,
          "icon": 0.32495,
          "ukmo": 0.256912,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.19446,
          "jma": 0.02
        },
        "intercept": 0.2725,
        "betaDrivers": [
          -0.2531,
          -0.0954,
          -0.9152,
          -0.4714,
          0.588,
          -0.0363
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5995,
        "spreadScale": 0.7104,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247574,
            "ecmwfAifs": 0.085077,
            "icon": 0.220489,
            "ukmo": 0.120927,
            "meteofrance": 0.151367,
            "gfs": 0.064196,
            "gem": 0.055749,
            "jma": 0.054621
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1773,
          "logisticSlope": 3.3315,
          "wetFractionWeight": 3.4613,
          "powerEta": 0.68,
          "rawBrier": 0.04766,
          "calibratedBrier": 0.04241
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4847,
          "rawIfsRmseC": 1.8792,
          "rawEqualMaeC": 1.1743,
          "rawEqualRmseC": 1.5525,
          "cvSimplexMaeC": 1.0452,
          "cvCalibratedMaeC": 0.9313,
          "cvCalibratedRmseC": 1.2386
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.061864,
          "ecmwfAifs": 0.242579,
          "icon": 0.214137,
          "ukmo": 0.218968,
          "meteofrance": 0.048295,
          "gfs": 0.02,
          "gem": 0.174157,
          "jma": 0.02
        },
        "intercept": 0.0843,
        "betaDrivers": [
          -0.155,
          -0.1186,
          -0.3735,
          -0.2188,
          0.2559,
          0.0276
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7068,
        "spreadScale": 0.7873,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31875,
            "ecmwfAifs": 0.228515,
            "icon": 0.137045,
            "ukmo": 0.109027,
            "meteofrance": 0.045052,
            "gfs": 0.062702,
            "gem": 0.054451,
            "jma": 0.044458
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.201,
          "logisticSlope": 3.5218,
          "wetFractionWeight": 3.2488,
          "powerEta": 0.68,
          "rawBrier": 0.04766,
          "calibratedBrier": 0.04199
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4847,
          "rawIfsRmseC": 1.8792,
          "rawEqualMaeC": 1.1743,
          "rawEqualRmseC": 1.5525,
          "cvSimplexMaeC": 1.0587,
          "cvCalibratedMaeC": 0.9903,
          "cvCalibratedRmseC": 1.3202
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.231764,
          "ukmo": 0.335675,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.332561,
          "jma": 0.02
        },
        "intercept": -0.0098,
        "betaDrivers": [
          -0.273,
          -0.1784,
          -0.3711,
          -0.4928,
          0.4013,
          0.0836
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1116,
        "spreadScale": 0.6199,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240537,
            "ecmwfAifs": 0.077658,
            "icon": 0.230431,
            "ukmo": 0.120173,
            "meteofrance": 0.154895,
            "gfs": 0.062403,
            "gem": 0.057609,
            "jma": 0.056294
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.149,
          "logisticSlope": 3.8474,
          "wetFractionWeight": 2.8793,
          "powerEta": 0.68,
          "rawBrier": 0.04216,
          "calibratedBrier": 0.0387
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4631,
          "rawIfsRmseC": 1.9603,
          "rawEqualMaeC": 1.2698,
          "rawEqualRmseC": 1.7174,
          "cvSimplexMaeC": 1.1116,
          "cvCalibratedMaeC": 1.0795,
          "cvCalibratedRmseC": 1.4168
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.167589,
          "ecmwfAifs": 0.109691,
          "icon": 0.160878,
          "ukmo": 0.250803,
          "meteofrance": 0.025402,
          "gfs": 0.02,
          "gem": 0.245637,
          "jma": 0.02
        },
        "intercept": -0.169,
        "betaDrivers": [
          -0.2046,
          -0.1527,
          -0.1527,
          -0.1839,
          0.179,
          0.1085
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9639,
        "spreadScale": 0.815,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.316982,
            "ecmwfAifs": 0.213501,
            "icon": 0.146597,
            "ukmo": 0.110898,
            "meteofrance": 0.045146,
            "gfs": 0.062386,
            "gem": 0.057592,
            "jma": 0.046898
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2358,
          "logisticSlope": 3.8361,
          "wetFractionWeight": 3.1907,
          "powerEta": 0.68,
          "rawBrier": 0.04216,
          "calibratedBrier": 0.03754
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4631,
          "rawIfsRmseC": 1.9603,
          "rawEqualMaeC": 1.2698,
          "rawEqualRmseC": 1.7174,
          "cvSimplexMaeC": 1.1453,
          "cvCalibratedMaeC": 1.1067,
          "cvCalibratedRmseC": 1.4622
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.217869,
          "icon": 0.261541,
          "ukmo": 0.151739,
          "meteofrance": 0.048022,
          "gfs": 0.02,
          "gem": 0.260829,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.033,
          0.1811,
          -0.1071,
          -0.3463,
          0.7822,
          -0.16
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0229,
        "spreadScale": 0.6745,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22598,
            "ecmwfAifs": 0.080563,
            "icon": 0.220547,
            "ukmo": 0.129945,
            "meteofrance": 0.161886,
            "gfs": 0.069076,
            "gem": 0.051672,
            "jma": 0.060331
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.9665,
          "logisticSlope": 3.1605,
          "wetFractionWeight": 1.8386,
          "powerEta": 0.68,
          "rawBrier": 0.00218,
          "calibratedBrier": 0.00218
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3167,
          "rawIfsRmseC": 1.6939,
          "rawEqualMaeC": 1.1333,
          "rawEqualRmseC": 1.4844,
          "cvSimplexMaeC": 1.1024,
          "cvCalibratedMaeC": 1.0815,
          "cvCalibratedRmseC": 1.425
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.196154,
          "ecmwfAifs": 0.232259,
          "icon": 0.155199,
          "ukmo": 0.155238,
          "meteofrance": 0.055954,
          "gfs": 0.02,
          "gem": 0.165196,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0393,
          0.0909,
          -0.0295,
          -0.0925,
          0.3219,
          0.0011
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1178,
        "spreadScale": 0.6568,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.299135,
            "ecmwfAifs": 0.222479,
            "icon": 0.140938,
            "ukmo": 0.120454,
            "meteofrance": 0.04525,
            "gfs": 0.069367,
            "gem": 0.05189,
            "jma": 0.050487
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.9849,
          "logisticSlope": 3.0432,
          "wetFractionWeight": 1.8614,
          "powerEta": 0.68,
          "rawBrier": 0.00218,
          "calibratedBrier": 0.00218
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3167,
          "rawIfsRmseC": 1.6939,
          "rawEqualMaeC": 1.1333,
          "rawEqualRmseC": 1.4844,
          "cvSimplexMaeC": 1.1184,
          "cvCalibratedMaeC": 1.1115,
          "cvCalibratedRmseC": 1.4493
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.192403,
          "ukmo": 0.304368,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.403229,
          "jma": 0.02
        },
        "intercept": 0.1156,
        "betaDrivers": [
          -0.4458,
          -0.2713,
          -0.7059,
          -0.7257,
          0.7777,
          0.1485
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.5059,
        "spreadScale": 0.5213,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241086,
            "ecmwfAifs": 0.081703,
            "icon": 0.21737,
            "ukmo": 0.12574,
            "meteofrance": 0.152727,
            "gfs": 0.066024,
            "gem": 0.057405,
            "jma": 0.057945
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6579,
          "logisticSlope": 4.7458,
          "wetFractionWeight": 2.7422,
          "powerEta": 0.68,
          "rawBrier": 0.01768,
          "calibratedBrier": 0.01697
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.7525,
          "rawIfsRmseC": 2.3393,
          "rawEqualMaeC": 1.5985,
          "rawEqualRmseC": 2.1282,
          "cvSimplexMaeC": 1.2906,
          "cvCalibratedMaeC": 1.2049,
          "cvCalibratedRmseC": 1.5619
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.066346,
          "ecmwfAifs": 0.109512,
          "icon": 0.172204,
          "ukmo": 0.285017,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.306921,
          "jma": 0.02
        },
        "intercept": -0.0127,
        "betaDrivers": [
          -0.2439,
          -0.2423,
          -0.2996,
          -0.2278,
          0.2972,
          0.0564
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.4111,
        "spreadScale": 0.7058,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313309,
            "ecmwfAifs": 0.221511,
            "icon": 0.136373,
            "ukmo": 0.114428,
            "meteofrance": 0.045088,
            "gfs": 0.065091,
            "gem": 0.056594,
            "jma": 0.047606
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7043,
          "logisticSlope": 4.7538,
          "wetFractionWeight": 2.7904,
          "powerEta": 0.68,
          "rawBrier": 0.01768,
          "calibratedBrier": 0.01644
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.7525,
          "rawIfsRmseC": 2.3393,
          "rawEqualMaeC": 1.5985,
          "rawEqualRmseC": 2.1282,
          "cvSimplexMaeC": 1.3245,
          "cvCalibratedMaeC": 1.2487,
          "cvCalibratedRmseC": 1.633
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.143678,
          "icon": 0.32495,
          "ukmo": 0.256912,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.19446,
          "jma": 0.02
        },
        "interceptC": 0.2725,
        "diurnalHarmonicsC": [
          -0.2531,
          -0.0954,
          0,
          0
        ],
        "driverBetasC": [
          -0.9152,
          -0.0363,
          -0.4714,
          0.588
        ],
        "spreadBaseC2": 0.5995,
        "spreadScale": 0.7104,
        "cvMaeC": 0.9313,
        "cvRmseC": 1.2386,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.040932,
          "ecmwfAifs": 0.193129,
          "icon": 0.269543,
          "ukmo": 0.237939,
          "meteofrance": 0.034148,
          "gfs": 0.02,
          "gem": 0.184309,
          "jma": 0.02
        },
        "interceptC": 0.1784,
        "diurnalHarmonicsC": [
          -0.2041,
          -0.107,
          0,
          0
        ],
        "driverBetasC": [
          -0.6443,
          -0.0043,
          -0.3451,
          0.4219
        ],
        "spreadBaseC2": 0.6532,
        "spreadScale": 0.7489,
        "cvMaeC": 0.9608,
        "cvRmseC": 1.2794,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.061864,
          "ecmwfAifs": 0.242579,
          "icon": 0.214137,
          "ukmo": 0.218968,
          "meteofrance": 0.048295,
          "gfs": 0.02,
          "gem": 0.174157,
          "jma": 0.02
        },
        "interceptC": 0.0843,
        "diurnalHarmonicsC": [
          -0.155,
          -0.1186,
          0,
          0
        ],
        "driverBetasC": [
          -0.3735,
          0.0276,
          -0.2188,
          0.2559
        ],
        "spreadBaseC2": 0.7068,
        "spreadScale": 0.7873,
        "cvMaeC": 0.9903,
        "cvRmseC": 1.3202,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.231764,
          "ukmo": 0.335675,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.332561,
          "jma": 0.02
        },
        "interceptC": -0.0098,
        "diurnalHarmonicsC": [
          -0.273,
          -0.1784,
          0,
          0
        ],
        "driverBetasC": [
          -0.3711,
          0.0836,
          -0.4928,
          0.4013
        ],
        "spreadBaseC2": 1.1116,
        "spreadScale": 0.6199,
        "cvMaeC": 1.0795,
        "cvRmseC": 1.4168,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.093795,
          "ecmwfAifs": 0.064846,
          "icon": 0.196321,
          "ukmo": 0.293238,
          "meteofrance": 0.022701,
          "gfs": 0.02,
          "gem": 0.289099,
          "jma": 0.02
        },
        "interceptC": -0.0894,
        "diurnalHarmonicsC": [
          -0.2388,
          -0.1656,
          0,
          0
        ],
        "driverBetasC": [
          -0.2619,
          0.096,
          -0.3384,
          0.2902
        ],
        "spreadBaseC2": 1.0377,
        "spreadScale": 0.7174,
        "cvMaeC": 1.0931,
        "cvRmseC": 1.4395,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.167589,
          "ecmwfAifs": 0.109691,
          "icon": 0.160878,
          "ukmo": 0.250803,
          "meteofrance": 0.025402,
          "gfs": 0.02,
          "gem": 0.245637,
          "jma": 0.02
        },
        "interceptC": -0.169,
        "diurnalHarmonicsC": [
          -0.2046,
          -0.1527,
          0,
          0
        ],
        "driverBetasC": [
          -0.1527,
          0.1085,
          -0.1839,
          0.179
        ],
        "spreadBaseC2": 0.9639,
        "spreadScale": 0.815,
        "cvMaeC": 1.1067,
        "cvRmseC": 1.4622,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.217869,
          "icon": 0.261541,
          "ukmo": 0.151739,
          "meteofrance": 0.048022,
          "gfs": 0.02,
          "gem": 0.260829,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.033,
          0.1811,
          0,
          0
        ],
        "driverBetasC": [
          -0.1071,
          -0.16,
          -0.3463,
          0.7822
        ],
        "spreadBaseC2": 1.0229,
        "spreadScale": 0.6745,
        "cvMaeC": 1.0815,
        "cvRmseC": 1.425,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.108077,
          "ecmwfAifs": 0.225063,
          "icon": 0.20837,
          "ukmo": 0.153489,
          "meteofrance": 0.051988,
          "gfs": 0.02,
          "gem": 0.213013,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0362,
          0.136,
          0,
          0
        ],
        "driverBetasC": [
          -0.0683,
          -0.0795,
          -0.2194,
          0.5521
        ],
        "spreadBaseC2": 1.0703,
        "spreadScale": 0.6657,
        "cvMaeC": 1.0965,
        "cvRmseC": 1.4371,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.196154,
          "ecmwfAifs": 0.232259,
          "icon": 0.155199,
          "ukmo": 0.155238,
          "meteofrance": 0.055954,
          "gfs": 0.02,
          "gem": 0.165196,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0393,
          0.0909,
          0,
          0
        ],
        "driverBetasC": [
          -0.0295,
          0.0011,
          -0.0925,
          0.3219
        ],
        "spreadBaseC2": 1.1178,
        "spreadScale": 0.6568,
        "cvMaeC": 1.1115,
        "cvRmseC": 1.4493,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.192403,
          "ukmo": 0.304368,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.403229,
          "jma": 0.02
        },
        "interceptC": 0.1156,
        "diurnalHarmonicsC": [
          -0.4458,
          -0.2713,
          0,
          0
        ],
        "driverBetasC": [
          -0.7059,
          0.1485,
          -0.7257,
          0.7777
        ],
        "spreadBaseC2": 1.5059,
        "spreadScale": 0.5213,
        "cvMaeC": 1.2049,
        "cvRmseC": 1.5619,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.043173,
          "ecmwfAifs": 0.064756,
          "icon": 0.182303,
          "ukmo": 0.294693,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.355075,
          "jma": 0.02
        },
        "interceptC": 0.0514,
        "diurnalHarmonicsC": [
          -0.3448,
          -0.2568,
          0,
          0
        ],
        "driverBetasC": [
          -0.5028,
          0.1024,
          -0.4768,
          0.5374
        ],
        "spreadBaseC2": 1.4585,
        "spreadScale": 0.6136,
        "cvMaeC": 1.2268,
        "cvRmseC": 1.5975,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.066346,
          "ecmwfAifs": 0.109512,
          "icon": 0.172204,
          "ukmo": 0.285017,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.306921,
          "jma": 0.02
        },
        "interceptC": -0.0127,
        "diurnalHarmonicsC": [
          -0.2439,
          -0.2423,
          0,
          0
        ],
        "driverBetasC": [
          -0.2996,
          0.0564,
          -0.2278,
          0.2972
        ],
        "spreadBaseC2": 1.4111,
        "spreadScale": 0.7058,
        "cvMaeC": 1.2487,
        "cvRmseC": 1.633,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.247574,
        "ecmwfAifs": 0.085077,
        "icon": 0.220489,
        "ukmo": 0.120927,
        "meteofrance": 0.151367,
        "gfs": 0.064196,
        "gem": 0.055749,
        "jma": 0.054621
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.240537,
        "ecmwfAifs": 0.077658,
        "icon": 0.230431,
        "ukmo": 0.120173,
        "meteofrance": 0.154895,
        "gfs": 0.062403,
        "gem": 0.057609,
        "jma": 0.056294
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.22598,
        "ecmwfAifs": 0.080563,
        "icon": 0.220547,
        "ukmo": 0.129945,
        "meteofrance": 0.161886,
        "gfs": 0.069076,
        "gem": 0.051672,
        "jma": 0.060331
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.241086,
        "ecmwfAifs": 0.081703,
        "icon": 0.21737,
        "ukmo": 0.12574,
        "meteofrance": 0.152727,
        "gfs": 0.066024,
        "gem": 0.057405,
        "jma": 0.057945
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.215751,
    "ecmwfAifs": 0.069436,
    "icon": 0.277893,
    "ukmo": 0.162224,
    "meteofrance": 0.108012,
    "gfs": 0.089532,
    "gem": 0.038576,
    "jma": 0.038576
  },
  "pressureWeights": {
    "ecmwfIfs": 0.308288,
    "ecmwfAifs": 0.149009,
    "icon": 0.141965,
    "ukmo": 0.17413,
    "meteofrance": 0.078426,
    "gfs": 0.069756,
    "gem": 0.039213,
    "jma": 0.039213
  }
} as const;

export default PROVINCE_CALIBRATION_TR_27;
