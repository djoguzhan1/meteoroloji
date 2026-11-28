import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_02: ProvinceCalibrationBundle = {
  "provinceCode": "TR-02",
  "provinceName": "Adıyaman",
  "plateNumber": 2,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17265",
  "stationLat": 37.75,
  "stationLon": 38.2833,
  "stationElevationM": 672,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.744498,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.135502,
          "jma": 0.02
        },
        "intercept": -0.3486,
        "betaDrivers": [
          0.0295,
          -0.0713,
          -0.4606,
          0.3722,
          -0.0516,
          0.1092
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5556,
        "spreadScale": 0.2762,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236958,
            "ecmwfAifs": 0.088879,
            "icon": 0.223224,
            "ukmo": 0.121028,
            "meteofrance": 0.156268,
            "gfs": 0.064661,
            "gem": 0.057157,
            "jma": 0.051825
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5737,
          "logisticSlope": 4.2108,
          "wetFractionWeight": 3.0113,
          "powerEta": 0.68,
          "rawBrier": 0.04458,
          "calibratedBrier": 0.0384
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.8434,
          "rawIfsRmseC": 1.1212,
          "rawEqualMaeC": 1.4114,
          "rawEqualRmseC": 1.89,
          "cvSimplexMaeC": 0.8318,
          "cvCalibratedMaeC": 0.7205,
          "cvCalibratedRmseC": 0.9662
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.81544,
          "ecmwfAifs": 0.034687,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.049873,
          "jma": 0.02
        },
        "intercept": -0.4361,
        "betaDrivers": [
          0.0328,
          -0.053,
          -0.127,
          0.1413,
          -0.0522,
          0.0515
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.622,
        "spreadScale": 0.2503,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305735,
            "ecmwfAifs": 0.239239,
            "icon": 0.139043,
            "ukmo": 0.109352,
            "meteofrance": 0.045121,
            "gfs": 0.063291,
            "gem": 0.055946,
            "jma": 0.042273
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5044,
          "logisticSlope": 4.1285,
          "wetFractionWeight": 3.0179,
          "powerEta": 0.68,
          "rawBrier": 0.04458,
          "calibratedBrier": 0.03822
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.8434,
          "rawIfsRmseC": 1.1212,
          "rawEqualMaeC": 1.4114,
          "rawEqualRmseC": 1.89,
          "cvSimplexMaeC": 0.8396,
          "cvCalibratedMaeC": 0.7261,
          "cvCalibratedRmseC": 0.9821
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.773115,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.106885,
          "jma": 0.02
        },
        "intercept": -0.3494,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8828,
        "spreadScale": 0.1588,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232855,
            "ecmwfAifs": 0.077077,
            "icon": 0.227744,
            "ukmo": 0.124309,
            "meteofrance": 0.157271,
            "gfs": 0.065042,
            "gem": 0.058776,
            "jma": 0.056926
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8184,
          "logisticSlope": 3.0293,
          "wetFractionWeight": 3.1488,
          "powerEta": 0.68,
          "rawBrier": 0.05556,
          "calibratedBrier": 0.05043
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.8693,
          "rawIfsRmseC": 1.1637,
          "rawEqualMaeC": 1.3507,
          "rawEqualRmseC": 1.765,
          "cvSimplexMaeC": 0.8556,
          "cvCalibratedMaeC": 0.7927,
          "cvCalibratedRmseC": 1.0649
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.815808,
          "ecmwfAifs": 0.044309,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.039883,
          "jma": 0.02
        },
        "intercept": -0.355,
        "betaDrivers": [
          0.0225,
          -0.0262,
          0.0079,
          0.0193,
          -0.0197,
          -0.0212
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9129,
        "spreadScale": 0.1448,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30855,
            "ecmwfAifs": 0.213072,
            "icon": 0.145686,
            "ukmo": 0.115348,
            "meteofrance": 0.04519,
            "gfs": 0.065383,
            "gem": 0.059084,
            "jma": 0.047687
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8157,
          "logisticSlope": 3.2586,
          "wetFractionWeight": 3.1706,
          "powerEta": 0.68,
          "rawBrier": 0.05556,
          "calibratedBrier": 0.04995
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.8693,
          "rawIfsRmseC": 1.1637,
          "rawEqualMaeC": 1.3507,
          "rawEqualRmseC": 1.765,
          "cvSimplexMaeC": 0.8592,
          "cvCalibratedMaeC": 0.7917,
          "cvCalibratedRmseC": 1.0693
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.577102,
          "ecmwfAifs": 0.133803,
          "icon": 0.065728,
          "ukmo": 0.100356,
          "meteofrance": 0.027249,
          "gfs": 0.047457,
          "gem": 0.028305,
          "jma": 0.02
        },
        "intercept": -0.2554,
        "betaDrivers": [
          0.1159,
          0.0126,
          0.2058,
          0.2654,
          -0.0691,
          -0.2328
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1747,
        "spreadScale": 0.2251,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.225242,
            "ecmwfAifs": 0.081543,
            "icon": 0.223343,
            "ukmo": 0.125901,
            "meteofrance": 0.162962,
            "gfs": 0.069469,
            "gem": 0.053267,
            "jma": 0.058273
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.5895,
          "logisticSlope": 1.2149,
          "wetFractionWeight": 0.8501,
          "powerEta": 0.68,
          "rawBrier": 0.00142,
          "calibratedBrier": 0.00139
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7743,
          "rawIfsRmseC": 0.9862,
          "rawEqualMaeC": 0.8611,
          "rawEqualRmseC": 1.1212,
          "cvSimplexMaeC": 0.5958,
          "cvCalibratedMaeC": 0.5858,
          "cvCalibratedRmseC": 0.7965
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.543795,
          "ecmwfAifs": 0.151674,
          "icon": 0.08866,
          "ukmo": 0.093798,
          "meteofrance": 0.02,
          "gfs": 0.052948,
          "gem": 0.029125,
          "jma": 0.02
        },
        "intercept": -0.0638,
        "betaDrivers": [
          0.0444,
          -0.0222,
          0.0694,
          0.109,
          -0.0302,
          -0.093
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1906,
        "spreadScale": 0.2202,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.298142,
            "ecmwfAifs": 0.225172,
            "icon": 0.142717,
            "ukmo": 0.116698,
            "meteofrance": 0.045264,
            "gfs": 0.069757,
            "gem": 0.053488,
            "jma": 0.048762
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.5895,
          "logisticSlope": 1.2726,
          "wetFractionWeight": 0.8042,
          "powerEta": 0.68,
          "rawBrier": 0.00142,
          "calibratedBrier": 0.00139
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7743,
          "rawIfsRmseC": 0.9862,
          "rawEqualMaeC": 0.8611,
          "rawEqualRmseC": 1.1212,
          "cvSimplexMaeC": 0.5946,
          "cvCalibratedMaeC": 0.5906,
          "cvCalibratedRmseC": 0.8002
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.718688,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.161312,
          "jma": 0.02
        },
        "intercept": -0.3764,
        "betaDrivers": [
          0.1469,
          -0.0718,
          0.0372,
          0.0589,
          -0.0506,
          -0.2056
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3154,
        "spreadScale": 0.2636,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.233458,
            "ecmwfAifs": 0.085698,
            "icon": 0.226928,
            "ukmo": 0.126087,
            "meteofrance": 0.148519,
            "gfs": 0.06533,
            "gem": 0.057132,
            "jma": 0.056848
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9004,
          "logisticSlope": 4.1942,
          "wetFractionWeight": 4.5328,
          "powerEta": 0.68,
          "rawBrier": 0.01707,
          "calibratedBrier": 0.01605
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.7496,
          "rawIfsRmseC": 0.9659,
          "rawEqualMaeC": 1.156,
          "rawEqualRmseC": 1.5421,
          "cvSimplexMaeC": 0.6888,
          "cvCalibratedMaeC": 0.6442,
          "cvCalibratedRmseC": 0.8567
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.664185,
          "ecmwfAifs": 0.10036,
          "icon": 0.02,
          "ukmo": 0.023412,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.132043,
          "jma": 0.02
        },
        "intercept": -0.2892,
        "betaDrivers": [
          0.0835,
          -0.0908,
          0.0299,
          0.0545,
          0.0013,
          -0.1407
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.301,
        "spreadScale": 0.288,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.301718,
            "ecmwfAifs": 0.231057,
            "icon": 0.141582,
            "ukmo": 0.11411,
            "meteofrance": 0.045022,
            "gfs": 0.064051,
            "gem": 0.056014,
            "jma": 0.046446
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9169,
          "logisticSlope": 4.4333,
          "wetFractionWeight": 4.1732,
          "powerEta": 0.68,
          "rawBrier": 0.01707,
          "calibratedBrier": 0.01598
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.7496,
          "rawIfsRmseC": 0.9659,
          "rawEqualMaeC": 1.156,
          "rawEqualRmseC": 1.5421,
          "cvSimplexMaeC": 0.7045,
          "cvCalibratedMaeC": 0.6559,
          "cvCalibratedRmseC": 0.8708
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.744498,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.135502,
          "jma": 0.02
        },
        "interceptC": -0.3486,
        "diurnalHarmonicsC": [
          0.0295,
          -0.0713,
          0,
          0
        ],
        "driverBetasC": [
          -0.4606,
          0.1092,
          0.3722,
          -0.0516
        ],
        "spreadBaseC2": 0.5556,
        "spreadScale": 0.2762,
        "cvMaeC": 0.7205,
        "cvRmseC": 0.9662,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.779968,
          "ecmwfAifs": 0.027344,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.092688,
          "jma": 0.02
        },
        "interceptC": -0.3923,
        "diurnalHarmonicsC": [
          0.0312,
          -0.0621,
          0,
          0
        ],
        "driverBetasC": [
          -0.2938,
          0.0804,
          0.2567,
          -0.0519
        ],
        "spreadBaseC2": 0.5888,
        "spreadScale": 0.2632,
        "cvMaeC": 0.7233,
        "cvRmseC": 0.9741,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.81544,
          "ecmwfAifs": 0.034687,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.049873,
          "jma": 0.02
        },
        "interceptC": -0.4361,
        "diurnalHarmonicsC": [
          0.0328,
          -0.053,
          0,
          0
        ],
        "driverBetasC": [
          -0.127,
          0.0515,
          0.1413,
          -0.0522
        ],
        "spreadBaseC2": 0.622,
        "spreadScale": 0.2503,
        "cvMaeC": 0.7261,
        "cvRmseC": 0.9821,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.773115,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.106885,
          "jma": 0.02
        },
        "interceptC": -0.3494,
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
        "spreadBaseC2": 0.8828,
        "spreadScale": 0.1588,
        "cvMaeC": 0.7927,
        "cvRmseC": 1.0649,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.794461,
          "ecmwfAifs": 0.032155,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.073384,
          "jma": 0.02
        },
        "interceptC": -0.3522,
        "diurnalHarmonicsC": [
          0.0112,
          -0.0131,
          0,
          0
        ],
        "driverBetasC": [
          0.004,
          -0.0106,
          0.0097,
          -0.0098
        ],
        "spreadBaseC2": 0.8979,
        "spreadScale": 0.1518,
        "cvMaeC": 0.7922,
        "cvRmseC": 1.0671,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.815808,
          "ecmwfAifs": 0.044309,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.039883,
          "jma": 0.02
        },
        "interceptC": -0.355,
        "diurnalHarmonicsC": [
          0.0225,
          -0.0262,
          0,
          0
        ],
        "driverBetasC": [
          0.0079,
          -0.0212,
          0.0193,
          -0.0197
        ],
        "spreadBaseC2": 0.9129,
        "spreadScale": 0.1448,
        "cvMaeC": 0.7917,
        "cvRmseC": 1.0693,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.577102,
          "ecmwfAifs": 0.133803,
          "icon": 0.065728,
          "ukmo": 0.100356,
          "meteofrance": 0.027249,
          "gfs": 0.047457,
          "gem": 0.028305,
          "jma": 0.02
        },
        "interceptC": -0.2554,
        "diurnalHarmonicsC": [
          0.1159,
          0.0126,
          0,
          0
        ],
        "driverBetasC": [
          0.2058,
          -0.2328,
          0.2654,
          -0.0691
        ],
        "spreadBaseC2": 0.1747,
        "spreadScale": 0.2251,
        "cvMaeC": 0.5858,
        "cvRmseC": 0.7965,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.560448,
          "ecmwfAifs": 0.142738,
          "icon": 0.077194,
          "ukmo": 0.097077,
          "meteofrance": 0.023625,
          "gfs": 0.050203,
          "gem": 0.028715,
          "jma": 0.02
        },
        "interceptC": -0.1596,
        "diurnalHarmonicsC": [
          0.0801,
          -0.0048,
          0,
          0
        ],
        "driverBetasC": [
          0.1376,
          -0.1629,
          0.1872,
          -0.0496
        ],
        "spreadBaseC2": 0.1826,
        "spreadScale": 0.2227,
        "cvMaeC": 0.5882,
        "cvRmseC": 0.7984,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.543795,
          "ecmwfAifs": 0.151674,
          "icon": 0.08866,
          "ukmo": 0.093798,
          "meteofrance": 0.02,
          "gfs": 0.052948,
          "gem": 0.029125,
          "jma": 0.02
        },
        "interceptC": -0.0638,
        "diurnalHarmonicsC": [
          0.0444,
          -0.0222,
          0,
          0
        ],
        "driverBetasC": [
          0.0694,
          -0.093,
          0.109,
          -0.0302
        ],
        "spreadBaseC2": 0.1906,
        "spreadScale": 0.2202,
        "cvMaeC": 0.5906,
        "cvRmseC": 0.8002,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.718688,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.161312,
          "jma": 0.02
        },
        "interceptC": -0.3764,
        "diurnalHarmonicsC": [
          0.1469,
          -0.0718,
          0,
          0
        ],
        "driverBetasC": [
          0.0372,
          -0.2056,
          0.0589,
          -0.0506
        ],
        "spreadBaseC2": 0.3154,
        "spreadScale": 0.2636,
        "cvMaeC": 0.6442,
        "cvRmseC": 0.8567,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.691436,
          "ecmwfAifs": 0.06018,
          "icon": 0.02,
          "ukmo": 0.021706,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.146678,
          "jma": 0.02
        },
        "interceptC": -0.3328,
        "diurnalHarmonicsC": [
          0.1152,
          -0.0813,
          0,
          0
        ],
        "driverBetasC": [
          0.0335,
          -0.1731,
          0.0567,
          -0.0246
        ],
        "spreadBaseC2": 0.3082,
        "spreadScale": 0.2758,
        "cvMaeC": 0.6501,
        "cvRmseC": 0.8638,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.664185,
          "ecmwfAifs": 0.10036,
          "icon": 0.02,
          "ukmo": 0.023412,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.132043,
          "jma": 0.02
        },
        "interceptC": -0.2892,
        "diurnalHarmonicsC": [
          0.0835,
          -0.0908,
          0,
          0
        ],
        "driverBetasC": [
          0.0299,
          -0.1407,
          0.0545,
          0.0013
        ],
        "spreadBaseC2": 0.301,
        "spreadScale": 0.288,
        "cvMaeC": 0.6559,
        "cvRmseC": 0.8708,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.236958,
        "ecmwfAifs": 0.088879,
        "icon": 0.223224,
        "ukmo": 0.121028,
        "meteofrance": 0.156268,
        "gfs": 0.064661,
        "gem": 0.057157,
        "jma": 0.051825
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.232855,
        "ecmwfAifs": 0.077077,
        "icon": 0.227744,
        "ukmo": 0.124309,
        "meteofrance": 0.157271,
        "gfs": 0.065042,
        "gem": 0.058776,
        "jma": 0.056926
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.225242,
        "ecmwfAifs": 0.081543,
        "icon": 0.223343,
        "ukmo": 0.125901,
        "meteofrance": 0.162962,
        "gfs": 0.069469,
        "gem": 0.053267,
        "jma": 0.058273
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.233458,
        "ecmwfAifs": 0.085698,
        "icon": 0.226928,
        "ukmo": 0.126087,
        "meteofrance": 0.148519,
        "gfs": 0.06533,
        "gem": 0.057132,
        "jma": 0.056848
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.257742,
    "ecmwfAifs": 0.069754,
    "icon": 0.229915,
    "ukmo": 0.143756,
    "meteofrance": 0.108506,
    "gfs": 0.112823,
    "gem": 0.038752,
    "jma": 0.038752
  },
  "pressureWeights": {
    "ecmwfIfs": 0.425799,
    "ecmwfAifs": 0.129161,
    "icon": 0.123645,
    "ukmo": 0.150315,
    "meteofrance": 0.06798,
    "gfs": 0.03512,
    "gem": 0.03399,
    "jma": 0.03399
  }
} as const;

export default PROVINCE_CALIBRATION_TR_02;
