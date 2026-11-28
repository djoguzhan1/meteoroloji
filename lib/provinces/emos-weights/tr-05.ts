import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_05: ProvinceCalibrationBundle = {
  "provinceCode": "TR-05",
  "provinceName": "Amasya",
  "plateNumber": 5,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17082",
  "stationLat": 40.85,
  "stationLon": 35.5833,
  "stationElevationM": 545,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17439,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.098526,
          "ecmwfAifs": 0.207061,
          "icon": 0.180567,
          "ukmo": 0.039945,
          "meteofrance": 0.24336,
          "gfs": 0.02,
          "gem": 0.190541,
          "jma": 0.02
        },
        "intercept": 0.3676,
        "betaDrivers": [
          0.0141,
          -0.2033,
          -0.5761,
          -0.0863,
          0.2627,
          0.1858
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.1977,
        "spreadScale": 0.3152,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241894,
            "ecmwfAifs": 0.08293,
            "icon": 0.213997,
            "ukmo": 0.125998,
            "meteofrance": 0.159806,
            "gfs": 0.066958,
            "gem": 0.056278,
            "jma": 0.052139
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2376,
          "logisticSlope": 4.729,
          "wetFractionWeight": 2.9121,
          "powerEta": 0.68,
          "rawBrier": 0.0414,
          "calibratedBrier": 0.04031
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.555,
          "rawIfsRmseC": 1.9745,
          "rawEqualMaeC": 1.1712,
          "rawEqualRmseC": 1.4985,
          "cvSimplexMaeC": 1.139,
          "cvCalibratedMaeC": 1.067,
          "cvCalibratedRmseC": 1.3876
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.196131,
          "ecmwfAifs": 0.312659,
          "icon": 0.123734,
          "ukmo": 0.044417,
          "meteofrance": 0.134867,
          "gfs": 0.031365,
          "gem": 0.136827,
          "jma": 0.02
        },
        "intercept": 0.3829,
        "betaDrivers": [
          -0.0518,
          -0.1254,
          -0.2108,
          -0.1007,
          0.1443,
          0.1049
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1216,
        "spreadScale": 0.362,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315138,
            "ecmwfAifs": 0.225396,
            "icon": 0.13459,
            "ukmo": 0.114948,
            "meteofrance": 0.045188,
            "gfs": 0.066177,
            "gem": 0.055621,
            "jma": 0.042942
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2898,
          "logisticSlope": 4.6301,
          "wetFractionWeight": 2.9327,
          "powerEta": 0.68,
          "rawBrier": 0.0414,
          "calibratedBrier": 0.03922
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.555,
          "rawIfsRmseC": 1.9745,
          "rawEqualMaeC": 1.1712,
          "rawEqualRmseC": 1.4985,
          "cvSimplexMaeC": 1.1486,
          "cvCalibratedMaeC": 1.0711,
          "cvCalibratedRmseC": 1.3996
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.110011,
          "ecmwfAifs": 0.059956,
          "icon": 0.02,
          "ukmo": 0.401404,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.348629,
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
        "spreadBaseC2": 1.0694,
        "spreadScale": 0.6368,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243454,
            "ecmwfAifs": 0.06967,
            "icon": 0.218496,
            "ukmo": 0.128173,
            "meteofrance": 0.164047,
            "gfs": 0.066447,
            "gem": 0.05882,
            "jma": 0.050893
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2007,
          "logisticSlope": 3.2663,
          "wetFractionWeight": 3.764,
          "powerEta": 0.68,
          "rawBrier": 0.05323,
          "calibratedBrier": 0.04379
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.5506,
          "rawIfsRmseC": 1.9893,
          "rawEqualMaeC": 1.3521,
          "rawEqualRmseC": 1.7791,
          "cvSimplexMaeC": 1.1817,
          "cvCalibratedMaeC": 1.1817,
          "cvCalibratedRmseC": 1.5273
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.22902,
          "ecmwfAifs": 0.174819,
          "icon": 0.02,
          "ukmo": 0.24131,
          "meteofrance": 0.027946,
          "gfs": 0.02,
          "gem": 0.266905,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0523,
          -0.1072,
          -0.0766,
          -0.0319,
          0.0735,
          0.0633
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9688,
        "spreadScale": 0.741,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.326787,
            "ecmwfAifs": 0.195096,
            "icon": 0.141585,
            "ukmo": 0.120478,
            "meteofrance": 0.04531,
            "gfs": 0.067662,
            "gem": 0.059896,
            "jma": 0.043186
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2921,
          "logisticSlope": 3.4778,
          "wetFractionWeight": 3.6198,
          "powerEta": 0.68,
          "rawBrier": 0.05323,
          "calibratedBrier": 0.0442
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.5506,
          "rawIfsRmseC": 1.9893,
          "rawEqualMaeC": 1.3521,
          "rawEqualRmseC": 1.7791,
          "cvSimplexMaeC": 1.2139,
          "cvCalibratedMaeC": 1.2112,
          "cvCalibratedRmseC": 1.5587
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.092669,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.347713,
          "meteofrance": 0.044454,
          "gfs": 0.112495,
          "gem": 0.342669,
          "jma": 0.02
        },
        "intercept": -0.0166,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8924,
        "spreadScale": 0.1964,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.229824,
            "ecmwfAifs": 0.078959,
            "icon": 0.234323,
            "ukmo": 0.112793,
            "meteofrance": 0.163992,
            "gfs": 0.068161,
            "gem": 0.05582,
            "jma": 0.056128
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7105,
          "logisticSlope": 4.2879,
          "wetFractionWeight": 3.644,
          "powerEta": 0.68,
          "rawBrier": 0.01622,
          "calibratedBrier": 0.01486
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4516,
          "rawIfsRmseC": 1.8025,
          "rawEqualMaeC": 1.287,
          "rawEqualRmseC": 1.6132,
          "cvSimplexMaeC": 1.2128,
          "cvCalibratedMaeC": 1.2078,
          "cvCalibratedRmseC": 1.508
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.239538,
          "ecmwfAifs": 0.120778,
          "icon": 0.02,
          "ukmo": 0.198002,
          "meteofrance": 0.052681,
          "gfs": 0.096717,
          "gem": 0.252284,
          "jma": 0.02
        },
        "intercept": 0.0418,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.7662,
        "spreadScale": 0.2826,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306363,
            "ecmwfAifs": 0.219582,
            "icon": 0.150794,
            "ukmo": 0.105289,
            "meteofrance": 0.045294,
            "gfs": 0.068929,
            "gem": 0.056449,
            "jma": 0.0473
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7899,
          "logisticSlope": 3.8934,
          "wetFractionWeight": 3.5366,
          "powerEta": 0.68,
          "rawBrier": 0.01622,
          "calibratedBrier": 0.01458
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.4516,
          "rawIfsRmseC": 1.8025,
          "rawEqualMaeC": 1.287,
          "rawEqualRmseC": 1.6132,
          "cvSimplexMaeC": 1.2258,
          "cvCalibratedMaeC": 1.2186,
          "cvCalibratedRmseC": 1.5209
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.090752,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.326913,
          "meteofrance": 0.130982,
          "gfs": 0.02,
          "gem": 0.371353,
          "jma": 0.02
        },
        "intercept": 0.1932,
        "betaDrivers": [
          -0.0138,
          -0.078,
          -0.0372,
          0.0477,
          0.0502,
          0.02
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8978,
        "spreadScale": 0.9679,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230345,
            "ecmwfAifs": 0.080324,
            "icon": 0.227859,
            "ukmo": 0.120274,
            "meteofrance": 0.159783,
            "gfs": 0.067706,
            "gem": 0.058494,
            "jma": 0.055215
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3286,
          "logisticSlope": 4.5867,
          "wetFractionWeight": 3.1643,
          "powerEta": 0.68,
          "rawBrier": 0.0309,
          "calibratedBrier": 0.0301
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.5807,
          "rawIfsRmseC": 1.9933,
          "rawEqualMaeC": 1.4474,
          "rawEqualRmseC": 1.8411,
          "cvSimplexMaeC": 1.3421,
          "cvCalibratedMaeC": 1.331,
          "cvCalibratedRmseC": 1.6988
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.241809,
          "ecmwfAifs": 0.15152,
          "icon": 0.024883,
          "ukmo": 0.191121,
          "meteofrance": 0.096747,
          "gfs": 0.02,
          "gem": 0.25392,
          "jma": 0.02
        },
        "intercept": 0.1702,
        "betaDrivers": [
          -0.0354,
          -0.0759,
          -0.0387,
          0.0106,
          0.0495,
          0.0096
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1451,
        "spreadScale": 0.8654,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304279,
            "ecmwfAifs": 0.221359,
            "icon": 0.145309,
            "ukmo": 0.111257,
            "meteofrance": 0.045217,
            "gfs": 0.06785,
            "gem": 0.058619,
            "jma": 0.04611
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4605,
          "logisticSlope": 4.2786,
          "wetFractionWeight": 3.3835,
          "powerEta": 0.68,
          "rawBrier": 0.0309,
          "calibratedBrier": 0.02953
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.5807,
          "rawIfsRmseC": 1.9933,
          "rawEqualMaeC": 1.4474,
          "rawEqualRmseC": 1.8411,
          "cvSimplexMaeC": 1.3658,
          "cvCalibratedMaeC": 1.3537,
          "cvCalibratedRmseC": 1.7055
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.098526,
          "ecmwfAifs": 0.207061,
          "icon": 0.180567,
          "ukmo": 0.039945,
          "meteofrance": 0.24336,
          "gfs": 0.02,
          "gem": 0.190541,
          "jma": 0.02
        },
        "interceptC": 0.3676,
        "diurnalHarmonicsC": [
          0.0141,
          -0.2033,
          0,
          0
        ],
        "driverBetasC": [
          -0.5761,
          0.1858,
          -0.0863,
          0.2627
        ],
        "spreadBaseC2": 1.1977,
        "spreadScale": 0.3152,
        "cvMaeC": 1.067,
        "cvRmseC": 1.3876,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.147329,
          "ecmwfAifs": 0.259859,
          "icon": 0.152151,
          "ukmo": 0.042181,
          "meteofrance": 0.189114,
          "gfs": 0.025682,
          "gem": 0.163684,
          "jma": 0.02
        },
        "interceptC": 0.3752,
        "diurnalHarmonicsC": [
          -0.0188,
          -0.1643,
          0,
          0
        ],
        "driverBetasC": [
          -0.3934,
          0.1453,
          -0.0935,
          0.2035
        ],
        "spreadBaseC2": 1.1597,
        "spreadScale": 0.3386,
        "cvMaeC": 1.069,
        "cvRmseC": 1.3936,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.196131,
          "ecmwfAifs": 0.312659,
          "icon": 0.123734,
          "ukmo": 0.044417,
          "meteofrance": 0.134867,
          "gfs": 0.031365,
          "gem": 0.136827,
          "jma": 0.02
        },
        "interceptC": 0.3829,
        "diurnalHarmonicsC": [
          -0.0518,
          -0.1254,
          0,
          0
        ],
        "driverBetasC": [
          -0.2108,
          0.1049,
          -0.1007,
          0.1443
        ],
        "spreadBaseC2": 1.1216,
        "spreadScale": 0.362,
        "cvMaeC": 1.0711,
        "cvRmseC": 1.3996,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.110011,
          "ecmwfAifs": 0.059956,
          "icon": 0.02,
          "ukmo": 0.401404,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.348629,
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
        "spreadBaseC2": 1.0694,
        "spreadScale": 0.6368,
        "cvMaeC": 1.1817,
        "cvRmseC": 1.5273,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.169516,
          "ecmwfAifs": 0.117388,
          "icon": 0.02,
          "ukmo": 0.321356,
          "meteofrance": 0.023973,
          "gfs": 0.02,
          "gem": 0.307767,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0261,
          -0.0536,
          0,
          0
        ],
        "driverBetasC": [
          -0.0383,
          0.0316,
          -0.0159,
          0.0367
        ],
        "spreadBaseC2": 1.0191,
        "spreadScale": 0.6889,
        "cvMaeC": 1.1965,
        "cvRmseC": 1.543,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.22902,
          "ecmwfAifs": 0.174819,
          "icon": 0.02,
          "ukmo": 0.24131,
          "meteofrance": 0.027946,
          "gfs": 0.02,
          "gem": 0.266905,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0523,
          -0.1072,
          0,
          0
        ],
        "driverBetasC": [
          -0.0766,
          0.0633,
          -0.0319,
          0.0735
        ],
        "spreadBaseC2": 0.9688,
        "spreadScale": 0.741,
        "cvMaeC": 1.2112,
        "cvRmseC": 1.5587,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.092669,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.347713,
          "meteofrance": 0.044454,
          "gfs": 0.112495,
          "gem": 0.342669,
          "jma": 0.02
        },
        "interceptC": -0.0166,
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
        "spreadBaseC2": 1.8924,
        "spreadScale": 0.1964,
        "cvMaeC": 1.2078,
        "cvRmseC": 1.508,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.166104,
          "ecmwfAifs": 0.070389,
          "icon": 0.02,
          "ukmo": 0.272857,
          "meteofrance": 0.048568,
          "gfs": 0.104606,
          "gem": 0.297476,
          "jma": 0.02
        },
        "interceptC": 0.0126,
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
        "spreadBaseC2": 1.8293,
        "spreadScale": 0.2395,
        "cvMaeC": 1.2132,
        "cvRmseC": 1.5145,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.239538,
          "ecmwfAifs": 0.120778,
          "icon": 0.02,
          "ukmo": 0.198002,
          "meteofrance": 0.052681,
          "gfs": 0.096717,
          "gem": 0.252284,
          "jma": 0.02
        },
        "interceptC": 0.0418,
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
        "spreadBaseC2": 1.7662,
        "spreadScale": 0.2826,
        "cvMaeC": 1.2186,
        "cvRmseC": 1.5209,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.090752,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.326913,
          "meteofrance": 0.130982,
          "gfs": 0.02,
          "gem": 0.371353,
          "jma": 0.02
        },
        "interceptC": 0.1932,
        "diurnalHarmonicsC": [
          -0.0138,
          -0.078,
          0,
          0
        ],
        "driverBetasC": [
          -0.0372,
          0.02,
          0.0477,
          0.0502
        ],
        "spreadBaseC2": 0.8978,
        "spreadScale": 0.9679,
        "cvMaeC": 1.331,
        "cvRmseC": 1.6988,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.16628,
          "ecmwfAifs": 0.08576,
          "icon": 0.022441,
          "ukmo": 0.259017,
          "meteofrance": 0.113864,
          "gfs": 0.02,
          "gem": 0.312638,
          "jma": 0.02
        },
        "interceptC": 0.1817,
        "diurnalHarmonicsC": [
          -0.0246,
          -0.0769,
          0,
          0
        ],
        "driverBetasC": [
          -0.0379,
          0.0148,
          0.0291,
          0.0499
        ],
        "spreadBaseC2": 1.0214,
        "spreadScale": 0.9166,
        "cvMaeC": 1.3423,
        "cvRmseC": 1.7022,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.241809,
          "ecmwfAifs": 0.15152,
          "icon": 0.024883,
          "ukmo": 0.191121,
          "meteofrance": 0.096747,
          "gfs": 0.02,
          "gem": 0.25392,
          "jma": 0.02
        },
        "interceptC": 0.1702,
        "diurnalHarmonicsC": [
          -0.0354,
          -0.0759,
          0,
          0
        ],
        "driverBetasC": [
          -0.0387,
          0.0096,
          0.0106,
          0.0495
        ],
        "spreadBaseC2": 1.1451,
        "spreadScale": 0.8654,
        "cvMaeC": 1.3537,
        "cvRmseC": 1.7055,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.241894,
        "ecmwfAifs": 0.08293,
        "icon": 0.213997,
        "ukmo": 0.125998,
        "meteofrance": 0.159806,
        "gfs": 0.066958,
        "gem": 0.056278,
        "jma": 0.052139
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243454,
        "ecmwfAifs": 0.06967,
        "icon": 0.218496,
        "ukmo": 0.128173,
        "meteofrance": 0.164047,
        "gfs": 0.066447,
        "gem": 0.05882,
        "jma": 0.050893
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.229824,
        "ecmwfAifs": 0.078959,
        "icon": 0.234323,
        "ukmo": 0.112793,
        "meteofrance": 0.163992,
        "gfs": 0.068161,
        "gem": 0.05582,
        "jma": 0.056128
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.230345,
        "ecmwfAifs": 0.080324,
        "icon": 0.227859,
        "ukmo": 0.120274,
        "meteofrance": 0.159783,
        "gfs": 0.067706,
        "gem": 0.058494,
        "jma": 0.055215
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.223961,
    "ecmwfAifs": 0.071441,
    "icon": 0.270436,
    "ukmo": 0.133357,
    "meteofrance": 0.111131,
    "gfs": 0.110294,
    "gem": 0.03969,
    "jma": 0.03969
  },
  "pressureWeights": {
    "ecmwfIfs": 0.306828,
    "ecmwfAifs": 0.148023,
    "icon": 0.166648,
    "ukmo": 0.166845,
    "meteofrance": 0.077907,
    "gfs": 0.055843,
    "gem": 0.038953,
    "jma": 0.038953
  }
} as const;

export default PROVINCE_CALIBRATION_TR_05;
