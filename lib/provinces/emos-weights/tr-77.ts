import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_77: ProvinceCalibrationBundle = {
  "provinceCode": "TR-77",
  "provinceName": "Yalova",
  "plateNumber": 77,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "LTBP0",
  "stationLat": 40.6844,
  "stationLon": 29.3757,
  "stationElevationM": 2,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17253,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.115919,
          "ecmwfAifs": 0.090746,
          "icon": 0.545421,
          "ukmo": 0.02,
          "meteofrance": 0.167914,
          "gfs": 0.02,
          "gem": 0.02,
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
        "spreadBaseC2": 0.7428,
        "spreadScale": 0.9904,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243001,
            "ecmwfAifs": 0.083905,
            "icon": 0.227254,
            "ukmo": 0.112661,
            "meteofrance": 0.154602,
            "gfs": 0.065887,
            "gem": 0.054715,
            "jma": 0.057975
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1158,
          "logisticSlope": 4.023,
          "wetFractionWeight": 3.0914,
          "powerEta": 0.68,
          "rawBrier": 0.06117,
          "calibratedBrier": 0.05809
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2549,
          "rawIfsRmseC": 1.7311,
          "rawEqualMaeC": 1.0782,
          "rawEqualRmseC": 1.5141,
          "cvSimplexMaeC": 1.023,
          "cvCalibratedMaeC": 1.023,
          "cvCalibratedRmseC": 1.3705
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.261861,
          "ecmwfAifs": 0.193864,
          "icon": 0.32689,
          "ukmo": 0.02,
          "meteofrance": 0.082282,
          "gfs": 0.075103,
          "gem": 0.02,
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
        "spreadBaseC2": 0.7506,
        "spreadScale": 1.0379,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315791,
            "ecmwfAifs": 0.227476,
            "icon": 0.142571,
            "ukmo": 0.102524,
            "meteofrance": 0.045113,
            "gfs": 0.064955,
            "gem": 0.053941,
            "jma": 0.047629
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1322,
          "logisticSlope": 3.8909,
          "wetFractionWeight": 3.0283,
          "powerEta": 0.68,
          "rawBrier": 0.06117,
          "calibratedBrier": 0.05815
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2549,
          "rawIfsRmseC": 1.7311,
          "rawEqualMaeC": 1.0782,
          "rawEqualRmseC": 1.5141,
          "cvSimplexMaeC": 1.0203,
          "cvCalibratedMaeC": 1.0203,
          "cvCalibratedRmseC": 1.3948
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.494103,
          "ecmwfAifs": 0.02,
          "icon": 0.385897,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.3999,
        "betaDrivers": [
          -0.0008,
          0.0077,
          -0.0058,
          0.0034,
          0.0161,
          0.0664
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7168,
        "spreadScale": 0.3461,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247591,
            "ecmwfAifs": 0.070472,
            "icon": 0.223996,
            "ukmo": 0.116559,
            "meteofrance": 0.160953,
            "gfs": 0.064206,
            "gem": 0.058241,
            "jma": 0.057982
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2133,
          "logisticSlope": 3.3643,
          "wetFractionWeight": 3.9907,
          "powerEta": 0.68,
          "rawBrier": 0.04043,
          "calibratedBrier": 0.0371
        },
        "verification": {
          "sampleHours": 4186,
          "rawIfsMaeC": 0.9241,
          "rawIfsRmseC": 1.2518,
          "rawEqualMaeC": 1.1569,
          "rawEqualRmseC": 1.4834,
          "cvSimplexMaeC": 0.8389,
          "cvCalibratedMaeC": 0.7821,
          "cvCalibratedRmseC": 1.0671
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.477717,
          "ecmwfAifs": 0.111385,
          "icon": 0.296085,
          "ukmo": 0.02,
          "meteofrance": 0.034813,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.3934,
        "betaDrivers": [
          0.0128,
          0.0193,
          0.0033,
          -0.0101,
          0.012,
          0.036
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7147,
        "spreadScale": 0.338,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33111,
            "ecmwfAifs": 0.196614,
            "icon": 0.144614,
            "ukmo": 0.109156,
            "meteofrance": 0.04526,
            "gfs": 0.065139,
            "gem": 0.059087,
            "jma": 0.04902
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2724,
          "logisticSlope": 3.8011,
          "wetFractionWeight": 3.5428,
          "powerEta": 0.68,
          "rawBrier": 0.04043,
          "calibratedBrier": 0.03753
        },
        "verification": {
          "sampleHours": 4186,
          "rawIfsMaeC": 0.9241,
          "rawIfsRmseC": 1.2518,
          "rawEqualMaeC": 1.1569,
          "rawEqualRmseC": 1.4834,
          "cvSimplexMaeC": 0.8491,
          "cvCalibratedMaeC": 0.7745,
          "cvCalibratedRmseC": 1.0622
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.324517,
          "ecmwfAifs": 0.02,
          "icon": 0.555483,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.5395,
        "betaDrivers": [
          0.0636,
          0.0536,
          -0.1454,
          0.2649,
          -0.0931,
          0.0003
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4473,
        "spreadScale": 0.3381,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.226306,
            "ecmwfAifs": 0.082911,
            "icon": 0.221221,
            "ukmo": 0.11536,
            "meteofrance": 0.163499,
            "gfs": 0.069908,
            "gem": 0.059888,
            "jma": 0.060907
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0151,
          "logisticSlope": 3.2172,
          "wetFractionWeight": 3.3397,
          "powerEta": 0.68,
          "rawBrier": 0.01505,
          "calibratedBrier": 0.01297
        },
        "verification": {
          "sampleHours": 4392,
          "rawIfsMaeC": 0.9677,
          "rawIfsRmseC": 1.2886,
          "rawEqualMaeC": 1.1782,
          "rawEqualRmseC": 1.4901,
          "cvSimplexMaeC": 0.8568,
          "cvCalibratedMaeC": 0.6378,
          "cvCalibratedRmseC": 0.875
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.436303,
          "ecmwfAifs": 0.02,
          "icon": 0.368668,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.095029,
          "jma": 0.02
        },
        "intercept": -0.6399,
        "betaDrivers": [
          0.062,
          0.0897,
          -0.0391,
          0.1241,
          -0.0667,
          0.0583
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4062,
        "spreadScale": 0.3511,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.298499,
            "ecmwfAifs": 0.228151,
            "icon": 0.140866,
            "ukmo": 0.106554,
            "meteofrance": 0.045264,
            "gfs": 0.069952,
            "gem": 0.059926,
            "jma": 0.050788
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1385,
          "logisticSlope": 3.2942,
          "wetFractionWeight": 3.6599,
          "powerEta": 0.68,
          "rawBrier": 0.01505,
          "calibratedBrier": 0.01271
        },
        "verification": {
          "sampleHours": 4392,
          "rawIfsMaeC": 0.9677,
          "rawIfsRmseC": 1.2886,
          "rawEqualMaeC": 1.1782,
          "rawEqualRmseC": 1.4901,
          "cvSimplexMaeC": 0.8736,
          "cvCalibratedMaeC": 0.6103,
          "cvCalibratedRmseC": 0.8584
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.543482,
          "ecmwfAifs": 0.16634,
          "icon": 0.190178,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2713,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5815,
        "spreadScale": 0.3547,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22865,
            "ecmwfAifs": 0.083416,
            "icon": 0.223285,
            "ukmo": 0.123088,
            "meteofrance": 0.154457,
            "gfs": 0.067219,
            "gem": 0.061349,
            "jma": 0.058536
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2326,
          "logisticSlope": 3.5683,
          "wetFractionWeight": 3.2138,
          "powerEta": 0.68,
          "rawBrier": 0.04116,
          "calibratedBrier": 0.03914
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.8148,
          "rawIfsRmseC": 1.1034,
          "rawEqualMaeC": 0.8945,
          "rawEqualRmseC": 1.1372,
          "cvSimplexMaeC": 0.7719,
          "cvCalibratedMaeC": 0.7431,
          "cvCalibratedRmseC": 0.998
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.463954,
          "ecmwfAifs": 0.197112,
          "icon": 0.179858,
          "ukmo": 0.02,
          "meteofrance": 0.039071,
          "gfs": 0.02,
          "gem": 0.060005,
          "jma": 0.02
        },
        "intercept": -0.2327,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5582,
        "spreadScale": 0.3584,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.298595,
            "ecmwfAifs": 0.227258,
            "icon": 0.140767,
            "ukmo": 0.112562,
            "meteofrance": 0.045121,
            "gfs": 0.066593,
            "gem": 0.060778,
            "jma": 0.048326
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3802,
          "logisticSlope": 3.6856,
          "wetFractionWeight": 3.1724,
          "powerEta": 0.68,
          "rawBrier": 0.04116,
          "calibratedBrier": 0.03841
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.8148,
          "rawIfsRmseC": 1.1034,
          "rawEqualMaeC": 0.8945,
          "rawEqualRmseC": 1.1372,
          "cvSimplexMaeC": 0.7651,
          "cvCalibratedMaeC": 0.7399,
          "cvCalibratedRmseC": 0.9883
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.115919,
          "ecmwfAifs": 0.090746,
          "icon": 0.545421,
          "ukmo": 0.02,
          "meteofrance": 0.167914,
          "gfs": 0.02,
          "gem": 0.02,
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
        "spreadBaseC2": 0.7428,
        "spreadScale": 0.9904,
        "cvMaeC": 1.023,
        "cvRmseC": 1.3705,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.18889,
          "ecmwfAifs": 0.142305,
          "icon": 0.436155,
          "ukmo": 0.02,
          "meteofrance": 0.125098,
          "gfs": 0.047552,
          "gem": 0.02,
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
        "spreadBaseC2": 0.7467,
        "spreadScale": 1.0141,
        "cvMaeC": 1.0216,
        "cvRmseC": 1.3826,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.261861,
          "ecmwfAifs": 0.193864,
          "icon": 0.32689,
          "ukmo": 0.02,
          "meteofrance": 0.082282,
          "gfs": 0.075103,
          "gem": 0.02,
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
        "spreadBaseC2": 0.7506,
        "spreadScale": 1.0379,
        "cvMaeC": 1.0203,
        "cvRmseC": 1.3948,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.494103,
          "ecmwfAifs": 0.02,
          "icon": 0.385897,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3999,
        "diurnalHarmonicsC": [
          -0.0008,
          0.0077,
          0,
          0
        ],
        "driverBetasC": [
          -0.0058,
          0.0664,
          0.0034,
          0.0161
        ],
        "spreadBaseC2": 0.7168,
        "spreadScale": 0.3461,
        "cvMaeC": 0.7821,
        "cvRmseC": 1.0671,
        "sampleHours": 4186
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.485909,
          "ecmwfAifs": 0.065693,
          "icon": 0.340991,
          "ukmo": 0.02,
          "meteofrance": 0.027407,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3967,
        "diurnalHarmonicsC": [
          0.006,
          0.0135,
          0,
          0
        ],
        "driverBetasC": [
          -0.0012,
          0.0512,
          -0.0033,
          0.014
        ],
        "spreadBaseC2": 0.7157,
        "spreadScale": 0.3421,
        "cvMaeC": 0.7783,
        "cvRmseC": 1.0646,
        "sampleHours": 4186
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.477717,
          "ecmwfAifs": 0.111385,
          "icon": 0.296085,
          "ukmo": 0.02,
          "meteofrance": 0.034813,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.3934,
        "diurnalHarmonicsC": [
          0.0128,
          0.0193,
          0,
          0
        ],
        "driverBetasC": [
          0.0033,
          0.036,
          -0.0101,
          0.012
        ],
        "spreadBaseC2": 0.7147,
        "spreadScale": 0.338,
        "cvMaeC": 0.7745,
        "cvRmseC": 1.0622,
        "sampleHours": 4186
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.324517,
          "ecmwfAifs": 0.02,
          "icon": 0.555483,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.5395,
        "diurnalHarmonicsC": [
          0.0636,
          0.0536,
          0,
          0
        ],
        "driverBetasC": [
          -0.1454,
          0.0003,
          0.2649,
          -0.0931
        ],
        "spreadBaseC2": 0.4473,
        "spreadScale": 0.3381,
        "cvMaeC": 0.6378,
        "cvRmseC": 0.875,
        "sampleHours": 4392
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.38041,
          "ecmwfAifs": 0.02,
          "icon": 0.462075,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.057515,
          "jma": 0.02
        },
        "interceptC": -0.5897,
        "diurnalHarmonicsC": [
          0.0628,
          0.0717,
          0,
          0
        ],
        "driverBetasC": [
          -0.0922,
          0.0293,
          0.1945,
          -0.0799
        ],
        "spreadBaseC2": 0.4267,
        "spreadScale": 0.3446,
        "cvMaeC": 0.624,
        "cvRmseC": 0.8667,
        "sampleHours": 4392
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.436303,
          "ecmwfAifs": 0.02,
          "icon": 0.368668,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.095029,
          "jma": 0.02
        },
        "interceptC": -0.6399,
        "diurnalHarmonicsC": [
          0.062,
          0.0897,
          0,
          0
        ],
        "driverBetasC": [
          -0.0391,
          0.0583,
          0.1241,
          -0.0667
        ],
        "spreadBaseC2": 0.4062,
        "spreadScale": 0.3511,
        "cvMaeC": 0.6103,
        "cvRmseC": 0.8584,
        "sampleHours": 4392
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.543482,
          "ecmwfAifs": 0.16634,
          "icon": 0.190178,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2713,
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
        "spreadBaseC2": 0.5815,
        "spreadScale": 0.3547,
        "cvMaeC": 0.7431,
        "cvRmseC": 0.998,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.503719,
          "ecmwfAifs": 0.181726,
          "icon": 0.185018,
          "ukmo": 0.02,
          "meteofrance": 0.029535,
          "gfs": 0.02,
          "gem": 0.040002,
          "jma": 0.02
        },
        "interceptC": -0.252,
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
        "spreadBaseC2": 0.5698,
        "spreadScale": 0.3566,
        "cvMaeC": 0.7415,
        "cvRmseC": 0.9931,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.463954,
          "ecmwfAifs": 0.197112,
          "icon": 0.179858,
          "ukmo": 0.02,
          "meteofrance": 0.039071,
          "gfs": 0.02,
          "gem": 0.060005,
          "jma": 0.02
        },
        "interceptC": -0.2327,
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
        "spreadBaseC2": 0.5582,
        "spreadScale": 0.3584,
        "cvMaeC": 0.7399,
        "cvRmseC": 0.9883,
        "sampleHours": 4331
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243001,
        "ecmwfAifs": 0.083905,
        "icon": 0.227254,
        "ukmo": 0.112661,
        "meteofrance": 0.154602,
        "gfs": 0.065887,
        "gem": 0.054715,
        "jma": 0.057975
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.247591,
        "ecmwfAifs": 0.070472,
        "icon": 0.223996,
        "ukmo": 0.116559,
        "meteofrance": 0.160953,
        "gfs": 0.064206,
        "gem": 0.058241,
        "jma": 0.057982
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.226306,
        "ecmwfAifs": 0.082911,
        "icon": 0.221221,
        "ukmo": 0.11536,
        "meteofrance": 0.163499,
        "gfs": 0.069908,
        "gem": 0.059888,
        "jma": 0.060907
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.22865,
        "ecmwfAifs": 0.083416,
        "icon": 0.223285,
        "ukmo": 0.123088,
        "meteofrance": 0.154457,
        "gfs": 0.067219,
        "gem": 0.061349,
        "jma": 0.058536
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.214847,
    "ecmwfAifs": 0.070802,
    "icon": 0.248578,
    "ukmo": 0.183506,
    "meteofrance": 0.110137,
    "gfs": 0.09346,
    "gem": 0.039335,
    "jma": 0.039335
  },
  "pressureWeights": {
    "ecmwfIfs": 0.306927,
    "ecmwfAifs": 0.150274,
    "icon": 0.136708,
    "ukmo": 0.183101,
    "meteofrance": 0.079091,
    "gfs": 0.064807,
    "gem": 0.039546,
    "jma": 0.039546
  }
} as const;

export default PROVINCE_CALIBRATION_TR_77;
