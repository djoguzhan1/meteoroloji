import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_43: ProvinceCalibrationBundle = {
  "provinceCode": "TR-43",
  "provinceName": "Kütahya",
  "plateNumber": 43,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17155",
  "stationLat": 39.4167,
  "stationLon": 29.9667,
  "stationElevationM": 969,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.788131,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.091869,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0629,
          -0.1938,
          -0.1712,
          -0.2046,
          0.062,
          -0.2145
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2939,
        "spreadScale": 0.0903,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.261307,
            "ecmwfAifs": 0.080531,
            "icon": 0.207318,
            "ukmo": 0.116172,
            "meteofrance": 0.158911,
            "gfs": 0.064948,
            "gem": 0.055079,
            "jma": 0.055734
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4501,
          "logisticSlope": 4.1271,
          "wetFractionWeight": 3.9068,
          "powerEta": 0.68,
          "rawBrier": 0.04159,
          "calibratedBrier": 0.03871
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5151,
          "rawIfsRmseC": 0.7321,
          "rawEqualMaeC": 0.9147,
          "rawEqualRmseC": 1.1764,
          "cvSimplexMaeC": 0.5122,
          "cvCalibratedMaeC": 0.4531,
          "cvCalibratedRmseC": 0.6447
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.828505,
          "ecmwfAifs": 0.029157,
          "icon": 0.02,
          "ukmo": 0.023267,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.039071,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.07,
          -0.1129,
          -0.1186,
          -0.106,
          0.0666,
          -0.0727
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3397,
        "spreadScale": 0.0748,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.338525,
            "ecmwfAifs": 0.217651,
            "icon": 0.12966,
            "ukmo": 0.105391,
            "meteofrance": 0.045164,
            "gfs": 0.063831,
            "gem": 0.054132,
            "jma": 0.045646
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.541,
          "logisticSlope": 4.3033,
          "wetFractionWeight": 3.6991,
          "powerEta": 0.68,
          "rawBrier": 0.04159,
          "calibratedBrier": 0.03806
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.5151,
          "rawIfsRmseC": 0.7321,
          "rawEqualMaeC": 0.9147,
          "rawEqualRmseC": 1.1764,
          "cvSimplexMaeC": 0.5192,
          "cvCalibratedMaeC": 0.4665,
          "cvCalibratedRmseC": 0.6637
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.831708,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.048292,
          "jma": 0.02
        },
        "intercept": -0.174,
        "betaDrivers": [
          -0.1709,
          -0.2943,
          0.0686,
          -0.0306,
          0.1541,
          0.0785
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3795,
        "spreadScale": 0.0979,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258156,
            "ecmwfAifs": 0.074985,
            "icon": 0.218346,
            "ukmo": 0.120084,
            "meteofrance": 0.151796,
            "gfs": 0.064228,
            "gem": 0.055315,
            "jma": 0.05709
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8942,
          "logisticSlope": 3.883,
          "wetFractionWeight": 2.8297,
          "powerEta": 0.68,
          "rawBrier": 0.05159,
          "calibratedBrier": 0.0473
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5233,
          "rawIfsRmseC": 0.7746,
          "rawEqualMaeC": 1.0788,
          "rawEqualRmseC": 1.3402,
          "cvSimplexMaeC": 0.5454,
          "cvCalibratedMaeC": 0.4919,
          "cvCalibratedRmseC": 0.7188
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.835124,
          "ecmwfAifs": 0.023935,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.040941,
          "jma": 0.02
        },
        "intercept": -0.1625,
        "betaDrivers": [
          -0.0951,
          -0.1536,
          0.0047,
          -0.0202,
          0.0749,
          0.0271
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.383,
        "spreadScale": 0.1032,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.337292,
            "ecmwfAifs": 0.204389,
            "icon": 0.137721,
            "ukmo": 0.109868,
            "meteofrance": 0.045087,
            "gfs": 0.063661,
            "gem": 0.054827,
            "jma": 0.047155
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9902,
          "logisticSlope": 3.8844,
          "wetFractionWeight": 3.0412,
          "powerEta": 0.68,
          "rawBrier": 0.05159,
          "calibratedBrier": 0.04596
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.5233,
          "rawIfsRmseC": 0.7746,
          "rawEqualMaeC": 1.0788,
          "rawEqualRmseC": 1.3402,
          "cvSimplexMaeC": 0.5466,
          "cvCalibratedMaeC": 0.4982,
          "cvCalibratedRmseC": 0.7264
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.817733,
          "ecmwfAifs": 0.02,
          "icon": 0.036017,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.04625,
          "jma": 0.02
        },
        "intercept": -0.0538,
        "betaDrivers": [
          -0.132,
          -0.2105,
          0.2268,
          0.0279,
          0.0782,
          -0.0803
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.307,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241819,
            "ecmwfAifs": 0.076022,
            "icon": 0.228381,
            "ukmo": 0.120726,
            "meteofrance": 0.155308,
            "gfs": 0.066674,
            "gem": 0.05655,
            "jma": 0.05452
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8777,
          "logisticSlope": 4.2239,
          "wetFractionWeight": 3.6723,
          "powerEta": 0.68,
          "rawBrier": 0.01691,
          "calibratedBrier": 0.0145
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3874,
          "rawIfsRmseC": 0.6358,
          "rawEqualMaeC": 0.8121,
          "rawEqualRmseC": 1.0367,
          "cvSimplexMaeC": 0.3992,
          "cvCalibratedMaeC": 0.3511,
          "cvCalibratedRmseC": 0.588
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.817877,
          "ecmwfAifs": 0.02,
          "icon": 0.040908,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.028268,
          "gem": 0.032947,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0757,
          -0.1032,
          0.0677,
          -0.0016,
          0.0372,
          -0.0496
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.3054,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319296,
            "ecmwfAifs": 0.209409,
            "icon": 0.145576,
            "ukmo": 0.111625,
            "meteofrance": 0.045156,
            "gfs": 0.066785,
            "gem": 0.056644,
            "jma": 0.045509
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9343,
          "logisticSlope": 3.8927,
          "wetFractionWeight": 3.7108,
          "powerEta": 0.68,
          "rawBrier": 0.01691,
          "calibratedBrier": 0.01414
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.3874,
          "rawIfsRmseC": 0.6358,
          "rawEqualMaeC": 0.8121,
          "rawEqualRmseC": 1.0367,
          "cvSimplexMaeC": 0.4002,
          "cvCalibratedMaeC": 0.3639,
          "cvCalibratedRmseC": 0.5941
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.76867,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.11133,
          "jma": 0.02
        },
        "intercept": -0.031,
        "betaDrivers": [
          -0.0206,
          -0.2598,
          0.1086,
          -0.1033,
          0.0156,
          -0.13
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2573,
        "spreadScale": 0.0711,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235326,
            "ecmwfAifs": 0.074467,
            "icon": 0.224105,
            "ukmo": 0.119202,
            "meteofrance": 0.163702,
            "gfs": 0.069557,
            "gem": 0.056291,
            "jma": 0.05735
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7166,
          "logisticSlope": 4.9411,
          "wetFractionWeight": 3.1255,
          "powerEta": 0.68,
          "rawBrier": 0.02022,
          "calibratedBrier": 0.0184
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4864,
          "rawIfsRmseC": 0.6795,
          "rawEqualMaeC": 0.8975,
          "rawEqualRmseC": 1.1117,
          "cvSimplexMaeC": 0.4643,
          "cvCalibratedMaeC": 0.4262,
          "cvCalibratedRmseC": 0.5985
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.724454,
          "ecmwfAifs": 0.032072,
          "icon": 0.051287,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.112187,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.0021,
          -0.1411,
          0.0357,
          -0.0446,
          0.0063,
          -0.1003
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2589,
        "spreadScale": 0.085,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314628,
            "ecmwfAifs": 0.207707,
            "icon": 0.144647,
            "ukmo": 0.111603,
            "meteofrance": 0.045297,
            "gfs": 0.07055,
            "gem": 0.057094,
            "jma": 0.048474
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8319,
          "logisticSlope": 4.8137,
          "wetFractionWeight": 3.1473,
          "powerEta": 0.68,
          "rawBrier": 0.02022,
          "calibratedBrier": 0.0181
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.4864,
          "rawIfsRmseC": 0.6795,
          "rawEqualMaeC": 0.8975,
          "rawEqualRmseC": 1.1117,
          "cvSimplexMaeC": 0.4809,
          "cvCalibratedMaeC": 0.4423,
          "cvCalibratedRmseC": 0.616
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.788131,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.091869,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0629,
          -0.1938,
          0,
          0
        ],
        "driverBetasC": [
          -0.1712,
          -0.2145,
          -0.2046,
          0.062
        ],
        "spreadBaseC2": 0.2939,
        "spreadScale": 0.0903,
        "cvMaeC": 0.4531,
        "cvRmseC": 0.6447,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.808319,
          "ecmwfAifs": 0.024578,
          "icon": 0.02,
          "ukmo": 0.021633,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.06547,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0665,
          -0.1533,
          0,
          0
        ],
        "driverBetasC": [
          -0.1449,
          -0.1436,
          -0.1553,
          0.0643
        ],
        "spreadBaseC2": 0.3168,
        "spreadScale": 0.0826,
        "cvMaeC": 0.4598,
        "cvRmseC": 0.6542,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.828505,
          "ecmwfAifs": 0.029157,
          "icon": 0.02,
          "ukmo": 0.023267,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.039071,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.07,
          -0.1129,
          0,
          0
        ],
        "driverBetasC": [
          -0.1186,
          -0.0727,
          -0.106,
          0.0666
        ],
        "spreadBaseC2": 0.3397,
        "spreadScale": 0.0748,
        "cvMaeC": 0.4665,
        "cvRmseC": 0.6637,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.831708,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.048292,
          "jma": 0.02
        },
        "interceptC": -0.174,
        "diurnalHarmonicsC": [
          -0.1709,
          -0.2943,
          0,
          0
        ],
        "driverBetasC": [
          0.0686,
          0.0785,
          -0.0306,
          0.1541
        ],
        "spreadBaseC2": 0.3795,
        "spreadScale": 0.0979,
        "cvMaeC": 0.4919,
        "cvRmseC": 0.7188,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.833415,
          "ecmwfAifs": 0.021968,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.044617,
          "jma": 0.02
        },
        "interceptC": -0.1683,
        "diurnalHarmonicsC": [
          -0.133,
          -0.2239,
          0,
          0
        ],
        "driverBetasC": [
          0.0366,
          0.0528,
          -0.0254,
          0.1145
        ],
        "spreadBaseC2": 0.3812,
        "spreadScale": 0.1006,
        "cvMaeC": 0.495,
        "cvRmseC": 0.7226,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.835124,
          "ecmwfAifs": 0.023935,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.040941,
          "jma": 0.02
        },
        "interceptC": -0.1625,
        "diurnalHarmonicsC": [
          -0.0951,
          -0.1536,
          0,
          0
        ],
        "driverBetasC": [
          0.0047,
          0.0271,
          -0.0202,
          0.0749
        ],
        "spreadBaseC2": 0.383,
        "spreadScale": 0.1032,
        "cvMaeC": 0.4982,
        "cvRmseC": 0.7264,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.817733,
          "ecmwfAifs": 0.02,
          "icon": 0.036017,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.04625,
          "jma": 0.02
        },
        "interceptC": -0.0538,
        "diurnalHarmonicsC": [
          -0.132,
          -0.2105,
          0,
          0
        ],
        "driverBetasC": [
          0.2268,
          -0.0803,
          0.0279,
          0.0782
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.307,
        "cvMaeC": 0.3511,
        "cvRmseC": 0.588,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.817805,
          "ecmwfAifs": 0.02,
          "icon": 0.038463,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.024134,
          "gem": 0.039598,
          "jma": 0.02
        },
        "interceptC": -0.0269,
        "diurnalHarmonicsC": [
          -0.1038,
          -0.1568,
          0,
          0
        ],
        "driverBetasC": [
          0.1472,
          -0.0649,
          0.0132,
          0.0577
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.3062,
        "cvMaeC": 0.3575,
        "cvRmseC": 0.591,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.817877,
          "ecmwfAifs": 0.02,
          "icon": 0.040908,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.028268,
          "gem": 0.032947,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0757,
          -0.1032,
          0,
          0
        ],
        "driverBetasC": [
          0.0677,
          -0.0496,
          -0.0016,
          0.0372
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.3054,
        "cvMaeC": 0.3639,
        "cvRmseC": 0.5941,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.76867,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.11133,
          "jma": 0.02
        },
        "interceptC": -0.031,
        "diurnalHarmonicsC": [
          -0.0206,
          -0.2598,
          0,
          0
        ],
        "driverBetasC": [
          0.1086,
          -0.13,
          -0.1033,
          0.0156
        ],
        "spreadBaseC2": 0.2573,
        "spreadScale": 0.0711,
        "cvMaeC": 0.4262,
        "cvRmseC": 0.5985,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.746561,
          "ecmwfAifs": 0.026036,
          "icon": 0.035644,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.111759,
          "jma": 0.02
        },
        "interceptC": -0.0155,
        "diurnalHarmonicsC": [
          -0.0092,
          -0.2004,
          0,
          0
        ],
        "driverBetasC": [
          0.0722,
          -0.1152,
          -0.074,
          0.0109
        ],
        "spreadBaseC2": 0.2581,
        "spreadScale": 0.0781,
        "cvMaeC": 0.4343,
        "cvRmseC": 0.6073,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.724454,
          "ecmwfAifs": 0.032072,
          "icon": 0.051287,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.112187,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0021,
          -0.1411,
          0,
          0
        ],
        "driverBetasC": [
          0.0357,
          -0.1003,
          -0.0446,
          0.0063
        ],
        "spreadBaseC2": 0.2589,
        "spreadScale": 0.085,
        "cvMaeC": 0.4423,
        "cvRmseC": 0.616,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.261307,
        "ecmwfAifs": 0.080531,
        "icon": 0.207318,
        "ukmo": 0.116172,
        "meteofrance": 0.158911,
        "gfs": 0.064948,
        "gem": 0.055079,
        "jma": 0.055734
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.258156,
        "ecmwfAifs": 0.074985,
        "icon": 0.218346,
        "ukmo": 0.120084,
        "meteofrance": 0.151796,
        "gfs": 0.064228,
        "gem": 0.055315,
        "jma": 0.05709
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.241819,
        "ecmwfAifs": 0.076022,
        "icon": 0.228381,
        "ukmo": 0.120726,
        "meteofrance": 0.155308,
        "gfs": 0.066674,
        "gem": 0.05655,
        "jma": 0.05452
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.235326,
        "ecmwfAifs": 0.074467,
        "icon": 0.224105,
        "ukmo": 0.119202,
        "meteofrance": 0.163702,
        "gfs": 0.069557,
        "gem": 0.056291,
        "jma": 0.05735
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.281198,
    "ecmwfAifs": 0.06873,
    "icon": 0.183562,
    "ukmo": 0.191145,
    "meteofrance": 0.106913,
    "gfs": 0.092086,
    "gem": 0.038183,
    "jma": 0.038183
  },
  "pressureWeights": {
    "ecmwfIfs": 0.552109,
    "ecmwfAifs": 0.096197,
    "icon": 0.126864,
    "ukmo": 0.090633,
    "meteofrance": 0.05063,
    "gfs": 0.032937,
    "gem": 0.025315,
    "jma": 0.025315
  }
} as const;

export default PROVINCE_CALIBRATION_TR_43;
