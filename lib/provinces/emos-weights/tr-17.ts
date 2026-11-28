import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_17: ProvinceCalibrationBundle = {
  "provinceCode": "TR-17",
  "provinceName": "Çanakkale",
  "plateNumber": 17,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17112",
  "stationLat": 40.1333,
  "stationLon": 26.4,
  "stationElevationM": 3,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.356492,
          "ukmo": 0.244737,
          "meteofrance": 0.187188,
          "gfs": 0.02,
          "gem": 0.131583,
          "jma": 0.02
        },
        "intercept": 0.2469,
        "betaDrivers": [
          0.1307,
          0.1054,
          -0.134,
          0.0137,
          0.2219,
          -0.2098
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7243,
        "spreadScale": 1.2269,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242206,
            "ecmwfAifs": 0.083706,
            "icon": 0.216217,
            "ukmo": 0.119674,
            "meteofrance": 0.154308,
            "gfs": 0.067595,
            "gem": 0.056719,
            "jma": 0.059575
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.024,
          "logisticSlope": 3.2137,
          "wetFractionWeight": 3.8727,
          "powerEta": 0.68,
          "rawBrier": 0.04155,
          "calibratedBrier": 0.04018
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2535,
          "rawIfsRmseC": 1.6148,
          "rawEqualMaeC": 1.0143,
          "rawEqualRmseC": 1.3147,
          "cvSimplexMaeC": 1.0065,
          "cvCalibratedMaeC": 0.9926,
          "cvCalibratedRmseC": 1.297
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.184536,
          "ecmwfAifs": 0.208688,
          "icon": 0.189505,
          "ukmo": 0.155701,
          "meteofrance": 0.110952,
          "gfs": 0.02,
          "gem": 0.090147,
          "jma": 0.040471
        },
        "intercept": 0.3144,
        "betaDrivers": [
          0.0956,
          0.0923,
          -0.0736,
          0.0161,
          0.1781,
          -0.1235
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5757,
        "spreadScale": 1.4605,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313821,
            "ecmwfAifs": 0.226261,
            "icon": 0.135243,
            "ukmo": 0.108582,
            "meteofrance": 0.045103,
            "gfs": 0.066441,
            "gem": 0.055751,
            "jma": 0.048798
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0764,
          "logisticSlope": 2.6138,
          "wetFractionWeight": 4.1377,
          "powerEta": 0.68,
          "rawBrier": 0.04155,
          "calibratedBrier": 0.03975
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2535,
          "rawIfsRmseC": 1.6148,
          "rawEqualMaeC": 1.0143,
          "rawEqualRmseC": 1.3147,
          "cvSimplexMaeC": 1.0166,
          "cvCalibratedMaeC": 0.9923,
          "cvCalibratedRmseC": 1.3102
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.028811,
          "ecmwfAifs": 0.043488,
          "icon": 0.535258,
          "ukmo": 0.312443,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.3944,
        "betaDrivers": [
          -0.0011,
          0.0204,
          -0.0716,
          -0.4214,
          0.0407,
          -0.0102
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8178,
        "spreadScale": 0.4027,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235061,
            "ecmwfAifs": 0.072465,
            "icon": 0.22106,
            "ukmo": 0.122675,
            "meteofrance": 0.162187,
            "gfs": 0.067815,
            "gem": 0.060511,
            "jma": 0.058226
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2006,
          "logisticSlope": 3.9789,
          "wetFractionWeight": 2.7733,
          "powerEta": 0.68,
          "rawBrier": 0.0319,
          "calibratedBrier": 0.03111
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.4711,
          "rawIfsRmseC": 1.9594,
          "rawEqualMaeC": 1.3694,
          "rawEqualRmseC": 1.7924,
          "cvSimplexMaeC": 1.2064,
          "cvCalibratedMaeC": 1.1772,
          "cvCalibratedRmseC": 1.5364
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.250439,
          "ecmwfAifs": 0.170471,
          "icon": 0.264905,
          "ukmo": 0.222188,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.031997,
          "jma": 0.02
        },
        "intercept": -0.4608,
        "betaDrivers": [
          -0.0631,
          -0.0117,
          -0.0665,
          -0.3164,
          0.1338,
          0.0409
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.625,
        "spreadScale": 0.5914,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.314742,
            "ecmwfAifs": 0.202423,
            "icon": 0.142894,
            "ukmo": 0.115025,
            "meteofrance": 0.045279,
            "gfs": 0.068885,
            "gem": 0.061465,
            "jma": 0.049287
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2693,
          "logisticSlope": 3.9269,
          "wetFractionWeight": 2.9962,
          "powerEta": 0.68,
          "rawBrier": 0.0319,
          "calibratedBrier": 0.03099
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.4711,
          "rawIfsRmseC": 1.9594,
          "rawEqualMaeC": 1.3694,
          "rawEqualRmseC": 1.7924,
          "cvSimplexMaeC": 1.2377,
          "cvCalibratedMaeC": 1.1955,
          "cvCalibratedRmseC": 1.5477
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.492476,
          "ukmo": 0.325856,
          "meteofrance": 0.02,
          "gfs": 0.081668,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2997,
        "betaDrivers": [
          -0.0642,
          -0.0536,
          -0.1436,
          -0.4993,
          0.1202,
          0.142
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0303,
        "spreadScale": 0.4968,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227447,
            "ecmwfAifs": 0.079822,
            "icon": 0.220536,
            "ukmo": 0.124125,
            "meteofrance": 0.163282,
            "gfs": 0.068425,
            "gem": 0.058376,
            "jma": 0.057987
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.2897,
          "logisticSlope": 3.8522,
          "wetFractionWeight": 2.8919,
          "powerEta": 0.68,
          "rawBrier": 0.0059,
          "calibratedBrier": 0.00579
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5019,
          "rawIfsRmseC": 1.9489,
          "rawEqualMaeC": 1.1392,
          "rawEqualRmseC": 1.4988,
          "cvSimplexMaeC": 1.0179,
          "cvCalibratedMaeC": 1.0001,
          "cvCalibratedRmseC": 1.3015
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.186071,
          "ecmwfAifs": 0.104896,
          "icon": 0.275141,
          "ukmo": 0.256687,
          "meteofrance": 0.02,
          "gfs": 0.073464,
          "gem": 0.063741,
          "jma": 0.02
        },
        "intercept": -0.4691,
        "betaDrivers": [
          -0.087,
          -0.061,
          -0.1135,
          -0.3698,
          0.2359,
          0.1296
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9695,
        "spreadScale": 0.5719,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.301509,
            "ecmwfAifs": 0.220749,
            "icon": 0.141133,
            "ukmo": 0.115224,
            "meteofrance": 0.045272,
            "gfs": 0.068812,
            "gem": 0.058706,
            "jma": 0.048595
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.3628,
          "logisticSlope": 3.7635,
          "wetFractionWeight": 3.1194,
          "powerEta": 0.68,
          "rawBrier": 0.0059,
          "calibratedBrier": 0.00567
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5019,
          "rawIfsRmseC": 1.9489,
          "rawEqualMaeC": 1.1392,
          "rawEqualRmseC": 1.4988,
          "cvSimplexMaeC": 1.0559,
          "cvCalibratedMaeC": 1.0225,
          "cvCalibratedRmseC": 1.3149
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.129725,
          "ecmwfAifs": 0.02,
          "icon": 0.502952,
          "ukmo": 0.267323,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0274,
        "betaDrivers": [
          0.0001,
          -0.0112,
          -0.1069,
          0.0195,
          0.096,
          0.0182
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0298,
        "spreadScale": 0.6377,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227218,
            "ecmwfAifs": 0.079186,
            "icon": 0.226509,
            "ukmo": 0.121186,
            "meteofrance": 0.162093,
            "gfs": 0.068235,
            "gem": 0.059229,
            "jma": 0.056344
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0685,
          "logisticSlope": 3.519,
          "wetFractionWeight": 2.5002,
          "powerEta": 0.68,
          "rawBrier": 0.03456,
          "calibratedBrier": 0.03298
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.2402,
          "rawIfsRmseC": 1.5811,
          "rawEqualMaeC": 1.1529,
          "rawEqualRmseC": 1.473,
          "cvSimplexMaeC": 1.0201,
          "cvCalibratedMaeC": 1.0194,
          "cvCalibratedRmseC": 1.284
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.297996,
          "ecmwfAifs": 0.076755,
          "icon": 0.284324,
          "ukmo": 0.235651,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.045274,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0104,
          -0.038,
          -0.154,
          0.0336,
          0.1782,
          0.0589
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9065,
        "spreadScale": 0.8527,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.301739,
            "ecmwfAifs": 0.21938,
            "icon": 0.145213,
            "ukmo": 0.112695,
            "meteofrance": 0.04526,
            "gfs": 0.068742,
            "gem": 0.059669,
            "jma": 0.047302
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.133,
          "logisticSlope": 3.0687,
          "wetFractionWeight": 2.8044,
          "powerEta": 0.68,
          "rawBrier": 0.03456,
          "calibratedBrier": 0.03304
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.2402,
          "rawIfsRmseC": 1.5811,
          "rawEqualMaeC": 1.1529,
          "rawEqualRmseC": 1.473,
          "cvSimplexMaeC": 1.0492,
          "cvCalibratedMaeC": 1.0479,
          "cvCalibratedRmseC": 1.3168
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
          "icon": 0.356492,
          "ukmo": 0.244737,
          "meteofrance": 0.187188,
          "gfs": 0.02,
          "gem": 0.131583,
          "jma": 0.02
        },
        "interceptC": 0.2469,
        "diurnalHarmonicsC": [
          0.1307,
          0.1054,
          0,
          0
        ],
        "driverBetasC": [
          -0.134,
          -0.2098,
          0.0137,
          0.2219
        ],
        "spreadBaseC2": 0.7243,
        "spreadScale": 1.2269,
        "cvMaeC": 0.9926,
        "cvRmseC": 1.297,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.102268,
          "ecmwfAifs": 0.114344,
          "icon": 0.272998,
          "ukmo": 0.200219,
          "meteofrance": 0.14907,
          "gfs": 0.02,
          "gem": 0.110865,
          "jma": 0.030236
        },
        "interceptC": 0.2807,
        "diurnalHarmonicsC": [
          0.1132,
          0.0988,
          0,
          0
        ],
        "driverBetasC": [
          -0.1038,
          -0.1666,
          0.0149,
          0.2
        ],
        "spreadBaseC2": 0.65,
        "spreadScale": 1.3437,
        "cvMaeC": 0.9925,
        "cvRmseC": 1.3036,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.184536,
          "ecmwfAifs": 0.208688,
          "icon": 0.189505,
          "ukmo": 0.155701,
          "meteofrance": 0.110952,
          "gfs": 0.02,
          "gem": 0.090147,
          "jma": 0.040471
        },
        "interceptC": 0.3144,
        "diurnalHarmonicsC": [
          0.0956,
          0.0923,
          0,
          0
        ],
        "driverBetasC": [
          -0.0736,
          -0.1235,
          0.0161,
          0.1781
        ],
        "spreadBaseC2": 0.5757,
        "spreadScale": 1.4605,
        "cvMaeC": 0.9923,
        "cvRmseC": 1.3102,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.028811,
          "ecmwfAifs": 0.043488,
          "icon": 0.535258,
          "ukmo": 0.312443,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3944,
        "diurnalHarmonicsC": [
          -0.0011,
          0.0204,
          0,
          0
        ],
        "driverBetasC": [
          -0.0716,
          -0.0102,
          -0.4214,
          0.0407
        ],
        "spreadBaseC2": 1.8178,
        "spreadScale": 0.4027,
        "cvMaeC": 1.1772,
        "cvRmseC": 1.5364,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.139625,
          "ecmwfAifs": 0.10698,
          "icon": 0.400081,
          "ukmo": 0.267315,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.025999,
          "jma": 0.02
        },
        "interceptC": -0.4276,
        "diurnalHarmonicsC": [
          -0.0321,
          0.0044,
          0,
          0
        ],
        "driverBetasC": [
          -0.0691,
          0.0153,
          -0.3689,
          0.0872
        ],
        "spreadBaseC2": 1.7214,
        "spreadScale": 0.497,
        "cvMaeC": 1.1864,
        "cvRmseC": 1.5421,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.250439,
          "ecmwfAifs": 0.170471,
          "icon": 0.264905,
          "ukmo": 0.222188,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.031997,
          "jma": 0.02
        },
        "interceptC": -0.4608,
        "diurnalHarmonicsC": [
          -0.0631,
          -0.0117,
          0,
          0
        ],
        "driverBetasC": [
          -0.0665,
          0.0409,
          -0.3164,
          0.1338
        ],
        "spreadBaseC2": 1.625,
        "spreadScale": 0.5914,
        "cvMaeC": 1.1955,
        "cvRmseC": 1.5477,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.492476,
          "ukmo": 0.325856,
          "meteofrance": 0.02,
          "gfs": 0.081668,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2997,
        "diurnalHarmonicsC": [
          -0.0642,
          -0.0536,
          0,
          0
        ],
        "driverBetasC": [
          -0.1436,
          0.142,
          -0.4993,
          0.1202
        ],
        "spreadBaseC2": 1.0303,
        "spreadScale": 0.4968,
        "cvMaeC": 1.0001,
        "cvRmseC": 1.3015,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.103035,
          "ecmwfAifs": 0.062448,
          "icon": 0.383808,
          "ukmo": 0.291272,
          "meteofrance": 0.02,
          "gfs": 0.077566,
          "gem": 0.041871,
          "jma": 0.02
        },
        "interceptC": -0.3844,
        "diurnalHarmonicsC": [
          -0.0756,
          -0.0573,
          0,
          0
        ],
        "driverBetasC": [
          -0.1285,
          0.1358,
          -0.4345,
          0.178
        ],
        "spreadBaseC2": 0.9999,
        "spreadScale": 0.5343,
        "cvMaeC": 1.0113,
        "cvRmseC": 1.3082,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.186071,
          "ecmwfAifs": 0.104896,
          "icon": 0.275141,
          "ukmo": 0.256687,
          "meteofrance": 0.02,
          "gfs": 0.073464,
          "gem": 0.063741,
          "jma": 0.02
        },
        "interceptC": -0.4691,
        "diurnalHarmonicsC": [
          -0.087,
          -0.061,
          0,
          0
        ],
        "driverBetasC": [
          -0.1135,
          0.1296,
          -0.3698,
          0.2359
        ],
        "spreadBaseC2": 0.9695,
        "spreadScale": 0.5719,
        "cvMaeC": 1.0225,
        "cvRmseC": 1.3149,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.129725,
          "ecmwfAifs": 0.02,
          "icon": 0.502952,
          "ukmo": 0.267323,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0274,
        "diurnalHarmonicsC": [
          0.0001,
          -0.0112,
          0,
          0
        ],
        "driverBetasC": [
          -0.1069,
          0.0182,
          0.0195,
          0.096
        ],
        "spreadBaseC2": 1.0298,
        "spreadScale": 0.6377,
        "cvMaeC": 1.0194,
        "cvRmseC": 1.284,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.21386,
          "ecmwfAifs": 0.048377,
          "icon": 0.393639,
          "ukmo": 0.251487,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.032637,
          "jma": 0.02
        },
        "interceptC": 0.0137,
        "diurnalHarmonicsC": [
          -0.0052,
          -0.0246,
          0,
          0
        ],
        "driverBetasC": [
          -0.1305,
          0.0386,
          0.0265,
          0.1371
        ],
        "spreadBaseC2": 0.9682,
        "spreadScale": 0.7452,
        "cvMaeC": 1.0337,
        "cvRmseC": 1.3004,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.297996,
          "ecmwfAifs": 0.076755,
          "icon": 0.284324,
          "ukmo": 0.235651,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.045274,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0104,
          -0.038,
          0,
          0
        ],
        "driverBetasC": [
          -0.154,
          0.0589,
          0.0336,
          0.1782
        ],
        "spreadBaseC2": 0.9065,
        "spreadScale": 0.8527,
        "cvMaeC": 1.0479,
        "cvRmseC": 1.3168,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.242206,
        "ecmwfAifs": 0.083706,
        "icon": 0.216217,
        "ukmo": 0.119674,
        "meteofrance": 0.154308,
        "gfs": 0.067595,
        "gem": 0.056719,
        "jma": 0.059575
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.235061,
        "ecmwfAifs": 0.072465,
        "icon": 0.22106,
        "ukmo": 0.122675,
        "meteofrance": 0.162187,
        "gfs": 0.067815,
        "gem": 0.060511,
        "jma": 0.058226
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.227447,
        "ecmwfAifs": 0.079822,
        "icon": 0.220536,
        "ukmo": 0.124125,
        "meteofrance": 0.163282,
        "gfs": 0.068425,
        "gem": 0.058376,
        "jma": 0.057987
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.227218,
        "ecmwfAifs": 0.079186,
        "icon": 0.226509,
        "ukmo": 0.121186,
        "meteofrance": 0.162093,
        "gfs": 0.068235,
        "gem": 0.059229,
        "jma": 0.056344
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.214385,
    "ecmwfAifs": 0.071397,
    "icon": 0.260982,
    "ukmo": 0.172832,
    "meteofrance": 0.111062,
    "gfs": 0.090012,
    "gem": 0.039665,
    "jma": 0.039665
  },
  "pressureWeights": {
    "ecmwfIfs": 0.310388,
    "ecmwfAifs": 0.147497,
    "icon": 0.12996,
    "ukmo": 0.180548,
    "meteofrance": 0.07763,
    "gfs": 0.076347,
    "gem": 0.038815,
    "jma": 0.038815
  }
} as const;

export default PROVINCE_CALIBRATION_TR_17;
