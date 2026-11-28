import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_49: ProvinceCalibrationBundle = {
  "provinceCode": "TR-49",
  "provinceName": "Muş",
  "plateNumber": 49,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17204",
  "stationLat": 38.7333,
  "stationLon": 41.5167,
  "stationElevationM": 1320,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.441811,
          "ecmwfAifs": 0.122514,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.118035,
          "gem": 0.020912,
          "jma": 0.236728
        },
        "intercept": 0,
        "betaDrivers": [
          0.0859,
          -0.042,
          -0.1249,
          -0.238,
          0.0222,
          0.0405
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7807,
        "spreadScale": 0.1138,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25784,
            "ecmwfAifs": 0.090935,
            "icon": 0.238102,
            "ukmo": 0.10832,
            "meteofrance": 0.132183,
            "gfs": 0.069087,
            "gem": 0.048514,
            "jma": 0.055019
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2282,
          "logisticSlope": 5.6001,
          "wetFractionWeight": 2.6387,
          "powerEta": 0.68,
          "rawBrier": 0.04398,
          "calibratedBrier": 0.04328
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 1.3568,
          "rawIfsRmseC": 1.7397,
          "rawEqualMaeC": 1.1248,
          "rawEqualRmseC": 1.4667,
          "cvSimplexMaeC": 0.9168,
          "cvCalibratedMaeC": 0.9131,
          "cvCalibratedRmseC": 1.2017
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.424461,
          "ecmwfAifs": 0.20022,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.071177,
          "gem": 0.02,
          "jma": 0.224142
        },
        "intercept": 0.1375,
        "betaDrivers": [
          0.0975,
          -0.0562,
          -0.069,
          -0.1095,
          -0.0011,
          0.0277
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8822,
        "spreadScale": 0.0886,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324868,
            "ecmwfAifs": 0.239024,
            "icon": 0.144826,
            "ukmo": 0.095571,
            "meteofrance": 0.039482,
            "gfs": 0.066035,
            "gem": 0.046371,
            "jma": 0.043823
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2989,
          "logisticSlope": 5.671,
          "wetFractionWeight": 2.5057,
          "powerEta": 0.68,
          "rawBrier": 0.04398,
          "calibratedBrier": 0.0418
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 1.3568,
          "rawIfsRmseC": 1.7397,
          "rawEqualMaeC": 1.1248,
          "rawEqualRmseC": 1.4667,
          "cvSimplexMaeC": 0.91,
          "cvCalibratedMaeC": 0.8986,
          "cvCalibratedRmseC": 1.1826
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.490846,
          "ecmwfAifs": 0.190571,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.218583
        },
        "intercept": 0,
        "betaDrivers": [
          0.4117,
          -0.2381,
          0.4059,
          -0.4824,
          -0.0365,
          -0.2719
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.856,
        "spreadScale": 0.0969,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238879,
            "ecmwfAifs": 0.073793,
            "icon": 0.234582,
            "ukmo": 0.118609,
            "meteofrance": 0.153547,
            "gfs": 0.069773,
            "gem": 0.053495,
            "jma": 0.057322
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4915,
          "logisticSlope": 3.3847,
          "wetFractionWeight": 3.0815,
          "powerEta": 0.68,
          "rawBrier": 0.07526,
          "calibratedBrier": 0.07259
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 1.389,
          "rawIfsRmseC": 1.7751,
          "rawEqualMaeC": 1.06,
          "rawEqualRmseC": 1.3858,
          "cvSimplexMaeC": 0.906,
          "cvCalibratedMaeC": 0.8539,
          "cvCalibratedRmseC": 1.1088
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.420795,
          "ecmwfAifs": 0.244597,
          "icon": 0.049526,
          "ukmo": 0.02,
          "meteofrance": 0.039925,
          "gfs": 0.036604,
          "gem": 0.02,
          "jma": 0.168553
        },
        "intercept": 0,
        "betaDrivers": [
          0.2304,
          -0.1454,
          0.1121,
          -0.1488,
          -0.0206,
          -0.129
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8788,
        "spreadScale": 0.1076,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.317292,
            "ecmwfAifs": 0.204481,
            "icon": 0.150419,
            "ukmo": 0.110321,
            "meteofrance": 0.045144,
            "gfs": 0.070306,
            "gem": 0.053904,
            "jma": 0.048133
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6434,
          "logisticSlope": 3.8243,
          "wetFractionWeight": 2.7499,
          "powerEta": 0.68,
          "rawBrier": 0.07526,
          "calibratedBrier": 0.07196
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 1.389,
          "rawIfsRmseC": 1.7751,
          "rawEqualMaeC": 1.06,
          "rawEqualRmseC": 1.3858,
          "cvSimplexMaeC": 0.9202,
          "cvCalibratedMaeC": 0.8796,
          "cvCalibratedRmseC": 1.1373
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.366421,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.044251,
          "gfs": 0.175303,
          "gem": 0.02,
          "jma": 0.334025
        },
        "intercept": -0.4032,
        "betaDrivers": [
          0.3676,
          -0.0719,
          0.482,
          -0.3026,
          0.0124,
          -0.7705
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3007,
        "spreadScale": 0.1197,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232133,
            "ecmwfAifs": 0.080826,
            "icon": 0.230685,
            "ukmo": 0.124534,
            "meteofrance": 0.156445,
            "gfs": 0.066562,
            "gem": 0.053453,
            "jma": 0.055362
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8627,
          "logisticSlope": 3.8714,
          "wetFractionWeight": 3.0599,
          "powerEta": 0.68,
          "rawBrier": 0.01238,
          "calibratedBrier": 0.01064
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 1.1257,
          "rawIfsRmseC": 1.4863,
          "rawEqualMaeC": 1.0039,
          "rawEqualRmseC": 1.3542,
          "cvSimplexMaeC": 0.721,
          "cvCalibratedMaeC": 0.6464,
          "cvCalibratedRmseC": 0.8799
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.36304,
          "ecmwfAifs": 0.120227,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.092208,
          "gfs": 0.103151,
          "gem": 0.02,
          "jma": 0.261374
        },
        "intercept": 0,
        "betaDrivers": [
          0.1979,
          -0.0565,
          0.1907,
          -0.1192,
          0.0072,
          -0.3518
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3227,
        "spreadScale": 0.1286,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305567,
            "ecmwfAifs": 0.221962,
            "icon": 0.146594,
            "ukmo": 0.114794,
            "meteofrance": 0.045165,
            "gfs": 0.066469,
            "gem": 0.053379,
            "jma": 0.04607
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9248,
          "logisticSlope": 3.9768,
          "wetFractionWeight": 3.0833,
          "powerEta": 0.68,
          "rawBrier": 0.01238,
          "calibratedBrier": 0.01044
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 1.1257,
          "rawIfsRmseC": 1.4863,
          "rawEqualMaeC": 1.0039,
          "rawEqualRmseC": 1.3542,
          "cvSimplexMaeC": 0.7462,
          "cvCalibratedMaeC": 0.6754,
          "cvCalibratedRmseC": 0.9118
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.358436,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.331209,
          "gem": 0.02,
          "jma": 0.210355
        },
        "intercept": -0.0942,
        "betaDrivers": [
          0.5819,
          -0.0677,
          0.1858,
          -0.4217,
          -0.1005,
          -0.5529
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4448,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.223216,
            "ecmwfAifs": 0.081876,
            "icon": 0.223616,
            "ukmo": 0.122526,
            "meteofrance": 0.162157,
            "gfs": 0.068649,
            "gem": 0.056707,
            "jma": 0.061253
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1517,
          "logisticSlope": 3.4658,
          "wetFractionWeight": 3.3511,
          "powerEta": 0.68,
          "rawBrier": 0.03245,
          "calibratedBrier": 0.03156
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 1.4525,
          "rawIfsRmseC": 1.8208,
          "rawEqualMaeC": 1.2444,
          "rawEqualRmseC": 1.5926,
          "cvSimplexMaeC": 0.7487,
          "cvCalibratedMaeC": 0.6267,
          "cvCalibratedRmseC": 0.8264
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.367266,
          "ecmwfAifs": 0.078339,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.257735,
          "gem": 0.02,
          "jma": 0.21666
        },
        "intercept": 0.0057,
        "betaDrivers": [
          0.3213,
          -0.0593,
          0.108,
          -0.1528,
          -0.0304,
          -0.281
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5185,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.295337,
            "ecmwfAifs": 0.225999,
            "icon": 0.142832,
            "ukmo": 0.113522,
            "meteofrance": 0.045252,
            "gfs": 0.068905,
            "gem": 0.056918,
            "jma": 0.051235
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.271,
          "logisticSlope": 3.1159,
          "wetFractionWeight": 3.5135,
          "powerEta": 0.68,
          "rawBrier": 0.03245,
          "calibratedBrier": 0.03131
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 1.4525,
          "rawIfsRmseC": 1.8208,
          "rawEqualMaeC": 1.2444,
          "rawEqualRmseC": 1.5926,
          "cvSimplexMaeC": 0.7679,
          "cvCalibratedMaeC": 0.6714,
          "cvCalibratedRmseC": 0.8699
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.441811,
          "ecmwfAifs": 0.122514,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.118035,
          "gem": 0.020912,
          "jma": 0.236728
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0859,
          -0.042,
          0,
          0
        ],
        "driverBetasC": [
          -0.1249,
          0.0405,
          -0.238,
          0.0222
        ],
        "spreadBaseC2": 0.7807,
        "spreadScale": 0.1138,
        "cvMaeC": 0.9131,
        "cvRmseC": 1.2017,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.433136,
          "ecmwfAifs": 0.161367,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.094606,
          "gem": 0.020456,
          "jma": 0.230435
        },
        "interceptC": 0.0688,
        "diurnalHarmonicsC": [
          0.0917,
          -0.0491,
          0,
          0
        ],
        "driverBetasC": [
          -0.097,
          0.0341,
          -0.1737,
          0.0106
        ],
        "spreadBaseC2": 0.8315,
        "spreadScale": 0.1012,
        "cvMaeC": 0.9059,
        "cvRmseC": 1.1922,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.424461,
          "ecmwfAifs": 0.20022,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.071177,
          "gem": 0.02,
          "jma": 0.224142
        },
        "interceptC": 0.1375,
        "diurnalHarmonicsC": [
          0.0975,
          -0.0562,
          0,
          0
        ],
        "driverBetasC": [
          -0.069,
          0.0277,
          -0.1095,
          -0.0011
        ],
        "spreadBaseC2": 0.8822,
        "spreadScale": 0.0886,
        "cvMaeC": 0.8986,
        "cvRmseC": 1.1826,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.490846,
          "ecmwfAifs": 0.190571,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.218583
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.4117,
          -0.2381,
          0,
          0
        ],
        "driverBetasC": [
          0.4059,
          -0.2719,
          -0.4824,
          -0.0365
        ],
        "spreadBaseC2": 0.856,
        "spreadScale": 0.0969,
        "cvMaeC": 0.8539,
        "cvRmseC": 1.1088,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.45582,
          "ecmwfAifs": 0.217584,
          "icon": 0.034763,
          "ukmo": 0.02,
          "meteofrance": 0.029963,
          "gfs": 0.028302,
          "gem": 0.02,
          "jma": 0.193568
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.3211,
          -0.1918,
          0,
          0
        ],
        "driverBetasC": [
          0.259,
          -0.2004,
          -0.3156,
          -0.0285
        ],
        "spreadBaseC2": 0.8674,
        "spreadScale": 0.1023,
        "cvMaeC": 0.8668,
        "cvRmseC": 1.1231,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.420795,
          "ecmwfAifs": 0.244597,
          "icon": 0.049526,
          "ukmo": 0.02,
          "meteofrance": 0.039925,
          "gfs": 0.036604,
          "gem": 0.02,
          "jma": 0.168553
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.2304,
          -0.1454,
          0,
          0
        ],
        "driverBetasC": [
          0.1121,
          -0.129,
          -0.1488,
          -0.0206
        ],
        "spreadBaseC2": 0.8788,
        "spreadScale": 0.1076,
        "cvMaeC": 0.8796,
        "cvRmseC": 1.1373,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.366421,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.044251,
          "gfs": 0.175303,
          "gem": 0.02,
          "jma": 0.334025
        },
        "interceptC": -0.4032,
        "diurnalHarmonicsC": [
          0.3676,
          -0.0719,
          0,
          0
        ],
        "driverBetasC": [
          0.482,
          -0.7705,
          -0.3026,
          0.0124
        ],
        "spreadBaseC2": 0.3007,
        "spreadScale": 0.1197,
        "cvMaeC": 0.6464,
        "cvRmseC": 0.8799,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.364729,
          "ecmwfAifs": 0.070114,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.06823,
          "gfs": 0.139227,
          "gem": 0.02,
          "jma": 0.2977
        },
        "interceptC": -0.2016,
        "diurnalHarmonicsC": [
          0.2828,
          -0.0642,
          0,
          0
        ],
        "driverBetasC": [
          0.3363,
          -0.5612,
          -0.2109,
          0.0098
        ],
        "spreadBaseC2": 0.3117,
        "spreadScale": 0.1241,
        "cvMaeC": 0.6609,
        "cvRmseC": 0.8959,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.36304,
          "ecmwfAifs": 0.120227,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.092208,
          "gfs": 0.103151,
          "gem": 0.02,
          "jma": 0.261374
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1979,
          -0.0565,
          0,
          0
        ],
        "driverBetasC": [
          0.1907,
          -0.3518,
          -0.1192,
          0.0072
        ],
        "spreadBaseC2": 0.3227,
        "spreadScale": 0.1286,
        "cvMaeC": 0.6754,
        "cvRmseC": 0.9118,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.358436,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.331209,
          "gem": 0.02,
          "jma": 0.210355
        },
        "interceptC": -0.0942,
        "diurnalHarmonicsC": [
          0.5819,
          -0.0677,
          0,
          0
        ],
        "driverBetasC": [
          0.1858,
          -0.5529,
          -0.4217,
          -0.1005
        ],
        "spreadBaseC2": 0.4448,
        "spreadScale": 0.05,
        "cvMaeC": 0.6267,
        "cvRmseC": 0.8264,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.36285,
          "ecmwfAifs": 0.04917,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.294472,
          "gem": 0.02,
          "jma": 0.213508
        },
        "interceptC": -0.0443,
        "diurnalHarmonicsC": [
          0.4516,
          -0.0635,
          0,
          0
        ],
        "driverBetasC": [
          0.1469,
          -0.4169,
          -0.2873,
          -0.0655
        ],
        "spreadBaseC2": 0.4816,
        "spreadScale": 0.05,
        "cvMaeC": 0.6491,
        "cvRmseC": 0.8481,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.367266,
          "ecmwfAifs": 0.078339,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.257735,
          "gem": 0.02,
          "jma": 0.21666
        },
        "interceptC": 0.0057,
        "diurnalHarmonicsC": [
          0.3213,
          -0.0593,
          0,
          0
        ],
        "driverBetasC": [
          0.108,
          -0.281,
          -0.1528,
          -0.0304
        ],
        "spreadBaseC2": 0.5185,
        "spreadScale": 0.05,
        "cvMaeC": 0.6714,
        "cvRmseC": 0.8699,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.25784,
        "ecmwfAifs": 0.090935,
        "icon": 0.238102,
        "ukmo": 0.10832,
        "meteofrance": 0.132183,
        "gfs": 0.069087,
        "gem": 0.048514,
        "jma": 0.055019
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.238879,
        "ecmwfAifs": 0.073793,
        "icon": 0.234582,
        "ukmo": 0.118609,
        "meteofrance": 0.153547,
        "gfs": 0.069773,
        "gem": 0.053495,
        "jma": 0.057322
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.232133,
        "ecmwfAifs": 0.080826,
        "icon": 0.230685,
        "ukmo": 0.124534,
        "meteofrance": 0.156445,
        "gfs": 0.066562,
        "gem": 0.053453,
        "jma": 0.055362
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.223216,
        "ecmwfAifs": 0.081876,
        "icon": 0.223616,
        "ukmo": 0.122526,
        "meteofrance": 0.162157,
        "gfs": 0.068649,
        "gem": 0.056707,
        "jma": 0.061253
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.269779,
    "ecmwfAifs": 0.066834,
    "icon": 0.225186,
    "ukmo": 0.158433,
    "meteofrance": 0.103964,
    "gfs": 0.101544,
    "gem": 0.03713,
    "jma": 0.03713
  },
  "pressureWeights": {
    "ecmwfIfs": 0.347778,
    "ecmwfAifs": 0.139004,
    "icon": 0.208546,
    "ukmo": 0.137785,
    "meteofrance": 0.07316,
    "gfs": 0.020567,
    "gem": 0.03658,
    "jma": 0.03658
  }
} as const;

export default PROVINCE_CALIBRATION_TR_49;
