import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_07: ProvinceCalibrationBundle = {
  "provinceCode": "TR-07",
  "provinceName": "Antalya",
  "plateNumber": 7,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17300",
  "stationLat": 36.9003,
  "stationLon": 30.7956,
  "stationElevationM": 54,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.258448,
          "ecmwfAifs": 0.192874,
          "icon": 0.356246,
          "ukmo": 0.068424,
          "meteofrance": 0.064008,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0808,
        "betaDrivers": [
          -0.079,
          -0.1165,
          -0.0731,
          -0.1143,
          0.2111,
          -0.3709
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6399,
        "spreadScale": 0.2655,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.253364,
            "ecmwfAifs": 0.093036,
            "icon": 0.211389,
            "ukmo": 0.106408,
            "meteofrance": 0.144453,
            "gfs": 0.073309,
            "gem": 0.059604,
            "jma": 0.058437
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4881,
          "logisticSlope": 2.8157,
          "wetFractionWeight": 2.2744,
          "powerEta": 0.68,
          "rawBrier": 0.08289,
          "calibratedBrier": 0.07378
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 0.8872,
          "rawIfsRmseC": 1.1591,
          "rawEqualMaeC": 0.8496,
          "rawEqualRmseC": 1.0891,
          "cvSimplexMaeC": 0.7702,
          "cvCalibratedMaeC": 0.734,
          "cvCalibratedRmseC": 0.9731
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.323454,
          "ecmwfAifs": 0.267536,
          "icon": 0.236582,
          "ukmo": 0.042613,
          "meteofrance": 0.069815,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0938,
        "betaDrivers": [
          -0.0549,
          -0.0742,
          -0.0284,
          -0.0178,
          0.0983,
          -0.1772
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5959,
        "spreadScale": 0.3274,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31828,
            "ecmwfAifs": 0.243823,
            "icon": 0.128197,
            "ukmo": 0.093606,
            "meteofrance": 0.04302,
            "gfs": 0.069863,
            "gem": 0.056802,
            "jma": 0.046409
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5052,
          "logisticSlope": 3.2539,
          "wetFractionWeight": 1.8974,
          "powerEta": 0.68,
          "rawBrier": 0.08289,
          "calibratedBrier": 0.07154
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 0.8872,
          "rawIfsRmseC": 1.1591,
          "rawEqualMaeC": 0.8496,
          "rawEqualRmseC": 1.0891,
          "cvSimplexMaeC": 0.7748,
          "cvCalibratedMaeC": 0.7477,
          "cvCalibratedRmseC": 0.9871
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.031836,
          "ecmwfAifs": 0.154362,
          "icon": 0.400165,
          "ukmo": 0.02,
          "meteofrance": 0.177649,
          "gfs": 0.146004,
          "gem": 0.023562,
          "jma": 0.046422
        },
        "intercept": 0.0813,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6515,
        "spreadScale": 0.3808,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245241,
            "ecmwfAifs": 0.069392,
            "icon": 0.217099,
            "ukmo": 0.124612,
            "meteofrance": 0.145655,
            "gfs": 0.079701,
            "gem": 0.057794,
            "jma": 0.060506
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5544,
          "logisticSlope": 2.4418,
          "wetFractionWeight": 2.4556,
          "powerEta": 0.68,
          "rawBrier": 0.04983,
          "calibratedBrier": 0.02857
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2006,
          "rawIfsRmseC": 1.554,
          "rawEqualMaeC": 0.871,
          "rawEqualRmseC": 1.1394,
          "cvSimplexMaeC": 0.8063,
          "cvCalibratedMaeC": 0.8023,
          "cvCalibratedRmseC": 1.0765
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.203023,
          "ecmwfAifs": 0.199153,
          "icon": 0.239272,
          "ukmo": 0.02,
          "meteofrance": 0.112021,
          "gfs": 0.149639,
          "gem": 0.022498,
          "jma": 0.054394
        },
        "intercept": 0.2141,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6291,
        "spreadScale": 0.402,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.3232,
            "ecmwfAifs": 0.190783,
            "icon": 0.138122,
            "ukmo": 0.115,
            "meteofrance": 0.045022,
            "gfs": 0.079683,
            "gem": 0.05778,
            "jma": 0.05041
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5663,
          "logisticSlope": 2.6506,
          "wetFractionWeight": 2.3076,
          "powerEta": 0.68,
          "rawBrier": 0.04983,
          "calibratedBrier": 0.02826
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.2006,
          "rawIfsRmseC": 1.554,
          "rawEqualMaeC": 0.871,
          "rawEqualRmseC": 1.1394,
          "cvSimplexMaeC": 0.8307,
          "cvCalibratedMaeC": 0.8123,
          "cvCalibratedRmseC": 1.0792
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.133794,
          "ecmwfAifs": 0.087555,
          "icon": 0.24115,
          "ukmo": 0.02,
          "meteofrance": 0.276447,
          "gfs": 0.201054,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0426,
        "betaDrivers": [
          0.0631,
          0.0253,
          -0.0156,
          0.2452,
          -0.132,
          -0.2612
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2609,
        "spreadScale": 0.5367,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.216978,
            "ecmwfAifs": 0.074042,
            "icon": 0.226465,
            "ukmo": 0.126423,
            "meteofrance": 0.169563,
            "gfs": 0.070927,
            "gem": 0.058984,
            "jma": 0.056618
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.1341,
          "logisticSlope": 1.9316,
          "wetFractionWeight": 1.2205,
          "powerEta": 0.68,
          "rawBrier": 0.00465,
          "calibratedBrier": 0.00231
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0543,
          "rawIfsRmseC": 1.4602,
          "rawEqualMaeC": 0.9884,
          "rawEqualRmseC": 1.3121,
          "cvSimplexMaeC": 0.7995,
          "cvCalibratedMaeC": 0.7752,
          "cvCalibratedRmseC": 1.1019
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.279719,
          "ecmwfAifs": 0.139423,
          "icon": 0.186192,
          "ukmo": 0.02,
          "meteofrance": 0.154078,
          "gfs": 0.180588,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.0534,
        "betaDrivers": [
          0.08,
          0.0842,
          0.0243,
          0.1754,
          -0.0304,
          -0.1244
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2098,
        "spreadScale": 0.5845,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.294358,
            "ecmwfAifs": 0.209553,
            "icon": 0.148318,
            "ukmo": 0.120102,
            "meteofrance": 0.045411,
            "gfs": 0.072996,
            "gem": 0.060704,
            "jma": 0.048558
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -6.139,
          "logisticSlope": 1.8003,
          "wetFractionWeight": 1.1004,
          "powerEta": 0.68,
          "rawBrier": 0.00465,
          "calibratedBrier": 0.00231
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0543,
          "rawIfsRmseC": 1.4602,
          "rawEqualMaeC": 0.9884,
          "rawEqualRmseC": 1.3121,
          "cvSimplexMaeC": 0.8194,
          "cvCalibratedMaeC": 0.7902,
          "cvCalibratedRmseC": 1.1166
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.257843,
          "ecmwfAifs": 0.098693,
          "icon": 0.349797,
          "ukmo": 0.02,
          "meteofrance": 0.101774,
          "gfs": 0.091566,
          "gem": 0.02,
          "jma": 0.060327
        },
        "intercept": 0,
        "betaDrivers": [
          0.0167,
          -0.1924,
          0.0192,
          0.2155,
          -0.1178,
          0.0207
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9107,
        "spreadScale": 0.2134,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240311,
            "ecmwfAifs": 0.080417,
            "icon": 0.227301,
            "ukmo": 0.123224,
            "meteofrance": 0.137864,
            "gfs": 0.071925,
            "gem": 0.060394,
            "jma": 0.058564
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.138,
          "logisticSlope": 2.1981,
          "wetFractionWeight": 2.6799,
          "powerEta": 0.68,
          "rawBrier": 0.05248,
          "calibratedBrier": 0.03636
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 0.985,
          "rawIfsRmseC": 1.3044,
          "rawEqualMaeC": 0.899,
          "rawEqualRmseC": 1.1833,
          "cvSimplexMaeC": 0.8502,
          "cvCalibratedMaeC": 0.8452,
          "cvCalibratedRmseC": 1.1233
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.342578,
          "ecmwfAifs": 0.192483,
          "icon": 0.21662,
          "ukmo": 0.027321,
          "meteofrance": 0.06546,
          "gfs": 0.109053,
          "gem": 0.024202,
          "jma": 0.022283
        },
        "intercept": 0.013,
        "betaDrivers": [
          0.0052,
          -0.0502,
          0.0016,
          0.0538,
          -0.0225,
          0.0161
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9325,
        "spreadScale": 0.2033,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.310405,
            "ecmwfAifs": 0.2167,
            "icon": 0.141738,
            "ukmo": 0.111459,
            "meteofrance": 0.042217,
            "gfs": 0.070479,
            "gem": 0.05918,
            "jma": 0.047822
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.172,
          "logisticSlope": 2.4295,
          "wetFractionWeight": 2.5178,
          "powerEta": 0.68,
          "rawBrier": 0.05248,
          "calibratedBrier": 0.03574
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 0.985,
          "rawIfsRmseC": 1.3044,
          "rawEqualMaeC": 0.899,
          "rawEqualRmseC": 1.1833,
          "cvSimplexMaeC": 0.8494,
          "cvCalibratedMaeC": 0.8482,
          "cvCalibratedRmseC": 1.1256
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.258448,
          "ecmwfAifs": 0.192874,
          "icon": 0.356246,
          "ukmo": 0.068424,
          "meteofrance": 0.064008,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0808,
        "diurnalHarmonicsC": [
          -0.079,
          -0.1165,
          0,
          0
        ],
        "driverBetasC": [
          -0.0731,
          -0.3709,
          -0.1143,
          0.2111
        ],
        "spreadBaseC2": 0.6399,
        "spreadScale": 0.2655,
        "cvMaeC": 0.734,
        "cvRmseC": 0.9731,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.290951,
          "ecmwfAifs": 0.230205,
          "icon": 0.296413,
          "ukmo": 0.055519,
          "meteofrance": 0.066912,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0873,
        "diurnalHarmonicsC": [
          -0.0669,
          -0.0954,
          0,
          0
        ],
        "driverBetasC": [
          -0.0508,
          -0.2741,
          -0.066,
          0.1547
        ],
        "spreadBaseC2": 0.6179,
        "spreadScale": 0.2964,
        "cvMaeC": 0.7409,
        "cvRmseC": 0.9801,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.323454,
          "ecmwfAifs": 0.267536,
          "icon": 0.236582,
          "ukmo": 0.042613,
          "meteofrance": 0.069815,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0938,
        "diurnalHarmonicsC": [
          -0.0549,
          -0.0742,
          0,
          0
        ],
        "driverBetasC": [
          -0.0284,
          -0.1772,
          -0.0178,
          0.0983
        ],
        "spreadBaseC2": 0.5959,
        "spreadScale": 0.3274,
        "cvMaeC": 0.7477,
        "cvRmseC": 0.9871,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.031836,
          "ecmwfAifs": 0.154362,
          "icon": 0.400165,
          "ukmo": 0.02,
          "meteofrance": 0.177649,
          "gfs": 0.146004,
          "gem": 0.023562,
          "jma": 0.046422
        },
        "interceptC": 0.0813,
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
        "spreadBaseC2": 0.6515,
        "spreadScale": 0.3808,
        "cvMaeC": 0.8023,
        "cvRmseC": 1.0765,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.11743,
          "ecmwfAifs": 0.176757,
          "icon": 0.319718,
          "ukmo": 0.02,
          "meteofrance": 0.144835,
          "gfs": 0.147822,
          "gem": 0.02303,
          "jma": 0.050408
        },
        "interceptC": 0.1477,
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
        "spreadBaseC2": 0.6403,
        "spreadScale": 0.3914,
        "cvMaeC": 0.8073,
        "cvRmseC": 1.0778,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.203023,
          "ecmwfAifs": 0.199153,
          "icon": 0.239272,
          "ukmo": 0.02,
          "meteofrance": 0.112021,
          "gfs": 0.149639,
          "gem": 0.022498,
          "jma": 0.054394
        },
        "interceptC": 0.2141,
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
        "spreadBaseC2": 0.6291,
        "spreadScale": 0.402,
        "cvMaeC": 0.8123,
        "cvRmseC": 1.0792,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.133794,
          "ecmwfAifs": 0.087555,
          "icon": 0.24115,
          "ukmo": 0.02,
          "meteofrance": 0.276447,
          "gfs": 0.201054,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0426,
        "diurnalHarmonicsC": [
          0.0631,
          0.0253,
          0,
          0
        ],
        "driverBetasC": [
          -0.0156,
          -0.2612,
          0.2452,
          -0.132
        ],
        "spreadBaseC2": 0.2609,
        "spreadScale": 0.5367,
        "cvMaeC": 0.7752,
        "cvRmseC": 1.1019,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.206757,
          "ecmwfAifs": 0.113489,
          "icon": 0.213671,
          "ukmo": 0.02,
          "meteofrance": 0.215262,
          "gfs": 0.190821,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.048,
        "diurnalHarmonicsC": [
          0.0716,
          0.0548,
          0,
          0
        ],
        "driverBetasC": [
          0.0043,
          -0.1928,
          0.2103,
          -0.0812
        ],
        "spreadBaseC2": 0.2354,
        "spreadScale": 0.5606,
        "cvMaeC": 0.7827,
        "cvRmseC": 1.1093,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.279719,
          "ecmwfAifs": 0.139423,
          "icon": 0.186192,
          "ukmo": 0.02,
          "meteofrance": 0.154078,
          "gfs": 0.180588,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.0534,
        "diurnalHarmonicsC": [
          0.08,
          0.0842,
          0,
          0
        ],
        "driverBetasC": [
          0.0243,
          -0.1244,
          0.1754,
          -0.0304
        ],
        "spreadBaseC2": 0.2098,
        "spreadScale": 0.5845,
        "cvMaeC": 0.7902,
        "cvRmseC": 1.1166,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.257843,
          "ecmwfAifs": 0.098693,
          "icon": 0.349797,
          "ukmo": 0.02,
          "meteofrance": 0.101774,
          "gfs": 0.091566,
          "gem": 0.02,
          "jma": 0.060327
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.0167,
          -0.1924,
          0,
          0
        ],
        "driverBetasC": [
          0.0192,
          0.0207,
          0.2155,
          -0.1178
        ],
        "spreadBaseC2": 0.9107,
        "spreadScale": 0.2134,
        "cvMaeC": 0.8452,
        "cvRmseC": 1.1233,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.300211,
          "ecmwfAifs": 0.145588,
          "icon": 0.283209,
          "ukmo": 0.02366,
          "meteofrance": 0.083617,
          "gfs": 0.100309,
          "gem": 0.022101,
          "jma": 0.041305
        },
        "interceptC": 0.0065,
        "diurnalHarmonicsC": [
          0.0109,
          -0.1213,
          0,
          0
        ],
        "driverBetasC": [
          0.0104,
          0.0184,
          0.1346,
          -0.0702
        ],
        "spreadBaseC2": 0.9216,
        "spreadScale": 0.2084,
        "cvMaeC": 0.8467,
        "cvRmseC": 1.1244,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.342578,
          "ecmwfAifs": 0.192483,
          "icon": 0.21662,
          "ukmo": 0.027321,
          "meteofrance": 0.06546,
          "gfs": 0.109053,
          "gem": 0.024202,
          "jma": 0.022283
        },
        "interceptC": 0.013,
        "diurnalHarmonicsC": [
          0.0052,
          -0.0502,
          0,
          0
        ],
        "driverBetasC": [
          0.0016,
          0.0161,
          0.0538,
          -0.0225
        ],
        "spreadBaseC2": 0.9325,
        "spreadScale": 0.2033,
        "cvMaeC": 0.8482,
        "cvRmseC": 1.1256,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.253364,
        "ecmwfAifs": 0.093036,
        "icon": 0.211389,
        "ukmo": 0.106408,
        "meteofrance": 0.144453,
        "gfs": 0.073309,
        "gem": 0.059604,
        "jma": 0.058437
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245241,
        "ecmwfAifs": 0.069392,
        "icon": 0.217099,
        "ukmo": 0.124612,
        "meteofrance": 0.145655,
        "gfs": 0.079701,
        "gem": 0.057794,
        "jma": 0.060506
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.216978,
        "ecmwfAifs": 0.074042,
        "icon": 0.226465,
        "ukmo": 0.126423,
        "meteofrance": 0.169563,
        "gfs": 0.070927,
        "gem": 0.058984,
        "jma": 0.056618
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.240311,
        "ecmwfAifs": 0.080417,
        "icon": 0.227301,
        "ukmo": 0.123224,
        "meteofrance": 0.137864,
        "gfs": 0.071925,
        "gem": 0.060394,
        "jma": 0.058564
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.213155,
    "ecmwfAifs": 0.069682,
    "icon": 0.267532,
    "ukmo": 0.165409,
    "meteofrance": 0.108394,
    "gfs": 0.098404,
    "gem": 0.038712,
    "jma": 0.038712
  },
  "pressureWeights": {
    "ecmwfIfs": 0.29029,
    "ecmwfAifs": 0.15218,
    "icon": 0.13534,
    "ukmo": 0.189532,
    "meteofrance": 0.080095,
    "gfs": 0.072469,
    "gem": 0.040047,
    "jma": 0.040047
  }
} as const;

export default PROVINCE_CALIBRATION_TR_07;
