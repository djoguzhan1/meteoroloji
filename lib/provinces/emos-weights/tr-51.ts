import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_51: ProvinceCalibrationBundle = {
  "provinceCode": "TR-51",
  "provinceName": "Niğde",
  "plateNumber": 51,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17250",
  "stationLat": 37.9667,
  "stationLon": 34.6833,
  "stationElevationM": 1208,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.563567,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.04496,
          "meteofrance": 0.02,
          "gfs": 0.280417,
          "gem": 0.031056,
          "jma": 0.02
        },
        "intercept": -0.1282,
        "betaDrivers": [
          0.2072,
          -0.0367,
          0.1159,
          0.3135,
          -0.2789,
          -0.2871
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7526,
        "spreadScale": 0.077,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239857,
            "ecmwfAifs": 0.085643,
            "icon": 0.230685,
            "ukmo": 0.120662,
            "meteofrance": 0.143464,
            "gfs": 0.067517,
            "gem": 0.058433,
            "jma": 0.053739
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2852,
          "logisticSlope": 4.7543,
          "wetFractionWeight": 3.8515,
          "powerEta": 0.68,
          "rawBrier": 0.04103,
          "calibratedBrier": 0.03766
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.8745,
          "rawIfsRmseC": 1.1878,
          "rawEqualMaeC": 0.9488,
          "rawEqualRmseC": 1.2093,
          "cvSimplexMaeC": 0.7532,
          "cvCalibratedMaeC": 0.7124,
          "cvCalibratedRmseC": 0.9561
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.489594,
          "ecmwfAifs": 0.148928,
          "icon": 0.047041,
          "ukmo": 0.050025,
          "meteofrance": 0.02,
          "gfs": 0.177702,
          "gem": 0.04671,
          "jma": 0.02
        },
        "intercept": -0.1902,
        "betaDrivers": [
          0.1552,
          -0.0359,
          0.0748,
          0.125,
          -0.133,
          -0.1849
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7761,
        "spreadScale": 0.078,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308331,
            "ecmwfAifs": 0.229676,
            "icon": 0.143158,
            "ukmo": 0.108617,
            "meteofrance": 0.04372,
            "gfs": 0.065842,
            "gem": 0.056984,
            "jma": 0.043672
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3771,
          "logisticSlope": 5.1044,
          "wetFractionWeight": 3.5016,
          "powerEta": 0.68,
          "rawBrier": 0.04103,
          "calibratedBrier": 0.03684
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.8745,
          "rawIfsRmseC": 1.1878,
          "rawEqualMaeC": 0.9488,
          "rawEqualRmseC": 1.2093,
          "cvSimplexMaeC": 0.7815,
          "cvCalibratedMaeC": 0.7272,
          "cvCalibratedRmseC": 0.9694
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.572164,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.109099,
          "meteofrance": 0.02,
          "gfs": 0.090519,
          "gem": 0.148218,
          "jma": 0.02
        },
        "intercept": -0.2126,
        "betaDrivers": [
          0.1942,
          -0.035,
          0.0791,
          0.1568,
          -0.1533,
          -0.1751
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9513,
        "spreadScale": 0.2397,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.228147,
            "ecmwfAifs": 0.080921,
            "icon": 0.229872,
            "ukmo": 0.121365,
            "meteofrance": 0.153743,
            "gfs": 0.068005,
            "gem": 0.062314,
            "jma": 0.055633
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4094,
          "logisticSlope": 3.389,
          "wetFractionWeight": 2.4032,
          "powerEta": 0.68,
          "rawBrier": 0.07194,
          "calibratedBrier": 0.06872
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.9489,
          "rawIfsRmseC": 1.3621,
          "rawEqualMaeC": 1.0514,
          "rawEqualRmseC": 1.3917,
          "cvSimplexMaeC": 0.8722,
          "cvCalibratedMaeC": 0.8472,
          "cvCalibratedRmseC": 1.2354
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.476531,
          "ecmwfAifs": 0.128085,
          "icon": 0.039473,
          "ukmo": 0.107996,
          "meteofrance": 0.02,
          "gfs": 0.056139,
          "gem": 0.151776,
          "jma": 0.02
        },
        "intercept": -0.2653,
        "betaDrivers": [
          0.1142,
          -0.0518,
          0.051,
          0.0702,
          -0.0897,
          -0.1212
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9662,
        "spreadScale": 0.2085,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.299677,
            "ecmwfAifs": 0.221746,
            "icon": 0.145765,
            "ukmo": 0.111633,
            "meteofrance": 0.045124,
            "gfs": 0.067764,
            "gem": 0.062094,
            "jma": 0.046197
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4687,
          "logisticSlope": 3.5818,
          "wetFractionWeight": 2.3439,
          "powerEta": 0.68,
          "rawBrier": 0.07194,
          "calibratedBrier": 0.06801
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.9489,
          "rawIfsRmseC": 1.3621,
          "rawEqualMaeC": 1.0514,
          "rawEqualRmseC": 1.3917,
          "cvSimplexMaeC": 0.882,
          "cvCalibratedMaeC": 0.8439,
          "cvCalibratedRmseC": 1.2166
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.564152,
          "ecmwfAifs": 0.123782,
          "icon": 0.02,
          "ukmo": 0.100597,
          "meteofrance": 0.034281,
          "gfs": 0.117188,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0969,
        "betaDrivers": [
          0.0557,
          0.042,
          0.3499,
          0.5251,
          -0.2815,
          -0.4063
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3504,
        "spreadScale": 0.1613,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231745,
            "ecmwfAifs": 0.08433,
            "icon": 0.21649,
            "ukmo": 0.133494,
            "meteofrance": 0.155357,
            "gfs": 0.065302,
            "gem": 0.057133,
            "jma": 0.056149
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5783,
          "logisticSlope": 4.5227,
          "wetFractionWeight": 3.2659,
          "powerEta": 0.68,
          "rawBrier": 0.01591,
          "calibratedBrier": 0.01591
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7619,
          "rawIfsRmseC": 1.015,
          "rawEqualMaeC": 0.8013,
          "rawEqualRmseC": 1.0397,
          "cvSimplexMaeC": 0.624,
          "cvCalibratedMaeC": 0.5515,
          "cvCalibratedRmseC": 0.8113
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.481878,
          "ecmwfAifs": 0.198553,
          "icon": 0.047064,
          "ukmo": 0.108722,
          "meteofrance": 0.030248,
          "gfs": 0.093535,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0596,
        "betaDrivers": [
          -0.0004,
          0.0098,
          0.144,
          0.2353,
          -0.1688,
          -0.2339
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3965,
        "spreadScale": 0.1594,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.301462,
            "ecmwfAifs": 0.228856,
            "icon": 0.135954,
            "ukmo": 0.121604,
            "meteofrance": 0.045125,
            "gfs": 0.064442,
            "gem": 0.056382,
            "jma": 0.046175
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6898,
          "logisticSlope": 4.6519,
          "wetFractionWeight": 3.5421,
          "powerEta": 0.68,
          "rawBrier": 0.01591,
          "calibratedBrier": 0.0156
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.7619,
          "rawIfsRmseC": 1.015,
          "rawEqualMaeC": 0.8013,
          "rawEqualRmseC": 1.0397,
          "cvSimplexMaeC": 0.6365,
          "cvCalibratedMaeC": 0.5841,
          "cvCalibratedRmseC": 0.8368
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.609573,
          "ecmwfAifs": 0.057094,
          "icon": 0.02,
          "ukmo": 0.106509,
          "meteofrance": 0.02,
          "gfs": 0.146824,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1335,
        "betaDrivers": [
          0.0888,
          -0.0552,
          0.2319,
          0.2903,
          -0.3951,
          -0.2467
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4514,
        "spreadScale": 0.1809,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231557,
            "ecmwfAifs": 0.079012,
            "icon": 0.226844,
            "ukmo": 0.121234,
            "meteofrance": 0.158297,
            "gfs": 0.067642,
            "gem": 0.057692,
            "jma": 0.057722
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3142,
          "logisticSlope": 4.4084,
          "wetFractionWeight": 2.3944,
          "powerEta": 0.68,
          "rawBrier": 0.02344,
          "calibratedBrier": 0.02265
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.7251,
          "rawIfsRmseC": 1.0465,
          "rawEqualMaeC": 0.8334,
          "rawEqualRmseC": 1.0976,
          "cvSimplexMaeC": 0.656,
          "cvCalibratedMaeC": 0.6367,
          "cvCalibratedRmseC": 0.9331
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.520549,
          "ecmwfAifs": 0.139858,
          "icon": 0.034657,
          "ukmo": 0.107394,
          "meteofrance": 0.02,
          "gfs": 0.107909,
          "gem": 0.049633,
          "jma": 0.02
        },
        "intercept": -0.112,
        "betaDrivers": [
          0.0647,
          -0.0337,
          0.1223,
          0.1147,
          -0.1597,
          -0.151
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4719,
        "spreadScale": 0.172,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306063,
            "ecmwfAifs": 0.217873,
            "icon": 0.144747,
            "ukmo": 0.112212,
            "meteofrance": 0.045198,
            "gfs": 0.067825,
            "gem": 0.057849,
            "jma": 0.048233
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3653,
          "logisticSlope": 4.3632,
          "wetFractionWeight": 2.4058,
          "powerEta": 0.68,
          "rawBrier": 0.02344,
          "calibratedBrier": 0.02237
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.7251,
          "rawIfsRmseC": 1.0465,
          "rawEqualMaeC": 0.8334,
          "rawEqualRmseC": 1.0976,
          "cvSimplexMaeC": 0.6685,
          "cvCalibratedMaeC": 0.6537,
          "cvCalibratedRmseC": 0.9329
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.563567,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.04496,
          "meteofrance": 0.02,
          "gfs": 0.280417,
          "gem": 0.031056,
          "jma": 0.02
        },
        "interceptC": -0.1282,
        "diurnalHarmonicsC": [
          0.2072,
          -0.0367,
          0,
          0
        ],
        "driverBetasC": [
          0.1159,
          -0.2871,
          0.3135,
          -0.2789
        ],
        "spreadBaseC2": 0.7526,
        "spreadScale": 0.077,
        "cvMaeC": 0.7124,
        "cvRmseC": 0.9561,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.526581,
          "ecmwfAifs": 0.084464,
          "icon": 0.03352,
          "ukmo": 0.047492,
          "meteofrance": 0.02,
          "gfs": 0.22906,
          "gem": 0.038883,
          "jma": 0.02
        },
        "interceptC": -0.1592,
        "diurnalHarmonicsC": [
          0.1812,
          -0.0363,
          0,
          0
        ],
        "driverBetasC": [
          0.0954,
          -0.236,
          0.2193,
          -0.2059
        ],
        "spreadBaseC2": 0.7644,
        "spreadScale": 0.0775,
        "cvMaeC": 0.7198,
        "cvRmseC": 0.9627,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.489594,
          "ecmwfAifs": 0.148928,
          "icon": 0.047041,
          "ukmo": 0.050025,
          "meteofrance": 0.02,
          "gfs": 0.177702,
          "gem": 0.04671,
          "jma": 0.02
        },
        "interceptC": -0.1902,
        "diurnalHarmonicsC": [
          0.1552,
          -0.0359,
          0,
          0
        ],
        "driverBetasC": [
          0.0748,
          -0.1849,
          0.125,
          -0.133
        ],
        "spreadBaseC2": 0.7761,
        "spreadScale": 0.078,
        "cvMaeC": 0.7272,
        "cvRmseC": 0.9694,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.572164,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.109099,
          "meteofrance": 0.02,
          "gfs": 0.090519,
          "gem": 0.148218,
          "jma": 0.02
        },
        "interceptC": -0.2126,
        "diurnalHarmonicsC": [
          0.1942,
          -0.035,
          0,
          0
        ],
        "driverBetasC": [
          0.0791,
          -0.1751,
          0.1568,
          -0.1533
        ],
        "spreadBaseC2": 0.9513,
        "spreadScale": 0.2397,
        "cvMaeC": 0.8472,
        "cvRmseC": 1.2354,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.524347,
          "ecmwfAifs": 0.074043,
          "icon": 0.029737,
          "ukmo": 0.108547,
          "meteofrance": 0.02,
          "gfs": 0.073329,
          "gem": 0.149997,
          "jma": 0.02
        },
        "interceptC": -0.2389,
        "diurnalHarmonicsC": [
          0.1542,
          -0.0434,
          0,
          0
        ],
        "driverBetasC": [
          0.065,
          -0.1482,
          0.1135,
          -0.1215
        ],
        "spreadBaseC2": 0.9587,
        "spreadScale": 0.2241,
        "cvMaeC": 0.8456,
        "cvRmseC": 1.226,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.476531,
          "ecmwfAifs": 0.128085,
          "icon": 0.039473,
          "ukmo": 0.107996,
          "meteofrance": 0.02,
          "gfs": 0.056139,
          "gem": 0.151776,
          "jma": 0.02
        },
        "interceptC": -0.2653,
        "diurnalHarmonicsC": [
          0.1142,
          -0.0518,
          0,
          0
        ],
        "driverBetasC": [
          0.051,
          -0.1212,
          0.0702,
          -0.0897
        ],
        "spreadBaseC2": 0.9662,
        "spreadScale": 0.2085,
        "cvMaeC": 0.8439,
        "cvRmseC": 1.2166,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.564152,
          "ecmwfAifs": 0.123782,
          "icon": 0.02,
          "ukmo": 0.100597,
          "meteofrance": 0.034281,
          "gfs": 0.117188,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0969,
        "diurnalHarmonicsC": [
          0.0557,
          0.042,
          0,
          0
        ],
        "driverBetasC": [
          0.3499,
          -0.4063,
          0.5251,
          -0.2815
        ],
        "spreadBaseC2": 0.3504,
        "spreadScale": 0.1613,
        "cvMaeC": 0.5515,
        "cvRmseC": 0.8113,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.523014,
          "ecmwfAifs": 0.161167,
          "icon": 0.033532,
          "ukmo": 0.10466,
          "meteofrance": 0.032265,
          "gfs": 0.105362,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0783,
        "diurnalHarmonicsC": [
          0.0277,
          0.0259,
          0,
          0
        ],
        "driverBetasC": [
          0.247,
          -0.3201,
          0.3802,
          -0.2251
        ],
        "spreadBaseC2": 0.3735,
        "spreadScale": 0.1603,
        "cvMaeC": 0.5678,
        "cvRmseC": 0.824,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.481878,
          "ecmwfAifs": 0.198553,
          "icon": 0.047064,
          "ukmo": 0.108722,
          "meteofrance": 0.030248,
          "gfs": 0.093535,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0596,
        "diurnalHarmonicsC": [
          -0.0004,
          0.0098,
          0,
          0
        ],
        "driverBetasC": [
          0.144,
          -0.2339,
          0.2353,
          -0.1688
        ],
        "spreadBaseC2": 0.3965,
        "spreadScale": 0.1594,
        "cvMaeC": 0.5841,
        "cvRmseC": 0.8368,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.609573,
          "ecmwfAifs": 0.057094,
          "icon": 0.02,
          "ukmo": 0.106509,
          "meteofrance": 0.02,
          "gfs": 0.146824,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1335,
        "diurnalHarmonicsC": [
          0.0888,
          -0.0552,
          0,
          0
        ],
        "driverBetasC": [
          0.2319,
          -0.2467,
          0.2903,
          -0.3951
        ],
        "spreadBaseC2": 0.4514,
        "spreadScale": 0.1809,
        "cvMaeC": 0.6367,
        "cvRmseC": 0.9331,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.56506,
          "ecmwfAifs": 0.098476,
          "icon": 0.027329,
          "ukmo": 0.106952,
          "meteofrance": 0.02,
          "gfs": 0.127366,
          "gem": 0.034817,
          "jma": 0.02
        },
        "interceptC": -0.1227,
        "diurnalHarmonicsC": [
          0.0767,
          -0.0445,
          0,
          0
        ],
        "driverBetasC": [
          0.1771,
          -0.1988,
          0.2025,
          -0.2774
        ],
        "spreadBaseC2": 0.4617,
        "spreadScale": 0.1764,
        "cvMaeC": 0.6452,
        "cvRmseC": 0.933,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.520549,
          "ecmwfAifs": 0.139858,
          "icon": 0.034657,
          "ukmo": 0.107394,
          "meteofrance": 0.02,
          "gfs": 0.107909,
          "gem": 0.049633,
          "jma": 0.02
        },
        "interceptC": -0.112,
        "diurnalHarmonicsC": [
          0.0647,
          -0.0337,
          0,
          0
        ],
        "driverBetasC": [
          0.1223,
          -0.151,
          0.1147,
          -0.1597
        ],
        "spreadBaseC2": 0.4719,
        "spreadScale": 0.172,
        "cvMaeC": 0.6537,
        "cvRmseC": 0.9329,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.239857,
        "ecmwfAifs": 0.085643,
        "icon": 0.230685,
        "ukmo": 0.120662,
        "meteofrance": 0.143464,
        "gfs": 0.067517,
        "gem": 0.058433,
        "jma": 0.053739
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.228147,
        "ecmwfAifs": 0.080921,
        "icon": 0.229872,
        "ukmo": 0.121365,
        "meteofrance": 0.153743,
        "gfs": 0.068005,
        "gem": 0.062314,
        "jma": 0.055633
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.231745,
        "ecmwfAifs": 0.08433,
        "icon": 0.21649,
        "ukmo": 0.133494,
        "meteofrance": 0.155357,
        "gfs": 0.065302,
        "gem": 0.057133,
        "jma": 0.056149
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.231557,
        "ecmwfAifs": 0.079012,
        "icon": 0.226844,
        "ukmo": 0.121234,
        "meteofrance": 0.158297,
        "gfs": 0.067642,
        "gem": 0.057692,
        "jma": 0.057722
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.29246,
    "ecmwfAifs": 0.065942,
    "icon": 0.20428,
    "ukmo": 0.165773,
    "meteofrance": 0.102576,
    "gfs": 0.095701,
    "gem": 0.036634,
    "jma": 0.036634
  },
  "pressureWeights": {
    "ecmwfIfs": 0.620963,
    "ecmwfAifs": 0.071746,
    "icon": 0.150461,
    "ukmo": 0.056001,
    "meteofrance": 0.037599,
    "gfs": 0.02323,
    "gem": 0.02,
    "jma": 0.02
  }
} as const;

export default PROVINCE_CALIBRATION_TR_51;
