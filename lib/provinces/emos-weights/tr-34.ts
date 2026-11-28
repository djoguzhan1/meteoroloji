import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_34: ProvinceCalibrationBundle = {
  "provinceCode": "TR-34",
  "provinceName": "İstanbul",
  "plateNumber": 34,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17060",
  "stationLat": 40.9667,
  "stationLon": 28.8167,
  "stationElevationM": 48,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.12084,
          "ecmwfAifs": 0.02,
          "icon": 0.365609,
          "ukmo": 0.165748,
          "meteofrance": 0.02,
          "gfs": 0.197528,
          "gem": 0.02,
          "jma": 0.090275
        },
        "intercept": 0.4148,
        "betaDrivers": [
          0.0795,
          -0.0832,
          -0.3126,
          0.0378,
          -0.2164,
          -0.2021
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4874,
        "spreadScale": 0.2967,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243701,
            "ecmwfAifs": 0.087721,
            "icon": 0.212708,
            "ukmo": 0.116281,
            "meteofrance": 0.161885,
            "gfs": 0.064751,
            "gem": 0.054276,
            "jma": 0.058677
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8417,
          "logisticSlope": 3.4848,
          "wetFractionWeight": 3.351,
          "powerEta": 0.68,
          "rawBrier": 0.05833,
          "calibratedBrier": 0.05752
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 0.9317,
          "rawIfsRmseC": 1.1973,
          "rawEqualMaeC": 0.7662,
          "rawEqualRmseC": 0.9972,
          "cvSimplexMaeC": 0.7185,
          "cvCalibratedMaeC": 0.6841,
          "cvCalibratedRmseC": 0.9072
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.257764,
          "ecmwfAifs": 0.241651,
          "icon": 0.169219,
          "ukmo": 0.123152,
          "meteofrance": 0.02,
          "gfs": 0.105725,
          "gem": 0.02,
          "jma": 0.062489
        },
        "intercept": 0.2935,
        "betaDrivers": [
          0.0108,
          -0.0712,
          -0.0898,
          0.0297,
          -0.1228,
          -0.0491
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5302,
        "spreadScale": 0.2885,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315201,
            "ecmwfAifs": 0.236698,
            "icon": 0.132815,
            "ukmo": 0.105319,
            "meteofrance": 0.0452,
            "gfs": 0.063534,
            "gem": 0.053255,
            "jma": 0.047978
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9201,
          "logisticSlope": 3.6982,
          "wetFractionWeight": 3.1542,
          "powerEta": 0.68,
          "rawBrier": 0.05833,
          "calibratedBrier": 0.05649
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 0.9317,
          "rawIfsRmseC": 1.1973,
          "rawEqualMaeC": 0.7662,
          "rawEqualRmseC": 0.9972,
          "cvSimplexMaeC": 0.739,
          "cvCalibratedMaeC": 0.7003,
          "cvCalibratedRmseC": 0.9255
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.072044,
          "ecmwfAifs": 0.02,
          "icon": 0.273201,
          "ukmo": 0.242336,
          "meteofrance": 0.02725,
          "gfs": 0.257768,
          "gem": 0.051455,
          "jma": 0.055946
        },
        "intercept": 0.3201,
        "betaDrivers": [
          0.2467,
          -0.156,
          -0.1086,
          -0.3268,
          0.0002,
          -0.1555
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6255,
        "spreadScale": 0.2185,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23852,
            "ecmwfAifs": 0.073838,
            "icon": 0.222399,
            "ukmo": 0.121618,
            "meteofrance": 0.161815,
            "gfs": 0.067169,
            "gem": 0.056841,
            "jma": 0.0578
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.189,
          "logisticSlope": 2.7035,
          "wetFractionWeight": 3.9043,
          "powerEta": 0.68,
          "rawBrier": 0.03857,
          "calibratedBrier": 0.03404
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2376,
          "rawIfsRmseC": 1.5604,
          "rawEqualMaeC": 0.8996,
          "rawEqualRmseC": 1.1451,
          "cvSimplexMaeC": 0.8395,
          "cvCalibratedMaeC": 0.7583,
          "cvCalibratedRmseC": 0.9915
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.216559,
          "ecmwfAifs": 0.123217,
          "icon": 0.166434,
          "ukmo": 0.21427,
          "meteofrance": 0.043913,
          "gfs": 0.14963,
          "gem": 0.02,
          "jma": 0.065977
        },
        "intercept": 0.3463,
        "betaDrivers": [
          0.0814,
          -0.0968,
          -0.0262,
          -0.1926,
          -0.0142,
          -0.0116
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7257,
        "spreadScale": 0.184,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31818,
            "ecmwfAifs": 0.205486,
            "icon": 0.143222,
            "ukmo": 0.113607,
            "meteofrance": 0.045266,
            "gfs": 0.067973,
            "gem": 0.057522,
            "jma": 0.048744
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2021,
          "logisticSlope": 3.0151,
          "wetFractionWeight": 3.7544,
          "powerEta": 0.68,
          "rawBrier": 0.03857,
          "calibratedBrier": 0.03413
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2376,
          "rawIfsRmseC": 1.5604,
          "rawEqualMaeC": 0.8996,
          "rawEqualRmseC": 1.1451,
          "cvSimplexMaeC": 0.8701,
          "cvCalibratedMaeC": 0.779,
          "cvCalibratedRmseC": 1.0131
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.057502,
          "ecmwfAifs": 0.02,
          "icon": 0.194601,
          "ukmo": 0.389736,
          "meteofrance": 0.056424,
          "gfs": 0.241737,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.1469,
        "betaDrivers": [
          0.2369,
          -0.3594,
          -0.0327,
          -0.5299,
          0.353,
          0.1765
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.4678,
        "spreadScale": 0.2931,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.233796,
            "ecmwfAifs": 0.078996,
            "icon": 0.221679,
            "ukmo": 0.122005,
            "meteofrance": 0.159173,
            "gfs": 0.06472,
            "gem": 0.061296,
            "jma": 0.058335
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1085,
          "logisticSlope": 3.9145,
          "wetFractionWeight": 2.6265,
          "powerEta": 0.68,
          "rawBrier": 0.01004,
          "calibratedBrier": 0.00858
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.1594,
          "rawIfsRmseC": 1.4394,
          "rawEqualMaeC": 1.0679,
          "rawEqualRmseC": 1.2749,
          "cvSimplexMaeC": 0.8693,
          "cvCalibratedMaeC": 0.6571,
          "cvCalibratedRmseC": 0.9018
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.245794,
          "ecmwfAifs": 0.02,
          "icon": 0.123211,
          "ukmo": 0.287513,
          "meteofrance": 0.067288,
          "gfs": 0.216194,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.2499,
        "betaDrivers": [
          0.0927,
          -0.1317,
          -0.0204,
          -0.2649,
          0.2063,
          0.131
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4737,
        "spreadScale": 0.3438,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308524,
            "ecmwfAifs": 0.217479,
            "icon": 0.141224,
            "ukmo": 0.112744,
            "meteofrance": 0.045207,
            "gfs": 0.064792,
            "gem": 0.061364,
            "jma": 0.048666
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.1797,
          "logisticSlope": 3.8964,
          "wetFractionWeight": 3.0809,
          "powerEta": 0.68,
          "rawBrier": 0.01004,
          "calibratedBrier": 0.00826
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.1594,
          "rawIfsRmseC": 1.4394,
          "rawEqualMaeC": 1.0679,
          "rawEqualRmseC": 1.2749,
          "cvSimplexMaeC": 0.8926,
          "cvCalibratedMaeC": 0.6851,
          "cvCalibratedRmseC": 0.937
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.073455,
          "ecmwfAifs": 0.02,
          "icon": 0.420096,
          "ukmo": 0.107692,
          "meteofrance": 0.02,
          "gfs": 0.318757,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.3215,
        "betaDrivers": [
          0.0657,
          -0.151,
          -0.1017,
          -0.0064,
          0.1656,
          -0.1015
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5085,
        "spreadScale": 0.2661,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238491,
            "ecmwfAifs": 0.076771,
            "icon": 0.219462,
            "ukmo": 0.118065,
            "meteofrance": 0.168865,
            "gfs": 0.066762,
            "gem": 0.057545,
            "jma": 0.054039
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2544,
          "logisticSlope": 3.4447,
          "wetFractionWeight": 2.9534,
          "powerEta": 0.68,
          "rawBrier": 0.03793,
          "calibratedBrier": 0.03123
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.0767,
          "rawIfsRmseC": 1.3263,
          "rawEqualMaeC": 0.7961,
          "rawEqualRmseC": 1.0274,
          "cvSimplexMaeC": 0.7252,
          "cvCalibratedMaeC": 0.6759,
          "cvCalibratedRmseC": 0.9057
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.257387,
          "ecmwfAifs": 0.144796,
          "icon": 0.202621,
          "ukmo": 0.155664,
          "meteofrance": 0.022531,
          "gfs": 0.174244,
          "gem": 0.02,
          "jma": 0.022757
        },
        "intercept": 0.4004,
        "betaDrivers": [
          0.0169,
          -0.142,
          -0.0459,
          -0.028,
          0.052,
          -0.0292
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.518,
        "spreadScale": 0.2664,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318092,
            "ecmwfAifs": 0.213619,
            "icon": 0.14131,
            "ukmo": 0.110273,
            "meteofrance": 0.045362,
            "gfs": 0.067552,
            "gem": 0.058226,
            "jma": 0.045566
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.319,
          "logisticSlope": 3.0217,
          "wetFractionWeight": 3.0891,
          "powerEta": 0.68,
          "rawBrier": 0.03793,
          "calibratedBrier": 0.03157
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 1.0767,
          "rawIfsRmseC": 1.3263,
          "rawEqualMaeC": 0.7961,
          "rawEqualRmseC": 1.0274,
          "cvSimplexMaeC": 0.772,
          "cvCalibratedMaeC": 0.6883,
          "cvCalibratedRmseC": 0.9096
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.12084,
          "ecmwfAifs": 0.02,
          "icon": 0.365609,
          "ukmo": 0.165748,
          "meteofrance": 0.02,
          "gfs": 0.197528,
          "gem": 0.02,
          "jma": 0.090275
        },
        "interceptC": 0.4148,
        "diurnalHarmonicsC": [
          0.0795,
          -0.0832,
          0,
          0
        ],
        "driverBetasC": [
          -0.3126,
          -0.2021,
          0.0378,
          -0.2164
        ],
        "spreadBaseC2": 0.4874,
        "spreadScale": 0.2967,
        "cvMaeC": 0.6841,
        "cvRmseC": 0.9072,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.189302,
          "ecmwfAifs": 0.130825,
          "icon": 0.267415,
          "ukmo": 0.14445,
          "meteofrance": 0.02,
          "gfs": 0.151626,
          "gem": 0.02,
          "jma": 0.076382
        },
        "interceptC": 0.3541,
        "diurnalHarmonicsC": [
          0.0452,
          -0.0772,
          0,
          0
        ],
        "driverBetasC": [
          -0.2012,
          -0.1256,
          0.0338,
          -0.1696
        ],
        "spreadBaseC2": 0.5088,
        "spreadScale": 0.2926,
        "cvMaeC": 0.6922,
        "cvRmseC": 0.9163,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.257764,
          "ecmwfAifs": 0.241651,
          "icon": 0.169219,
          "ukmo": 0.123152,
          "meteofrance": 0.02,
          "gfs": 0.105725,
          "gem": 0.02,
          "jma": 0.062489
        },
        "interceptC": 0.2935,
        "diurnalHarmonicsC": [
          0.0108,
          -0.0712,
          0,
          0
        ],
        "driverBetasC": [
          -0.0898,
          -0.0491,
          0.0297,
          -0.1228
        ],
        "spreadBaseC2": 0.5302,
        "spreadScale": 0.2885,
        "cvMaeC": 0.7003,
        "cvRmseC": 0.9255,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.072044,
          "ecmwfAifs": 0.02,
          "icon": 0.273201,
          "ukmo": 0.242336,
          "meteofrance": 0.02725,
          "gfs": 0.257768,
          "gem": 0.051455,
          "jma": 0.055946
        },
        "interceptC": 0.3201,
        "diurnalHarmonicsC": [
          0.2467,
          -0.156,
          0,
          0
        ],
        "driverBetasC": [
          -0.1086,
          -0.1555,
          -0.3268,
          0.0002
        ],
        "spreadBaseC2": 0.6255,
        "spreadScale": 0.2185,
        "cvMaeC": 0.7583,
        "cvRmseC": 0.9915,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.144302,
          "ecmwfAifs": 0.071608,
          "icon": 0.219817,
          "ukmo": 0.228302,
          "meteofrance": 0.035582,
          "gfs": 0.203699,
          "gem": 0.035728,
          "jma": 0.060962
        },
        "interceptC": 0.3332,
        "diurnalHarmonicsC": [
          0.1641,
          -0.1264,
          0,
          0
        ],
        "driverBetasC": [
          -0.0674,
          -0.0835,
          -0.2597,
          -0.007
        ],
        "spreadBaseC2": 0.6756,
        "spreadScale": 0.2012,
        "cvMaeC": 0.7687,
        "cvRmseC": 1.0023,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.216559,
          "ecmwfAifs": 0.123217,
          "icon": 0.166434,
          "ukmo": 0.21427,
          "meteofrance": 0.043913,
          "gfs": 0.14963,
          "gem": 0.02,
          "jma": 0.065977
        },
        "interceptC": 0.3463,
        "diurnalHarmonicsC": [
          0.0814,
          -0.0968,
          0,
          0
        ],
        "driverBetasC": [
          -0.0262,
          -0.0116,
          -0.1926,
          -0.0142
        ],
        "spreadBaseC2": 0.7257,
        "spreadScale": 0.184,
        "cvMaeC": 0.779,
        "cvRmseC": 1.0131,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.057502,
          "ecmwfAifs": 0.02,
          "icon": 0.194601,
          "ukmo": 0.389736,
          "meteofrance": 0.056424,
          "gfs": 0.241737,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1469,
        "diurnalHarmonicsC": [
          0.2369,
          -0.3594,
          0,
          0
        ],
        "driverBetasC": [
          -0.0327,
          0.1765,
          -0.5299,
          0.353
        ],
        "spreadBaseC2": 0.4678,
        "spreadScale": 0.2931,
        "cvMaeC": 0.6571,
        "cvRmseC": 0.9018,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.151648,
          "ecmwfAifs": 0.02,
          "icon": 0.158906,
          "ukmo": 0.338624,
          "meteofrance": 0.061856,
          "gfs": 0.228966,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.1984,
        "diurnalHarmonicsC": [
          0.1648,
          -0.2455,
          0,
          0
        ],
        "driverBetasC": [
          -0.0266,
          0.1537,
          -0.3974,
          0.2797
        ],
        "spreadBaseC2": 0.4708,
        "spreadScale": 0.3185,
        "cvMaeC": 0.6711,
        "cvRmseC": 0.9194,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.245794,
          "ecmwfAifs": 0.02,
          "icon": 0.123211,
          "ukmo": 0.287513,
          "meteofrance": 0.067288,
          "gfs": 0.216194,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.2499,
        "diurnalHarmonicsC": [
          0.0927,
          -0.1317,
          0,
          0
        ],
        "driverBetasC": [
          -0.0204,
          0.131,
          -0.2649,
          0.2063
        ],
        "spreadBaseC2": 0.4737,
        "spreadScale": 0.3438,
        "cvMaeC": 0.6851,
        "cvRmseC": 0.937,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.073455,
          "ecmwfAifs": 0.02,
          "icon": 0.420096,
          "ukmo": 0.107692,
          "meteofrance": 0.02,
          "gfs": 0.318757,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.3215,
        "diurnalHarmonicsC": [
          0.0657,
          -0.151,
          0,
          0
        ],
        "driverBetasC": [
          -0.1017,
          -0.1015,
          -0.0064,
          0.1656
        ],
        "spreadBaseC2": 0.5085,
        "spreadScale": 0.2661,
        "cvMaeC": 0.6759,
        "cvRmseC": 0.9057,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.165421,
          "ecmwfAifs": 0.082398,
          "icon": 0.311358,
          "ukmo": 0.131678,
          "meteofrance": 0.021266,
          "gfs": 0.2465,
          "gem": 0.02,
          "jma": 0.021379
        },
        "interceptC": 0.3609,
        "diurnalHarmonicsC": [
          0.0413,
          -0.1465,
          0,
          0
        ],
        "driverBetasC": [
          -0.0738,
          -0.0654,
          -0.0172,
          0.1088
        ],
        "spreadBaseC2": 0.5132,
        "spreadScale": 0.2662,
        "cvMaeC": 0.6821,
        "cvRmseC": 0.9076,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.257387,
          "ecmwfAifs": 0.144796,
          "icon": 0.202621,
          "ukmo": 0.155664,
          "meteofrance": 0.022531,
          "gfs": 0.174244,
          "gem": 0.02,
          "jma": 0.022757
        },
        "interceptC": 0.4004,
        "diurnalHarmonicsC": [
          0.0169,
          -0.142,
          0,
          0
        ],
        "driverBetasC": [
          -0.0459,
          -0.0292,
          -0.028,
          0.052
        ],
        "spreadBaseC2": 0.518,
        "spreadScale": 0.2664,
        "cvMaeC": 0.6883,
        "cvRmseC": 0.9096,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243701,
        "ecmwfAifs": 0.087721,
        "icon": 0.212708,
        "ukmo": 0.116281,
        "meteofrance": 0.161885,
        "gfs": 0.064751,
        "gem": 0.054276,
        "jma": 0.058677
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.23852,
        "ecmwfAifs": 0.073838,
        "icon": 0.222399,
        "ukmo": 0.121618,
        "meteofrance": 0.161815,
        "gfs": 0.067169,
        "gem": 0.056841,
        "jma": 0.0578
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.233796,
        "ecmwfAifs": 0.078996,
        "icon": 0.221679,
        "ukmo": 0.122005,
        "meteofrance": 0.159173,
        "gfs": 0.06472,
        "gem": 0.061296,
        "jma": 0.058335
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.238491,
        "ecmwfAifs": 0.076771,
        "icon": 0.219462,
        "ukmo": 0.118065,
        "meteofrance": 0.168865,
        "gfs": 0.066762,
        "gem": 0.057545,
        "jma": 0.054039
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.210552,
    "ecmwfAifs": 0.06749,
    "icon": 0.280552,
    "ukmo": 0.157043,
    "meteofrance": 0.104985,
    "gfs": 0.104388,
    "gem": 0.037495,
    "jma": 0.037495
  },
  "pressureWeights": {
    "ecmwfIfs": 0.293334,
    "ecmwfAifs": 0.150681,
    "icon": 0.134858,
    "ukmo": 0.18572,
    "meteofrance": 0.079306,
    "gfs": 0.076795,
    "gem": 0.039653,
    "jma": 0.039653
  }
} as const;

export default PROVINCE_CALIBRATION_TR_34;
