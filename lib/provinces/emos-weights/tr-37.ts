import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_37: ProvinceCalibrationBundle = {
  "provinceCode": "TR-37",
  "provinceName": "Kastamonu",
  "plateNumber": 37,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17074",
  "stationLat": 41.3667,
  "stationLon": 33.7667,
  "stationElevationM": 799,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17340,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.281931,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.269078,
          "meteofrance": 0.197438,
          "gfs": 0.02,
          "gem": 0.171553,
          "jma": 0.02
        },
        "intercept": -0.0977,
        "betaDrivers": [
          0.0705,
          0.1355,
          -0.2727,
          -0.2258,
          -0.0847,
          0.0742
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8869,
        "spreadScale": 0.3509,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.260332,
            "ecmwfAifs": 0.072615,
            "icon": 0.223207,
            "ukmo": 0.116188,
            "meteofrance": 0.153106,
            "gfs": 0.066363,
            "gem": 0.054653,
            "jma": 0.053536
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3646,
          "logisticSlope": 4.4575,
          "wetFractionWeight": 3.4161,
          "powerEta": 0.68,
          "rawBrier": 0.04306,
          "calibratedBrier": 0.03879
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3808,
          "rawIfsRmseC": 1.9074,
          "rawEqualMaeC": 1.3609,
          "rawEqualRmseC": 1.7177,
          "cvSimplexMaeC": 1.2505,
          "cvCalibratedMaeC": 1.2444,
          "cvCalibratedRmseC": 1.6018
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.343986,
          "ecmwfAifs": 0.02241,
          "icon": 0.112637,
          "ukmo": 0.213362,
          "meteofrance": 0.125247,
          "gfs": 0.02,
          "gem": 0.142358,
          "jma": 0.02
        },
        "intercept": -0.1833,
        "betaDrivers": [
          0.0202,
          0.0744,
          -0.1003,
          -0.0641,
          -0.0009,
          0.0667
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.8988,
        "spreadScale": 0.3609,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.342128,
            "ecmwfAifs": 0.199088,
            "icon": 0.141612,
            "ukmo": 0.106927,
            "meteofrance": 0.045116,
            "gfs": 0.066162,
            "gem": 0.054488,
            "jma": 0.044479
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.498,
          "logisticSlope": 4.2718,
          "wetFractionWeight": 3.6018,
          "powerEta": 0.68,
          "rawBrier": 0.04306,
          "calibratedBrier": 0.03731
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3808,
          "rawIfsRmseC": 1.9074,
          "rawEqualMaeC": 1.3609,
          "rawEqualRmseC": 1.7177,
          "cvSimplexMaeC": 1.2602,
          "cvCalibratedMaeC": 1.2545,
          "cvCalibratedRmseC": 1.6123
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.542664,
          "ecmwfAifs": 0.147543,
          "icon": 0.066664,
          "ukmo": 0.039651,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.143478,
          "jma": 0.02
        },
        "intercept": -0.2528,
        "betaDrivers": [
          -0.1388,
          0.2032,
          -0.1472,
          0.1022,
          0.0733,
          -0.0523
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8213,
        "spreadScale": 0.858,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258109,
            "ecmwfAifs": 0.063041,
            "icon": 0.218681,
            "ukmo": 0.123981,
            "meteofrance": 0.153511,
            "gfs": 0.065658,
            "gem": 0.059357,
            "jma": 0.057662
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8445,
          "logisticSlope": 2.7947,
          "wetFractionWeight": 3.3323,
          "powerEta": 0.68,
          "rawBrier": 0.06411,
          "calibratedBrier": 0.05509
        },
        "verification": {
          "sampleHours": 4323,
          "rawIfsMaeC": 1.2929,
          "rawIfsRmseC": 1.9244,
          "rawEqualMaeC": 1.4265,
          "rawEqualRmseC": 1.7875,
          "cvSimplexMaeC": 1.2883,
          "cvCalibratedMaeC": 1.2486,
          "cvCalibratedRmseC": 1.7176
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.447666,
          "ecmwfAifs": 0.164548,
          "icon": 0.124628,
          "ukmo": 0.070994,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.132164,
          "jma": 0.02
        },
        "intercept": -0.2923,
        "betaDrivers": [
          -0.0962,
          0.0733,
          -0.0672,
          0.0311,
          0.0424,
          -0.0635
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9929,
        "spreadScale": 0.7232,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.345507,
            "ecmwfAifs": 0.176051,
            "icon": 0.141317,
            "ukmo": 0.116217,
            "meteofrance": 0.04516,
            "gfs": 0.066675,
            "gem": 0.060277,
            "jma": 0.048796
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0211,
          "logisticSlope": 2.9439,
          "wetFractionWeight": 3.5734,
          "powerEta": 0.68,
          "rawBrier": 0.06411,
          "calibratedBrier": 0.05335
        },
        "verification": {
          "sampleHours": 4323,
          "rawIfsMaeC": 1.2929,
          "rawIfsRmseC": 1.9244,
          "rawEqualMaeC": 1.4265,
          "rawEqualRmseC": 1.7875,
          "cvSimplexMaeC": 1.2727,
          "cvCalibratedMaeC": 1.2327,
          "cvCalibratedRmseC": 1.6628
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.599969,
          "ecmwfAifs": 0.116788,
          "icon": 0.136799,
          "ukmo": 0.04243,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.044014,
          "jma": 0.02
        },
        "intercept": -0.2219,
        "betaDrivers": [
          -0.0816,
          0.3216,
          -0.003,
          -0.09,
          -0.0966,
          -0.1006
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5085,
        "spreadScale": 0.5354,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250288,
            "ecmwfAifs": 0.067026,
            "icon": 0.224003,
            "ukmo": 0.116138,
            "meteofrance": 0.160784,
            "gfs": 0.066041,
            "gem": 0.059515,
            "jma": 0.056205
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4689,
          "logisticSlope": 3.298,
          "wetFractionWeight": 3.0108,
          "powerEta": 0.68,
          "rawBrier": 0.02779,
          "calibratedBrier": 0.02337
        },
        "verification": {
          "sampleHours": 4357,
          "rawIfsMaeC": 1.0561,
          "rawIfsRmseC": 1.6448,
          "rawEqualMaeC": 1.1264,
          "rawEqualRmseC": 1.4652,
          "cvSimplexMaeC": 1.0154,
          "cvCalibratedMaeC": 0.9945,
          "cvCalibratedRmseC": 1.4104
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.499654,
          "ecmwfAifs": 0.139348,
          "icon": 0.152753,
          "ukmo": 0.079415,
          "meteofrance": 0.022788,
          "gfs": 0.02,
          "gem": 0.066042,
          "jma": 0.02
        },
        "intercept": -0.1357,
        "betaDrivers": [
          -0.0491,
          0.1473,
          0.026,
          -0.0289,
          -0.0283,
          -0.0748
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5661,
        "spreadScale": 0.5067,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.336386,
            "ecmwfAifs": 0.187931,
            "icon": 0.14534,
            "ukmo": 0.109304,
            "meteofrance": 0.045268,
            "gfs": 0.067335,
            "gem": 0.060681,
            "jma": 0.047755
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.616,
          "logisticSlope": 3.2315,
          "wetFractionWeight": 3.3073,
          "powerEta": 0.68,
          "rawBrier": 0.02779,
          "calibratedBrier": 0.02273
        },
        "verification": {
          "sampleHours": 4357,
          "rawIfsMaeC": 1.0561,
          "rawIfsRmseC": 1.6448,
          "rawEqualMaeC": 1.1264,
          "rawEqualRmseC": 1.4652,
          "cvSimplexMaeC": 1.0226,
          "cvCalibratedMaeC": 1.0097,
          "cvCalibratedRmseC": 1.3995
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.475141,
          "ecmwfAifs": 0.107811,
          "icon": 0.0945,
          "ukmo": 0.149394,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.113154,
          "jma": 0.02
        },
        "intercept": -0.1425,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8179,
        "spreadScale": 0.4299,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.262807,
            "ecmwfAifs": 0.067586,
            "icon": 0.217776,
            "ukmo": 0.118486,
            "meteofrance": 0.148493,
            "gfs": 0.069617,
            "gem": 0.057543,
            "jma": 0.057692
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3542,
          "logisticSlope": 3.4735,
          "wetFractionWeight": 3.7561,
          "powerEta": 0.68,
          "rawBrier": 0.04352,
          "calibratedBrier": 0.03849
        },
        "verification": {
          "sampleHours": 4316,
          "rawIfsMaeC": 1.058,
          "rawIfsRmseC": 1.522,
          "rawEqualMaeC": 1.1099,
          "rawEqualRmseC": 1.411,
          "cvSimplexMaeC": 0.9892,
          "cvCalibratedMaeC": 0.9786,
          "cvCalibratedRmseC": 1.3337
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.442707,
          "ecmwfAifs": 0.121573,
          "icon": 0.138194,
          "ukmo": 0.13382,
          "meteofrance": 0.021745,
          "gfs": 0.02,
          "gem": 0.101961,
          "jma": 0.02
        },
        "intercept": -0.1594,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.814,
        "spreadScale": 0.4082,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.346231,
            "ecmwfAifs": 0.185757,
            "icon": 0.138506,
            "ukmo": 0.10931,
            "meteofrance": 0.045059,
            "gfs": 0.069578,
            "gem": 0.05751,
            "jma": 0.048049
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6609,
          "logisticSlope": 3.7555,
          "wetFractionWeight": 3.8346,
          "powerEta": 0.68,
          "rawBrier": 0.04352,
          "calibratedBrier": 0.03616
        },
        "verification": {
          "sampleHours": 4316,
          "rawIfsMaeC": 1.058,
          "rawIfsRmseC": 1.522,
          "rawEqualMaeC": 1.1099,
          "rawEqualRmseC": 1.411,
          "cvSimplexMaeC": 0.987,
          "cvCalibratedMaeC": 0.9726,
          "cvCalibratedRmseC": 1.3139
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.281931,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.269078,
          "meteofrance": 0.197438,
          "gfs": 0.02,
          "gem": 0.171553,
          "jma": 0.02
        },
        "interceptC": -0.0977,
        "diurnalHarmonicsC": [
          0.0705,
          0.1355,
          0,
          0
        ],
        "driverBetasC": [
          -0.2727,
          0.0742,
          -0.2258,
          -0.0847
        ],
        "spreadBaseC2": 1.8869,
        "spreadScale": 0.3509,
        "cvMaeC": 1.2444,
        "cvRmseC": 1.6018,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.312959,
          "ecmwfAifs": 0.021205,
          "icon": 0.066318,
          "ukmo": 0.24122,
          "meteofrance": 0.161342,
          "gfs": 0.02,
          "gem": 0.156956,
          "jma": 0.02
        },
        "interceptC": -0.1405,
        "diurnalHarmonicsC": [
          0.0453,
          0.105,
          0,
          0
        ],
        "driverBetasC": [
          -0.1865,
          0.0704,
          -0.1449,
          -0.0428
        ],
        "spreadBaseC2": 1.8929,
        "spreadScale": 0.3559,
        "cvMaeC": 1.2494,
        "cvRmseC": 1.6071,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.343986,
          "ecmwfAifs": 0.02241,
          "icon": 0.112637,
          "ukmo": 0.213362,
          "meteofrance": 0.125247,
          "gfs": 0.02,
          "gem": 0.142358,
          "jma": 0.02
        },
        "interceptC": -0.1833,
        "diurnalHarmonicsC": [
          0.0202,
          0.0744,
          0,
          0
        ],
        "driverBetasC": [
          -0.1003,
          0.0667,
          -0.0641,
          -0.0009
        ],
        "spreadBaseC2": 1.8988,
        "spreadScale": 0.3609,
        "cvMaeC": 1.2545,
        "cvRmseC": 1.6123,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.542664,
          "ecmwfAifs": 0.147543,
          "icon": 0.066664,
          "ukmo": 0.039651,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.143478,
          "jma": 0.02
        },
        "interceptC": -0.2528,
        "diurnalHarmonicsC": [
          -0.1388,
          0.2032,
          0,
          0
        ],
        "driverBetasC": [
          -0.1472,
          -0.0523,
          0.1022,
          0.0733
        ],
        "spreadBaseC2": 0.8213,
        "spreadScale": 0.858,
        "cvMaeC": 1.2486,
        "cvRmseC": 1.7176,
        "sampleHours": 4323
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.495164,
          "ecmwfAifs": 0.156046,
          "icon": 0.095646,
          "ukmo": 0.055323,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.137821,
          "jma": 0.02
        },
        "interceptC": -0.2726,
        "diurnalHarmonicsC": [
          -0.1175,
          0.1382,
          0,
          0
        ],
        "driverBetasC": [
          -0.1072,
          -0.0579,
          0.0667,
          0.0578
        ],
        "spreadBaseC2": 0.9071,
        "spreadScale": 0.7906,
        "cvMaeC": 1.2407,
        "cvRmseC": 1.6902,
        "sampleHours": 4323
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.447666,
          "ecmwfAifs": 0.164548,
          "icon": 0.124628,
          "ukmo": 0.070994,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.132164,
          "jma": 0.02
        },
        "interceptC": -0.2923,
        "diurnalHarmonicsC": [
          -0.0962,
          0.0733,
          0,
          0
        ],
        "driverBetasC": [
          -0.0672,
          -0.0635,
          0.0311,
          0.0424
        ],
        "spreadBaseC2": 0.9929,
        "spreadScale": 0.7232,
        "cvMaeC": 1.2327,
        "cvRmseC": 1.6628,
        "sampleHours": 4323
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.599969,
          "ecmwfAifs": 0.116788,
          "icon": 0.136799,
          "ukmo": 0.04243,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.044014,
          "jma": 0.02
        },
        "interceptC": -0.2219,
        "diurnalHarmonicsC": [
          -0.0816,
          0.3216,
          0,
          0
        ],
        "driverBetasC": [
          -0.003,
          -0.1006,
          -0.09,
          -0.0966
        ],
        "spreadBaseC2": 0.5085,
        "spreadScale": 0.5354,
        "cvMaeC": 0.9945,
        "cvRmseC": 1.4104,
        "sampleHours": 4357
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.549811,
          "ecmwfAifs": 0.128068,
          "icon": 0.144776,
          "ukmo": 0.060923,
          "meteofrance": 0.021394,
          "gfs": 0.02,
          "gem": 0.055028,
          "jma": 0.02
        },
        "interceptC": -0.1788,
        "diurnalHarmonicsC": [
          -0.0654,
          0.2344,
          0,
          0
        ],
        "driverBetasC": [
          0.0115,
          -0.0877,
          -0.0594,
          -0.0625
        ],
        "spreadBaseC2": 0.5373,
        "spreadScale": 0.5211,
        "cvMaeC": 1.0021,
        "cvRmseC": 1.4049,
        "sampleHours": 4357
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.499654,
          "ecmwfAifs": 0.139348,
          "icon": 0.152753,
          "ukmo": 0.079415,
          "meteofrance": 0.022788,
          "gfs": 0.02,
          "gem": 0.066042,
          "jma": 0.02
        },
        "interceptC": -0.1357,
        "diurnalHarmonicsC": [
          -0.0491,
          0.1473,
          0,
          0
        ],
        "driverBetasC": [
          0.026,
          -0.0748,
          -0.0289,
          -0.0283
        ],
        "spreadBaseC2": 0.5661,
        "spreadScale": 0.5067,
        "cvMaeC": 1.0097,
        "cvRmseC": 1.3995,
        "sampleHours": 4357
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.475141,
          "ecmwfAifs": 0.107811,
          "icon": 0.0945,
          "ukmo": 0.149394,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.113154,
          "jma": 0.02
        },
        "interceptC": -0.1425,
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
        "spreadBaseC2": 0.8179,
        "spreadScale": 0.4299,
        "cvMaeC": 0.9786,
        "cvRmseC": 1.3337,
        "sampleHours": 4316
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.458923,
          "ecmwfAifs": 0.114692,
          "icon": 0.116347,
          "ukmo": 0.141607,
          "meteofrance": 0.020873,
          "gfs": 0.02,
          "gem": 0.107558,
          "jma": 0.02
        },
        "interceptC": -0.1509,
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
        "spreadBaseC2": 0.8159,
        "spreadScale": 0.4191,
        "cvMaeC": 0.9756,
        "cvRmseC": 1.3238,
        "sampleHours": 4316
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.442707,
          "ecmwfAifs": 0.121573,
          "icon": 0.138194,
          "ukmo": 0.13382,
          "meteofrance": 0.021745,
          "gfs": 0.02,
          "gem": 0.101961,
          "jma": 0.02
        },
        "interceptC": -0.1594,
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
        "spreadBaseC2": 0.814,
        "spreadScale": 0.4082,
        "cvMaeC": 0.9726,
        "cvRmseC": 1.3139,
        "sampleHours": 4316
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.260332,
        "ecmwfAifs": 0.072615,
        "icon": 0.223207,
        "ukmo": 0.116188,
        "meteofrance": 0.153106,
        "gfs": 0.066363,
        "gem": 0.054653,
        "jma": 0.053536
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.258109,
        "ecmwfAifs": 0.063041,
        "icon": 0.218681,
        "ukmo": 0.123981,
        "meteofrance": 0.153511,
        "gfs": 0.065658,
        "gem": 0.059357,
        "jma": 0.057662
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.250288,
        "ecmwfAifs": 0.067026,
        "icon": 0.224003,
        "ukmo": 0.116138,
        "meteofrance": 0.160784,
        "gfs": 0.066041,
        "gem": 0.059515,
        "jma": 0.056205
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.262807,
        "ecmwfAifs": 0.067586,
        "icon": 0.217776,
        "ukmo": 0.118486,
        "meteofrance": 0.148493,
        "gfs": 0.069617,
        "gem": 0.057543,
        "jma": 0.057692
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.230092,
    "ecmwfAifs": 0.071732,
    "icon": 0.238314,
    "ukmo": 0.173943,
    "meteofrance": 0.111584,
    "gfs": 0.094633,
    "gem": 0.039851,
    "jma": 0.039851
  },
  "pressureWeights": {
    "ecmwfIfs": 0.313337,
    "ecmwfAifs": 0.150661,
    "icon": 0.146722,
    "ukmo": 0.172815,
    "meteofrance": 0.079295,
    "gfs": 0.057874,
    "gem": 0.039648,
    "jma": 0.039648
  }
} as const;

export default PROVINCE_CALIBRATION_TR_37;
