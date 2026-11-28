import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_09: ProvinceCalibrationBundle = {
  "provinceCode": "TR-09",
  "provinceName": "Aydın",
  "plateNumber": 9,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17234",
  "stationLat": 37.85,
  "stationLon": 27.85,
  "stationElevationM": 57,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.470482,
          "icon": 0.02,
          "ukmo": 0.149604,
          "meteofrance": 0.23442,
          "gfs": 0.02,
          "gem": 0.065494,
          "jma": 0.02
        },
        "intercept": 0.2698,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4233,
        "spreadScale": 0.3108,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.264364,
            "ecmwfAifs": 0.079209,
            "icon": 0.196104,
            "ukmo": 0.113757,
            "meteofrance": 0.160641,
            "gfs": 0.065285,
            "gem": 0.058948,
            "jma": 0.061692
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5739,
          "logisticSlope": 4.0497,
          "wetFractionWeight": 2.7397,
          "powerEta": 0.68,
          "rawBrier": 0.05804,
          "calibratedBrier": 0.05539
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4915,
          "rawIfsRmseC": 1.9263,
          "rawEqualMaeC": 1.1242,
          "rawEqualRmseC": 1.395,
          "cvSimplexMaeC": 1.1294,
          "cvCalibratedMaeC": 1.1145,
          "cvCalibratedRmseC": 1.4198
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.110617,
          "ecmwfAifs": 0.435157,
          "icon": 0.061965,
          "ukmo": 0.144174,
          "meteofrance": 0.11859,
          "gfs": 0.02,
          "gem": 0.060321,
          "jma": 0.049176
        },
        "intercept": 0.1735,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.4063,
        "spreadScale": 0.3259,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.342407,
            "ecmwfAifs": 0.214029,
            "icon": 0.122619,
            "ukmo": 0.103177,
            "meteofrance": 0.045186,
            "gfs": 0.064147,
            "gem": 0.057921,
            "jma": 0.050514
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6833,
          "logisticSlope": 3.9028,
          "wetFractionWeight": 2.6468,
          "powerEta": 0.68,
          "rawBrier": 0.05804,
          "calibratedBrier": 0.05435
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4915,
          "rawIfsRmseC": 1.9263,
          "rawEqualMaeC": 1.1242,
          "rawEqualRmseC": 1.395,
          "cvSimplexMaeC": 1.1342,
          "cvCalibratedMaeC": 1.1253,
          "cvCalibratedRmseC": 1.4239
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.510429,
          "ecmwfAifs": 0.059173,
          "icon": 0.114039,
          "ukmo": 0.034736,
          "meteofrance": 0.113989,
          "gfs": 0.05348,
          "gem": 0.094154,
          "jma": 0.02
        },
        "intercept": 0.1937,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0816,
        "spreadScale": 0.9225,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248955,
            "ecmwfAifs": 0.0826,
            "icon": 0.212496,
            "ukmo": 0.124033,
            "meteofrance": 0.148965,
            "gfs": 0.068566,
            "gem": 0.057662,
            "jma": 0.056723
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6289,
          "logisticSlope": 3.6436,
          "wetFractionWeight": 3.0569,
          "powerEta": 0.68,
          "rawBrier": 0.04955,
          "calibratedBrier": 0.04886
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.5328,
          "rawIfsRmseC": 1.9712,
          "rawEqualMaeC": 1.3212,
          "rawEqualRmseC": 1.6452,
          "cvSimplexMaeC": 1.3857,
          "cvCalibratedMaeC": 1.3731,
          "cvCalibratedRmseC": 1.7284
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.23674,
          "ecmwfAifs": 0.193554,
          "icon": 0.167583,
          "ukmo": 0.103653,
          "meteofrance": 0.09579,
          "gfs": 0.047928,
          "gem": 0.134752,
          "jma": 0.02
        },
        "intercept": 0.022,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.144,
        "spreadScale": 0.8293,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320271,
            "ecmwfAifs": 0.221683,
            "icon": 0.13197,
            "ukmo": 0.111736,
            "meteofrance": 0.045019,
            "gfs": 0.066915,
            "gem": 0.056274,
            "jma": 0.046132
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7221,
          "logisticSlope": 3.786,
          "wetFractionWeight": 2.9799,
          "powerEta": 0.68,
          "rawBrier": 0.04955,
          "calibratedBrier": 0.04723
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.5328,
          "rawIfsRmseC": 1.9712,
          "rawEqualMaeC": 1.3212,
          "rawEqualRmseC": 1.6452,
          "cvSimplexMaeC": 1.3584,
          "cvCalibratedMaeC": 1.3583,
          "cvCalibratedRmseC": 1.6902
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.329065,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.107596,
          "gem": 0.463339,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          0.1978,
          -0.4109,
          -0.2127,
          -0.4239,
          -0.2746,
          0.4068
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4776,
        "spreadScale": 0.496,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.229091,
            "ecmwfAifs": 0.078139,
            "icon": 0.219429,
            "ukmo": 0.126762,
            "meteofrance": 0.162604,
            "gfs": 0.069193,
            "gem": 0.058066,
            "jma": 0.056716
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.0763,
          "logisticSlope": 3.2514,
          "wetFractionWeight": 2.5662,
          "powerEta": 0.68,
          "rawBrier": 0.00693,
          "calibratedBrier": 0.00678
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.1757,
          "rawIfsRmseC": 2.681,
          "rawEqualMaeC": 1.8084,
          "rawEqualRmseC": 2.2416,
          "cvSimplexMaeC": 1.3758,
          "cvCalibratedMaeC": 1.3283,
          "cvCalibratedRmseC": 1.67
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.081624,
          "ecmwfAifs": 0.09037,
          "icon": 0.324799,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.088424,
          "gem": 0.354783,
          "jma": 0.02
        },
        "intercept": -0.3406,
        "betaDrivers": [
          0.0985,
          -0.2872,
          -0.113,
          -0.1846,
          -0.1044,
          0.2159
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6267,
        "spreadScale": 0.4139,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304117,
            "ecmwfAifs": 0.216399,
            "icon": 0.140624,
            "ukmo": 0.117838,
            "meteofrance": 0.045266,
            "gfs": 0.069682,
            "gem": 0.058477,
            "jma": 0.047597
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1136,
          "logisticSlope": 3.2103,
          "wetFractionWeight": 2.8138,
          "powerEta": 0.68,
          "rawBrier": 0.00693,
          "calibratedBrier": 0.0067
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.1757,
          "rawIfsRmseC": 2.681,
          "rawEqualMaeC": 1.8084,
          "rawEqualRmseC": 2.2416,
          "cvSimplexMaeC": 1.412,
          "cvCalibratedMaeC": 1.3204,
          "cvCalibratedRmseC": 1.6458
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.078252,
          "ecmwfAifs": 0.182634,
          "icon": 0.424812,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.112846,
          "gem": 0.141456,
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
        "spreadBaseC2": 1.5668,
        "spreadScale": 0.4378,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237089,
            "ecmwfAifs": 0.077541,
            "icon": 0.218231,
            "ukmo": 0.126936,
            "meteofrance": 0.161506,
            "gfs": 0.06112,
            "gem": 0.05868,
            "jma": 0.058897
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4189,
          "logisticSlope": 4.6927,
          "wetFractionWeight": 2.9072,
          "powerEta": 0.68,
          "rawBrier": 0.02612,
          "calibratedBrier": 0.0241
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.7746,
          "rawIfsRmseC": 2.3711,
          "rawEqualMaeC": 1.4009,
          "rawEqualRmseC": 1.7941,
          "cvSimplexMaeC": 1.307,
          "cvCalibratedMaeC": 1.307,
          "cvCalibratedRmseC": 1.6272
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.182546,
          "ecmwfAifs": 0.208308,
          "icon": 0.302332,
          "ukmo": 0.026954,
          "meteofrance": 0.02,
          "gfs": 0.068388,
          "gem": 0.171472,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0069,
          -0.1408,
          -0.0965,
          -0.0546,
          0.0819,
          0.1193
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.671,
        "spreadScale": 0.3668,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313863,
            "ecmwfAifs": 0.214148,
            "icon": 0.139468,
            "ukmo": 0.117672,
            "meteofrance": 0.045245,
            "gfs": 0.061382,
            "gem": 0.058931,
            "jma": 0.049291
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.557,
          "logisticSlope": 4.5124,
          "wetFractionWeight": 2.9941,
          "powerEta": 0.68,
          "rawBrier": 0.02612,
          "calibratedBrier": 0.02361
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.7746,
          "rawIfsRmseC": 2.3711,
          "rawEqualMaeC": 1.4009,
          "rawEqualRmseC": 1.7941,
          "cvSimplexMaeC": 1.2891,
          "cvCalibratedMaeC": 1.2828,
          "cvCalibratedRmseC": 1.6052
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.470482,
          "icon": 0.02,
          "ukmo": 0.149604,
          "meteofrance": 0.23442,
          "gfs": 0.02,
          "gem": 0.065494,
          "jma": 0.02
        },
        "interceptC": 0.2698,
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
        "spreadBaseC2": 1.4233,
        "spreadScale": 0.3108,
        "cvMaeC": 1.1145,
        "cvRmseC": 1.4198,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.065308,
          "ecmwfAifs": 0.452821,
          "icon": 0.040982,
          "ukmo": 0.146889,
          "meteofrance": 0.176505,
          "gfs": 0.02,
          "gem": 0.062907,
          "jma": 0.034588
        },
        "interceptC": 0.2216,
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
        "spreadBaseC2": 1.4148,
        "spreadScale": 0.3184,
        "cvMaeC": 1.1199,
        "cvRmseC": 1.4219,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.110617,
          "ecmwfAifs": 0.435157,
          "icon": 0.061965,
          "ukmo": 0.144174,
          "meteofrance": 0.11859,
          "gfs": 0.02,
          "gem": 0.060321,
          "jma": 0.049176
        },
        "interceptC": 0.1735,
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
        "spreadBaseC2": 1.4063,
        "spreadScale": 0.3259,
        "cvMaeC": 1.1253,
        "cvRmseC": 1.4239,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.510429,
          "ecmwfAifs": 0.059173,
          "icon": 0.114039,
          "ukmo": 0.034736,
          "meteofrance": 0.113989,
          "gfs": 0.05348,
          "gem": 0.094154,
          "jma": 0.02
        },
        "interceptC": 0.1937,
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
        "spreadBaseC2": 1.0816,
        "spreadScale": 0.9225,
        "cvMaeC": 1.3731,
        "cvRmseC": 1.7284,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.373584,
          "ecmwfAifs": 0.126364,
          "icon": 0.140811,
          "ukmo": 0.069194,
          "meteofrance": 0.10489,
          "gfs": 0.050704,
          "gem": 0.114453,
          "jma": 0.02
        },
        "interceptC": 0.1079,
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
        "spreadBaseC2": 1.1128,
        "spreadScale": 0.8759,
        "cvMaeC": 1.3657,
        "cvRmseC": 1.7093,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.23674,
          "ecmwfAifs": 0.193554,
          "icon": 0.167583,
          "ukmo": 0.103653,
          "meteofrance": 0.09579,
          "gfs": 0.047928,
          "gem": 0.134752,
          "jma": 0.02
        },
        "interceptC": 0.022,
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
        "spreadBaseC2": 1.144,
        "spreadScale": 0.8293,
        "cvMaeC": 1.3583,
        "cvRmseC": 1.6902,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.329065,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.107596,
          "gem": 0.463339,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.1978,
          -0.4109,
          0,
          0
        ],
        "driverBetasC": [
          -0.2127,
          0.4068,
          -0.4239,
          -0.2746
        ],
        "spreadBaseC2": 1.4776,
        "spreadScale": 0.496,
        "cvMaeC": 1.3283,
        "cvRmseC": 1.67,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.050812,
          "ecmwfAifs": 0.055185,
          "icon": 0.326932,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.09801,
          "gem": 0.409061,
          "jma": 0.02
        },
        "interceptC": -0.1703,
        "diurnalHarmonicsC": [
          0.1482,
          -0.349,
          0,
          0
        ],
        "driverBetasC": [
          -0.1628,
          0.3114,
          -0.3043,
          -0.1895
        ],
        "spreadBaseC2": 1.5522,
        "spreadScale": 0.4549,
        "cvMaeC": 1.3243,
        "cvRmseC": 1.6579,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.081624,
          "ecmwfAifs": 0.09037,
          "icon": 0.324799,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.088424,
          "gem": 0.354783,
          "jma": 0.02
        },
        "interceptC": -0.3406,
        "diurnalHarmonicsC": [
          0.0985,
          -0.2872,
          0,
          0
        ],
        "driverBetasC": [
          -0.113,
          0.2159,
          -0.1846,
          -0.1044
        ],
        "spreadBaseC2": 1.6267,
        "spreadScale": 0.4139,
        "cvMaeC": 1.3204,
        "cvRmseC": 1.6458,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.078252,
          "ecmwfAifs": 0.182634,
          "icon": 0.424812,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.112846,
          "gem": 0.141456,
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
        "spreadBaseC2": 1.5668,
        "spreadScale": 0.4378,
        "cvMaeC": 1.307,
        "cvRmseC": 1.6272,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.130399,
          "ecmwfAifs": 0.195471,
          "icon": 0.363572,
          "ukmo": 0.023477,
          "meteofrance": 0.02,
          "gfs": 0.090617,
          "gem": 0.156464,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0034,
          -0.0704,
          0,
          0
        ],
        "driverBetasC": [
          -0.0483,
          0.0597,
          -0.0273,
          0.041
        ],
        "spreadBaseC2": 1.6189,
        "spreadScale": 0.4023,
        "cvMaeC": 1.2949,
        "cvRmseC": 1.6162,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.182546,
          "ecmwfAifs": 0.208308,
          "icon": 0.302332,
          "ukmo": 0.026954,
          "meteofrance": 0.02,
          "gfs": 0.068388,
          "gem": 0.171472,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0069,
          -0.1408,
          0,
          0
        ],
        "driverBetasC": [
          -0.0965,
          0.1193,
          -0.0546,
          0.0819
        ],
        "spreadBaseC2": 1.671,
        "spreadScale": 0.3668,
        "cvMaeC": 1.2828,
        "cvRmseC": 1.6052,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.264364,
        "ecmwfAifs": 0.079209,
        "icon": 0.196104,
        "ukmo": 0.113757,
        "meteofrance": 0.160641,
        "gfs": 0.065285,
        "gem": 0.058948,
        "jma": 0.061692
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.248955,
        "ecmwfAifs": 0.0826,
        "icon": 0.212496,
        "ukmo": 0.124033,
        "meteofrance": 0.148965,
        "gfs": 0.068566,
        "gem": 0.057662,
        "jma": 0.056723
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.229091,
        "ecmwfAifs": 0.078139,
        "icon": 0.219429,
        "ukmo": 0.126762,
        "meteofrance": 0.162604,
        "gfs": 0.069193,
        "gem": 0.058066,
        "jma": 0.056716
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.237089,
        "ecmwfAifs": 0.077541,
        "icon": 0.218231,
        "ukmo": 0.126936,
        "meteofrance": 0.161506,
        "gfs": 0.06112,
        "gem": 0.05868,
        "jma": 0.058897
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.222252,
    "ecmwfAifs": 0.070553,
    "icon": 0.238496,
    "ukmo": 0.180549,
    "meteofrance": 0.10975,
    "gfs": 0.100008,
    "gem": 0.039196,
    "jma": 0.039196
  },
  "pressureWeights": {
    "ecmwfIfs": 0.281542,
    "ecmwfAifs": 0.151576,
    "icon": 0.132929,
    "ukmo": 0.202828,
    "meteofrance": 0.079777,
    "gfs": 0.071572,
    "gem": 0.039888,
    "jma": 0.039888
  }
} as const;

export default PROVINCE_CALIBRATION_TR_09;
