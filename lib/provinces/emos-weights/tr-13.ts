import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_13: ProvinceCalibrationBundle = {
  "provinceCode": "TR-13",
  "provinceName": "Bitlis",
  "plateNumber": 13,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 38.4011,
  "stationLon": 42.1078,
  "stationElevationM": 1789,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-49",
    "TR-65",
    "TR-12"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-49",
      "provinceName": "Muş",
      "wmoStationId": "17204",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-65",
      "provinceName": "Van",
      "wmoStationId": "17170",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-12",
      "provinceName": "Bingöl",
      "wmoStationId": "17203",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.39285,
          "ecmwfAifs": 0.205567,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02775,
          "gfs": 0.064116,
          "gem": 0.143266,
          "jma": 0.126451
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.9836,
        "spreadScale": 0.2007,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.260442,
            "ecmwfAifs": 0.086631,
            "icon": 0.226678,
            "ukmo": 0.110027,
            "meteofrance": 0.14274,
            "gfs": 0.065222,
            "gem": 0.051681,
            "jma": 0.056579
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.443651,
          "ecmwfAifs": 0.229173,
          "icon": 0.025334,
          "ukmo": 0.026826,
          "meteofrance": 0.022281,
          "gfs": 0.04303,
          "gem": 0.085889,
          "jma": 0.123816
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.0014,
        "spreadScale": 0.211,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.260442,
            "ecmwfAifs": 0.086631,
            "icon": 0.226678,
            "ukmo": 0.110027,
            "meteofrance": 0.14274,
            "gfs": 0.065222,
            "gem": 0.051681,
            "jma": 0.056579
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.470497,
          "ecmwfAifs": 0.185198,
          "icon": 0.040992,
          "ukmo": 0.065753,
          "meteofrance": 0.029604,
          "gfs": 0.020636,
          "gem": 0.071123,
          "jma": 0.116197
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.0627,
        "spreadScale": 0.1984,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244165,
            "ecmwfAifs": 0.074375,
            "icon": 0.226735,
            "ukmo": 0.119423,
            "meteofrance": 0.154249,
            "gfs": 0.067379,
            "gem": 0.055297,
            "jma": 0.058377
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.450597,
          "ecmwfAifs": 0.219073,
          "icon": 0.062125,
          "ukmo": 0.057105,
          "meteofrance": 0.032372,
          "gfs": 0.033566,
          "gem": 0.051411,
          "jma": 0.093751
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.0972,
        "spreadScale": 0.1922,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244165,
            "ecmwfAifs": 0.074375,
            "icon": 0.226735,
            "ukmo": 0.119423,
            "meteofrance": 0.154249,
            "gfs": 0.067379,
            "gem": 0.055297,
            "jma": 0.058377
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.51286,
          "ecmwfAifs": 0.02,
          "icon": 0.020459,
          "ukmo": 0.023983,
          "meteofrance": 0.073616,
          "gfs": 0.089886,
          "gem": 0.097885,
          "jma": 0.161311
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.2065,
        "spreadScale": 0.1132,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232989,
            "ecmwfAifs": 0.082658,
            "icon": 0.224551,
            "ukmo": 0.123852,
            "meteofrance": 0.160072,
            "gfs": 0.067231,
            "gem": 0.052616,
            "jma": 0.056031
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.488675,
          "ecmwfAifs": 0.087954,
          "icon": 0.048019,
          "ukmo": 0.022948,
          "meteofrance": 0.081763,
          "gfs": 0.061905,
          "gem": 0.080118,
          "jma": 0.128618
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.2354,
        "spreadScale": 0.1033,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232989,
            "ecmwfAifs": 0.082658,
            "icon": 0.224551,
            "ukmo": 0.123852,
            "meteofrance": 0.160072,
            "gfs": 0.067231,
            "gem": 0.052616,
            "jma": 0.056031
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.509027,
          "ecmwfAifs": 0.047765,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.160044,
          "gem": 0.117504,
          "jma": 0.10566
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.7347,
        "spreadScale": 0.3036,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230327,
            "ecmwfAifs": 0.082415,
            "icon": 0.222922,
            "ukmo": 0.120911,
            "meteofrance": 0.158657,
            "gfs": 0.068476,
            "gem": 0.056889,
            "jma": 0.059403
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3.2,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.501766,
          "ecmwfAifs": 0.094409,
          "icon": 0.033951,
          "ukmo": 0.021077,
          "meteofrance": 0.02,
          "gfs": 0.126981,
          "gem": 0.093319,
          "jma": 0.108497
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.8355,
        "spreadScale": 0.2608,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230327,
            "ecmwfAifs": 0.082415,
            "icon": 0.222922,
            "ukmo": 0.120911,
            "meteofrance": 0.158657,
            "gfs": 0.068476,
            "gem": 0.056889,
            "jma": 0.059403
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -2.85,
          "logisticSlope": 3,
          "wetFractionWeight": 2,
          "powerEta": 0.68,
          "rawBrier": null,
          "calibratedBrier": null
        },
        "verification": {
          "sampleHours": 0,
          "rawIfsMaeC": null,
          "rawIfsRmseC": null,
          "rawEqualMaeC": null,
          "rawEqualRmseC": null,
          "cvSimplexMaeC": null,
          "cvCalibratedMaeC": null,
          "cvCalibratedRmseC": null
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.39285,
          "ecmwfAifs": 0.205567,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02775,
          "gfs": 0.064116,
          "gem": 0.143266,
          "jma": 0.126451
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
        "spreadBaseC2": 0.9836,
        "spreadScale": 0.2007,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.418249,
          "ecmwfAifs": 0.21737,
          "icon": 0.022667,
          "ukmo": 0.023413,
          "meteofrance": 0.025016,
          "gfs": 0.053573,
          "gem": 0.114578,
          "jma": 0.125134
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
        "spreadBaseC2": 0.9836,
        "spreadScale": 0.2007,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.443651,
          "ecmwfAifs": 0.229173,
          "icon": 0.025334,
          "ukmo": 0.026826,
          "meteofrance": 0.022281,
          "gfs": 0.04303,
          "gem": 0.085889,
          "jma": 0.123816
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
        "spreadBaseC2": 1.0014,
        "spreadScale": 0.211,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.470497,
          "ecmwfAifs": 0.185198,
          "icon": 0.040992,
          "ukmo": 0.065753,
          "meteofrance": 0.029604,
          "gfs": 0.020636,
          "gem": 0.071123,
          "jma": 0.116197
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
        "spreadBaseC2": 1.0627,
        "spreadScale": 0.1984,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.460546,
          "ecmwfAifs": 0.202136,
          "icon": 0.051559,
          "ukmo": 0.061429,
          "meteofrance": 0.030988,
          "gfs": 0.027101,
          "gem": 0.061267,
          "jma": 0.104974
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
        "spreadBaseC2": 1.0627,
        "spreadScale": 0.1984,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.450597,
          "ecmwfAifs": 0.219073,
          "icon": 0.062125,
          "ukmo": 0.057105,
          "meteofrance": 0.032372,
          "gfs": 0.033566,
          "gem": 0.051411,
          "jma": 0.093751
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
        "spreadBaseC2": 1.0972,
        "spreadScale": 0.1922,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.51286,
          "ecmwfAifs": 0.02,
          "icon": 0.020459,
          "ukmo": 0.023983,
          "meteofrance": 0.073616,
          "gfs": 0.089886,
          "gem": 0.097885,
          "jma": 0.161311
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
        "spreadBaseC2": 1.2065,
        "spreadScale": 0.1132,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.500769,
          "ecmwfAifs": 0.053977,
          "icon": 0.034239,
          "ukmo": 0.023465,
          "meteofrance": 0.077689,
          "gfs": 0.075895,
          "gem": 0.089001,
          "jma": 0.144965
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
        "spreadBaseC2": 1.2065,
        "spreadScale": 0.1132,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.488675,
          "ecmwfAifs": 0.087954,
          "icon": 0.048019,
          "ukmo": 0.022948,
          "meteofrance": 0.081763,
          "gfs": 0.061905,
          "gem": 0.080118,
          "jma": 0.128618
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
        "spreadBaseC2": 1.2354,
        "spreadScale": 0.1033,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.509027,
          "ecmwfAifs": 0.047765,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.160044,
          "gem": 0.117504,
          "jma": 0.10566
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
        "spreadBaseC2": 0.7347,
        "spreadScale": 0.3036,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.505397,
          "ecmwfAifs": 0.071087,
          "icon": 0.026975,
          "ukmo": 0.020539,
          "meteofrance": 0.02,
          "gfs": 0.143513,
          "gem": 0.105411,
          "jma": 0.107078
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
        "spreadBaseC2": 0.7347,
        "spreadScale": 0.3036,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.501766,
          "ecmwfAifs": 0.094409,
          "icon": 0.033951,
          "ukmo": 0.021077,
          "meteofrance": 0.02,
          "gfs": 0.126981,
          "gem": 0.093319,
          "jma": 0.108497
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
        "spreadBaseC2": 0.8355,
        "spreadScale": 0.2608,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.260442,
        "ecmwfAifs": 0.086631,
        "icon": 0.226678,
        "ukmo": 0.110027,
        "meteofrance": 0.14274,
        "gfs": 0.065222,
        "gem": 0.051681,
        "jma": 0.056579
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.244165,
        "ecmwfAifs": 0.074375,
        "icon": 0.226735,
        "ukmo": 0.119423,
        "meteofrance": 0.154249,
        "gfs": 0.067379,
        "gem": 0.055297,
        "jma": 0.058377
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.232989,
        "ecmwfAifs": 0.082658,
        "icon": 0.224551,
        "ukmo": 0.123852,
        "meteofrance": 0.160072,
        "gfs": 0.067231,
        "gem": 0.052616,
        "jma": 0.056031
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.230327,
        "ecmwfAifs": 0.082415,
        "icon": 0.222922,
        "ukmo": 0.120911,
        "meteofrance": 0.158657,
        "gfs": 0.068476,
        "gem": 0.056889,
        "jma": 0.059403
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.269024,
    "ecmwfAifs": 0.067462,
    "icon": 0.222346,
    "ukmo": 0.160167,
    "meteofrance": 0.104941,
    "gfs": 0.101102,
    "gem": 0.037479,
    "jma": 0.037479
  },
  "pressureWeights": {
    "ecmwfIfs": 0.397828,
    "ecmwfAifs": 0.130455,
    "icon": 0.17788,
    "ukmo": 0.130448,
    "meteofrance": 0.068595,
    "gfs": 0.026338,
    "gem": 0.034228,
    "jma": 0.034228
  }
} as const;

export default PROVINCE_CALIBRATION_TR_13;
