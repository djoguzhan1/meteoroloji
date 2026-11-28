import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_21: ProvinceCalibrationBundle = {
  "provinceCode": "TR-21",
  "provinceName": "Diyarbakır",
  "plateNumber": 21,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17280",
  "stationLat": 37.8833,
  "stationLon": 40.1833,
  "stationElevationM": 686,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.112418,
          "ecmwfAifs": 0.02,
          "icon": 0.503411,
          "ukmo": 0.165705,
          "meteofrance": 0.05283,
          "gfs": 0.02,
          "gem": 0.105636,
          "jma": 0.02
        },
        "intercept": 0.2026,
        "betaDrivers": [
          -0.0666,
          -0.0001,
          -0.4694,
          -0.1881,
          -0.0558,
          -0.0613
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0027,
        "spreadScale": 0.3167,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248225,
            "ecmwfAifs": 0.086324,
            "icon": 0.217589,
            "ukmo": 0.121215,
            "meteofrance": 0.15036,
            "gfs": 0.065285,
            "gem": 0.054285,
            "jma": 0.056717
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2614,
          "logisticSlope": 4.5483,
          "wetFractionWeight": 2.8904,
          "powerEta": 0.68,
          "rawBrier": 0.04316,
          "calibratedBrier": 0.04097
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3052,
          "rawIfsRmseC": 1.7701,
          "rawEqualMaeC": 1.1076,
          "rawEqualRmseC": 1.4585,
          "cvSimplexMaeC": 1.0124,
          "cvCalibratedMaeC": 0.9931,
          "cvCalibratedRmseC": 1.3664
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.213284,
          "ecmwfAifs": 0.205433,
          "icon": 0.268005,
          "ukmo": 0.127169,
          "meteofrance": 0.042738,
          "gfs": 0.02,
          "gem": 0.103371,
          "jma": 0.02
        },
        "intercept": 0.2285,
        "betaDrivers": [
          -0.1041,
          -0.044,
          -0.1799,
          -0.0633,
          -0.0053,
          -0.0413
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1372,
        "spreadScale": 0.2818,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318269,
            "ecmwfAifs": 0.230907,
            "icon": 0.134683,
            "ukmo": 0.108834,
            "meteofrance": 0.04503,
            "gfs": 0.063502,
            "gem": 0.052802,
            "jma": 0.045973
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1893,
          "logisticSlope": 4.6241,
          "wetFractionWeight": 2.6723,
          "powerEta": 0.68,
          "rawBrier": 0.04316,
          "calibratedBrier": 0.04076
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3052,
          "rawIfsRmseC": 1.7701,
          "rawEqualMaeC": 1.1076,
          "rawEqualRmseC": 1.4585,
          "cvSimplexMaeC": 1.0413,
          "cvCalibratedMaeC": 1.0176,
          "cvCalibratedRmseC": 1.3801
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.131593,
          "ecmwfAifs": 0.050012,
          "icon": 0.451562,
          "ukmo": 0.118114,
          "meteofrance": 0.143603,
          "gfs": 0.02,
          "gem": 0.065116,
          "jma": 0.02
        },
        "intercept": 0.1783,
        "betaDrivers": [
          -0.0825,
          -0.1215,
          0.0215,
          -0.0773,
          -0.0675,
          -0.0022
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.6082,
        "spreadScale": 0.1891,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.257718,
            "ecmwfAifs": 0.075394,
            "icon": 0.213548,
            "ukmo": 0.125929,
            "meteofrance": 0.154447,
            "gfs": 0.061294,
            "gem": 0.054537,
            "jma": 0.057133
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7741,
          "logisticSlope": 2.9531,
          "wetFractionWeight": 2.9336,
          "powerEta": 0.68,
          "rawBrier": 0.05893,
          "calibratedBrier": 0.05272
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4165,
          "rawIfsRmseC": 1.8221,
          "rawEqualMaeC": 1.166,
          "rawEqualRmseC": 1.4959,
          "cvSimplexMaeC": 1.1088,
          "cvCalibratedMaeC": 1.0881,
          "cvCalibratedRmseC": 1.4539
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.237948,
          "ecmwfAifs": 0.156968,
          "icon": 0.272994,
          "ukmo": 0.12945,
          "meteofrance": 0.067362,
          "gfs": 0.02,
          "gem": 0.095278,
          "jma": 0.02
        },
        "intercept": 0.1869,
        "betaDrivers": [
          -0.1421,
          -0.1047,
          0.0147,
          -0.0508,
          -0.0416,
          0.0202
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5518,
        "spreadScale": 0.213,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.336984,
            "ecmwfAifs": 0.205662,
            "icon": 0.134799,
            "ukmo": 0.115306,
            "meteofrance": 0.045124,
            "gfs": 0.0608,
            "gem": 0.054098,
            "jma": 0.047227
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8065,
          "logisticSlope": 3.3132,
          "wetFractionWeight": 2.7987,
          "powerEta": 0.68,
          "rawBrier": 0.05893,
          "calibratedBrier": 0.05116
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4165,
          "rawIfsRmseC": 1.8221,
          "rawEqualMaeC": 1.166,
          "rawEqualRmseC": 1.4959,
          "cvSimplexMaeC": 1.1204,
          "cvCalibratedMaeC": 1.1019,
          "cvCalibratedRmseC": 1.4488
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.263676,
          "ecmwfAifs": 0.02,
          "icon": 0.301213,
          "ukmo": 0.296528,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.058583,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0342,
          -0.1733,
          -0.0643,
          -0.1726,
          0.0682,
          -0.0286
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0736,
        "spreadScale": 0.3483,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.226831,
            "ecmwfAifs": 0.081578,
            "icon": 0.221577,
            "ukmo": 0.123767,
            "meteofrance": 0.165056,
            "gfs": 0.06884,
            "gem": 0.050626,
            "jma": 0.061725
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.9924,
          "logisticSlope": 0.8313,
          "wetFractionWeight": 0.5409,
          "powerEta": 0.68,
          "rawBrier": 0.00175,
          "calibratedBrier": 0.00093
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2624,
          "rawIfsRmseC": 1.6542,
          "rawEqualMaeC": 1.1508,
          "rawEqualRmseC": 1.4973,
          "cvSimplexMaeC": 1.0819,
          "cvCalibratedMaeC": 1.0724,
          "cvCalibratedRmseC": 1.4465
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.341416,
          "ecmwfAifs": 0.113467,
          "icon": 0.199044,
          "ukmo": 0.208468,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.077605,
          "jma": 0.02
        },
        "intercept": 0.0024,
        "betaDrivers": [
          -0.0502,
          -0.121,
          -0.0254,
          -0.109,
          0.0543,
          -0.0289
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0808,
        "spreadScale": 0.3435,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.300643,
            "ecmwfAifs": 0.22557,
            "icon": 0.141777,
            "ukmo": 0.114873,
            "meteofrance": 0.045296,
            "gfs": 0.069217,
            "gem": 0.050904,
            "jma": 0.05172
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.9942,
          "logisticSlope": 0.8927,
          "wetFractionWeight": 0.7283,
          "powerEta": 0.68,
          "rawBrier": 0.00175,
          "calibratedBrier": 0.00093
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2624,
          "rawIfsRmseC": 1.6542,
          "rawEqualMaeC": 1.1508,
          "rawEqualRmseC": 1.4973,
          "cvSimplexMaeC": 1.0928,
          "cvCalibratedMaeC": 1.0829,
          "cvCalibratedRmseC": 1.4417
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.220856,
          "ecmwfAifs": 0.02,
          "icon": 0.427955,
          "ukmo": 0.087755,
          "meteofrance": 0.055153,
          "gfs": 0.02,
          "gem": 0.148281,
          "jma": 0.02
        },
        "intercept": 0.0687,
        "betaDrivers": [
          -0.0195,
          -0.2373,
          -0.0615,
          -0.2675,
          0.1542,
          -0.0436
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.3304,
        "spreadScale": 0.1893,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231981,
            "ecmwfAifs": 0.076819,
            "icon": 0.218265,
            "ukmo": 0.133807,
            "meteofrance": 0.153796,
            "gfs": 0.069041,
            "gem": 0.058346,
            "jma": 0.057945
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.797,
          "logisticSlope": 3.7293,
          "wetFractionWeight": 3.2943,
          "powerEta": 0.68,
          "rawBrier": 0.01978,
          "calibratedBrier": 0.0172
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.4291,
          "rawIfsRmseC": 1.8312,
          "rawEqualMaeC": 1.2371,
          "rawEqualRmseC": 1.552,
          "cvSimplexMaeC": 1.087,
          "cvCalibratedMaeC": 1.0673,
          "cvCalibratedRmseC": 1.4154
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.281507,
          "ecmwfAifs": 0.135265,
          "icon": 0.251509,
          "ukmo": 0.084992,
          "meteofrance": 0.044096,
          "gfs": 0.02,
          "gem": 0.162631,
          "jma": 0.02
        },
        "intercept": 0.0465,
        "betaDrivers": [
          -0.0658,
          -0.1665,
          -0.0312,
          -0.1144,
          0.0874,
          -0.042
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3469,
        "spreadScale": 0.1918,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305708,
            "ecmwfAifs": 0.211195,
            "icon": 0.138858,
            "ukmo": 0.123481,
            "meteofrance": 0.045131,
            "gfs": 0.069022,
            "gem": 0.05833,
            "jma": 0.048275
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8281,
          "logisticSlope": 3.8318,
          "wetFractionWeight": 3.0764,
          "powerEta": 0.68,
          "rawBrier": 0.01978,
          "calibratedBrier": 0.01708
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.4291,
          "rawIfsRmseC": 1.8312,
          "rawEqualMaeC": 1.2371,
          "rawEqualRmseC": 1.552,
          "cvSimplexMaeC": 1.109,
          "cvCalibratedMaeC": 1.0915,
          "cvCalibratedRmseC": 1.4237
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.112418,
          "ecmwfAifs": 0.02,
          "icon": 0.503411,
          "ukmo": 0.165705,
          "meteofrance": 0.05283,
          "gfs": 0.02,
          "gem": 0.105636,
          "jma": 0.02
        },
        "interceptC": 0.2026,
        "diurnalHarmonicsC": [
          -0.0666,
          -0.0001,
          0,
          0
        ],
        "driverBetasC": [
          -0.4694,
          -0.0613,
          -0.1881,
          -0.0558
        ],
        "spreadBaseC2": 1.0027,
        "spreadScale": 0.3167,
        "cvMaeC": 0.9931,
        "cvRmseC": 1.3664,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.162851,
          "ecmwfAifs": 0.112717,
          "icon": 0.385707,
          "ukmo": 0.146437,
          "meteofrance": 0.047784,
          "gfs": 0.02,
          "gem": 0.104504,
          "jma": 0.02
        },
        "interceptC": 0.2156,
        "diurnalHarmonicsC": [
          -0.0854,
          -0.0221,
          0,
          0
        ],
        "driverBetasC": [
          -0.3246,
          -0.0513,
          -0.1257,
          -0.0306
        ],
        "spreadBaseC2": 1.0699,
        "spreadScale": 0.2993,
        "cvMaeC": 1.0053,
        "cvRmseC": 1.3733,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.213284,
          "ecmwfAifs": 0.205433,
          "icon": 0.268005,
          "ukmo": 0.127169,
          "meteofrance": 0.042738,
          "gfs": 0.02,
          "gem": 0.103371,
          "jma": 0.02
        },
        "interceptC": 0.2285,
        "diurnalHarmonicsC": [
          -0.1041,
          -0.044,
          0,
          0
        ],
        "driverBetasC": [
          -0.1799,
          -0.0413,
          -0.0633,
          -0.0053
        ],
        "spreadBaseC2": 1.1372,
        "spreadScale": 0.2818,
        "cvMaeC": 1.0176,
        "cvRmseC": 1.3801,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.131593,
          "ecmwfAifs": 0.050012,
          "icon": 0.451562,
          "ukmo": 0.118114,
          "meteofrance": 0.143603,
          "gfs": 0.02,
          "gem": 0.065116,
          "jma": 0.02
        },
        "interceptC": 0.1783,
        "diurnalHarmonicsC": [
          -0.0825,
          -0.1215,
          0,
          0
        ],
        "driverBetasC": [
          0.0215,
          -0.0022,
          -0.0773,
          -0.0675
        ],
        "spreadBaseC2": 1.6082,
        "spreadScale": 0.1891,
        "cvMaeC": 1.0881,
        "cvRmseC": 1.4539,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.184771,
          "ecmwfAifs": 0.10349,
          "icon": 0.362277,
          "ukmo": 0.123782,
          "meteofrance": 0.105483,
          "gfs": 0.02,
          "gem": 0.080197,
          "jma": 0.02
        },
        "interceptC": 0.1826,
        "diurnalHarmonicsC": [
          -0.1123,
          -0.1131,
          0,
          0
        ],
        "driverBetasC": [
          0.0181,
          0.009,
          -0.064,
          -0.0546
        ],
        "spreadBaseC2": 1.58,
        "spreadScale": 0.2011,
        "cvMaeC": 1.095,
        "cvRmseC": 1.4514,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.237948,
          "ecmwfAifs": 0.156968,
          "icon": 0.272994,
          "ukmo": 0.12945,
          "meteofrance": 0.067362,
          "gfs": 0.02,
          "gem": 0.095278,
          "jma": 0.02
        },
        "interceptC": 0.1869,
        "diurnalHarmonicsC": [
          -0.1421,
          -0.1047,
          0,
          0
        ],
        "driverBetasC": [
          0.0147,
          0.0202,
          -0.0508,
          -0.0416
        ],
        "spreadBaseC2": 1.5518,
        "spreadScale": 0.213,
        "cvMaeC": 1.1019,
        "cvRmseC": 1.4488,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.263676,
          "ecmwfAifs": 0.02,
          "icon": 0.301213,
          "ukmo": 0.296528,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.058583,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0342,
          -0.1733,
          0,
          0
        ],
        "driverBetasC": [
          -0.0643,
          -0.0286,
          -0.1726,
          0.0682
        ],
        "spreadBaseC2": 1.0736,
        "spreadScale": 0.3483,
        "cvMaeC": 1.0724,
        "cvRmseC": 1.4465,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.302545,
          "ecmwfAifs": 0.066734,
          "icon": 0.250129,
          "ukmo": 0.252498,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.068094,
          "jma": 0.02
        },
        "interceptC": 0.0012,
        "diurnalHarmonicsC": [
          -0.008,
          -0.1472,
          0,
          0
        ],
        "driverBetasC": [
          -0.0449,
          -0.0287,
          -0.1408,
          0.0612
        ],
        "spreadBaseC2": 1.0772,
        "spreadScale": 0.3459,
        "cvMaeC": 1.0776,
        "cvRmseC": 1.4441,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.341416,
          "ecmwfAifs": 0.113467,
          "icon": 0.199044,
          "ukmo": 0.208468,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.077605,
          "jma": 0.02
        },
        "interceptC": 0.0024,
        "diurnalHarmonicsC": [
          -0.0502,
          -0.121,
          0,
          0
        ],
        "driverBetasC": [
          -0.0254,
          -0.0289,
          -0.109,
          0.0543
        ],
        "spreadBaseC2": 1.0808,
        "spreadScale": 0.3435,
        "cvMaeC": 1.0829,
        "cvRmseC": 1.4417,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.220856,
          "ecmwfAifs": 0.02,
          "icon": 0.427955,
          "ukmo": 0.087755,
          "meteofrance": 0.055153,
          "gfs": 0.02,
          "gem": 0.148281,
          "jma": 0.02
        },
        "interceptC": 0.0687,
        "diurnalHarmonicsC": [
          -0.0195,
          -0.2373,
          0,
          0
        ],
        "driverBetasC": [
          -0.0615,
          -0.0436,
          -0.2675,
          0.1542
        ],
        "spreadBaseC2": 1.3304,
        "spreadScale": 0.1893,
        "cvMaeC": 1.0673,
        "cvRmseC": 1.4154,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.251182,
          "ecmwfAifs": 0.077633,
          "icon": 0.339731,
          "ukmo": 0.086373,
          "meteofrance": 0.049625,
          "gfs": 0.02,
          "gem": 0.155456,
          "jma": 0.02
        },
        "interceptC": 0.0576,
        "diurnalHarmonicsC": [
          -0.0427,
          -0.2019,
          0,
          0
        ],
        "driverBetasC": [
          -0.0464,
          -0.0428,
          -0.191,
          0.1208
        ],
        "spreadBaseC2": 1.3386,
        "spreadScale": 0.1905,
        "cvMaeC": 1.0794,
        "cvRmseC": 1.4196,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.281507,
          "ecmwfAifs": 0.135265,
          "icon": 0.251509,
          "ukmo": 0.084992,
          "meteofrance": 0.044096,
          "gfs": 0.02,
          "gem": 0.162631,
          "jma": 0.02
        },
        "interceptC": 0.0465,
        "diurnalHarmonicsC": [
          -0.0658,
          -0.1665,
          0,
          0
        ],
        "driverBetasC": [
          -0.0312,
          -0.042,
          -0.1144,
          0.0874
        ],
        "spreadBaseC2": 1.3469,
        "spreadScale": 0.1918,
        "cvMaeC": 1.0915,
        "cvRmseC": 1.4237,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.248225,
        "ecmwfAifs": 0.086324,
        "icon": 0.217589,
        "ukmo": 0.121215,
        "meteofrance": 0.15036,
        "gfs": 0.065285,
        "gem": 0.054285,
        "jma": 0.056717
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.257718,
        "ecmwfAifs": 0.075394,
        "icon": 0.213548,
        "ukmo": 0.125929,
        "meteofrance": 0.154447,
        "gfs": 0.061294,
        "gem": 0.054537,
        "jma": 0.057133
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.226831,
        "ecmwfAifs": 0.081578,
        "icon": 0.221577,
        "ukmo": 0.123767,
        "meteofrance": 0.165056,
        "gfs": 0.06884,
        "gem": 0.050626,
        "jma": 0.061725
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.231981,
        "ecmwfAifs": 0.076819,
        "icon": 0.218265,
        "ukmo": 0.133807,
        "meteofrance": 0.153796,
        "gfs": 0.069041,
        "gem": 0.058346,
        "jma": 0.057945
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.213674,
    "ecmwfAifs": 0.070526,
    "icon": 0.255642,
    "ukmo": 0.169105,
    "meteofrance": 0.109707,
    "gfs": 0.102984,
    "gem": 0.039181,
    "jma": 0.039181
  },
  "pressureWeights": {
    "ecmwfIfs": 0.302718,
    "ecmwfAifs": 0.152998,
    "icon": 0.134207,
    "ukmo": 0.193198,
    "meteofrance": 0.080525,
    "gfs": 0.055828,
    "gem": 0.040263,
    "jma": 0.040263
  }
} as const;

export default PROVINCE_CALIBRATION_TR_21;
