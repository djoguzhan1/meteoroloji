import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_46: ProvinceCalibrationBundle = {
  "provinceCode": "TR-46",
  "provinceName": "Kahramanmaraş",
  "plateNumber": 46,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17255",
  "stationLat": 37.6,
  "stationLon": 36.9333,
  "stationElevationM": 549,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "intercept": -1.4798,
        "betaDrivers": [
          0.113,
          0.3051,
          -0.1658,
          -0.0001,
          0.113,
          0.2808
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0905,
        "spreadScale": 0.446,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22502,
            "ecmwfAifs": 0.095751,
            "icon": 0.224486,
            "ukmo": 0.126318,
            "meteofrance": 0.155553,
            "gfs": 0.064624,
            "gem": 0.055533,
            "jma": 0.052715
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8954,
          "logisticSlope": 4.5339,
          "wetFractionWeight": 2.7164,
          "powerEta": 0.68,
          "rawBrier": 0.0515,
          "calibratedBrier": 0.05015
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.3672,
          "rawIfsRmseC": 2.7418,
          "rawEqualMaeC": 2.6675,
          "rawEqualRmseC": 2.8626,
          "cvSimplexMaeC": 1.659,
          "cvCalibratedMaeC": 1.0106,
          "cvCalibratedRmseC": 1.2646
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.190815,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.689185,
          "jma": 0.02
        },
        "intercept": -1.6654,
        "betaDrivers": [
          0.0468,
          0.2032,
          -0.0674,
          0.0096,
          0.054,
          0.2497
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2273,
        "spreadScale": 0.1367,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.288001,
            "ecmwfAifs": 0.255665,
            "icon": 0.138705,
            "ukmo": 0.113214,
            "meteofrance": 0.045095,
            "gfs": 0.062747,
            "gem": 0.05392,
            "jma": 0.042653
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7866,
          "logisticSlope": 4.558,
          "wetFractionWeight": 2.4494,
          "powerEta": 0.68,
          "rawBrier": 0.0515,
          "calibratedBrier": 0.05107
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.3672,
          "rawIfsRmseC": 2.7418,
          "rawEqualMaeC": 2.6675,
          "rawEqualRmseC": 2.8626,
          "cvSimplexMaeC": 1.7657,
          "cvCalibratedMaeC": 0.9352,
          "cvCalibratedRmseC": 1.1761
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.146456,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.733544,
          "jma": 0.02
        },
        "intercept": -1.9061,
        "betaDrivers": [
          -0.353,
          0.4591,
          0.2115,
          -0.2002,
          -0.2577,
          0.23
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8322,
        "spreadScale": 0.8995,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234394,
            "ecmwfAifs": 0.071488,
            "icon": 0.225172,
            "ukmo": 0.129683,
            "meteofrance": 0.151726,
            "gfs": 0.067013,
            "gem": 0.060777,
            "jma": 0.059747
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.3378,
          "logisticSlope": 3.4034,
          "wetFractionWeight": 2.5546,
          "powerEta": 0.68,
          "rawBrier": 0.06651,
          "calibratedBrier": 0.06617
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.0697,
          "rawIfsRmseC": 2.4787,
          "rawEqualMaeC": 2.6836,
          "rawEqualRmseC": 2.9192,
          "cvSimplexMaeC": 1.9711,
          "cvCalibratedMaeC": 1.0815,
          "cvCalibratedRmseC": 1.5358
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.450916,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.429084,
          "jma": 0.02
        },
        "intercept": -1.9398,
        "betaDrivers": [
          -0.208,
          0.2983,
          0.0676,
          -0.0783,
          -0.0402,
          0.2139
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9378,
        "spreadScale": 0.6031,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311825,
            "ecmwfAifs": 0.198408,
            "icon": 0.144614,
            "ukmo": 0.120812,
            "meteofrance": 0.045123,
            "gfs": 0.067632,
            "gem": 0.061338,
            "jma": 0.050248
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.2981,
          "logisticSlope": 3.5467,
          "wetFractionWeight": 2.5661,
          "powerEta": 0.68,
          "rawBrier": 0.06651,
          "calibratedBrier": 0.06547
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.0697,
          "rawIfsRmseC": 2.4787,
          "rawEqualMaeC": 2.6836,
          "rawEqualRmseC": 2.9192,
          "cvSimplexMaeC": 2.0111,
          "cvCalibratedMaeC": 1.0055,
          "cvCalibratedRmseC": 1.4074
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "intercept": -2.1297,
        "betaDrivers": [
          -0.5809,
          0.6391,
          0.2296,
          -0.0858,
          -0.0598,
          0.706
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.336,
        "spreadScale": 0.4638,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227138,
            "ecmwfAifs": 0.071218,
            "icon": 0.222024,
            "ukmo": 0.129789,
            "meteofrance": 0.164898,
            "gfs": 0.069145,
            "gem": 0.053951,
            "jma": 0.061837
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.3658,
          "logisticSlope": 1.0084,
          "wetFractionWeight": 0.4219,
          "powerEta": 0.68,
          "rawBrier": 0.00472,
          "calibratedBrier": 0.00472
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.8282,
          "rawIfsRmseC": 3.3484,
          "rawEqualMaeC": 3.2199,
          "rawEqualRmseC": 3.6012,
          "cvSimplexMaeC": 2.4619,
          "cvCalibratedMaeC": 1.1256,
          "cvCalibratedRmseC": 1.4209
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.311577,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.568423,
          "jma": 0.02
        },
        "intercept": -2.1928,
        "betaDrivers": [
          -0.3578,
          0.3691,
          0.0487,
          -0.0263,
          0.0225,
          0.5178
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6402,
        "spreadScale": 0.222,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.307025,
            "ecmwfAifs": 0.200833,
            "icon": 0.144882,
            "ukmo": 0.122853,
            "meteofrance": 0.045338,
            "gfs": 0.070904,
            "gem": 0.055324,
            "jma": 0.052841
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.375,
          "logisticSlope": 1.0853,
          "wetFractionWeight": 0.4765,
          "powerEta": 0.68,
          "rawBrier": 0.00472,
          "calibratedBrier": 0.00472
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.8282,
          "rawIfsRmseC": 3.3484,
          "rawEqualMaeC": 3.2199,
          "rawEqualRmseC": 3.6012,
          "cvSimplexMaeC": 2.5748,
          "cvCalibratedMaeC": 1.1229,
          "cvCalibratedRmseC": 1.4025
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "intercept": -1.9147,
        "betaDrivers": [
          -0.959,
          0.0999,
          -0.0539,
          0.2239,
          -0.0725,
          0.3025
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9133,
        "spreadScale": 0.9465,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236536,
            "ecmwfAifs": 0.078303,
            "icon": 0.217735,
            "ukmo": 0.122529,
            "meteofrance": 0.166222,
            "gfs": 0.067759,
            "gem": 0.053042,
            "jma": 0.057874
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4875,
          "logisticSlope": 2.872,
          "wetFractionWeight": 3.628,
          "powerEta": 0.68,
          "rawBrier": 0.02174,
          "calibratedBrier": 0.02104
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 3.1338,
          "rawIfsRmseC": 3.4184,
          "rawEqualMaeC": 3.2738,
          "rawEqualRmseC": 3.5896,
          "cvSimplexMaeC": 2.1621,
          "cvCalibratedMaeC": 1.129,
          "cvCalibratedRmseC": 1.4423
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.098956,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.781044,
          "jma": 0.02
        },
        "intercept": -1.992,
        "betaDrivers": [
          -0.4913,
          0.0669,
          -0.0422,
          0.0697,
          0.0025,
          0.1345
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.685,
        "spreadScale": 1.1419,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314054,
            "ecmwfAifs": 0.216892,
            "icon": 0.139562,
            "ukmo": 0.113923,
            "meteofrance": 0.045315,
            "gfs": 0.06825,
            "gem": 0.053426,
            "jma": 0.048578
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.642,
          "logisticSlope": 2.6203,
          "wetFractionWeight": 3.9202,
          "powerEta": 0.68,
          "rawBrier": 0.02174,
          "calibratedBrier": 0.02012
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 3.1338,
          "rawIfsRmseC": 3.4184,
          "rawEqualMaeC": 3.2738,
          "rawEqualRmseC": 3.5896,
          "cvSimplexMaeC": 2.2419,
          "cvCalibratedMaeC": 1.1127,
          "cvCalibratedRmseC": 1.4466
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
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "interceptC": -1.4798,
        "diurnalHarmonicsC": [
          0.113,
          0.3051,
          0,
          0
        ],
        "driverBetasC": [
          -0.1658,
          0.2808,
          -0.0001,
          0.113
        ],
        "spreadBaseC2": 1.0905,
        "spreadScale": 0.446,
        "cvMaeC": 1.0106,
        "cvRmseC": 1.2646,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.105408,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.774592,
          "jma": 0.02
        },
        "interceptC": -1.5726,
        "diurnalHarmonicsC": [
          0.0799,
          0.2541,
          0,
          0
        ],
        "driverBetasC": [
          -0.1166,
          0.2652,
          0.0047,
          0.0835
        ],
        "spreadBaseC2": 1.1589,
        "spreadScale": 0.2913,
        "cvMaeC": 0.9729,
        "cvRmseC": 1.2203,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.190815,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.689185,
          "jma": 0.02
        },
        "interceptC": -1.6654,
        "diurnalHarmonicsC": [
          0.0468,
          0.2032,
          0,
          0
        ],
        "driverBetasC": [
          -0.0674,
          0.2497,
          0.0096,
          0.054
        ],
        "spreadBaseC2": 1.2273,
        "spreadScale": 0.1367,
        "cvMaeC": 0.9352,
        "cvRmseC": 1.1761,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.146456,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.733544,
          "jma": 0.02
        },
        "interceptC": -1.9061,
        "diurnalHarmonicsC": [
          -0.353,
          0.4591,
          0,
          0
        ],
        "driverBetasC": [
          0.2115,
          0.23,
          -0.2002,
          -0.2577
        ],
        "spreadBaseC2": 0.8322,
        "spreadScale": 0.8995,
        "cvMaeC": 1.0815,
        "cvRmseC": 1.5358,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.298686,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.581314,
          "jma": 0.02
        },
        "interceptC": -1.9229,
        "diurnalHarmonicsC": [
          -0.2805,
          0.3787,
          0,
          0
        ],
        "driverBetasC": [
          0.1396,
          0.222,
          -0.1392,
          -0.1489
        ],
        "spreadBaseC2": 0.885,
        "spreadScale": 0.7513,
        "cvMaeC": 1.0435,
        "cvRmseC": 1.4716,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.450916,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.429084,
          "jma": 0.02
        },
        "interceptC": -1.9398,
        "diurnalHarmonicsC": [
          -0.208,
          0.2983,
          0,
          0
        ],
        "driverBetasC": [
          0.0676,
          0.2139,
          -0.0783,
          -0.0402
        ],
        "spreadBaseC2": 0.9378,
        "spreadScale": 0.6031,
        "cvMaeC": 1.0055,
        "cvRmseC": 1.4074,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "interceptC": -2.1297,
        "diurnalHarmonicsC": [
          -0.5809,
          0.6391,
          0,
          0
        ],
        "driverBetasC": [
          0.2296,
          0.706,
          -0.0858,
          -0.0598
        ],
        "spreadBaseC2": 1.336,
        "spreadScale": 0.4638,
        "cvMaeC": 1.1256,
        "cvRmseC": 1.4209,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.165789,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.714211,
          "jma": 0.02
        },
        "interceptC": -2.1612,
        "diurnalHarmonicsC": [
          -0.4693,
          0.5041,
          0,
          0
        ],
        "driverBetasC": [
          0.1391,
          0.6119,
          -0.0561,
          -0.0186
        ],
        "spreadBaseC2": 1.4881,
        "spreadScale": 0.3429,
        "cvMaeC": 1.1242,
        "cvRmseC": 1.4117,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.311577,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.568423,
          "jma": 0.02
        },
        "interceptC": -2.1928,
        "diurnalHarmonicsC": [
          -0.3578,
          0.3691,
          0,
          0
        ],
        "driverBetasC": [
          0.0487,
          0.5178,
          -0.0263,
          0.0225
        ],
        "spreadBaseC2": 1.6402,
        "spreadScale": 0.222,
        "cvMaeC": 1.1229,
        "cvRmseC": 1.4025,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.86,
          "jma": 0.02
        },
        "interceptC": -1.9147,
        "diurnalHarmonicsC": [
          -0.959,
          0.0999,
          0,
          0
        ],
        "driverBetasC": [
          -0.0539,
          0.3025,
          0.2239,
          -0.0725
        ],
        "spreadBaseC2": 0.9133,
        "spreadScale": 0.9465,
        "cvMaeC": 1.129,
        "cvRmseC": 1.4423,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.059478,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.820522,
          "jma": 0.02
        },
        "interceptC": -1.9533,
        "diurnalHarmonicsC": [
          -0.7251,
          0.0834,
          0,
          0
        ],
        "driverBetasC": [
          -0.0481,
          0.2185,
          0.1468,
          -0.035
        ],
        "spreadBaseC2": 0.7992,
        "spreadScale": 1.0442,
        "cvMaeC": 1.1208,
        "cvRmseC": 1.4445,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.098956,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.781044,
          "jma": 0.02
        },
        "interceptC": -1.992,
        "diurnalHarmonicsC": [
          -0.4913,
          0.0669,
          0,
          0
        ],
        "driverBetasC": [
          -0.0422,
          0.1345,
          0.0697,
          0.0025
        ],
        "spreadBaseC2": 0.685,
        "spreadScale": 1.1419,
        "cvMaeC": 1.1127,
        "cvRmseC": 1.4466,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.22502,
        "ecmwfAifs": 0.095751,
        "icon": 0.224486,
        "ukmo": 0.126318,
        "meteofrance": 0.155553,
        "gfs": 0.064624,
        "gem": 0.055533,
        "jma": 0.052715
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.234394,
        "ecmwfAifs": 0.071488,
        "icon": 0.225172,
        "ukmo": 0.129683,
        "meteofrance": 0.151726,
        "gfs": 0.067013,
        "gem": 0.060777,
        "jma": 0.059747
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.227138,
        "ecmwfAifs": 0.071218,
        "icon": 0.222024,
        "ukmo": 0.129789,
        "meteofrance": 0.164898,
        "gfs": 0.069145,
        "gem": 0.053951,
        "jma": 0.061837
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.236536,
        "ecmwfAifs": 0.078303,
        "icon": 0.217735,
        "ukmo": 0.122529,
        "meteofrance": 0.166222,
        "gfs": 0.067759,
        "gem": 0.053042,
        "jma": 0.057874
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.214572,
    "ecmwfAifs": 0.068878,
    "icon": 0.235402,
    "ukmo": 0.199781,
    "meteofrance": 0.107143,
    "gfs": 0.097692,
    "gem": 0.038266,
    "jma": 0.038266
  },
  "pressureWeights": {
    "ecmwfIfs": 0.254968,
    "ecmwfAifs": 0.141722,
    "icon": 0.128384,
    "ukmo": 0.255637,
    "meteofrance": 0.074591,
    "gfs": 0.070108,
    "gem": 0.037295,
    "jma": 0.037295
  }
} as const;

export default PROVINCE_CALIBRATION_TR_46;
