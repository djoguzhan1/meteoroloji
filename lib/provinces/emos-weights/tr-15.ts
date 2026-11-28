import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_15: ProvinceCalibrationBundle = {
  "provinceCode": "TR-15",
  "provinceName": "Burdur",
  "plateNumber": 15,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17241",
  "stationLat": 37.85,
  "stationLon": 30.3667,
  "stationElevationM": 864,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17439,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.565569,
          "ukmo": 0.124877,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.209554,
          "jma": 0.02
        },
        "intercept": 0.0257,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.6003,
        "spreadScale": 0.3594,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244797,
            "ecmwfAifs": 0.081584,
            "icon": 0.213828,
            "ukmo": 0.120899,
            "meteofrance": 0.156938,
            "gfs": 0.068249,
            "gem": 0.057005,
            "jma": 0.0567
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9967,
          "logisticSlope": 4.7847,
          "wetFractionWeight": 3.1986,
          "powerEta": 0.68,
          "rawBrier": 0.04048,
          "calibratedBrier": 0.04048
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.76,
          "rawIfsRmseC": 2.2817,
          "rawEqualMaeC": 1.2902,
          "rawEqualRmseC": 1.7596,
          "cvSimplexMaeC": 1.0993,
          "cvCalibratedMaeC": 1.0991,
          "cvCalibratedRmseC": 1.5174
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.086566,
          "ecmwfAifs": 0.247977,
          "icon": 0.31392,
          "ukmo": 0.12116,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.170377,
          "jma": 0.02
        },
        "intercept": 0.1026,
        "betaDrivers": [
          -0.1056,
          0.0566,
          -0.0509,
          -0.1095,
          0.1517,
          0.0246
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.6054,
        "spreadScale": 0.4254,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31856,
            "ecmwfAifs": 0.221487,
            "icon": 0.134333,
            "ukmo": 0.110173,
            "meteofrance": 0.045147,
            "gfs": 0.067377,
            "gem": 0.056277,
            "jma": 0.046646
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1362,
          "logisticSlope": 4.7644,
          "wetFractionWeight": 3.0916,
          "powerEta": 0.68,
          "rawBrier": 0.04048,
          "calibratedBrier": 0.03991
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.76,
          "rawIfsRmseC": 2.2817,
          "rawEqualMaeC": 1.2902,
          "rawEqualRmseC": 1.7596,
          "cvSimplexMaeC": 1.1506,
          "cvCalibratedMaeC": 1.1454,
          "cvCalibratedRmseC": 1.5711
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.064722,
          "ecmwfAifs": 0.02,
          "icon": 0.37184,
          "ukmo": 0.111752,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.371686,
          "jma": 0.02
        },
        "intercept": -0.0995,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.3159,
        "spreadScale": 0.4344,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239829,
            "ecmwfAifs": 0.074104,
            "icon": 0.230339,
            "ukmo": 0.117843,
            "meteofrance": 0.155508,
            "gfs": 0.065123,
            "gem": 0.05708,
            "jma": 0.060174
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0668,
          "logisticSlope": 4.2167,
          "wetFractionWeight": 3.038,
          "powerEta": 0.68,
          "rawBrier": 0.04401,
          "calibratedBrier": 0.0411
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.529,
          "rawIfsRmseC": 1.9733,
          "rawEqualMaeC": 1.3273,
          "rawEqualRmseC": 1.743,
          "cvSimplexMaeC": 1.1228,
          "cvCalibratedMaeC": 1.1195,
          "cvCalibratedRmseC": 1.453
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.193743,
          "ecmwfAifs": 0.126096,
          "icon": 0.273657,
          "ukmo": 0.099328,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.247176,
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
        "spreadBaseC2": 1.2011,
        "spreadScale": 0.5518,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.318539,
            "ecmwfAifs": 0.205334,
            "icon": 0.147693,
            "ukmo": 0.109605,
            "meteofrance": 0.045171,
            "gfs": 0.065618,
            "gem": 0.057514,
            "jma": 0.050526
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1388,
          "logisticSlope": 3.9315,
          "wetFractionWeight": 3.2335,
          "powerEta": 0.68,
          "rawBrier": 0.04401,
          "calibratedBrier": 0.0411
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.529,
          "rawIfsRmseC": 1.9733,
          "rawEqualMaeC": 1.3273,
          "rawEqualRmseC": 1.743,
          "cvSimplexMaeC": 1.1542,
          "cvCalibratedMaeC": 1.1542,
          "cvCalibratedRmseC": 1.487
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.58235,
          "ukmo": 0.026248,
          "meteofrance": 0.132,
          "gfs": 0.053456,
          "gem": 0.145946,
          "jma": 0.02
        },
        "intercept": 0.0205,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9474,
        "spreadScale": 0.6581,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234547,
            "ecmwfAifs": 0.080284,
            "icon": 0.222273,
            "ukmo": 0.121876,
            "meteofrance": 0.163289,
            "gfs": 0.066142,
            "gem": 0.055395,
            "jma": 0.056194
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.8655,
          "logisticSlope": 2.9187,
          "wetFractionWeight": 2.589,
          "powerEta": 0.68,
          "rawBrier": 0.01375,
          "calibratedBrier": 0.01106
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5759,
          "rawIfsRmseC": 2.0426,
          "rawEqualMaeC": 1.2814,
          "rawEqualRmseC": 1.6901,
          "cvSimplexMaeC": 1.165,
          "cvCalibratedMaeC": 1.1622,
          "cvCalibratedRmseC": 1.5732
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.192452,
          "ecmwfAifs": 0.064677,
          "icon": 0.321598,
          "ukmo": 0.067123,
          "meteofrance": 0.149774,
          "gfs": 0.056405,
          "gem": 0.127971,
          "jma": 0.02
        },
        "intercept": 0.1575,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9196,
        "spreadScale": 0.7294,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.309975,
            "ecmwfAifs": 0.221353,
            "icon": 0.141813,
            "ukmo": 0.112792,
            "meteofrance": 0.045265,
            "gfs": 0.066313,
            "gem": 0.055539,
            "jma": 0.04695
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.9018,
          "logisticSlope": 3.2591,
          "wetFractionWeight": 2.3355,
          "powerEta": 0.68,
          "rawBrier": 0.01375,
          "calibratedBrier": 0.01087
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.5759,
          "rawIfsRmseC": 2.0426,
          "rawEqualMaeC": 1.2814,
          "rawEqualRmseC": 1.6901,
          "cvSimplexMaeC": 1.2074,
          "cvCalibratedMaeC": 1.1944,
          "cvCalibratedRmseC": 1.6113
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.027412,
          "ecmwfAifs": 0.02,
          "icon": 0.563263,
          "ukmo": 0.142033,
          "meteofrance": 0.08501,
          "gfs": 0.02,
          "gem": 0.122282,
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
        "spreadBaseC2": 1.0124,
        "spreadScale": 0.9467,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.229583,
            "ecmwfAifs": 0.07702,
            "icon": 0.219378,
            "ukmo": 0.120834,
            "meteofrance": 0.162564,
            "gfs": 0.068301,
            "gem": 0.059537,
            "jma": 0.062783
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5299,
          "logisticSlope": 4.359,
          "wetFractionWeight": 3.7787,
          "powerEta": 0.68,
          "rawBrier": 0.01933,
          "calibratedBrier": 0.01933
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.5734,
          "rawIfsRmseC": 2.0093,
          "rawEqualMaeC": 1.396,
          "rawEqualRmseC": 1.7996,
          "cvSimplexMaeC": 1.2837,
          "cvCalibratedMaeC": 1.2837,
          "cvCalibratedRmseC": 1.648
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.214533,
          "ecmwfAifs": 0.123201,
          "icon": 0.308149,
          "ukmo": 0.136485,
          "meteofrance": 0.062713,
          "gfs": 0.02,
          "gem": 0.114919,
          "jma": 0.02
        },
        "intercept": 0.095,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8886,
        "spreadScale": 1.0633,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305509,
            "ecmwfAifs": 0.213819,
            "icon": 0.140931,
            "ukmo": 0.1126,
            "meteofrance": 0.045271,
            "gfs": 0.068951,
            "gem": 0.060103,
            "jma": 0.052816
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6752,
          "logisticSlope": 4.1045,
          "wetFractionWeight": 3.6902,
          "powerEta": 0.68,
          "rawBrier": 0.01933,
          "calibratedBrier": 0.01933
        },
        "verification": {
          "sampleHours": 4354,
          "rawIfsMaeC": 1.5734,
          "rawIfsRmseC": 2.0093,
          "rawEqualMaeC": 1.396,
          "rawEqualRmseC": 1.7996,
          "cvSimplexMaeC": 1.3017,
          "cvCalibratedMaeC": 1.2984,
          "cvCalibratedRmseC": 1.6695
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
          "icon": 0.565569,
          "ukmo": 0.124877,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.209554,
          "jma": 0.02
        },
        "interceptC": 0.0257,
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
        "spreadBaseC2": 1.6003,
        "spreadScale": 0.3594,
        "cvMaeC": 1.0991,
        "cvRmseC": 1.5174,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.053283,
          "ecmwfAifs": 0.133988,
          "icon": 0.439746,
          "ukmo": 0.123018,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.189965,
          "jma": 0.02
        },
        "interceptC": 0.0641,
        "diurnalHarmonicsC": [
          -0.0528,
          0.0283,
          0,
          0
        ],
        "driverBetasC": [
          -0.0255,
          0.0123,
          -0.0548,
          0.0759
        ],
        "spreadBaseC2": 1.6029,
        "spreadScale": 0.3924,
        "cvMaeC": 1.1222,
        "cvRmseC": 1.5442,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.086566,
          "ecmwfAifs": 0.247977,
          "icon": 0.31392,
          "ukmo": 0.12116,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.170377,
          "jma": 0.02
        },
        "interceptC": 0.1026,
        "diurnalHarmonicsC": [
          -0.1056,
          0.0566,
          0,
          0
        ],
        "driverBetasC": [
          -0.0509,
          0.0246,
          -0.1095,
          0.1517
        ],
        "spreadBaseC2": 1.6054,
        "spreadScale": 0.4254,
        "cvMaeC": 1.1454,
        "cvRmseC": 1.5711,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.064722,
          "ecmwfAifs": 0.02,
          "icon": 0.37184,
          "ukmo": 0.111752,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.371686,
          "jma": 0.02
        },
        "interceptC": -0.0995,
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
        "spreadBaseC2": 1.3159,
        "spreadScale": 0.4344,
        "cvMaeC": 1.1195,
        "cvRmseC": 1.453,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.129233,
          "ecmwfAifs": 0.073048,
          "icon": 0.322748,
          "ukmo": 0.10554,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.309431,
          "jma": 0.02
        },
        "interceptC": -0.0498,
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
        "spreadBaseC2": 1.2585,
        "spreadScale": 0.4931,
        "cvMaeC": 1.1368,
        "cvRmseC": 1.47,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.193743,
          "ecmwfAifs": 0.126096,
          "icon": 0.273657,
          "ukmo": 0.099328,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.247176,
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
        "spreadBaseC2": 1.2011,
        "spreadScale": 0.5518,
        "cvMaeC": 1.1542,
        "cvRmseC": 1.487,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.58235,
          "ukmo": 0.026248,
          "meteofrance": 0.132,
          "gfs": 0.053456,
          "gem": 0.145946,
          "jma": 0.02
        },
        "interceptC": 0.0205,
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
        "spreadBaseC2": 0.9474,
        "spreadScale": 0.6581,
        "cvMaeC": 1.1622,
        "cvRmseC": 1.5732,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.106226,
          "ecmwfAifs": 0.042339,
          "icon": 0.451974,
          "ukmo": 0.046686,
          "meteofrance": 0.140887,
          "gfs": 0.05493,
          "gem": 0.136958,
          "jma": 0.02
        },
        "interceptC": 0.089,
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
        "spreadBaseC2": 0.9335,
        "spreadScale": 0.6938,
        "cvMaeC": 1.1783,
        "cvRmseC": 1.5922,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.192452,
          "ecmwfAifs": 0.064677,
          "icon": 0.321598,
          "ukmo": 0.067123,
          "meteofrance": 0.149774,
          "gfs": 0.056405,
          "gem": 0.127971,
          "jma": 0.02
        },
        "interceptC": 0.1575,
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
        "spreadBaseC2": 0.9196,
        "spreadScale": 0.7294,
        "cvMaeC": 1.1944,
        "cvRmseC": 1.6113,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.027412,
          "ecmwfAifs": 0.02,
          "icon": 0.563263,
          "ukmo": 0.142033,
          "meteofrance": 0.08501,
          "gfs": 0.02,
          "gem": 0.122282,
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
        "spreadBaseC2": 1.0124,
        "spreadScale": 0.9467,
        "cvMaeC": 1.2837,
        "cvRmseC": 1.648,
        "sampleHours": 4354
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.120973,
          "ecmwfAifs": 0.071601,
          "icon": 0.435705,
          "ukmo": 0.139258,
          "meteofrance": 0.073862,
          "gfs": 0.02,
          "gem": 0.118601,
          "jma": 0.02
        },
        "interceptC": 0.0475,
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
        "spreadBaseC2": 0.9505,
        "spreadScale": 1.005,
        "cvMaeC": 1.2911,
        "cvRmseC": 1.6587,
        "sampleHours": 4354
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.214533,
          "ecmwfAifs": 0.123201,
          "icon": 0.308149,
          "ukmo": 0.136485,
          "meteofrance": 0.062713,
          "gfs": 0.02,
          "gem": 0.114919,
          "jma": 0.02
        },
        "interceptC": 0.095,
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
        "spreadBaseC2": 0.8886,
        "spreadScale": 1.0633,
        "cvMaeC": 1.2984,
        "cvRmseC": 1.6695,
        "sampleHours": 4354
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.244797,
        "ecmwfAifs": 0.081584,
        "icon": 0.213828,
        "ukmo": 0.120899,
        "meteofrance": 0.156938,
        "gfs": 0.068249,
        "gem": 0.057005,
        "jma": 0.0567
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.239829,
        "ecmwfAifs": 0.074104,
        "icon": 0.230339,
        "ukmo": 0.117843,
        "meteofrance": 0.155508,
        "gfs": 0.065123,
        "gem": 0.05708,
        "jma": 0.060174
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.234547,
        "ecmwfAifs": 0.080284,
        "icon": 0.222273,
        "ukmo": 0.121876,
        "meteofrance": 0.163289,
        "gfs": 0.066142,
        "gem": 0.055395,
        "jma": 0.056194
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.229583,
        "ecmwfAifs": 0.07702,
        "icon": 0.219378,
        "ukmo": 0.120834,
        "meteofrance": 0.162564,
        "gfs": 0.068301,
        "gem": 0.059537,
        "jma": 0.062783
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.219913,
    "ecmwfAifs": 0.070458,
    "icon": 0.252251,
    "ukmo": 0.160238,
    "meteofrance": 0.109602,
    "gfs": 0.10925,
    "gem": 0.039144,
    "jma": 0.039144
  },
  "pressureWeights": {
    "ecmwfIfs": 0.329046,
    "ecmwfAifs": 0.145991,
    "icon": 0.15056,
    "ukmo": 0.160048,
    "meteofrance": 0.076838,
    "gfs": 0.060679,
    "gem": 0.038419,
    "jma": 0.038419
  }
} as const;

export default PROVINCE_CALIBRATION_TR_15;
