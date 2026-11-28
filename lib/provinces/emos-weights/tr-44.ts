import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_44: ProvinceCalibrationBundle = {
  "provinceCode": "TR-44",
  "provinceName": "Malatya",
  "plateNumber": 44,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "LTAO0",
  "stationLat": 38.3537,
  "stationLon": 38.2539,
  "stationElevationM": 919,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17297,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.231927,
          "ecmwfAifs": 0.033283,
          "icon": 0.362184,
          "ukmo": 0.02,
          "meteofrance": 0.148616,
          "gfs": 0.02,
          "gem": 0.16399,
          "jma": 0.02
        },
        "intercept": 0.0501,
        "betaDrivers": [
          -0.0321,
          0.0121,
          -0.3253,
          -0.0743,
          -0.0166,
          0.0149
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9263,
        "spreadScale": 0.2487,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.266064,
            "ecmwfAifs": 0.082473,
            "icon": 0.211083,
            "ukmo": 0.114451,
            "meteofrance": 0.150488,
            "gfs": 0.063173,
            "gem": 0.053522,
            "jma": 0.058746
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4148,
          "logisticSlope": 5.1705,
          "wetFractionWeight": 3.8202,
          "powerEta": 0.68,
          "rawBrier": 0.03364,
          "calibratedBrier": 0.03118
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2296,
          "rawIfsRmseC": 1.6327,
          "rawEqualMaeC": 1.0556,
          "rawEqualRmseC": 1.3561,
          "cvSimplexMaeC": 0.9635,
          "cvCalibratedMaeC": 0.96,
          "cvCalibratedRmseC": 1.2331
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.28673,
          "ecmwfAifs": 0.100145,
          "icon": 0.222601,
          "ukmo": 0.076697,
          "meteofrance": 0.109616,
          "gfs": 0.02,
          "gem": 0.164211,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.054,
          -0.0268,
          -0.1599,
          -0.0173,
          0.0089,
          0.0112
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9183,
        "spreadScale": 0.2557,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.340669,
            "ecmwfAifs": 0.220301,
            "icon": 0.130477,
            "ukmo": 0.10262,
            "meteofrance": 0.045029,
            "gfs": 0.061363,
            "gem": 0.051989,
            "jma": 0.047552
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5158,
          "logisticSlope": 5.1927,
          "wetFractionWeight": 3.3728,
          "powerEta": 0.68,
          "rawBrier": 0.03364,
          "calibratedBrier": 0.03078
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.2296,
          "rawIfsRmseC": 1.6327,
          "rawEqualMaeC": 1.0556,
          "rawEqualRmseC": 1.3561,
          "cvSimplexMaeC": 0.9642,
          "cvCalibratedMaeC": 0.9585,
          "cvCalibratedRmseC": 1.2368
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.76921,
          "ecmwfAifs": 0.02,
          "icon": 0.062105,
          "ukmo": 0.02,
          "meteofrance": 0.056629,
          "gfs": 0.02,
          "gem": 0.032056,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1463,
          0.0394,
          0.0528,
          0.0472,
          -0.0149,
          -0.0155
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7222,
        "spreadScale": 0.5942,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251445,
            "ecmwfAifs": 0.071543,
            "icon": 0.221552,
            "ukmo": 0.123999,
            "meteofrance": 0.14772,
            "gfs": 0.067879,
            "gem": 0.055693,
            "jma": 0.060169
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8082,
          "logisticSlope": 2.6878,
          "wetFractionWeight": 3.0408,
          "powerEta": 0.68,
          "rawBrier": 0.05548,
          "calibratedBrier": 0.04917
        },
        "verification": {
          "sampleHours": 4186,
          "rawIfsMaeC": 1.1347,
          "rawIfsRmseC": 1.5478,
          "rawEqualMaeC": 1.161,
          "rawEqualRmseC": 1.4745,
          "cvSimplexMaeC": 1.0805,
          "cvCalibratedMaeC": 1.0767,
          "cvCalibratedRmseC": 1.4497
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.435213,
          "ecmwfAifs": 0.07746,
          "icon": 0.161588,
          "ukmo": 0.066179,
          "meteofrance": 0.108481,
          "gfs": 0.025983,
          "gem": 0.105096,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0956,
          -0.0109,
          0.0271,
          0.0049,
          -0.0198,
          -0.1965
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.0004,
        "spreadScale": 0.4593,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.330619,
            "ecmwfAifs": 0.196251,
            "icon": 0.140634,
            "ukmo": 0.114174,
            "meteofrance": 0.045045,
            "gfs": 0.067709,
            "gem": 0.055553,
            "jma": 0.050015
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8575,
          "logisticSlope": 2.6312,
          "wetFractionWeight": 3.2511,
          "powerEta": 0.68,
          "rawBrier": 0.05548,
          "calibratedBrier": 0.04825
        },
        "verification": {
          "sampleHours": 4186,
          "rawIfsMaeC": 1.1347,
          "rawIfsRmseC": 1.5478,
          "rawEqualMaeC": 1.161,
          "rawEqualRmseC": 1.4745,
          "cvSimplexMaeC": 1.1221,
          "cvCalibratedMaeC": 1.1153,
          "cvCalibratedRmseC": 1.4382
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
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
        "spreadBaseC2": 0.683,
        "spreadScale": 0.5901,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227482,
            "ecmwfAifs": 0.079073,
            "icon": 0.220565,
            "ukmo": 0.128505,
            "meteofrance": 0.164371,
            "gfs": 0.070245,
            "gem": 0.051061,
            "jma": 0.058698
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.9974,
          "logisticSlope": 1.3711,
          "wetFractionWeight": 0.8601,
          "powerEta": 0.68,
          "rawBrier": 0.00378,
          "calibratedBrier": 0.00254
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.1647,
          "rawIfsRmseC": 1.6013,
          "rawEqualMaeC": 1.1836,
          "rawEqualRmseC": 1.4966,
          "cvSimplexMaeC": 1.1277,
          "cvCalibratedMaeC": 1.1277,
          "cvCalibratedRmseC": 1.5364
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
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
        "spreadBaseC2": 0.683,
        "spreadScale": 0.5901,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.302457,
            "ecmwfAifs": 0.219333,
            "icon": 0.141575,
            "ukmo": 0.119647,
            "meteofrance": 0.045293,
            "gfs": 0.070853,
            "gem": 0.051503,
            "jma": 0.049339
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.0006,
          "logisticSlope": 1.4075,
          "wetFractionWeight": 0.8862,
          "powerEta": 0.68,
          "rawBrier": 0.00378,
          "calibratedBrier": 0.00254
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.1647,
          "rawIfsRmseC": 1.6013,
          "rawEqualMaeC": 1.1836,
          "rawEqualRmseC": 1.4966,
          "cvSimplexMaeC": 1.1277,
          "cvCalibratedMaeC": 1.1277,
          "cvCalibratedRmseC": 1.5364
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.739219,
          "ecmwfAifs": 0.032753,
          "icon": 0.086409,
          "ukmo": 0.051146,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.030473,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0876,
          -0.0145,
          -0.0118,
          -0.0144,
          -0.0136,
          0.0246
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.7586,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239418,
            "ecmwfAifs": 0.076113,
            "icon": 0.229279,
            "ukmo": 0.11554,
            "meteofrance": 0.158761,
            "gfs": 0.067366,
            "gem": 0.053732,
            "jma": 0.059791
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7634,
          "logisticSlope": 4.3928,
          "wetFractionWeight": 3.539,
          "powerEta": 0.68,
          "rawBrier": 0.01622,
          "calibratedBrier": 0.01622
        },
        "verification": {
          "sampleHours": 4351,
          "rawIfsMaeC": 1.2049,
          "rawIfsRmseC": 1.7953,
          "rawEqualMaeC": 1.1184,
          "rawEqualRmseC": 1.5312,
          "cvSimplexMaeC": 1.1264,
          "cvCalibratedMaeC": 1.1247,
          "cvCalibratedRmseC": 1.6644
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.605156,
          "ecmwfAifs": 0.073181,
          "icon": 0.108893,
          "ukmo": 0.081211,
          "meteofrance": 0.033354,
          "gfs": 0.02,
          "gem": 0.058205,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0703,
          -0.0141,
          -0.0031,
          -0.016,
          -0.0117,
          0.0085
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.7218,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.317725,
            "ecmwfAifs": 0.210722,
            "icon": 0.14689,
            "ukmo": 0.107372,
            "meteofrance": 0.045213,
            "gfs": 0.067821,
            "gem": 0.054095,
            "jma": 0.050162
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9126,
          "logisticSlope": 4.0955,
          "wetFractionWeight": 3.7105,
          "powerEta": 0.68,
          "rawBrier": 0.01622,
          "calibratedBrier": 0.01558
        },
        "verification": {
          "sampleHours": 4351,
          "rawIfsMaeC": 1.2049,
          "rawIfsRmseC": 1.7953,
          "rawEqualMaeC": 1.1184,
          "rawEqualRmseC": 1.5312,
          "cvSimplexMaeC": 1.1087,
          "cvCalibratedMaeC": 1.108,
          "cvCalibratedRmseC": 1.6163
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.231927,
          "ecmwfAifs": 0.033283,
          "icon": 0.362184,
          "ukmo": 0.02,
          "meteofrance": 0.148616,
          "gfs": 0.02,
          "gem": 0.16399,
          "jma": 0.02
        },
        "interceptC": 0.0501,
        "diurnalHarmonicsC": [
          -0.0321,
          0.0121,
          0,
          0
        ],
        "driverBetasC": [
          -0.3253,
          0.0149,
          -0.0743,
          -0.0166
        ],
        "spreadBaseC2": 0.9263,
        "spreadScale": 0.2487,
        "cvMaeC": 0.96,
        "cvRmseC": 1.2331,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.259328,
          "ecmwfAifs": 0.066714,
          "icon": 0.292393,
          "ukmo": 0.048349,
          "meteofrance": 0.129116,
          "gfs": 0.02,
          "gem": 0.1641,
          "jma": 0.02
        },
        "interceptC": 0.025,
        "diurnalHarmonicsC": [
          -0.043,
          -0.0074,
          0,
          0
        ],
        "driverBetasC": [
          -0.2426,
          0.013,
          -0.0458,
          -0.0039
        ],
        "spreadBaseC2": 0.9223,
        "spreadScale": 0.2522,
        "cvMaeC": 0.9592,
        "cvRmseC": 1.2349,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.28673,
          "ecmwfAifs": 0.100145,
          "icon": 0.222601,
          "ukmo": 0.076697,
          "meteofrance": 0.109616,
          "gfs": 0.02,
          "gem": 0.164211,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.054,
          -0.0268,
          0,
          0
        ],
        "driverBetasC": [
          -0.1599,
          0.0112,
          -0.0173,
          0.0089
        ],
        "spreadBaseC2": 0.9183,
        "spreadScale": 0.2557,
        "cvMaeC": 0.9585,
        "cvRmseC": 1.2368,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.76921,
          "ecmwfAifs": 0.02,
          "icon": 0.062105,
          "ukmo": 0.02,
          "meteofrance": 0.056629,
          "gfs": 0.02,
          "gem": 0.032056,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1463,
          0.0394,
          0,
          0
        ],
        "driverBetasC": [
          0.0528,
          -0.0155,
          0.0472,
          -0.0149
        ],
        "spreadBaseC2": 0.7222,
        "spreadScale": 0.5942,
        "cvMaeC": 1.0767,
        "cvRmseC": 1.4497,
        "sampleHours": 4186
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.602211,
          "ecmwfAifs": 0.04873,
          "icon": 0.111847,
          "ukmo": 0.04309,
          "meteofrance": 0.082555,
          "gfs": 0.022991,
          "gem": 0.068576,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.121,
          0.0142,
          0,
          0
        ],
        "driverBetasC": [
          0.0399,
          -0.106,
          0.0261,
          -0.0174
        ],
        "spreadBaseC2": 0.8613,
        "spreadScale": 0.5267,
        "cvMaeC": 1.096,
        "cvRmseC": 1.444,
        "sampleHours": 4186
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.435213,
          "ecmwfAifs": 0.07746,
          "icon": 0.161588,
          "ukmo": 0.066179,
          "meteofrance": 0.108481,
          "gfs": 0.025983,
          "gem": 0.105096,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0956,
          -0.0109,
          0,
          0
        ],
        "driverBetasC": [
          0.0271,
          -0.1965,
          0.0049,
          -0.0198
        ],
        "spreadBaseC2": 1.0004,
        "spreadScale": 0.4593,
        "cvMaeC": 1.1153,
        "cvRmseC": 1.4382,
        "sampleHours": 4186
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
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
        "spreadBaseC2": 0.683,
        "spreadScale": 0.5901,
        "cvMaeC": 1.1277,
        "cvRmseC": 1.5364,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
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
        "spreadBaseC2": 0.683,
        "spreadScale": 0.5901,
        "cvMaeC": 1.1277,
        "cvRmseC": 1.5364,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
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
        "spreadBaseC2": 0.683,
        "spreadScale": 0.5901,
        "cvMaeC": 1.1277,
        "cvRmseC": 1.5364,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.739219,
          "ecmwfAifs": 0.032753,
          "icon": 0.086409,
          "ukmo": 0.051146,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.030473,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0876,
          -0.0145,
          0,
          0
        ],
        "driverBetasC": [
          -0.0118,
          0.0246,
          -0.0144,
          -0.0136
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.7586,
        "cvMaeC": 1.1247,
        "cvRmseC": 1.6644,
        "sampleHours": 4351
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.672187,
          "ecmwfAifs": 0.052967,
          "icon": 0.097651,
          "ukmo": 0.066179,
          "meteofrance": 0.026677,
          "gfs": 0.02,
          "gem": 0.044339,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0789,
          -0.0143,
          0,
          0
        ],
        "driverBetasC": [
          -0.0075,
          0.0166,
          -0.0152,
          -0.0126
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.7402,
        "cvMaeC": 1.1164,
        "cvRmseC": 1.6404,
        "sampleHours": 4351
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.605156,
          "ecmwfAifs": 0.073181,
          "icon": 0.108893,
          "ukmo": 0.081211,
          "meteofrance": 0.033354,
          "gfs": 0.02,
          "gem": 0.058205,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0703,
          -0.0141,
          0,
          0
        ],
        "driverBetasC": [
          -0.0031,
          0.0085,
          -0.016,
          -0.0117
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.7218,
        "cvMaeC": 1.108,
        "cvRmseC": 1.6163,
        "sampleHours": 4351
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.266064,
        "ecmwfAifs": 0.082473,
        "icon": 0.211083,
        "ukmo": 0.114451,
        "meteofrance": 0.150488,
        "gfs": 0.063173,
        "gem": 0.053522,
        "jma": 0.058746
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.251445,
        "ecmwfAifs": 0.071543,
        "icon": 0.221552,
        "ukmo": 0.123999,
        "meteofrance": 0.14772,
        "gfs": 0.067879,
        "gem": 0.055693,
        "jma": 0.060169
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.227482,
        "ecmwfAifs": 0.079073,
        "icon": 0.220565,
        "ukmo": 0.128505,
        "meteofrance": 0.164371,
        "gfs": 0.070245,
        "gem": 0.051061,
        "jma": 0.058698
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.239418,
        "ecmwfAifs": 0.076113,
        "icon": 0.229279,
        "ukmo": 0.11554,
        "meteofrance": 0.158761,
        "gfs": 0.067366,
        "gem": 0.053732,
        "jma": 0.059791
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.241658,
    "ecmwfAifs": 0.070512,
    "icon": 0.226841,
    "ukmo": 0.175735,
    "meteofrance": 0.109685,
    "gfs": 0.097223,
    "gem": 0.039173,
    "jma": 0.039173
  },
  "pressureWeights": {
    "ecmwfIfs": 0.377555,
    "ecmwfAifs": 0.136489,
    "icon": 0.135669,
    "ukmo": 0.143217,
    "meteofrance": 0.071836,
    "gfs": 0.063398,
    "gem": 0.035918,
    "jma": 0.035918
  }
} as const;

export default PROVINCE_CALIBRATION_TR_44;
