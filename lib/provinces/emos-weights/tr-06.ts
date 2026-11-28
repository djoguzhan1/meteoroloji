import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_06: ProvinceCalibrationBundle = {
  "provinceCode": "TR-06",
  "provinceName": "Ankara",
  "plateNumber": 6,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17130",
  "stationLat": 39.95,
  "stationLon": 32.8833,
  "stationElevationM": 891,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.825041,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02228,
          "gfs": 0.02,
          "gem": 0.052679,
          "jma": 0.02
        },
        "intercept": -0.2447,
        "betaDrivers": [
          -0.0931,
          -0.206,
          -0.0262,
          -0.0746,
          -0.1566,
          -0.1989
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4469,
        "spreadScale": 0.078,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241165,
            "ecmwfAifs": 0.084294,
            "icon": 0.215422,
            "ukmo": 0.117751,
            "meteofrance": 0.15683,
            "gfs": 0.069503,
            "gem": 0.055472,
            "jma": 0.059563
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0883,
          "logisticSlope": 4.8405,
          "wetFractionWeight": 2.9799,
          "powerEta": 0.68,
          "rawBrier": 0.0397,
          "calibratedBrier": 0.0397
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6021,
          "rawIfsRmseC": 0.842,
          "rawEqualMaeC": 1.0519,
          "rawEqualRmseC": 1.3393,
          "cvSimplexMaeC": 0.6097,
          "cvCalibratedMaeC": 0.5254,
          "cvCalibratedRmseC": 0.7417
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.822936,
          "ecmwfAifs": 0.030961,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.028284,
          "gfs": 0.02,
          "gem": 0.037819,
          "jma": 0.02
        },
        "intercept": -0.2446,
        "betaDrivers": [
          -0.0543,
          -0.122,
          -0.0257,
          -0.0314,
          -0.0561,
          -0.1045
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4604,
        "spreadScale": 0.0753,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.312907,
            "ecmwfAifs": 0.228168,
            "icon": 0.134933,
            "ukmo": 0.106985,
            "meteofrance": 0.045139,
            "gfs": 0.068411,
            "gem": 0.054601,
            "jma": 0.048856
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1388,
          "logisticSlope": 4.9102,
          "wetFractionWeight": 2.8107,
          "powerEta": 0.68,
          "rawBrier": 0.0397,
          "calibratedBrier": 0.0396
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6021,
          "rawIfsRmseC": 0.842,
          "rawEqualMaeC": 1.0519,
          "rawEqualRmseC": 1.3393,
          "cvSimplexMaeC": 0.612,
          "cvCalibratedMaeC": 0.5289,
          "cvCalibratedRmseC": 0.7484
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.772748,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.107252,
          "jma": 0.02
        },
        "intercept": -0.2811,
        "betaDrivers": [
          -0.1042,
          -0.2934,
          -0.0862,
          0.1625,
          0.0255,
          0.0129
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4467,
        "spreadScale": 0.1772,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.261913,
            "ecmwfAifs": 0.075641,
            "icon": 0.223247,
            "ukmo": 0.112777,
            "meteofrance": 0.149146,
            "gfs": 0.06504,
            "gem": 0.05751,
            "jma": 0.054726
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8721,
          "logisticSlope": 3.0918,
          "wetFractionWeight": 3.3847,
          "powerEta": 0.68,
          "rawBrier": 0.05903,
          "calibratedBrier": 0.0503
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6462,
          "rawIfsRmseC": 0.9475,
          "rawEqualMaeC": 1.0873,
          "rawEqualRmseC": 1.3812,
          "cvSimplexMaeC": 0.6514,
          "cvCalibratedMaeC": 0.5616,
          "cvCalibratedRmseC": 0.8427
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.81238,
          "ecmwfAifs": 0.038812,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.048808,
          "jma": 0.02
        },
        "intercept": -0.2866,
        "betaDrivers": [
          -0.0683,
          -0.1758,
          -0.0493,
          0.0611,
          0.0292,
          0.0052
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4514,
        "spreadScale": 0.1835,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.340744,
            "ecmwfAifs": 0.205298,
            "icon": 0.140212,
            "ukmo": 0.102743,
            "meteofrance": 0.045043,
            "gfs": 0.064191,
            "gem": 0.05676,
            "jma": 0.045009
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.972,
          "logisticSlope": 3.6918,
          "wetFractionWeight": 2.9478,
          "powerEta": 0.68,
          "rawBrier": 0.05903,
          "calibratedBrier": 0.04928
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.6462,
          "rawIfsRmseC": 0.9475,
          "rawEqualMaeC": 1.0873,
          "rawEqualRmseC": 1.3812,
          "cvSimplexMaeC": 0.6562,
          "cvCalibratedMaeC": 0.568,
          "cvCalibratedRmseC": 0.8497
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.710391,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.050347,
          "gem": 0.139262,
          "jma": 0.02
        },
        "intercept": -0.2067,
        "betaDrivers": [
          -0.0232,
          -0.1339,
          0.0021,
          0.0581,
          -0.0912,
          -0.2905
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1495,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236468,
            "ecmwfAifs": 0.079248,
            "icon": 0.223399,
            "ukmo": 0.126449,
            "meteofrance": 0.16384,
            "gfs": 0.064222,
            "gem": 0.05469,
            "jma": 0.051684
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8806,
          "logisticSlope": 3.4408,
          "wetFractionWeight": 3.5767,
          "powerEta": 0.68,
          "rawBrier": 0.01575,
          "calibratedBrier": 0.01346
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4912,
          "rawIfsRmseC": 0.7416,
          "rawEqualMaeC": 0.8348,
          "rawEqualRmseC": 1.0238,
          "cvSimplexMaeC": 0.4268,
          "cvCalibratedMaeC": 0.3769,
          "cvCalibratedRmseC": 0.6206
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.665909,
          "ecmwfAifs": 0.050819,
          "icon": 0.030121,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.065472,
          "gem": 0.127679,
          "jma": 0.02
        },
        "intercept": -0.1024,
        "betaDrivers": [
          -0.0365,
          -0.0889,
          0.0097,
          0.022,
          -0.0317,
          -0.17
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.1732,
        "spreadScale": 0.1367,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313088,
            "ecmwfAifs": 0.2189,
            "icon": 0.142794,
            "ukmo": 0.11724,
            "meteofrance": 0.045277,
            "gfs": 0.064507,
            "gem": 0.054933,
            "jma": 0.043261
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9266,
          "logisticSlope": 3.1521,
          "wetFractionWeight": 3.6913,
          "powerEta": 0.68,
          "rawBrier": 0.01575,
          "calibratedBrier": 0.01341
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4912,
          "rawIfsRmseC": 0.7416,
          "rawEqualMaeC": 0.8348,
          "rawEqualRmseC": 1.0238,
          "cvSimplexMaeC": 0.443,
          "cvCalibratedMaeC": 0.3917,
          "cvCalibratedRmseC": 0.6262
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.707732,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.172268,
          "jma": 0.02
        },
        "intercept": -0.1433,
        "betaDrivers": [
          -0.007,
          -0.2104,
          0.0694,
          -0.0714,
          0.0711,
          -0.1439
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3765,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24164,
            "ecmwfAifs": 0.078747,
            "icon": 0.220599,
            "ukmo": 0.117893,
            "meteofrance": 0.163208,
            "gfs": 0.066758,
            "gem": 0.054508,
            "jma": 0.056647
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5759,
          "logisticSlope": 4.4424,
          "wetFractionWeight": 3.7501,
          "powerEta": 0.68,
          "rawBrier": 0.02282,
          "calibratedBrier": 0.02269
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5364,
          "rawIfsRmseC": 0.7504,
          "rawEqualMaeC": 1.0247,
          "rawEqualRmseC": 1.2476,
          "cvSimplexMaeC": 0.5213,
          "cvCalibratedMaeC": 0.4763,
          "cvCalibratedRmseC": 0.6752
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.687759,
          "ecmwfAifs": 0.0433,
          "icon": 0.024967,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.163974,
          "jma": 0.02
        },
        "intercept": -0.1322,
        "betaDrivers": [
          -0.0067,
          -0.1484,
          0.0229,
          -0.0282,
          0.0396,
          -0.1129
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.389,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319189,
            "ecmwfAifs": 0.217004,
            "icon": 0.140673,
            "ukmo": 0.10905,
            "meteofrance": 0.045263,
            "gfs": 0.066896,
            "gem": 0.054621,
            "jma": 0.047304
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6518,
          "logisticSlope": 4.3413,
          "wetFractionWeight": 3.6393,
          "powerEta": 0.68,
          "rawBrier": 0.02282,
          "calibratedBrier": 0.02247
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5364,
          "rawIfsRmseC": 0.7504,
          "rawEqualMaeC": 1.0247,
          "rawEqualRmseC": 1.2476,
          "cvSimplexMaeC": 0.5304,
          "cvCalibratedMaeC": 0.4846,
          "cvCalibratedRmseC": 0.6845
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.825041,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02228,
          "gfs": 0.02,
          "gem": 0.052679,
          "jma": 0.02
        },
        "interceptC": -0.2447,
        "diurnalHarmonicsC": [
          -0.0931,
          -0.206,
          0,
          0
        ],
        "driverBetasC": [
          -0.0262,
          -0.1989,
          -0.0746,
          -0.1566
        ],
        "spreadBaseC2": 0.4469,
        "spreadScale": 0.078,
        "cvMaeC": 0.5254,
        "cvRmseC": 0.7417,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.823988,
          "ecmwfAifs": 0.025481,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.025282,
          "gfs": 0.02,
          "gem": 0.045249,
          "jma": 0.02
        },
        "interceptC": -0.2447,
        "diurnalHarmonicsC": [
          -0.0737,
          -0.164,
          0,
          0
        ],
        "driverBetasC": [
          -0.026,
          -0.1517,
          -0.053,
          -0.1064
        ],
        "spreadBaseC2": 0.4536,
        "spreadScale": 0.0766,
        "cvMaeC": 0.5272,
        "cvRmseC": 0.745,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.822936,
          "ecmwfAifs": 0.030961,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.028284,
          "gfs": 0.02,
          "gem": 0.037819,
          "jma": 0.02
        },
        "interceptC": -0.2446,
        "diurnalHarmonicsC": [
          -0.0543,
          -0.122,
          0,
          0
        ],
        "driverBetasC": [
          -0.0257,
          -0.1045,
          -0.0314,
          -0.0561
        ],
        "spreadBaseC2": 0.4604,
        "spreadScale": 0.0753,
        "cvMaeC": 0.5289,
        "cvRmseC": 0.7484,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.772748,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.107252,
          "jma": 0.02
        },
        "interceptC": -0.2811,
        "diurnalHarmonicsC": [
          -0.1042,
          -0.2934,
          0,
          0
        ],
        "driverBetasC": [
          -0.0862,
          0.0129,
          0.1625,
          0.0255
        ],
        "spreadBaseC2": 0.4467,
        "spreadScale": 0.1772,
        "cvMaeC": 0.5616,
        "cvRmseC": 0.8427,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.792564,
          "ecmwfAifs": 0.029406,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.07803,
          "jma": 0.02
        },
        "interceptC": -0.2839,
        "diurnalHarmonicsC": [
          -0.0862,
          -0.2346,
          0,
          0
        ],
        "driverBetasC": [
          -0.0678,
          0.009,
          0.1118,
          0.0273
        ],
        "spreadBaseC2": 0.4491,
        "spreadScale": 0.1804,
        "cvMaeC": 0.5648,
        "cvRmseC": 0.8462,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.81238,
          "ecmwfAifs": 0.038812,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.048808,
          "jma": 0.02
        },
        "interceptC": -0.2866,
        "diurnalHarmonicsC": [
          -0.0683,
          -0.1758,
          0,
          0
        ],
        "driverBetasC": [
          -0.0493,
          0.0052,
          0.0611,
          0.0292
        ],
        "spreadBaseC2": 0.4514,
        "spreadScale": 0.1835,
        "cvMaeC": 0.568,
        "cvRmseC": 0.8497,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.710391,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.050347,
          "gem": 0.139262,
          "jma": 0.02
        },
        "interceptC": -0.2067,
        "diurnalHarmonicsC": [
          -0.0232,
          -0.1339,
          0,
          0
        ],
        "driverBetasC": [
          0.0021,
          -0.2905,
          0.0581,
          -0.0912
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1495,
        "cvMaeC": 0.3769,
        "cvRmseC": 0.6206,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.688151,
          "ecmwfAifs": 0.035409,
          "icon": 0.02506,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.057909,
          "gem": 0.133471,
          "jma": 0.02
        },
        "interceptC": -0.1545,
        "diurnalHarmonicsC": [
          -0.0298,
          -0.1114,
          0,
          0
        ],
        "driverBetasC": [
          0.0059,
          -0.2303,
          0.0401,
          -0.0615
        ],
        "spreadBaseC2": 0.1616,
        "spreadScale": 0.1431,
        "cvMaeC": 0.3843,
        "cvRmseC": 0.6234,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.665909,
          "ecmwfAifs": 0.050819,
          "icon": 0.030121,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.065472,
          "gem": 0.127679,
          "jma": 0.02
        },
        "interceptC": -0.1024,
        "diurnalHarmonicsC": [
          -0.0365,
          -0.0889,
          0,
          0
        ],
        "driverBetasC": [
          0.0097,
          -0.17,
          0.022,
          -0.0317
        ],
        "spreadBaseC2": 0.1732,
        "spreadScale": 0.1367,
        "cvMaeC": 0.3917,
        "cvRmseC": 0.6262,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.707732,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.172268,
          "jma": 0.02
        },
        "interceptC": -0.1433,
        "diurnalHarmonicsC": [
          -0.007,
          -0.2104,
          0,
          0
        ],
        "driverBetasC": [
          0.0694,
          -0.1439,
          -0.0714,
          0.0711
        ],
        "spreadBaseC2": 0.3765,
        "spreadScale": 0.05,
        "cvMaeC": 0.4763,
        "cvRmseC": 0.6752,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.697746,
          "ecmwfAifs": 0.03165,
          "icon": 0.022483,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.168121,
          "jma": 0.02
        },
        "interceptC": -0.1378,
        "diurnalHarmonicsC": [
          -0.0069,
          -0.1794,
          0,
          0
        ],
        "driverBetasC": [
          0.0462,
          -0.1284,
          -0.0498,
          0.0553
        ],
        "spreadBaseC2": 0.3828,
        "spreadScale": 0.05,
        "cvMaeC": 0.4804,
        "cvRmseC": 0.6799,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.687759,
          "ecmwfAifs": 0.0433,
          "icon": 0.024967,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.163974,
          "jma": 0.02
        },
        "interceptC": -0.1322,
        "diurnalHarmonicsC": [
          -0.0067,
          -0.1484,
          0,
          0
        ],
        "driverBetasC": [
          0.0229,
          -0.1129,
          -0.0282,
          0.0396
        ],
        "spreadBaseC2": 0.389,
        "spreadScale": 0.05,
        "cvMaeC": 0.4846,
        "cvRmseC": 0.6845,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.241165,
        "ecmwfAifs": 0.084294,
        "icon": 0.215422,
        "ukmo": 0.117751,
        "meteofrance": 0.15683,
        "gfs": 0.069503,
        "gem": 0.055472,
        "jma": 0.059563
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.261913,
        "ecmwfAifs": 0.075641,
        "icon": 0.223247,
        "ukmo": 0.112777,
        "meteofrance": 0.149146,
        "gfs": 0.06504,
        "gem": 0.05751,
        "jma": 0.054726
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.236468,
        "ecmwfAifs": 0.079248,
        "icon": 0.223399,
        "ukmo": 0.126449,
        "meteofrance": 0.16384,
        "gfs": 0.064222,
        "gem": 0.05469,
        "jma": 0.051684
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.24164,
        "ecmwfAifs": 0.078747,
        "icon": 0.220599,
        "ukmo": 0.117893,
        "meteofrance": 0.163208,
        "gfs": 0.066758,
        "gem": 0.054508,
        "jma": 0.056647
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.270938,
    "ecmwfAifs": 0.068102,
    "icon": 0.235159,
    "ukmo": 0.157501,
    "meteofrance": 0.105937,
    "gfs": 0.086693,
    "gem": 0.037835,
    "jma": 0.037835
  },
  "pressureWeights": {
    "ecmwfIfs": 0.562319,
    "ecmwfAifs": 0.095499,
    "icon": 0.084798,
    "ukmo": 0.119126,
    "meteofrance": 0.050263,
    "gfs": 0.037733,
    "gem": 0.025131,
    "jma": 0.025131
  }
} as const;

export default PROVINCE_CALIBRATION_TR_06;
