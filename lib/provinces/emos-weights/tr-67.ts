import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_67: ProvinceCalibrationBundle = {
  "provinceCode": "TR-67",
  "provinceName": "Zonguldak",
  "plateNumber": 67,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17022",
  "stationLat": 41.45,
  "stationLon": 31.8,
  "stationElevationM": 136,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.251841,
          "ukmo": 0.23687,
          "meteofrance": 0.02,
          "gfs": 0.380362,
          "gem": 0.050927,
          "jma": 0.02
        },
        "intercept": 1.1795,
        "betaDrivers": [
          0.0959,
          0.2826,
          0.3021,
          0.5498,
          0.2998,
          -1.233
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5417,
        "spreadScale": 1.194,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242823,
            "ecmwfAifs": 0.088764,
            "icon": 0.224638,
            "ukmo": 0.110334,
            "meteofrance": 0.152263,
            "gfs": 0.065993,
            "gem": 0.055374,
            "jma": 0.059811
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0325,
          "logisticSlope": 4.5738,
          "wetFractionWeight": 2.7838,
          "powerEta": 0.68,
          "rawBrier": 0.06798,
          "calibratedBrier": 0.0635
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.5663,
          "rawIfsRmseC": 2.1346,
          "rawEqualMaeC": 1.3314,
          "rawEqualRmseC": 1.7995,
          "cvSimplexMaeC": 1.1982,
          "cvCalibratedMaeC": 0.956,
          "cvCalibratedRmseC": 1.3249
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.113837,
          "ecmwfAifs": 0.069817,
          "icon": 0.197078,
          "ukmo": 0.205557,
          "meteofrance": 0.02,
          "gfs": 0.252787,
          "gem": 0.120924,
          "jma": 0.02
        },
        "intercept": 0.7997,
        "betaDrivers": [
          0.0841,
          0.1702,
          0.1966,
          0.2976,
          0.0777,
          -0.5318
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4509,
        "spreadScale": 1.5423,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31184,
            "ecmwfAifs": 0.237813,
            "icon": 0.139269,
            "ukmo": 0.099223,
            "meteofrance": 0.045058,
            "gfs": 0.064292,
            "gem": 0.053947,
            "jma": 0.048558
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0772,
          "logisticSlope": 4.782,
          "wetFractionWeight": 2.6229,
          "powerEta": 0.68,
          "rawBrier": 0.06798,
          "calibratedBrier": 0.0628
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.5663,
          "rawIfsRmseC": 2.1346,
          "rawEqualMaeC": 1.3314,
          "rawEqualRmseC": 1.7995,
          "cvSimplexMaeC": 1.2252,
          "cvCalibratedMaeC": 1.0391,
          "cvCalibratedRmseC": 1.4196
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.180796,
          "ukmo": 0.440297,
          "meteofrance": 0.02,
          "gfs": 0.153277,
          "gem": 0.14563,
          "jma": 0.02
        },
        "intercept": 0.7677,
        "betaDrivers": [
          0.2769,
          0.4978,
          0.4575,
          0.4666,
          0.3439,
          -0.743
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9553,
        "spreadScale": 1.5635,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243907,
            "ecmwfAifs": 0.071877,
            "icon": 0.218944,
            "ukmo": 0.116296,
            "meteofrance": 0.160752,
            "gfs": 0.068275,
            "gem": 0.061711,
            "jma": 0.058238
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8631,
          "logisticSlope": 4.0647,
          "wetFractionWeight": 2.505,
          "powerEta": 0.68,
          "rawBrier": 0.0492,
          "calibratedBrier": 0.04699
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.7212,
          "rawIfsRmseC": 2.3719,
          "rawEqualMaeC": 1.4744,
          "rawEqualRmseC": 1.9788,
          "cvSimplexMaeC": 1.4222,
          "cvCalibratedMaeC": 1.2689,
          "cvCalibratedRmseC": 1.7493
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.129236,
          "ecmwfAifs": 0.160428,
          "icon": 0.182843,
          "ukmo": 0.259324,
          "meteofrance": 0.02,
          "gfs": 0.138094,
          "gem": 0.090075,
          "jma": 0.02
        },
        "intercept": 0.6307,
        "betaDrivers": [
          0.141,
          0.3011,
          0.2204,
          0.2305,
          0.0885,
          -0.3611
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8265,
        "spreadScale": 1.8442,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325047,
            "ecmwfAifs": 0.199835,
            "icon": 0.140859,
            "ukmo": 0.10853,
            "meteofrance": 0.045249,
            "gfs": 0.069025,
            "gem": 0.06239,
            "jma": 0.049065
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9427,
          "logisticSlope": 4.0951,
          "wetFractionWeight": 2.5811,
          "powerEta": 0.68,
          "rawBrier": 0.0492,
          "calibratedBrier": 0.04715
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.7212,
          "rawIfsRmseC": 2.3719,
          "rawEqualMaeC": 1.4744,
          "rawEqualRmseC": 1.9788,
          "cvSimplexMaeC": 1.4421,
          "cvCalibratedMaeC": 1.3303,
          "cvCalibratedRmseC": 1.816
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.244935,
          "icon": 0.02,
          "ukmo": 0.253399,
          "meteofrance": 0.085016,
          "gfs": 0.142311,
          "gem": 0.214339,
          "jma": 0.02
        },
        "intercept": 0.1099,
        "betaDrivers": [
          -0.0765,
          0.2378,
          0.3931,
          0.0616,
          0.2654,
          0.0229
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.792,
        "spreadScale": 1.4235,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240073,
            "ecmwfAifs": 0.084019,
            "icon": 0.211618,
            "ukmo": 0.119916,
            "meteofrance": 0.156348,
            "gfs": 0.068664,
            "gem": 0.058779,
            "jma": 0.060583
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1686,
          "logisticSlope": 3.4087,
          "wetFractionWeight": 3.5788,
          "powerEta": 0.68,
          "rawBrier": 0.02777,
          "calibratedBrier": 0.02652
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3801,
          "rawIfsRmseC": 1.8531,
          "rawEqualMaeC": 1.1981,
          "rawEqualRmseC": 1.565,
          "cvSimplexMaeC": 1.1723,
          "cvCalibratedMaeC": 1.1309,
          "cvCalibratedRmseC": 1.5595
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.162423,
          "ecmwfAifs": 0.288614,
          "icon": 0.02,
          "ukmo": 0.184996,
          "meteofrance": 0.079638,
          "gfs": 0.122784,
          "gem": 0.121545,
          "jma": 0.02
        },
        "intercept": 0.0571,
        "betaDrivers": [
          -0.0567,
          0.164,
          0.1574,
          0.0145,
          0.0765,
          0.0411
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7289,
        "spreadScale": 1.4568,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311265,
            "ecmwfAifs": 0.227261,
            "icon": 0.132457,
            "ukmo": 0.108875,
            "meteofrance": 0.045132,
            "gfs": 0.067538,
            "gem": 0.057815,
            "jma": 0.049657
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.297,
          "logisticSlope": 3.2873,
          "wetFractionWeight": 3.601,
          "powerEta": 0.68,
          "rawBrier": 0.02777,
          "calibratedBrier": 0.02564
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3801,
          "rawIfsRmseC": 1.8531,
          "rawEqualMaeC": 1.1981,
          "rawEqualRmseC": 1.565,
          "cvSimplexMaeC": 1.1615,
          "cvCalibratedMaeC": 1.1296,
          "cvCalibratedRmseC": 1.5518
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.035767,
          "icon": 0.082867,
          "ukmo": 0.083884,
          "meteofrance": 0.020022,
          "gfs": 0.467999,
          "gem": 0.269461,
          "jma": 0.02
        },
        "intercept": 0.6079,
        "betaDrivers": [
          0.0127,
          0.1179,
          0.0991,
          0.2274,
          0.1333,
          -0.6562
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1515,
        "spreadScale": 1.5683,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.257049,
            "ecmwfAifs": 0.089553,
            "icon": 0.19726,
            "ukmo": 0.113879,
            "meteofrance": 0.154408,
            "gfs": 0.070085,
            "gem": 0.057294,
            "jma": 0.060472
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9046,
          "logisticSlope": 3.1935,
          "wetFractionWeight": 4.5398,
          "powerEta": 0.68,
          "rawBrier": 0.05319,
          "calibratedBrier": 0.05035
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.2659,
          "rawIfsRmseC": 1.7381,
          "rawEqualMaeC": 1.0943,
          "rawEqualRmseC": 1.496,
          "cvSimplexMaeC": 0.9673,
          "cvCalibratedMaeC": 0.9204,
          "cvCalibratedRmseC": 1.3221
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.207189,
          "ecmwfAifs": 0.113432,
          "icon": 0.085953,
          "ukmo": 0.100131,
          "meteofrance": 0.02,
          "gfs": 0.313952,
          "gem": 0.139343,
          "jma": 0.02
        },
        "intercept": 0.4192,
        "betaDrivers": [
          0.0743,
          0.0924,
          0.1089,
          0.1346,
          0.0192,
          -0.2417
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 1.9024,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325678,
            "ecmwfAifs": 0.236705,
            "icon": 0.120654,
            "ukmo": 0.101036,
            "meteofrance": 0.045059,
            "gfs": 0.067363,
            "gem": 0.055069,
            "jma": 0.048436
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.114,
          "logisticSlope": 3.1981,
          "wetFractionWeight": 4.3947,
          "powerEta": 0.68,
          "rawBrier": 0.05319,
          "calibratedBrier": 0.04902
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.2659,
          "rawIfsRmseC": 1.7381,
          "rawEqualMaeC": 1.0943,
          "rawEqualRmseC": 1.496,
          "cvSimplexMaeC": 1.005,
          "cvCalibratedMaeC": 0.946,
          "cvCalibratedRmseC": 1.362
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
          "icon": 0.251841,
          "ukmo": 0.23687,
          "meteofrance": 0.02,
          "gfs": 0.380362,
          "gem": 0.050927,
          "jma": 0.02
        },
        "interceptC": 1.1795,
        "diurnalHarmonicsC": [
          0.0959,
          0.2826,
          0,
          0
        ],
        "driverBetasC": [
          0.3021,
          -1.233,
          0.5498,
          0.2998
        ],
        "spreadBaseC2": 0.5417,
        "spreadScale": 1.194,
        "cvMaeC": 0.956,
        "cvRmseC": 1.3249,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.066918,
          "ecmwfAifs": 0.044909,
          "icon": 0.224459,
          "ukmo": 0.221214,
          "meteofrance": 0.02,
          "gfs": 0.316574,
          "gem": 0.085926,
          "jma": 0.02
        },
        "interceptC": 0.9896,
        "diurnalHarmonicsC": [
          0.09,
          0.2264,
          0,
          0
        ],
        "driverBetasC": [
          0.2493,
          -0.8824,
          0.4237,
          0.1888
        ],
        "spreadBaseC2": 0.4963,
        "spreadScale": 1.3681,
        "cvMaeC": 0.9975,
        "cvRmseC": 1.3722,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.113837,
          "ecmwfAifs": 0.069817,
          "icon": 0.197078,
          "ukmo": 0.205557,
          "meteofrance": 0.02,
          "gfs": 0.252787,
          "gem": 0.120924,
          "jma": 0.02
        },
        "interceptC": 0.7997,
        "diurnalHarmonicsC": [
          0.0841,
          0.1702,
          0,
          0
        ],
        "driverBetasC": [
          0.1966,
          -0.5318,
          0.2976,
          0.0777
        ],
        "spreadBaseC2": 0.4509,
        "spreadScale": 1.5423,
        "cvMaeC": 1.0391,
        "cvRmseC": 1.4196,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.180796,
          "ukmo": 0.440297,
          "meteofrance": 0.02,
          "gfs": 0.153277,
          "gem": 0.14563,
          "jma": 0.02
        },
        "interceptC": 0.7677,
        "diurnalHarmonicsC": [
          0.2769,
          0.4978,
          0,
          0
        ],
        "driverBetasC": [
          0.4575,
          -0.743,
          0.4666,
          0.3439
        ],
        "spreadBaseC2": 0.9553,
        "spreadScale": 1.5635,
        "cvMaeC": 1.2689,
        "cvRmseC": 1.7493,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.074618,
          "ecmwfAifs": 0.090214,
          "icon": 0.181819,
          "ukmo": 0.34981,
          "meteofrance": 0.02,
          "gfs": 0.145686,
          "gem": 0.117853,
          "jma": 0.02
        },
        "interceptC": 0.6992,
        "diurnalHarmonicsC": [
          0.2089,
          0.3994,
          0,
          0
        ],
        "driverBetasC": [
          0.339,
          -0.552,
          0.3486,
          0.2162
        ],
        "spreadBaseC2": 0.8909,
        "spreadScale": 1.7039,
        "cvMaeC": 1.2996,
        "cvRmseC": 1.7827,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.129236,
          "ecmwfAifs": 0.160428,
          "icon": 0.182843,
          "ukmo": 0.259324,
          "meteofrance": 0.02,
          "gfs": 0.138094,
          "gem": 0.090075,
          "jma": 0.02
        },
        "interceptC": 0.6307,
        "diurnalHarmonicsC": [
          0.141,
          0.3011,
          0,
          0
        ],
        "driverBetasC": [
          0.2204,
          -0.3611,
          0.2305,
          0.0885
        ],
        "spreadBaseC2": 0.8265,
        "spreadScale": 1.8442,
        "cvMaeC": 1.3303,
        "cvRmseC": 1.816,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.244935,
          "icon": 0.02,
          "ukmo": 0.253399,
          "meteofrance": 0.085016,
          "gfs": 0.142311,
          "gem": 0.214339,
          "jma": 0.02
        },
        "interceptC": 0.1099,
        "diurnalHarmonicsC": [
          -0.0765,
          0.2378,
          0,
          0
        ],
        "driverBetasC": [
          0.3931,
          0.0229,
          0.0616,
          0.2654
        ],
        "spreadBaseC2": 0.792,
        "spreadScale": 1.4235,
        "cvMaeC": 1.1309,
        "cvRmseC": 1.5595,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.091211,
          "ecmwfAifs": 0.266776,
          "icon": 0.02,
          "ukmo": 0.219197,
          "meteofrance": 0.082327,
          "gfs": 0.132547,
          "gem": 0.167942,
          "jma": 0.02
        },
        "interceptC": 0.0835,
        "diurnalHarmonicsC": [
          -0.0666,
          0.2009,
          0,
          0
        ],
        "driverBetasC": [
          0.2752,
          0.032,
          0.0381,
          0.171
        ],
        "spreadBaseC2": 0.7605,
        "spreadScale": 1.4402,
        "cvMaeC": 1.1302,
        "cvRmseC": 1.5556,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.162423,
          "ecmwfAifs": 0.288614,
          "icon": 0.02,
          "ukmo": 0.184996,
          "meteofrance": 0.079638,
          "gfs": 0.122784,
          "gem": 0.121545,
          "jma": 0.02
        },
        "interceptC": 0.0571,
        "diurnalHarmonicsC": [
          -0.0567,
          0.164,
          0,
          0
        ],
        "driverBetasC": [
          0.1574,
          0.0411,
          0.0145,
          0.0765
        ],
        "spreadBaseC2": 0.7289,
        "spreadScale": 1.4568,
        "cvMaeC": 1.1296,
        "cvRmseC": 1.5518,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.035767,
          "icon": 0.082867,
          "ukmo": 0.083884,
          "meteofrance": 0.020022,
          "gfs": 0.467999,
          "gem": 0.269461,
          "jma": 0.02
        },
        "interceptC": 0.6079,
        "diurnalHarmonicsC": [
          0.0127,
          0.1179,
          0,
          0
        ],
        "driverBetasC": [
          0.0991,
          -0.6562,
          0.2274,
          0.1333
        ],
        "spreadBaseC2": 0.1515,
        "spreadScale": 1.5683,
        "cvMaeC": 0.9204,
        "cvRmseC": 1.3221,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.113594,
          "ecmwfAifs": 0.074599,
          "icon": 0.08441,
          "ukmo": 0.092007,
          "meteofrance": 0.020011,
          "gfs": 0.390977,
          "gem": 0.204402,
          "jma": 0.02
        },
        "interceptC": 0.5135,
        "diurnalHarmonicsC": [
          0.0435,
          0.1051,
          0,
          0
        ],
        "driverBetasC": [
          0.104,
          -0.449,
          0.181,
          0.0762
        ],
        "spreadBaseC2": 0.1507,
        "spreadScale": 1.7353,
        "cvMaeC": 0.9332,
        "cvRmseC": 1.342,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.207189,
          "ecmwfAifs": 0.113432,
          "icon": 0.085953,
          "ukmo": 0.100131,
          "meteofrance": 0.02,
          "gfs": 0.313952,
          "gem": 0.139343,
          "jma": 0.02
        },
        "interceptC": 0.4192,
        "diurnalHarmonicsC": [
          0.0743,
          0.0924,
          0,
          0
        ],
        "driverBetasC": [
          0.1089,
          -0.2417,
          0.1346,
          0.0192
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.9024,
        "cvMaeC": 0.946,
        "cvRmseC": 1.362,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.242823,
        "ecmwfAifs": 0.088764,
        "icon": 0.224638,
        "ukmo": 0.110334,
        "meteofrance": 0.152263,
        "gfs": 0.065993,
        "gem": 0.055374,
        "jma": 0.059811
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243907,
        "ecmwfAifs": 0.071877,
        "icon": 0.218944,
        "ukmo": 0.116296,
        "meteofrance": 0.160752,
        "gfs": 0.068275,
        "gem": 0.061711,
        "jma": 0.058238
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.240073,
        "ecmwfAifs": 0.084019,
        "icon": 0.211618,
        "ukmo": 0.119916,
        "meteofrance": 0.156348,
        "gfs": 0.068664,
        "gem": 0.058779,
        "jma": 0.060583
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.257049,
        "ecmwfAifs": 0.089553,
        "icon": 0.19726,
        "ukmo": 0.113879,
        "meteofrance": 0.154408,
        "gfs": 0.070085,
        "gem": 0.057294,
        "jma": 0.060472
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.206055,
    "ecmwfAifs": 0.067787,
    "icon": 0.282455,
    "ukmo": 0.161975,
    "meteofrance": 0.105447,
    "gfs": 0.100961,
    "gem": 0.03766,
    "jma": 0.03766
  },
  "pressureWeights": {
    "ecmwfIfs": 0.303937,
    "ecmwfAifs": 0.149619,
    "icon": 0.132748,
    "ukmo": 0.186778,
    "meteofrance": 0.078747,
    "gfs": 0.069425,
    "gem": 0.039373,
    "jma": 0.039373
  }
} as const;

export default PROVINCE_CALIBRATION_TR_67;
