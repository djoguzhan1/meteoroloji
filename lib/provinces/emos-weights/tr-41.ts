import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_41: ProvinceCalibrationBundle = {
  "provinceCode": "TR-41",
  "provinceName": "Kocaeli",
  "plateNumber": 41,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "LTBQ0",
  "stationLat": 40.7333,
  "stationLon": 30.0833,
  "stationElevationM": 50,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17307,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.464417,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.415583,
          "jma": 0.02
        },
        "intercept": 0.0174,
        "betaDrivers": [
          -0.2222,
          -0.2075,
          -1.3459,
          -0.1531,
          0.6305,
          -0.3098
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.6016,
        "spreadScale": 2.0878,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.196792,
            "ecmwfAifs": 0.091439,
            "icon": 0.219997,
            "ukmo": 0.128947,
            "meteofrance": 0.175517,
            "gfs": 0.073278,
            "gem": 0.05419,
            "jma": 0.05984
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7025,
          "logisticSlope": 4.7555,
          "wetFractionWeight": 3.1965,
          "powerEta": 0.68,
          "rawBrier": 0.07129,
          "calibratedBrier": 0.06887
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.936,
          "rawIfsRmseC": 2.7424,
          "rawEqualMaeC": 2.1436,
          "rawEqualRmseC": 3.0913,
          "cvSimplexMaeC": 1.8589,
          "cvCalibratedMaeC": 1.7544,
          "cvCalibratedRmseC": 2.3973
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.453849,
          "ecmwfAifs": 0.081995,
          "icon": 0.151517,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.232639,
          "jma": 0.02
        },
        "intercept": -0.0138,
        "betaDrivers": [
          -0.1445,
          -0.1846,
          -0.4444,
          -0.0763,
          0.2544,
          -0.1347
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 3.1464,
        "spreadScale": 2.2,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.261416,
            "ecmwfAifs": 0.253404,
            "icon": 0.141081,
            "ukmo": 0.119949,
            "meteofrance": 0.045442,
            "gfs": 0.073845,
            "gem": 0.05461,
            "jma": 0.050253
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5881,
          "logisticSlope": 4.5546,
          "wetFractionWeight": 3.0235,
          "powerEta": 0.68,
          "rawBrier": 0.07129,
          "calibratedBrier": 0.07129
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.936,
          "rawIfsRmseC": 2.7424,
          "rawEqualMaeC": 2.1436,
          "rawEqualRmseC": 3.0913,
          "cvSimplexMaeC": 1.8843,
          "cvCalibratedMaeC": 1.8157,
          "cvCalibratedRmseC": 2.5667
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.284197,
          "ecmwfAifs": 0.02,
          "icon": 0.481328,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.134475,
          "jma": 0.02
        },
        "intercept": -0.6502,
        "betaDrivers": [
          -0.1138,
          -1.2008,
          -1.6299,
          -0.4145,
          0.548,
          -0.0647
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 3.2135,
        "spreadScale": 1.338,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.220393,
            "ecmwfAifs": 0.07413,
            "icon": 0.217126,
            "ukmo": 0.126023,
            "meteofrance": 0.177382,
            "gfs": 0.070445,
            "gem": 0.057355,
            "jma": 0.057146
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.512,
          "logisticSlope": 3.4862,
          "wetFractionWeight": 3.4792,
          "powerEta": 0.68,
          "rawBrier": 0.06178,
          "calibratedBrier": 0.06035
        },
        "verification": {
          "sampleHours": 4192,
          "rawIfsMaeC": 2.1972,
          "rawIfsRmseC": 3.0225,
          "rawEqualMaeC": 2.3895,
          "rawEqualRmseC": 3.3217,
          "cvSimplexMaeC": 2.1646,
          "cvCalibratedMaeC": 1.8751,
          "cvCalibratedRmseC": 2.4146
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.393854,
          "ecmwfAifs": 0.070426,
          "icon": 0.289352,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.166368,
          "jma": 0.02
        },
        "intercept": -0.4679,
        "betaDrivers": [
          -0.1183,
          -0.6368,
          -0.5186,
          -0.1627,
          0.2333,
          -0.1468
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 4.1661,
        "spreadScale": 1.2217,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.300003,
            "ecmwfAifs": 0.210514,
            "icon": 0.142682,
            "ukmo": 0.120126,
            "meteofrance": 0.045527,
            "gfs": 0.072745,
            "gem": 0.059227,
            "jma": 0.049176
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5038,
          "logisticSlope": 4.3564,
          "wetFractionWeight": 2.7013,
          "powerEta": 0.68,
          "rawBrier": 0.06178,
          "calibratedBrier": 0.06178
        },
        "verification": {
          "sampleHours": 4192,
          "rawIfsMaeC": 2.1972,
          "rawIfsRmseC": 3.0225,
          "rawEqualMaeC": 2.3895,
          "rawEqualRmseC": 3.3217,
          "cvSimplexMaeC": 2.1433,
          "cvCalibratedMaeC": 1.9626,
          "cvCalibratedRmseC": 2.5891
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.745492,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.134508,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.8034,
        "betaDrivers": [
          -0.36,
          -1.1365,
          -0.9906,
          -0.5283,
          0.7148,
          0.2786
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 3.1523,
        "spreadScale": 0.8122,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232304,
            "ecmwfAifs": 0.088734,
            "icon": 0.21438,
            "ukmo": 0.130098,
            "meteofrance": 0.1541,
            "gfs": 0.069685,
            "gem": 0.058708,
            "jma": 0.051991
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.644,
          "logisticSlope": 4.6769,
          "wetFractionWeight": 2.5777,
          "powerEta": 0.68,
          "rawBrier": 0.04552,
          "calibratedBrier": 0.04552
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.2982,
          "rawIfsRmseC": 3.1524,
          "rawEqualMaeC": 2.2117,
          "rawEqualRmseC": 3.0678,
          "cvSimplexMaeC": 1.9107,
          "cvCalibratedMaeC": 1.6373,
          "cvCalibratedRmseC": 2.1252
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.214514,
          "ecmwfAifs": 0.026275,
          "icon": 0.46905,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.210161,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.7004,
        "betaDrivers": [
          -0.2691,
          -0.5846,
          -0.3838,
          -0.2139,
          0.3198,
          -0.0635
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 3.6394,
        "spreadScale": 0.8411,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.298849,
            "ecmwfAifs": 0.238144,
            "icon": 0.133139,
            "ukmo": 0.117199,
            "meteofrance": 0.045086,
            "gfs": 0.068007,
            "gem": 0.057294,
            "jma": 0.042282
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.7203,
          "logisticSlope": 5.2272,
          "wetFractionWeight": 2.2039,
          "powerEta": 0.68,
          "rawBrier": 0.04552,
          "calibratedBrier": 0.04449
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.2982,
          "rawIfsRmseC": 3.1524,
          "rawEqualMaeC": 2.2117,
          "rawEqualRmseC": 3.0678,
          "cvSimplexMaeC": 1.9684,
          "cvCalibratedMaeC": 1.73,
          "cvCalibratedRmseC": 2.2824
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.068955,
          "ecmwfAifs": 0.02,
          "icon": 0.721077,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.109968,
          "jma": 0.02
        },
        "intercept": -0.1834,
        "betaDrivers": [
          -0.0445,
          -1.1473,
          -1.37,
          -0.1749,
          0.6441,
          -0.5804
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 3.0679,
        "spreadScale": 1.4779,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.221163,
            "ecmwfAifs": 0.09167,
            "icon": 0.207014,
            "ukmo": 0.124438,
            "meteofrance": 0.164651,
            "gfs": 0.074441,
            "gem": 0.057251,
            "jma": 0.059372
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.3523,
          "logisticSlope": 4.3836,
          "wetFractionWeight": 2.6715,
          "powerEta": 0.68,
          "rawBrier": 0.06669,
          "calibratedBrier": 0.06669
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 2.3325,
          "rawIfsRmseC": 3.0751,
          "rawEqualMaeC": 2.4929,
          "rawEqualRmseC": 3.2854,
          "cvSimplexMaeC": 2.1904,
          "cvCalibratedMaeC": 1.7851,
          "cvCalibratedRmseC": 2.3012
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.348601,
          "ecmwfAifs": 0.071353,
          "icon": 0.339389,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.160657,
          "jma": 0.02
        },
        "intercept": -0.3682,
        "betaDrivers": [
          -0.1351,
          -0.688,
          -0.5495,
          -0.0769,
          0.2908,
          -0.3391
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 3.4777,
        "spreadScale": 1.7195,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.286539,
            "ecmwfAifs": 0.247776,
            "icon": 0.12948,
            "ukmo": 0.112899,
            "meteofrance": 0.04524,
            "gfs": 0.073166,
            "gem": 0.056271,
            "jma": 0.048629
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4597,
          "logisticSlope": 4.5055,
          "wetFractionWeight": 2.5835,
          "powerEta": 0.68,
          "rawBrier": 0.06669,
          "calibratedBrier": 0.06669
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 2.3325,
          "rawIfsRmseC": 3.0751,
          "rawEqualMaeC": 2.4929,
          "rawEqualRmseC": 3.2854,
          "cvSimplexMaeC": 2.2339,
          "cvCalibratedMaeC": 1.9154,
          "cvCalibratedRmseC": 2.4557
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.464417,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.415583,
          "jma": 0.02
        },
        "interceptC": 0.0174,
        "diurnalHarmonicsC": [
          -0.2222,
          -0.2075,
          0,
          0
        ],
        "driverBetasC": [
          -1.3459,
          -0.3098,
          -0.1531,
          0.6305
        ],
        "spreadBaseC2": 2.6016,
        "spreadScale": 2.0878,
        "cvMaeC": 1.7544,
        "cvRmseC": 2.3973,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.459134,
          "ecmwfAifs": 0.050997,
          "icon": 0.085758,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.324111,
          "jma": 0.02
        },
        "interceptC": 0.0018,
        "diurnalHarmonicsC": [
          -0.1834,
          -0.1961,
          0,
          0
        ],
        "driverBetasC": [
          -0.8952,
          -0.2223,
          -0.1147,
          0.4425
        ],
        "spreadBaseC2": 2.874,
        "spreadScale": 2.1439,
        "cvMaeC": 1.7851,
        "cvRmseC": 2.482,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.453849,
          "ecmwfAifs": 0.081995,
          "icon": 0.151517,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.232639,
          "jma": 0.02
        },
        "interceptC": -0.0138,
        "diurnalHarmonicsC": [
          -0.1445,
          -0.1846,
          0,
          0
        ],
        "driverBetasC": [
          -0.4444,
          -0.1347,
          -0.0763,
          0.2544
        ],
        "spreadBaseC2": 3.1464,
        "spreadScale": 2.2,
        "cvMaeC": 1.8157,
        "cvRmseC": 2.5667,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.284197,
          "ecmwfAifs": 0.02,
          "icon": 0.481328,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.134475,
          "jma": 0.02
        },
        "interceptC": -0.6502,
        "diurnalHarmonicsC": [
          -0.1138,
          -1.2008,
          0,
          0
        ],
        "driverBetasC": [
          -1.6299,
          -0.0647,
          -0.4145,
          0.548
        ],
        "spreadBaseC2": 3.2135,
        "spreadScale": 1.338,
        "cvMaeC": 1.8751,
        "cvRmseC": 2.4146,
        "sampleHours": 4192
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.339026,
          "ecmwfAifs": 0.045213,
          "icon": 0.385339,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.150422,
          "jma": 0.02
        },
        "interceptC": -0.5591,
        "diurnalHarmonicsC": [
          -0.1161,
          -0.9188,
          0,
          0
        ],
        "driverBetasC": [
          -1.0742,
          -0.1058,
          -0.2886,
          0.3907
        ],
        "spreadBaseC2": 3.6898,
        "spreadScale": 1.2799,
        "cvMaeC": 1.9188,
        "cvRmseC": 2.5019,
        "sampleHours": 4192
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.393854,
          "ecmwfAifs": 0.070426,
          "icon": 0.289352,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.166368,
          "jma": 0.02
        },
        "interceptC": -0.4679,
        "diurnalHarmonicsC": [
          -0.1183,
          -0.6368,
          0,
          0
        ],
        "driverBetasC": [
          -0.5186,
          -0.1468,
          -0.1627,
          0.2333
        ],
        "spreadBaseC2": 4.1661,
        "spreadScale": 1.2217,
        "cvMaeC": 1.9626,
        "cvRmseC": 2.5891,
        "sampleHours": 4192
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.745492,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.134508,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.8034,
        "diurnalHarmonicsC": [
          -0.36,
          -1.1365,
          0,
          0
        ],
        "driverBetasC": [
          -0.9906,
          0.2786,
          -0.5283,
          0.7148
        ],
        "spreadBaseC2": 3.1523,
        "spreadScale": 0.8122,
        "cvMaeC": 1.6373,
        "cvRmseC": 2.1252,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.117257,
          "ecmwfAifs": 0.023137,
          "icon": 0.607272,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.172334,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.7519,
        "diurnalHarmonicsC": [
          -0.3145,
          -0.8606,
          0,
          0
        ],
        "driverBetasC": [
          -0.6872,
          0.1076,
          -0.3711,
          0.5173
        ],
        "spreadBaseC2": 3.3959,
        "spreadScale": 0.8266,
        "cvMaeC": 1.6837,
        "cvRmseC": 2.2038,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.214514,
          "ecmwfAifs": 0.026275,
          "icon": 0.46905,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.210161,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.7004,
        "diurnalHarmonicsC": [
          -0.2691,
          -0.5846,
          0,
          0
        ],
        "driverBetasC": [
          -0.3838,
          -0.0635,
          -0.2139,
          0.3198
        ],
        "spreadBaseC2": 3.6394,
        "spreadScale": 0.8411,
        "cvMaeC": 1.73,
        "cvRmseC": 2.2824,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.068955,
          "ecmwfAifs": 0.02,
          "icon": 0.721077,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.109968,
          "jma": 0.02
        },
        "interceptC": -0.1834,
        "diurnalHarmonicsC": [
          -0.0445,
          -1.1473,
          0,
          0
        ],
        "driverBetasC": [
          -1.37,
          -0.5804,
          -0.1749,
          0.6441
        ],
        "spreadBaseC2": 3.0679,
        "spreadScale": 1.4779,
        "cvMaeC": 1.7851,
        "cvRmseC": 2.3012,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.208778,
          "ecmwfAifs": 0.045677,
          "icon": 0.530232,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.135313,
          "jma": 0.02
        },
        "interceptC": -0.2758,
        "diurnalHarmonicsC": [
          -0.0898,
          -0.9176,
          0,
          0
        ],
        "driverBetasC": [
          -0.9598,
          -0.4597,
          -0.1259,
          0.4675
        ],
        "spreadBaseC2": 3.2728,
        "spreadScale": 1.5987,
        "cvMaeC": 1.8502,
        "cvRmseC": 2.3784,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.348601,
          "ecmwfAifs": 0.071353,
          "icon": 0.339389,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.160657,
          "jma": 0.02
        },
        "interceptC": -0.3682,
        "diurnalHarmonicsC": [
          -0.1351,
          -0.688,
          0,
          0
        ],
        "driverBetasC": [
          -0.5495,
          -0.3391,
          -0.0769,
          0.2908
        ],
        "spreadBaseC2": 3.4777,
        "spreadScale": 1.7195,
        "cvMaeC": 1.9154,
        "cvRmseC": 2.4557,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.196792,
        "ecmwfAifs": 0.091439,
        "icon": 0.219997,
        "ukmo": 0.128947,
        "meteofrance": 0.175517,
        "gfs": 0.073278,
        "gem": 0.05419,
        "jma": 0.05984
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.220393,
        "ecmwfAifs": 0.07413,
        "icon": 0.217126,
        "ukmo": 0.126023,
        "meteofrance": 0.177382,
        "gfs": 0.070445,
        "gem": 0.057355,
        "jma": 0.057146
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.232304,
        "ecmwfAifs": 0.088734,
        "icon": 0.21438,
        "ukmo": 0.130098,
        "meteofrance": 0.1541,
        "gfs": 0.069685,
        "gem": 0.058708,
        "jma": 0.051991
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.221163,
        "ecmwfAifs": 0.09167,
        "icon": 0.207014,
        "ukmo": 0.124438,
        "meteofrance": 0.164651,
        "gfs": 0.074441,
        "gem": 0.057251,
        "jma": 0.059372
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.208397,
    "ecmwfAifs": 0.068255,
    "icon": 0.276254,
    "ukmo": 0.158156,
    "meteofrance": 0.106175,
    "gfs": 0.106923,
    "gem": 0.03792,
    "jma": 0.03792
  },
  "pressureWeights": {
    "ecmwfIfs": 0.320162,
    "ecmwfAifs": 0.146743,
    "icon": 0.130156,
    "ukmo": 0.173018,
    "meteofrance": 0.077233,
    "gfs": 0.075454,
    "gem": 0.038617,
    "jma": 0.038617
  }
} as const;

export default PROVINCE_CALIBRATION_TR_41;
