import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_03: ProvinceCalibrationBundle = {
  "provinceCode": "TR-03",
  "provinceName": "Afyonkarahisar",
  "plateNumber": 3,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17190",
  "stationLat": 38.75,
  "stationLon": 30.5333,
  "stationElevationM": 1034,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17432,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.399039,
          "icon": 0.02,
          "ukmo": 0.275853,
          "meteofrance": 0.20678,
          "gfs": 0.038328,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0.2071,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0583,
        "spreadScale": 0.6683,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232399,
            "ecmwfAifs": 0.082825,
            "icon": 0.230449,
            "ukmo": 0.116603,
            "meteofrance": 0.156961,
            "gfs": 0.065395,
            "gem": 0.057394,
            "jma": 0.057974
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1229,
          "logisticSlope": 4.2435,
          "wetFractionWeight": 2.9009,
          "powerEta": 0.68,
          "rawBrier": 0.03896,
          "calibratedBrier": 0.03764
        },
        "verification": {
          "sampleHours": 4343,
          "rawIfsMaeC": 1.8235,
          "rawIfsRmseC": 2.4471,
          "rawEqualMaeC": 1.1899,
          "rawEqualRmseC": 1.5562,
          "cvSimplexMaeC": 1.145,
          "cvCalibratedMaeC": 1.1349,
          "cvCalibratedRmseC": 1.4961
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.407576,
          "icon": 0.134855,
          "ukmo": 0.209951,
          "meteofrance": 0.119782,
          "gfs": 0.06439,
          "gem": 0.023446,
          "jma": 0.02
        },
        "intercept": 0.2678,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9799,
        "spreadScale": 0.7057,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304856,
            "ecmwfAifs": 0.226663,
            "icon": 0.145937,
            "ukmo": 0.107111,
            "meteofrance": 0.045164,
            "gfs": 0.065077,
            "gem": 0.057115,
            "jma": 0.048077
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1271,
          "logisticSlope": 4.0581,
          "wetFractionWeight": 2.7115,
          "powerEta": 0.68,
          "rawBrier": 0.03896,
          "calibratedBrier": 0.03808
        },
        "verification": {
          "sampleHours": 4343,
          "rawIfsMaeC": 1.8235,
          "rawIfsRmseC": 2.4471,
          "rawEqualMaeC": 1.1899,
          "rawEqualRmseC": 1.5562,
          "cvSimplexMaeC": 1.1408,
          "cvCalibratedMaeC": 1.1222,
          "cvCalibratedRmseC": 1.4939
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.131484,
          "icon": 0.307584,
          "ukmo": 0.101848,
          "meteofrance": 0.180125,
          "gfs": 0.131273,
          "gem": 0.107686,
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
        "spreadBaseC2": 1.3188,
        "spreadScale": 0.7,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245891,
            "ecmwfAifs": 0.079664,
            "icon": 0.222482,
            "ukmo": 0.118789,
            "meteofrance": 0.159506,
            "gfs": 0.062441,
            "gem": 0.054626,
            "jma": 0.056601
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8825,
          "logisticSlope": 3.3713,
          "wetFractionWeight": 3.3732,
          "powerEta": 0.68,
          "rawBrier": 0.05218,
          "calibratedBrier": 0.04826
        },
        "verification": {
          "sampleHours": 4323,
          "rawIfsMaeC": 1.4986,
          "rawIfsRmseC": 2.0971,
          "rawEqualMaeC": 1.1523,
          "rawEqualRmseC": 1.4655,
          "cvSimplexMaeC": 1.2205,
          "cvCalibratedMaeC": 1.2205,
          "cvCalibratedRmseC": 1.5569
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.143738,
          "ecmwfAifs": 0.245645,
          "icon": 0.19104,
          "ukmo": 0.113748,
          "meteofrance": 0.122443,
          "gfs": 0.08726,
          "gem": 0.076126,
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
        "spreadBaseC2": 1.1783,
        "spreadScale": 0.7372,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.32282,
            "ecmwfAifs": 0.218192,
            "icon": 0.141008,
            "ukmo": 0.109208,
            "meteofrance": 0.0452,
            "gfs": 0.062189,
            "gem": 0.054406,
            "jma": 0.046977
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9765,
          "logisticSlope": 3.2522,
          "wetFractionWeight": 3.5192,
          "powerEta": 0.68,
          "rawBrier": 0.05218,
          "calibratedBrier": 0.04714
        },
        "verification": {
          "sampleHours": 4323,
          "rawIfsMaeC": 1.4986,
          "rawIfsRmseC": 2.0971,
          "rawEqualMaeC": 1.1523,
          "rawEqualRmseC": 1.4655,
          "cvSimplexMaeC": 1.2048,
          "cvCalibratedMaeC": 1.2048,
          "cvCalibratedRmseC": 1.5308
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
        "intercept": 0.3614,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5335,
        "spreadScale": 1.1003,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23488,
            "ecmwfAifs": 0.085827,
            "icon": 0.221535,
            "ukmo": 0.122609,
            "meteofrance": 0.155507,
            "gfs": 0.06999,
            "gem": 0.054533,
            "jma": 0.055119
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5258,
          "logisticSlope": 2.9534,
          "wetFractionWeight": 3.1883,
          "powerEta": 0.68,
          "rawBrier": 0.02185,
          "calibratedBrier": 0.01808
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0849,
          "rawIfsRmseC": 1.5424,
          "rawEqualMaeC": 1.0661,
          "rawEqualRmseC": 1.3542,
          "cvSimplexMaeC": 1.0513,
          "cvCalibratedMaeC": 1.0464,
          "cvCalibratedRmseC": 1.4524
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.733588,
          "ecmwfAifs": 0.049225,
          "icon": 0.052461,
          "ukmo": 0.041774,
          "meteofrance": 0.042709,
          "gfs": 0.02,
          "gem": 0.040243,
          "jma": 0.02
        },
        "intercept": 0.0501,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5749,
        "spreadScale": 1.0366,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.304708,
            "ecmwfAifs": 0.232286,
            "icon": 0.138744,
            "ukmo": 0.111385,
            "meteofrance": 0.045122,
            "gfs": 0.068881,
            "gem": 0.053669,
            "jma": 0.045205
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5743,
          "logisticSlope": 3.3151,
          "wetFractionWeight": 3.2157,
          "powerEta": 0.68,
          "rawBrier": 0.02185,
          "calibratedBrier": 0.01759
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.0849,
          "rawIfsRmseC": 1.5424,
          "rawEqualMaeC": 1.0661,
          "rawEqualRmseC": 1.3542,
          "cvSimplexMaeC": 1.0511,
          "cvCalibratedMaeC": 1.0508,
          "cvCalibratedRmseC": 1.4307
        }
      }
    },
    "SON": {
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
        "intercept": 0.0468,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.0503,
        "spreadScale": 0.9659,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236392,
            "ecmwfAifs": 0.081269,
            "icon": 0.226011,
            "ukmo": 0.117874,
            "meteofrance": 0.15979,
            "gfs": 0.065967,
            "gem": 0.053646,
            "jma": 0.059051
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6626,
          "logisticSlope": 4.8121,
          "wetFractionWeight": 3.665,
          "powerEta": 0.68,
          "rawBrier": 0.0174,
          "calibratedBrier": 0.01635
        },
        "verification": {
          "sampleHours": 4350,
          "rawIfsMaeC": 1.2398,
          "rawIfsRmseC": 1.6927,
          "rawEqualMaeC": 1.2167,
          "rawEqualRmseC": 1.5545,
          "cvSimplexMaeC": 1.2005,
          "cvCalibratedMaeC": 1.2004,
          "cvCalibratedRmseC": 1.6124
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.732587,
          "ecmwfAifs": 0.055718,
          "icon": 0.066594,
          "ukmo": 0.034001,
          "meteofrance": 0.027758,
          "gfs": 0.02,
          "gem": 0.043342,
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
        "spreadBaseC2": 1.0584,
        "spreadScale": 0.9122,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.311034,
            "ecmwfAifs": 0.223078,
            "icon": 0.143561,
            "ukmo": 0.108607,
            "meteofrance": 0.045209,
            "gfs": 0.065845,
            "gem": 0.053547,
            "jma": 0.049119
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7485,
          "logisticSlope": 4.3164,
          "wetFractionWeight": 3.7462,
          "powerEta": 0.68,
          "rawBrier": 0.0174,
          "calibratedBrier": 0.01615
        },
        "verification": {
          "sampleHours": 4350,
          "rawIfsMaeC": 1.2398,
          "rawIfsRmseC": 1.6927,
          "rawEqualMaeC": 1.2167,
          "rawEqualRmseC": 1.5545,
          "cvSimplexMaeC": 1.1964,
          "cvCalibratedMaeC": 1.1964,
          "cvCalibratedRmseC": 1.5875
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.399039,
          "icon": 0.02,
          "ukmo": 0.275853,
          "meteofrance": 0.20678,
          "gfs": 0.038328,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0.2071,
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
        "spreadBaseC2": 1.0583,
        "spreadScale": 0.6683,
        "cvMaeC": 1.1349,
        "cvRmseC": 1.4961,
        "sampleHours": 4343
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.403307,
          "icon": 0.077428,
          "ukmo": 0.242902,
          "meteofrance": 0.163281,
          "gfs": 0.051359,
          "gem": 0.021723,
          "jma": 0.02
        },
        "interceptC": 0.2374,
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
        "spreadBaseC2": 1.0191,
        "spreadScale": 0.687,
        "cvMaeC": 1.1286,
        "cvRmseC": 1.495,
        "sampleHours": 4343
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.407576,
          "icon": 0.134855,
          "ukmo": 0.209951,
          "meteofrance": 0.119782,
          "gfs": 0.06439,
          "gem": 0.023446,
          "jma": 0.02
        },
        "interceptC": 0.2678,
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
        "spreadBaseC2": 0.9799,
        "spreadScale": 0.7057,
        "cvMaeC": 1.1222,
        "cvRmseC": 1.4939,
        "sampleHours": 4343
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.131484,
          "icon": 0.307584,
          "ukmo": 0.101848,
          "meteofrance": 0.180125,
          "gfs": 0.131273,
          "gem": 0.107686,
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
        "spreadBaseC2": 1.3188,
        "spreadScale": 0.7,
        "cvMaeC": 1.2205,
        "cvRmseC": 1.5569,
        "sampleHours": 4323
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.081869,
          "ecmwfAifs": 0.188564,
          "icon": 0.249313,
          "ukmo": 0.107798,
          "meteofrance": 0.151284,
          "gfs": 0.109266,
          "gem": 0.091906,
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
        "spreadBaseC2": 1.2485,
        "spreadScale": 0.7186,
        "cvMaeC": 1.2127,
        "cvRmseC": 1.5438,
        "sampleHours": 4323
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.143738,
          "ecmwfAifs": 0.245645,
          "icon": 0.19104,
          "ukmo": 0.113748,
          "meteofrance": 0.122443,
          "gfs": 0.08726,
          "gem": 0.076126,
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
        "spreadBaseC2": 1.1783,
        "spreadScale": 0.7372,
        "cvMaeC": 1.2048,
        "cvRmseC": 1.5308,
        "sampleHours": 4323
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
        "interceptC": 0.3614,
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
        "spreadBaseC2": 0.5335,
        "spreadScale": 1.1003,
        "cvMaeC": 1.0464,
        "cvRmseC": 1.4524,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.796795,
          "ecmwfAifs": 0.034612,
          "icon": 0.036231,
          "ukmo": 0.030887,
          "meteofrance": 0.031354,
          "gfs": 0.02,
          "gem": 0.030121,
          "jma": 0.02
        },
        "interceptC": 0.2057,
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
        "spreadBaseC2": 0.5542,
        "spreadScale": 1.0684,
        "cvMaeC": 1.0486,
        "cvRmseC": 1.4415,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.733588,
          "ecmwfAifs": 0.049225,
          "icon": 0.052461,
          "ukmo": 0.041774,
          "meteofrance": 0.042709,
          "gfs": 0.02,
          "gem": 0.040243,
          "jma": 0.02
        },
        "interceptC": 0.0501,
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
        "spreadBaseC2": 0.5749,
        "spreadScale": 1.0366,
        "cvMaeC": 1.0508,
        "cvRmseC": 1.4307,
        "sampleHours": 4416
      }
    },
    "SON": {
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
        "interceptC": 0.0468,
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
        "spreadBaseC2": 1.0503,
        "spreadScale": 0.9659,
        "cvMaeC": 1.2004,
        "cvRmseC": 1.6124,
        "sampleHours": 4350
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.796293,
          "ecmwfAifs": 0.037859,
          "icon": 0.043297,
          "ukmo": 0.027001,
          "meteofrance": 0.023879,
          "gfs": 0.02,
          "gem": 0.031671,
          "jma": 0.02
        },
        "interceptC": 0.0234,
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
        "spreadBaseC2": 1.0543,
        "spreadScale": 0.939,
        "cvMaeC": 1.1984,
        "cvRmseC": 1.5999,
        "sampleHours": 4350
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.732587,
          "ecmwfAifs": 0.055718,
          "icon": 0.066594,
          "ukmo": 0.034001,
          "meteofrance": 0.027758,
          "gfs": 0.02,
          "gem": 0.043342,
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
        "spreadBaseC2": 1.0584,
        "spreadScale": 0.9122,
        "cvMaeC": 1.1964,
        "cvRmseC": 1.5875,
        "sampleHours": 4350
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.232399,
        "ecmwfAifs": 0.082825,
        "icon": 0.230449,
        "ukmo": 0.116603,
        "meteofrance": 0.156961,
        "gfs": 0.065395,
        "gem": 0.057394,
        "jma": 0.057974
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245891,
        "ecmwfAifs": 0.079664,
        "icon": 0.222482,
        "ukmo": 0.118789,
        "meteofrance": 0.159506,
        "gfs": 0.062441,
        "gem": 0.054626,
        "jma": 0.056601
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.23488,
        "ecmwfAifs": 0.085827,
        "icon": 0.221535,
        "ukmo": 0.122609,
        "meteofrance": 0.155507,
        "gfs": 0.06999,
        "gem": 0.054533,
        "jma": 0.055119
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.236392,
        "ecmwfAifs": 0.081269,
        "icon": 0.226011,
        "ukmo": 0.117874,
        "meteofrance": 0.15979,
        "gfs": 0.065967,
        "gem": 0.053646,
        "jma": 0.059051
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.22204,
    "ecmwfAifs": 0.071885,
    "icon": 0.247796,
    "ukmo": 0.174655,
    "meteofrance": 0.111821,
    "gfs": 0.091931,
    "gem": 0.039936,
    "jma": 0.039936
  },
  "pressureWeights": {
    "ecmwfIfs": 0.379519,
    "ecmwfAifs": 0.136322,
    "icon": 0.143575,
    "ukmo": 0.14715,
    "meteofrance": 0.071748,
    "gfs": 0.049938,
    "gem": 0.035874,
    "jma": 0.035874
  }
} as const;

export default PROVINCE_CALIBRATION_TR_03;
