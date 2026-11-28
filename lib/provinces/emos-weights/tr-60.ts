import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_60: ProvinceCalibrationBundle = {
  "provinceCode": "TR-60",
  "provinceName": "Tokat",
  "plateNumber": 60,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17086",
  "stationLat": 40.3,
  "stationLon": 36.5667,
  "stationElevationM": 608,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17385,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.052034,
          "ecmwfAifs": 0.534958,
          "icon": 0.241887,
          "ukmo": 0.080633,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.030488,
          "jma": 0.02
        },
        "intercept": 0.1751,
        "betaDrivers": [
          -0.2706,
          -0.0502,
          -0.191,
          -0.071,
          0.4732,
          0.231
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.1948,
        "spreadScale": 0.7823,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245957,
            "ecmwfAifs": 0.087164,
            "icon": 0.209827,
            "ukmo": 0.117278,
            "meteofrance": 0.157458,
            "gfs": 0.069024,
            "gem": 0.057828,
            "jma": 0.055464
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2925,
          "logisticSlope": 4.8219,
          "wetFractionWeight": 3.488,
          "powerEta": 0.68,
          "rawBrier": 0.04862,
          "calibratedBrier": 0.04602
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.7684,
          "rawIfsRmseC": 2.4484,
          "rawEqualMaeC": 1.5273,
          "rawEqualRmseC": 1.9643,
          "cvSimplexMaeC": 1.5048,
          "cvCalibratedMaeC": 1.4903,
          "cvCalibratedRmseC": 1.968
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.179876,
          "ecmwfAifs": 0.421047,
          "icon": 0.189043,
          "ukmo": 0.074955,
          "meteofrance": 0.035792,
          "gfs": 0.02,
          "gem": 0.056255,
          "jma": 0.023032
        },
        "intercept": 0.0857,
        "betaDrivers": [
          -0.1991,
          0.0051,
          -0.0854,
          -0.0244,
          0.1824,
          0.1516
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.3093,
        "spreadScale": 0.6814,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.316299,
            "ecmwfAifs": 0.233848,
            "icon": 0.130265,
            "ukmo": 0.105613,
            "meteofrance": 0.045129,
            "gfs": 0.067339,
            "gem": 0.056415,
            "jma": 0.045092
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3347,
          "logisticSlope": 4.8992,
          "wetFractionWeight": 3.4312,
          "powerEta": 0.68,
          "rawBrier": 0.04862,
          "calibratedBrier": 0.04457
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.7684,
          "rawIfsRmseC": 2.4484,
          "rawEqualMaeC": 1.5273,
          "rawEqualRmseC": 1.9643,
          "cvSimplexMaeC": 1.4844,
          "cvCalibratedMaeC": 1.478,
          "cvCalibratedRmseC": 1.9379
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.307601,
          "ecmwfAifs": 0.127005,
          "icon": 0.226878,
          "ukmo": 0.258516,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1843,
          0.0359,
          0.0233,
          -0.0943,
          0.1296,
          -0.3834
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5184,
        "spreadScale": 1.6127,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244832,
            "ecmwfAifs": 0.0744,
            "icon": 0.229141,
            "ukmo": 0.115334,
            "meteofrance": 0.163636,
            "gfs": 0.063755,
            "gem": 0.05526,
            "jma": 0.053642
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7765,
          "logisticSlope": 2.7239,
          "wetFractionWeight": 3.7435,
          "powerEta": 0.68,
          "rawBrier": 0.0667,
          "calibratedBrier": 0.05898
        },
        "verification": {
          "sampleHours": 4324,
          "rawIfsMaeC": 1.4716,
          "rawIfsRmseC": 2.1196,
          "rawEqualMaeC": 1.3767,
          "rawEqualRmseC": 1.7691,
          "cvSimplexMaeC": 1.3407,
          "cvCalibratedMaeC": 1.3064,
          "cvCalibratedRmseC": 1.7678
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.301687,
          "ecmwfAifs": 0.249587,
          "icon": 0.178657,
          "ukmo": 0.190069,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1565,
          -0.0079,
          0.0193,
          -0.0135,
          0.0624,
          -0.2256
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6289,
        "spreadScale": 1.4408,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.326628,
            "ecmwfAifs": 0.207068,
            "icon": 0.147576,
            "ukmo": 0.107746,
            "meteofrance": 0.045291,
            "gfs": 0.064524,
            "gem": 0.055926,
            "jma": 0.045241
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8754,
          "logisticSlope": 3.1866,
          "wetFractionWeight": 3.537,
          "powerEta": 0.68,
          "rawBrier": 0.0667,
          "calibratedBrier": 0.05868
        },
        "verification": {
          "sampleHours": 4324,
          "rawIfsMaeC": 1.4716,
          "rawIfsRmseC": 2.1196,
          "rawEqualMaeC": 1.3767,
          "rawEqualRmseC": 1.7691,
          "cvSimplexMaeC": 1.3104,
          "cvCalibratedMaeC": 1.278,
          "cvCalibratedRmseC": 1.7083
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.479612,
          "ecmwfAifs": 0.145289,
          "icon": 0.164786,
          "ukmo": 0.114092,
          "meteofrance": 0.029163,
          "gfs": 0.02,
          "gem": 0.027058,
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
        "spreadBaseC2": 1.1828,
        "spreadScale": 0.2155,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242277,
            "ecmwfAifs": 0.082702,
            "icon": 0.220264,
            "ukmo": 0.119678,
            "meteofrance": 0.156349,
            "gfs": 0.066316,
            "gem": 0.058826,
            "jma": 0.053588
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3457,
          "logisticSlope": 4.3584,
          "wetFractionWeight": 4.0889,
          "powerEta": 0.68,
          "rawBrier": 0.02755,
          "calibratedBrier": 0.02625
        },
        "verification": {
          "sampleHours": 4379,
          "rawIfsMaeC": 1.0036,
          "rawIfsRmseC": 1.423,
          "rawEqualMaeC": 1.0077,
          "rawEqualRmseC": 1.3307,
          "cvSimplexMaeC": 0.9093,
          "cvCalibratedMaeC": 0.9093,
          "cvCalibratedRmseC": 1.2525
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.388412,
          "ecmwfAifs": 0.228743,
          "icon": 0.143668,
          "ukmo": 0.122946,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.056231,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0645,
          -0.0243,
          0.0051,
          -0.0587,
          0.0448,
          -0.0009
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1719,
        "spreadScale": 0.2052,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315278,
            "ecmwfAifs": 0.224521,
            "icon": 0.138375,
            "ukmo": 0.109059,
            "meteofrance": 0.045139,
            "gfs": 0.065468,
            "gem": 0.058074,
            "jma": 0.044086
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5511,
          "logisticSlope": 3.8001,
          "wetFractionWeight": 4.264,
          "powerEta": 0.68,
          "rawBrier": 0.02755,
          "calibratedBrier": 0.02438
        },
        "verification": {
          "sampleHours": 4379,
          "rawIfsMaeC": 1.0036,
          "rawIfsRmseC": 1.423,
          "rawEqualMaeC": 1.0077,
          "rawEqualRmseC": 1.3307,
          "cvSimplexMaeC": 0.9115,
          "cvCalibratedMaeC": 0.91,
          "cvCalibratedRmseC": 1.2407
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.332236,
          "ecmwfAifs": 0.321214,
          "icon": 0.02,
          "ukmo": 0.149878,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.116672,
          "jma": 0.02
        },
        "intercept": -0.1424,
        "betaDrivers": [
          -0.088,
          0.0818,
          0.0014,
          -0.1746,
          0.3482,
          0.0429
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6826,
        "spreadScale": 1.6078,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.24125,
            "ecmwfAifs": 0.07769,
            "icon": 0.222372,
            "ukmo": 0.120315,
            "meteofrance": 0.161123,
            "gfs": 0.066788,
            "gem": 0.055435,
            "jma": 0.055027
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5549,
          "logisticSlope": 3.8764,
          "wetFractionWeight": 4.3382,
          "powerEta": 0.68,
          "rawBrier": 0.03088,
          "calibratedBrier": 0.02846
        },
        "verification": {
          "sampleHours": 4338,
          "rawIfsMaeC": 1.4307,
          "rawIfsRmseC": 2.1139,
          "rawEqualMaeC": 1.5031,
          "rawEqualRmseC": 2.0086,
          "cvSimplexMaeC": 1.3948,
          "cvCalibratedMaeC": 1.3773,
          "cvCalibratedRmseC": 1.9514
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.324031,
          "ecmwfAifs": 0.341296,
          "icon": 0.064094,
          "ukmo": 0.122969,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.08761,
          "jma": 0.02
        },
        "intercept": -0.2099,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7986,
        "spreadScale": 1.4458,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318833,
            "ecmwfAifs": 0.214198,
            "icon": 0.141874,
            "ukmo": 0.111346,
            "meteofrance": 0.045236,
            "gfs": 0.066961,
            "gem": 0.055578,
            "jma": 0.045974
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7181,
          "logisticSlope": 4.0447,
          "wetFractionWeight": 4.2003,
          "powerEta": 0.68,
          "rawBrier": 0.03088,
          "calibratedBrier": 0.0277
        },
        "verification": {
          "sampleHours": 4338,
          "rawIfsMaeC": 1.4307,
          "rawIfsRmseC": 2.1139,
          "rawEqualMaeC": 1.5031,
          "rawEqualRmseC": 2.0086,
          "cvSimplexMaeC": 1.3461,
          "cvCalibratedMaeC": 1.3291,
          "cvCalibratedRmseC": 1.8733
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.052034,
          "ecmwfAifs": 0.534958,
          "icon": 0.241887,
          "ukmo": 0.080633,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.030488,
          "jma": 0.02
        },
        "interceptC": 0.1751,
        "diurnalHarmonicsC": [
          -0.2706,
          -0.0502,
          0,
          0
        ],
        "driverBetasC": [
          -0.191,
          0.231,
          -0.071,
          0.4732
        ],
        "spreadBaseC2": 2.1948,
        "spreadScale": 0.7823,
        "cvMaeC": 1.4903,
        "cvRmseC": 1.968,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.115955,
          "ecmwfAifs": 0.478002,
          "icon": 0.215465,
          "ukmo": 0.077794,
          "meteofrance": 0.027896,
          "gfs": 0.02,
          "gem": 0.043372,
          "jma": 0.021516
        },
        "interceptC": 0.1304,
        "diurnalHarmonicsC": [
          -0.2349,
          -0.0226,
          0,
          0
        ],
        "driverBetasC": [
          -0.1382,
          0.1913,
          -0.0477,
          0.3278
        ],
        "spreadBaseC2": 2.252,
        "spreadScale": 0.7319,
        "cvMaeC": 1.4842,
        "cvRmseC": 1.9529,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.179876,
          "ecmwfAifs": 0.421047,
          "icon": 0.189043,
          "ukmo": 0.074955,
          "meteofrance": 0.035792,
          "gfs": 0.02,
          "gem": 0.056255,
          "jma": 0.023032
        },
        "interceptC": 0.0857,
        "diurnalHarmonicsC": [
          -0.1991,
          0.0051,
          0,
          0
        ],
        "driverBetasC": [
          -0.0854,
          0.1516,
          -0.0244,
          0.1824
        ],
        "spreadBaseC2": 2.3093,
        "spreadScale": 0.6814,
        "cvMaeC": 1.478,
        "cvRmseC": 1.9379,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.307601,
          "ecmwfAifs": 0.127005,
          "icon": 0.226878,
          "ukmo": 0.258516,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1843,
          0.0359,
          0,
          0
        ],
        "driverBetasC": [
          0.0233,
          -0.3834,
          -0.0943,
          0.1296
        ],
        "spreadBaseC2": 0.5184,
        "spreadScale": 1.6127,
        "cvMaeC": 1.3064,
        "cvRmseC": 1.7678,
        "sampleHours": 4324
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.304643,
          "ecmwfAifs": 0.188296,
          "icon": 0.202768,
          "ukmo": 0.224293,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1704,
          0.014,
          0,
          0
        ],
        "driverBetasC": [
          0.0213,
          -0.3045,
          -0.0539,
          0.096
        ],
        "spreadBaseC2": 0.5736,
        "spreadScale": 1.5268,
        "cvMaeC": 1.2922,
        "cvRmseC": 1.738,
        "sampleHours": 4324
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.301687,
          "ecmwfAifs": 0.249587,
          "icon": 0.178657,
          "ukmo": 0.190069,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1565,
          -0.0079,
          0,
          0
        ],
        "driverBetasC": [
          0.0193,
          -0.2256,
          -0.0135,
          0.0624
        ],
        "spreadBaseC2": 0.6289,
        "spreadScale": 1.4408,
        "cvMaeC": 1.278,
        "cvRmseC": 1.7083,
        "sampleHours": 4324
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.479612,
          "ecmwfAifs": 0.145289,
          "icon": 0.164786,
          "ukmo": 0.114092,
          "meteofrance": 0.029163,
          "gfs": 0.02,
          "gem": 0.027058,
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
        "spreadBaseC2": 1.1828,
        "spreadScale": 0.2155,
        "cvMaeC": 0.9093,
        "cvRmseC": 1.2525,
        "sampleHours": 4379
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.434011,
          "ecmwfAifs": 0.187016,
          "icon": 0.154227,
          "ukmo": 0.118519,
          "meteofrance": 0.024582,
          "gfs": 0.02,
          "gem": 0.041645,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0323,
          -0.0121,
          0,
          0
        ],
        "driverBetasC": [
          0.0026,
          -0.0004,
          -0.0294,
          0.0224
        ],
        "spreadBaseC2": 1.1774,
        "spreadScale": 0.2103,
        "cvMaeC": 0.9097,
        "cvRmseC": 1.2466,
        "sampleHours": 4379
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.388412,
          "ecmwfAifs": 0.228743,
          "icon": 0.143668,
          "ukmo": 0.122946,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.056231,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0645,
          -0.0243,
          0,
          0
        ],
        "driverBetasC": [
          0.0051,
          -0.0009,
          -0.0587,
          0.0448
        ],
        "spreadBaseC2": 1.1719,
        "spreadScale": 0.2052,
        "cvMaeC": 0.91,
        "cvRmseC": 1.2407,
        "sampleHours": 4379
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.332236,
          "ecmwfAifs": 0.321214,
          "icon": 0.02,
          "ukmo": 0.149878,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.116672,
          "jma": 0.02
        },
        "interceptC": -0.1424,
        "diurnalHarmonicsC": [
          -0.088,
          0.0818,
          0,
          0
        ],
        "driverBetasC": [
          0.0014,
          0.0429,
          -0.1746,
          0.3482
        ],
        "spreadBaseC2": 0.6826,
        "spreadScale": 1.6078,
        "cvMaeC": 1.3773,
        "cvRmseC": 1.9514,
        "sampleHours": 4338
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.328133,
          "ecmwfAifs": 0.331255,
          "icon": 0.042047,
          "ukmo": 0.136424,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.102141,
          "jma": 0.02
        },
        "interceptC": -0.1762,
        "diurnalHarmonicsC": [
          -0.044,
          0.0409,
          0,
          0
        ],
        "driverBetasC": [
          0.0007,
          0.0215,
          -0.0873,
          0.1741
        ],
        "spreadBaseC2": 0.7406,
        "spreadScale": 1.5268,
        "cvMaeC": 1.3532,
        "cvRmseC": 1.9123,
        "sampleHours": 4338
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.324031,
          "ecmwfAifs": 0.341296,
          "icon": 0.064094,
          "ukmo": 0.122969,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.08761,
          "jma": 0.02
        },
        "interceptC": -0.2099,
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
        "spreadBaseC2": 0.7986,
        "spreadScale": 1.4458,
        "cvMaeC": 1.3291,
        "cvRmseC": 1.8733,
        "sampleHours": 4338
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.245957,
        "ecmwfAifs": 0.087164,
        "icon": 0.209827,
        "ukmo": 0.117278,
        "meteofrance": 0.157458,
        "gfs": 0.069024,
        "gem": 0.057828,
        "jma": 0.055464
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.244832,
        "ecmwfAifs": 0.0744,
        "icon": 0.229141,
        "ukmo": 0.115334,
        "meteofrance": 0.163636,
        "gfs": 0.063755,
        "gem": 0.05526,
        "jma": 0.053642
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.242277,
        "ecmwfAifs": 0.082702,
        "icon": 0.220264,
        "ukmo": 0.119678,
        "meteofrance": 0.156349,
        "gfs": 0.066316,
        "gem": 0.058826,
        "jma": 0.053588
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.24125,
        "ecmwfAifs": 0.07769,
        "icon": 0.222372,
        "ukmo": 0.120315,
        "meteofrance": 0.161123,
        "gfs": 0.066788,
        "gem": 0.055435,
        "jma": 0.055027
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.237626,
    "ecmwfAifs": 0.070595,
    "icon": 0.222062,
    "ukmo": 0.179383,
    "meteofrance": 0.109814,
    "gfs": 0.102082,
    "gem": 0.039219,
    "jma": 0.039219
  },
  "pressureWeights": {
    "ecmwfIfs": 0.336655,
    "ecmwfAifs": 0.145492,
    "icon": 0.157109,
    "ukmo": 0.154295,
    "meteofrance": 0.076575,
    "gfs": 0.0533,
    "gem": 0.038287,
    "jma": 0.038287
  }
} as const;

export default PROVINCE_CALIBRATION_TR_60;
