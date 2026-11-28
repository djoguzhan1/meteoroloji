import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_31: ProvinceCalibrationBundle = {
  "provinceCode": "TR-31",
  "provinceName": "Hatay",
  "plateNumber": 31,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "LTDA0",
  "stationLat": 36.3628,
  "stationLon": 36.2822,
  "stationElevationM": 82,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17306,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.409281,
          "ukmo": 0.201174,
          "meteofrance": 0.074709,
          "gfs": 0.02,
          "gem": 0.234836,
          "jma": 0.02
        },
        "intercept": -0.1876,
        "betaDrivers": [
          -0.0563,
          0.1598,
          -0.2803,
          0.2927,
          0.2664,
          -0.0695
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8824,
        "spreadScale": 0.8754,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251608,
            "ecmwfAifs": 0.08394,
            "icon": 0.217813,
            "ukmo": 0.116152,
            "meteofrance": 0.155247,
            "gfs": 0.062988,
            "gem": 0.056178,
            "jma": 0.056074
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9991,
          "logisticSlope": 3.9667,
          "wetFractionWeight": 2.9493,
          "powerEta": 0.68,
          "rawBrier": 0.05064,
          "calibratedBrier": 0.04717
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8682,
          "rawIfsRmseC": 2.6045,
          "rawEqualMaeC": 1.366,
          "rawEqualRmseC": 1.8558,
          "cvSimplexMaeC": 1.1886,
          "cvCalibratedMaeC": 1.1455,
          "cvCalibratedRmseC": 1.4915
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.205493,
          "icon": 0.296449,
          "ukmo": 0.194743,
          "meteofrance": 0.061311,
          "gfs": 0.02,
          "gem": 0.182004,
          "jma": 0.02
        },
        "intercept": -0.2825,
        "betaDrivers": [
          -0.0266,
          0.0253,
          -0.048,
          0.026,
          0.0477,
          -0.0046
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.65,
        "spreadScale": 1.1083,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.325085,
            "ecmwfAifs": 0.226255,
            "icon": 0.135858,
            "ukmo": 0.10509,
            "meteofrance": 0.04511,
            "gfs": 0.061738,
            "gem": 0.055063,
            "jma": 0.045801
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9552,
          "logisticSlope": 4.0674,
          "wetFractionWeight": 2.6095,
          "powerEta": 0.68,
          "rawBrier": 0.05064,
          "calibratedBrier": 0.04772
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.8682,
          "rawIfsRmseC": 2.6045,
          "rawEqualMaeC": 1.366,
          "rawEqualRmseC": 1.8558,
          "cvSimplexMaeC": 1.2012,
          "cvCalibratedMaeC": 1.1635,
          "cvCalibratedRmseC": 1.5326
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.416716,
          "icon": 0.359627,
          "ukmo": 0.061974,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.081683,
          "jma": 0.02
        },
        "intercept": -0.0228,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2087,
        "spreadScale": 0.6942,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24885,
            "ecmwfAifs": 0.074996,
            "icon": 0.216856,
            "ukmo": 0.117385,
            "meteofrance": 0.158074,
            "gfs": 0.066993,
            "gem": 0.056477,
            "jma": 0.060369
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7698,
          "logisticSlope": 2.8367,
          "wetFractionWeight": 4.1091,
          "powerEta": 0.68,
          "rawBrier": 0.04511,
          "calibratedBrier": 0.04374
        },
        "verification": {
          "sampleHours": 4192,
          "rawIfsMaeC": 1.6973,
          "rawIfsRmseC": 2.2595,
          "rawEqualMaeC": 1.3432,
          "rawEqualRmseC": 1.7604,
          "cvSimplexMaeC": 1.2541,
          "cvCalibratedMaeC": 1.254,
          "cvCalibratedRmseC": 1.6171
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.09885,
          "ecmwfAifs": 0.379195,
          "icon": 0.246356,
          "ukmo": 0.080703,
          "meteofrance": 0.036939,
          "gfs": 0.02,
          "gem": 0.117957,
          "jma": 0.02
        },
        "intercept": -0.0197,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1696,
        "spreadScale": 0.7581,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.328171,
            "ecmwfAifs": 0.206328,
            "icon": 0.138058,
            "ukmo": 0.108402,
            "meteofrance": 0.04519,
            "gfs": 0.067021,
            "gem": 0.056501,
            "jma": 0.050329
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8564,
          "logisticSlope": 2.711,
          "wetFractionWeight": 4.1419,
          "powerEta": 0.68,
          "rawBrier": 0.04511,
          "calibratedBrier": 0.0431
        },
        "verification": {
          "sampleHours": 4192,
          "rawIfsMaeC": 1.6973,
          "rawIfsRmseC": 2.2595,
          "rawEqualMaeC": 1.3432,
          "rawEqualRmseC": 1.7604,
          "cvSimplexMaeC": 1.2766,
          "cvCalibratedMaeC": 1.2765,
          "cvCalibratedRmseC": 1.6455
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.455143,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.252701,
          "gfs": 0.02,
          "gem": 0.192156,
          "jma": 0.02
        },
        "intercept": 0.0803,
        "betaDrivers": [
          0.3863,
          -0.119,
          0.659,
          0.0166,
          0.4493,
          0.3036
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 1.0455,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.224367,
            "ecmwfAifs": 0.078125,
            "icon": 0.2194,
            "ukmo": 0.129585,
            "meteofrance": 0.159623,
            "gfs": 0.069451,
            "gem": 0.05959,
            "jma": 0.059859
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.6115,
          "logisticSlope": 2.149,
          "wetFractionWeight": 1.462,
          "powerEta": 0.68,
          "rawBrier": 0.00303,
          "calibratedBrier": 0.00303
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8741,
          "rawIfsRmseC": 2.5767,
          "rawEqualMaeC": 1.3785,
          "rawEqualRmseC": 1.8726,
          "cvSimplexMaeC": 1.0291,
          "cvCalibratedMaeC": 0.9754,
          "cvCalibratedRmseC": 1.3644
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.041923,
          "ecmwfAifs": 0.492449,
          "icon": 0.102643,
          "ukmo": 0.02,
          "meteofrance": 0.177606,
          "gfs": 0.02,
          "gem": 0.125379,
          "jma": 0.02
        },
        "intercept": 0.1017,
        "betaDrivers": [
          0.2493,
          0.0188,
          0.222,
          0.0032,
          0.1224,
          0.1284
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 1.1042,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.297632,
            "ecmwfAifs": 0.216207,
            "icon": 0.140504,
            "ukmo": 0.120375,
            "meteofrance": 0.045224,
            "gfs": 0.069892,
            "gem": 0.059968,
            "jma": 0.050198
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.6255,
          "logisticSlope": 2.3976,
          "wetFractionWeight": 1.8752,
          "powerEta": 0.68,
          "rawBrier": 0.00303,
          "calibratedBrier": 0.00303
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.8741,
          "rawIfsRmseC": 2.5767,
          "rawEqualMaeC": 1.3785,
          "rawEqualRmseC": 1.8726,
          "cvSimplexMaeC": 1.033,
          "cvCalibratedMaeC": 0.9823,
          "cvCalibratedRmseC": 1.3757
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.061937,
          "icon": 0.572767,
          "ukmo": 0.122814,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.162482,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0413,
          -0.0081,
          -0.06,
          0.0243,
          0.1146,
          0.0503
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 1.3987,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234756,
            "ecmwfAifs": 0.072191,
            "icon": 0.220633,
            "ukmo": 0.124601,
            "meteofrance": 0.160328,
            "gfs": 0.066141,
            "gem": 0.060768,
            "jma": 0.060582
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6371,
          "logisticSlope": 4.5813,
          "wetFractionWeight": 3.3139,
          "powerEta": 0.68,
          "rawBrier": 0.01843,
          "calibratedBrier": 0.01796
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.7921,
          "rawIfsRmseC": 2.6589,
          "rawEqualMaeC": 1.4519,
          "rawEqualRmseC": 1.9889,
          "cvSimplexMaeC": 1.2894,
          "cvCalibratedMaeC": 1.2887,
          "cvCalibratedRmseC": 1.6638
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.074135,
          "ecmwfAifs": 0.187641,
          "icon": 0.367775,
          "ukmo": 0.157744,
          "meteofrance": 0.031283,
          "gfs": 0.02,
          "gem": 0.141422,
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
        "spreadBaseC2": 0.15,
        "spreadScale": 1.9016,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31404,
            "ecmwfAifs": 0.201472,
            "icon": 0.142486,
            "ukmo": 0.116723,
            "meteofrance": 0.045252,
            "gfs": 0.067123,
            "gem": 0.06167,
            "jma": 0.051234
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8078,
          "logisticSlope": 4.1522,
          "wetFractionWeight": 3.3135,
          "powerEta": 0.68,
          "rawBrier": 0.01843,
          "calibratedBrier": 0.01749
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.7921,
          "rawIfsRmseC": 2.6589,
          "rawEqualMaeC": 1.4519,
          "rawEqualRmseC": 1.9889,
          "cvSimplexMaeC": 1.3288,
          "cvCalibratedMaeC": 1.3288,
          "cvCalibratedRmseC": 1.7437
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
          "icon": 0.409281,
          "ukmo": 0.201174,
          "meteofrance": 0.074709,
          "gfs": 0.02,
          "gem": 0.234836,
          "jma": 0.02
        },
        "interceptC": -0.1876,
        "diurnalHarmonicsC": [
          -0.0563,
          0.1598,
          0,
          0
        ],
        "driverBetasC": [
          -0.2803,
          -0.0695,
          0.2927,
          0.2664
        ],
        "spreadBaseC2": 0.8824,
        "spreadScale": 0.8754,
        "cvMaeC": 1.1455,
        "cvRmseC": 1.4915,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.112747,
          "icon": 0.352865,
          "ukmo": 0.197958,
          "meteofrance": 0.06801,
          "gfs": 0.02,
          "gem": 0.20842,
          "jma": 0.02
        },
        "interceptC": -0.235,
        "diurnalHarmonicsC": [
          -0.0415,
          0.0925,
          0,
          0
        ],
        "driverBetasC": [
          -0.1641,
          -0.037,
          0.1594,
          0.1571
        ],
        "spreadBaseC2": 0.7662,
        "spreadScale": 0.9919,
        "cvMaeC": 1.1545,
        "cvRmseC": 1.512,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.205493,
          "icon": 0.296449,
          "ukmo": 0.194743,
          "meteofrance": 0.061311,
          "gfs": 0.02,
          "gem": 0.182004,
          "jma": 0.02
        },
        "interceptC": -0.2825,
        "diurnalHarmonicsC": [
          -0.0266,
          0.0253,
          0,
          0
        ],
        "driverBetasC": [
          -0.048,
          -0.0046,
          0.026,
          0.0477
        ],
        "spreadBaseC2": 0.65,
        "spreadScale": 1.1083,
        "cvMaeC": 1.1635,
        "cvRmseC": 1.5326,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.416716,
          "icon": 0.359627,
          "ukmo": 0.061974,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.081683,
          "jma": 0.02
        },
        "interceptC": -0.0228,
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
        "spreadBaseC2": 1.2087,
        "spreadScale": 0.6942,
        "cvMaeC": 1.254,
        "cvRmseC": 1.6171,
        "sampleHours": 4192
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.059425,
          "ecmwfAifs": 0.397955,
          "icon": 0.302991,
          "ukmo": 0.071339,
          "meteofrance": 0.02847,
          "gfs": 0.02,
          "gem": 0.09982,
          "jma": 0.02
        },
        "interceptC": -0.0212,
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
        "spreadBaseC2": 1.1892,
        "spreadScale": 0.7262,
        "cvMaeC": 1.2652,
        "cvRmseC": 1.6313,
        "sampleHours": 4192
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.09885,
          "ecmwfAifs": 0.379195,
          "icon": 0.246356,
          "ukmo": 0.080703,
          "meteofrance": 0.036939,
          "gfs": 0.02,
          "gem": 0.117957,
          "jma": 0.02
        },
        "interceptC": -0.0197,
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
        "spreadBaseC2": 1.1696,
        "spreadScale": 0.7581,
        "cvMaeC": 1.2765,
        "cvRmseC": 1.6455,
        "sampleHours": 4192
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.455143,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.252701,
          "gfs": 0.02,
          "gem": 0.192156,
          "jma": 0.02
        },
        "interceptC": 0.0803,
        "diurnalHarmonicsC": [
          0.3863,
          -0.119,
          0,
          0
        ],
        "driverBetasC": [
          0.659,
          0.3036,
          0.0166,
          0.4493
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.0455,
        "cvMaeC": 0.9754,
        "cvRmseC": 1.3644,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.030962,
          "ecmwfAifs": 0.473795,
          "icon": 0.061322,
          "ukmo": 0.02,
          "meteofrance": 0.215153,
          "gfs": 0.02,
          "gem": 0.158768,
          "jma": 0.02
        },
        "interceptC": 0.091,
        "diurnalHarmonicsC": [
          0.3178,
          -0.0501,
          0,
          0
        ],
        "driverBetasC": [
          0.4405,
          0.216,
          0.0099,
          0.2858
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.0749,
        "cvMaeC": 0.9788,
        "cvRmseC": 1.37,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.041923,
          "ecmwfAifs": 0.492449,
          "icon": 0.102643,
          "ukmo": 0.02,
          "meteofrance": 0.177606,
          "gfs": 0.02,
          "gem": 0.125379,
          "jma": 0.02
        },
        "interceptC": 0.1017,
        "diurnalHarmonicsC": [
          0.2493,
          0.0188,
          0,
          0
        ],
        "driverBetasC": [
          0.222,
          0.1284,
          0.0032,
          0.1224
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.1042,
        "cvMaeC": 0.9823,
        "cvRmseC": 1.3757,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.061937,
          "icon": 0.572767,
          "ukmo": 0.122814,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.162482,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0413,
          -0.0081,
          0,
          0
        ],
        "driverBetasC": [
          -0.06,
          0.0503,
          0.0243,
          0.1146
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.3987,
        "cvMaeC": 1.2887,
        "cvRmseC": 1.6638,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.047068,
          "ecmwfAifs": 0.124789,
          "icon": 0.470271,
          "ukmo": 0.140279,
          "meteofrance": 0.025641,
          "gfs": 0.02,
          "gem": 0.151952,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0207,
          -0.004,
          0,
          0
        ],
        "driverBetasC": [
          -0.03,
          0.0251,
          0.0121,
          0.0573
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.6502,
        "cvMaeC": 1.3087,
        "cvRmseC": 1.7037,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.074135,
          "ecmwfAifs": 0.187641,
          "icon": 0.367775,
          "ukmo": 0.157744,
          "meteofrance": 0.031283,
          "gfs": 0.02,
          "gem": 0.141422,
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
        "spreadBaseC2": 0.15,
        "spreadScale": 1.9016,
        "cvMaeC": 1.3288,
        "cvRmseC": 1.7437,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.251608,
        "ecmwfAifs": 0.08394,
        "icon": 0.217813,
        "ukmo": 0.116152,
        "meteofrance": 0.155247,
        "gfs": 0.062988,
        "gem": 0.056178,
        "jma": 0.056074
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.24885,
        "ecmwfAifs": 0.074996,
        "icon": 0.216856,
        "ukmo": 0.117385,
        "meteofrance": 0.158074,
        "gfs": 0.066993,
        "gem": 0.056477,
        "jma": 0.060369
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.224367,
        "ecmwfAifs": 0.078125,
        "icon": 0.2194,
        "ukmo": 0.129585,
        "meteofrance": 0.159623,
        "gfs": 0.069451,
        "gem": 0.05959,
        "jma": 0.059859
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.234756,
        "ecmwfAifs": 0.072191,
        "icon": 0.220633,
        "ukmo": 0.124601,
        "meteofrance": 0.160328,
        "gfs": 0.066141,
        "gem": 0.060768,
        "jma": 0.060582
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.192145,
    "ecmwfAifs": 0.067567,
    "icon": 0.29942,
    "ukmo": 0.149618,
    "meteofrance": 0.105104,
    "gfs": 0.111072,
    "gem": 0.037537,
    "jma": 0.037537
  },
  "pressureWeights": {
    "ecmwfIfs": 0.32031,
    "ecmwfAifs": 0.145708,
    "icon": 0.132774,
    "ukmo": 0.177262,
    "meteofrance": 0.076688,
    "gfs": 0.07057,
    "gem": 0.038344,
    "jma": 0.038344
  }
} as const;

export default PROVINCE_CALIBRATION_TR_31;
