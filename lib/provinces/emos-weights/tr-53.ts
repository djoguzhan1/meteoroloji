import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_53: ProvinceCalibrationBundle = {
  "provinceCode": "TR-53",
  "provinceName": "Rize",
  "plateNumber": 53,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17040",
  "stationLat": 41.0333,
  "stationLon": 40.5167,
  "stationElevationM": 9,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17083,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.719864,
          "ecmwfAifs": 0.026525,
          "icon": 0.02,
          "ukmo": 0.130063,
          "meteofrance": 0.043548,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1584,
        "betaDrivers": [
          -0.1726,
          -0.2508,
          -0.2461,
          -0.3311,
          -0.2081,
          0.1024
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.3994,
        "spreadScale": 0.1204,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250519,
            "ecmwfAifs": 0.087752,
            "icon": 0.215042,
            "ukmo": 0.104796,
            "meteofrance": 0.158158,
            "gfs": 0.064422,
            "gem": 0.065806,
            "jma": 0.053505
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.916,
          "logisticSlope": 4.6601,
          "wetFractionWeight": 3.364,
          "powerEta": 0.68,
          "rawBrier": 0.05155,
          "calibratedBrier": 0.04798
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6701,
          "rawIfsRmseC": 0.8993,
          "rawEqualMaeC": 1.0575,
          "rawEqualRmseC": 1.4537,
          "cvSimplexMaeC": 0.6483,
          "cvCalibratedMaeC": 0.5863,
          "cvCalibratedRmseC": 0.7844
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.654034,
          "ecmwfAifs": 0.059073,
          "icon": 0.051508,
          "ukmo": 0.131084,
          "meteofrance": 0.044301,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.147,
        "betaDrivers": [
          -0.1068,
          -0.1725,
          -0.1256,
          -0.1365,
          -0.066,
          0.0956
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.3718,
        "spreadScale": 0.1555,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.321779,
            "ecmwfAifs": 0.235141,
            "icon": 0.133343,
            "ukmo": 0.094259,
            "meteofrance": 0.045136,
            "gfs": 0.062774,
            "gem": 0.064122,
            "jma": 0.043446
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0923,
          "logisticSlope": 5.0171,
          "wetFractionWeight": 3.1158,
          "powerEta": 0.68,
          "rawBrier": 0.05155,
          "calibratedBrier": 0.04718
        },
        "verification": {
          "sampleHours": 4277,
          "rawIfsMaeC": 0.6701,
          "rawIfsRmseC": 0.8993,
          "rawEqualMaeC": 1.0575,
          "rawEqualRmseC": 1.4537,
          "cvSimplexMaeC": 0.6573,
          "cvCalibratedMaeC": 0.5972,
          "cvCalibratedRmseC": 0.8066
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.492532,
          "ecmwfAifs": 0.02,
          "icon": 0.096406,
          "ukmo": 0.144906,
          "meteofrance": 0.102425,
          "gfs": 0.02,
          "gem": 0.045141,
          "jma": 0.07859
        },
        "intercept": -0.1391,
        "betaDrivers": [
          -0.0175,
          -0.092,
          -0.0002,
          -0.4036,
          -0.0481,
          0.3557
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2575,
        "spreadScale": 0.1761,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.265522,
            "ecmwfAifs": 0.066384,
            "icon": 0.209369,
            "ukmo": 0.122049,
            "meteofrance": 0.150984,
            "gfs": 0.065324,
            "gem": 0.062215,
            "jma": 0.058153
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8423,
          "logisticSlope": 4.2983,
          "wetFractionWeight": 3.5307,
          "powerEta": 0.68,
          "rawBrier": 0.06165,
          "calibratedBrier": 0.05594
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.8661,
          "rawIfsRmseC": 1.2127,
          "rawEqualMaeC": 0.7638,
          "rawEqualRmseC": 1.0714,
          "cvSimplexMaeC": 0.5769,
          "cvCalibratedMaeC": 0.5582,
          "cvCalibratedRmseC": 0.809
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.491422,
          "ecmwfAifs": 0.025042,
          "icon": 0.122586,
          "ukmo": 0.133833,
          "meteofrance": 0.082809,
          "gfs": 0.02,
          "gem": 0.052921,
          "jma": 0.071387
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0232,
          -0.0668,
          -0.0124,
          -0.1505,
          -0.0172,
          0.1417
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.2529,
        "spreadScale": 0.1871,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.350172,
            "ecmwfAifs": 0.182641,
            "icon": 0.133297,
            "ukmo": 0.112713,
            "meteofrance": 0.045095,
            "gfs": 0.065355,
            "gem": 0.062244,
            "jma": 0.048483
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9879,
          "logisticSlope": 5.0537,
          "wetFractionWeight": 3.0738,
          "powerEta": 0.68,
          "rawBrier": 0.06165,
          "calibratedBrier": 0.05506
        },
        "verification": {
          "sampleHours": 4185,
          "rawIfsMaeC": 0.8661,
          "rawIfsRmseC": 1.2127,
          "rawEqualMaeC": 0.7638,
          "rawEqualRmseC": 1.0714,
          "cvSimplexMaeC": 0.5768,
          "cvCalibratedMaeC": 0.562,
          "cvCalibratedRmseC": 0.8211
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.582305,
          "ecmwfAifs": 0.049993,
          "icon": 0.099937,
          "ukmo": 0.084608,
          "meteofrance": 0.105068,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.038089
        },
        "intercept": -0.1255,
        "betaDrivers": [
          0.0107,
          -0.0418,
          0.005,
          -0.2626,
          -0.1009,
          0.2174
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.2316,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.270527,
            "ecmwfAifs": 0.091608,
            "icon": 0.183754,
            "ukmo": 0.113714,
            "meteofrance": 0.156438,
            "gfs": 0.064932,
            "gem": 0.067196,
            "jma": 0.051831
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.1051,
          "logisticSlope": 2.262,
          "wetFractionWeight": 4.8161,
          "powerEta": 0.68,
          "rawBrier": 0.10411,
          "calibratedBrier": 0.10086
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4575,
          "rawIfsRmseC": 0.642,
          "rawEqualMaeC": 0.5192,
          "rawEqualRmseC": 0.6849,
          "cvSimplexMaeC": 0.4041,
          "cvCalibratedMaeC": 0.4011,
          "cvCalibratedRmseC": 0.5465
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.510791,
          "ecmwfAifs": 0.08858,
          "icon": 0.141171,
          "ukmo": 0.093903,
          "meteofrance": 0.067242,
          "gfs": 0.02,
          "gem": 0.046056,
          "jma": 0.032257
        },
        "intercept": 0,
        "betaDrivers": [
          0.003,
          -0.0312,
          -0.012,
          -0.0826,
          -0.042,
          0.078
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.239,
        "spreadScale": 0.05,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.33859,
            "ecmwfAifs": 0.239195,
            "icon": 0.111027,
            "ukmo": 0.099664,
            "meteofrance": 0.045061,
            "gfs": 0.061651,
            "gem": 0.063802,
            "jma": 0.04101
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.4919,
          "logisticSlope": 2.0907,
          "wetFractionWeight": 4.8287,
          "powerEta": 0.68,
          "rawBrier": 0.10411,
          "calibratedBrier": 0.09558
        },
        "verification": {
          "sampleHours": 4331,
          "rawIfsMaeC": 0.4575,
          "rawIfsRmseC": 0.642,
          "rawEqualMaeC": 0.5192,
          "rawEqualRmseC": 0.6849,
          "cvSimplexMaeC": 0.4102,
          "cvCalibratedMaeC": 0.4078,
          "cvCalibratedRmseC": 0.5532
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.617719,
          "ecmwfAifs": 0.02187,
          "icon": 0.073491,
          "ukmo": 0.129231,
          "meteofrance": 0.097689,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.2533,
        "betaDrivers": [
          -0.0069,
          -0.184,
          -0.0285,
          -0.1472,
          -0.242,
          0.3607
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1823,
        "spreadScale": 0.1431,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.297467,
            "ecmwfAifs": 0.086588,
            "icon": 0.175167,
            "ukmo": 0.107386,
            "meteofrance": 0.152637,
            "gfs": 0.066339,
            "gem": 0.060541,
            "jma": 0.053875
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.8843,
          "logisticSlope": 2.3656,
          "wetFractionWeight": 5.5853,
          "powerEta": 0.68,
          "rawBrier": 0.0588,
          "calibratedBrier": 0.05253
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5518,
          "rawIfsRmseC": 0.7665,
          "rawEqualMaeC": 0.758,
          "rawEqualRmseC": 1.049,
          "cvSimplexMaeC": 0.4967,
          "cvCalibratedMaeC": 0.4756,
          "cvCalibratedRmseC": 0.6382
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.556445,
          "ecmwfAifs": 0.058457,
          "icon": 0.138153,
          "ukmo": 0.124393,
          "meteofrance": 0.062552,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.1039,
        "betaDrivers": [
          -0.0119,
          -0.1078,
          -0.0369,
          -0.0754,
          -0.0843,
          0.1693
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1771,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.369814,
            "ecmwfAifs": 0.224575,
            "icon": 0.10513,
            "ukmo": 0.093488,
            "meteofrance": 0.044986,
            "gfs": 0.062566,
            "gem": 0.057098,
            "jma": 0.042343
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3135,
          "logisticSlope": 2.4673,
          "wetFractionWeight": 5.3762,
          "powerEta": 0.68,
          "rawBrier": 0.0588,
          "calibratedBrier": 0.04879
        },
        "verification": {
          "sampleHours": 4290,
          "rawIfsMaeC": 0.5518,
          "rawIfsRmseC": 0.7665,
          "rawEqualMaeC": 0.758,
          "rawEqualRmseC": 1.049,
          "cvSimplexMaeC": 0.5011,
          "cvCalibratedMaeC": 0.4857,
          "cvCalibratedRmseC": 0.6532
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.719864,
          "ecmwfAifs": 0.026525,
          "icon": 0.02,
          "ukmo": 0.130063,
          "meteofrance": 0.043548,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1584,
        "diurnalHarmonicsC": [
          -0.1726,
          -0.2508,
          0,
          0
        ],
        "driverBetasC": [
          -0.2461,
          0.1024,
          -0.3311,
          -0.2081
        ],
        "spreadBaseC2": 0.3994,
        "spreadScale": 0.1204,
        "cvMaeC": 0.5863,
        "cvRmseC": 0.7844,
        "sampleHours": 4277
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.68695,
          "ecmwfAifs": 0.042799,
          "icon": 0.035754,
          "ukmo": 0.130573,
          "meteofrance": 0.043924,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1527,
        "diurnalHarmonicsC": [
          -0.1397,
          -0.2117,
          0,
          0
        ],
        "driverBetasC": [
          -0.1859,
          0.099,
          -0.2338,
          -0.1371
        ],
        "spreadBaseC2": 0.3856,
        "spreadScale": 0.1379,
        "cvMaeC": 0.5917,
        "cvRmseC": 0.7955,
        "sampleHours": 4277
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.654034,
          "ecmwfAifs": 0.059073,
          "icon": 0.051508,
          "ukmo": 0.131084,
          "meteofrance": 0.044301,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.147,
        "diurnalHarmonicsC": [
          -0.1068,
          -0.1725,
          0,
          0
        ],
        "driverBetasC": [
          -0.1256,
          0.0956,
          -0.1365,
          -0.066
        ],
        "spreadBaseC2": 0.3718,
        "spreadScale": 0.1555,
        "cvMaeC": 0.5972,
        "cvRmseC": 0.8066,
        "sampleHours": 4277
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.492532,
          "ecmwfAifs": 0.02,
          "icon": 0.096406,
          "ukmo": 0.144906,
          "meteofrance": 0.102425,
          "gfs": 0.02,
          "gem": 0.045141,
          "jma": 0.07859
        },
        "interceptC": -0.1391,
        "diurnalHarmonicsC": [
          -0.0175,
          -0.092,
          0,
          0
        ],
        "driverBetasC": [
          -0.0002,
          0.3557,
          -0.4036,
          -0.0481
        ],
        "spreadBaseC2": 0.2575,
        "spreadScale": 0.1761,
        "cvMaeC": 0.5582,
        "cvRmseC": 0.809,
        "sampleHours": 4185
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.491978,
          "ecmwfAifs": 0.022521,
          "icon": 0.109496,
          "ukmo": 0.139369,
          "meteofrance": 0.092617,
          "gfs": 0.02,
          "gem": 0.049031,
          "jma": 0.074988
        },
        "interceptC": -0.0696,
        "diurnalHarmonicsC": [
          -0.0204,
          -0.0794,
          0,
          0
        ],
        "driverBetasC": [
          -0.0063,
          0.2487,
          -0.2771,
          -0.0326
        ],
        "spreadBaseC2": 0.2552,
        "spreadScale": 0.1816,
        "cvMaeC": 0.5601,
        "cvRmseC": 0.8151,
        "sampleHours": 4185
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.491422,
          "ecmwfAifs": 0.025042,
          "icon": 0.122586,
          "ukmo": 0.133833,
          "meteofrance": 0.082809,
          "gfs": 0.02,
          "gem": 0.052921,
          "jma": 0.071387
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0232,
          -0.0668,
          0,
          0
        ],
        "driverBetasC": [
          -0.0124,
          0.1417,
          -0.1505,
          -0.0172
        ],
        "spreadBaseC2": 0.2529,
        "spreadScale": 0.1871,
        "cvMaeC": 0.562,
        "cvRmseC": 0.8211,
        "sampleHours": 4185
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.582305,
          "ecmwfAifs": 0.049993,
          "icon": 0.099937,
          "ukmo": 0.084608,
          "meteofrance": 0.105068,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.038089
        },
        "interceptC": -0.1255,
        "diurnalHarmonicsC": [
          0.0107,
          -0.0418,
          0,
          0
        ],
        "driverBetasC": [
          0.005,
          0.2174,
          -0.2626,
          -0.1009
        ],
        "spreadBaseC2": 0.2316,
        "spreadScale": 0.05,
        "cvMaeC": 0.4011,
        "cvRmseC": 0.5465,
        "sampleHours": 4331
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.546549,
          "ecmwfAifs": 0.069286,
          "icon": 0.120554,
          "ukmo": 0.089255,
          "meteofrance": 0.086155,
          "gfs": 0.02,
          "gem": 0.033028,
          "jma": 0.035173
        },
        "interceptC": -0.0628,
        "diurnalHarmonicsC": [
          0.0069,
          -0.0365,
          0,
          0
        ],
        "driverBetasC": [
          -0.0035,
          0.1477,
          -0.1726,
          -0.0714
        ],
        "spreadBaseC2": 0.2353,
        "spreadScale": 0.05,
        "cvMaeC": 0.4044,
        "cvRmseC": 0.5498,
        "sampleHours": 4331
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.510791,
          "ecmwfAifs": 0.08858,
          "icon": 0.141171,
          "ukmo": 0.093903,
          "meteofrance": 0.067242,
          "gfs": 0.02,
          "gem": 0.046056,
          "jma": 0.032257
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          0.003,
          -0.0312,
          0,
          0
        ],
        "driverBetasC": [
          -0.012,
          0.078,
          -0.0826,
          -0.042
        ],
        "spreadBaseC2": 0.239,
        "spreadScale": 0.05,
        "cvMaeC": 0.4078,
        "cvRmseC": 0.5532,
        "sampleHours": 4331
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.617719,
          "ecmwfAifs": 0.02187,
          "icon": 0.073491,
          "ukmo": 0.129231,
          "meteofrance": 0.097689,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.2533,
        "diurnalHarmonicsC": [
          -0.0069,
          -0.184,
          0,
          0
        ],
        "driverBetasC": [
          -0.0285,
          0.3607,
          -0.1472,
          -0.242
        ],
        "spreadBaseC2": 0.1823,
        "spreadScale": 0.1431,
        "cvMaeC": 0.4756,
        "cvRmseC": 0.6382,
        "sampleHours": 4290
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.587081,
          "ecmwfAifs": 0.040164,
          "icon": 0.105822,
          "ukmo": 0.126812,
          "meteofrance": 0.080121,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1786,
        "diurnalHarmonicsC": [
          -0.0094,
          -0.1459,
          0,
          0
        ],
        "driverBetasC": [
          -0.0327,
          0.265,
          -0.1113,
          -0.1631
        ],
        "spreadBaseC2": 0.1661,
        "spreadScale": 0.1601,
        "cvMaeC": 0.4807,
        "cvRmseC": 0.6457,
        "sampleHours": 4290
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.556445,
          "ecmwfAifs": 0.058457,
          "icon": 0.138153,
          "ukmo": 0.124393,
          "meteofrance": 0.062552,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1039,
        "diurnalHarmonicsC": [
          -0.0119,
          -0.1078,
          0,
          0
        ],
        "driverBetasC": [
          -0.0369,
          0.1693,
          -0.0754,
          -0.0843
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1771,
        "cvMaeC": 0.4857,
        "cvRmseC": 0.6532,
        "sampleHours": 4290
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.250519,
        "ecmwfAifs": 0.087752,
        "icon": 0.215042,
        "ukmo": 0.104796,
        "meteofrance": 0.158158,
        "gfs": 0.064422,
        "gem": 0.065806,
        "jma": 0.053505
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.265522,
        "ecmwfAifs": 0.066384,
        "icon": 0.209369,
        "ukmo": 0.122049,
        "meteofrance": 0.150984,
        "gfs": 0.065324,
        "gem": 0.062215,
        "jma": 0.058153
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.270527,
        "ecmwfAifs": 0.091608,
        "icon": 0.183754,
        "ukmo": 0.113714,
        "meteofrance": 0.156438,
        "gfs": 0.064932,
        "gem": 0.067196,
        "jma": 0.051831
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.297467,
        "ecmwfAifs": 0.086588,
        "icon": 0.175167,
        "ukmo": 0.107386,
        "meteofrance": 0.152637,
        "gfs": 0.066339,
        "gem": 0.060541,
        "jma": 0.053875
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.258126,
    "ecmwfAifs": 0.07019,
    "icon": 0.216832,
    "ukmo": 0.145303,
    "meteofrance": 0.109185,
    "gfs": 0.122376,
    "gem": 0.038994,
    "jma": 0.038994
  },
  "pressureWeights": {
    "ecmwfIfs": 0.334543,
    "ecmwfAifs": 0.142426,
    "icon": 0.123325,
    "ukmo": 0.174751,
    "meteofrance": 0.074961,
    "gfs": 0.075032,
    "gem": 0.037481,
    "jma": 0.037481
  }
} as const;

export default PROVINCE_CALIBRATION_TR_53;
