import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_78: ProvinceCalibrationBundle = {
  "provinceCode": "TR-78",
  "provinceName": "Karabük",
  "plateNumber": 78,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 41.2061,
  "stationLon": 32.6204,
  "stationElevationM": 485,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-14",
    "TR-37",
    "TR-67"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-14",
      "provinceName": "Bolu",
      "wmoStationId": "17070",
      "weight": 0.4
    },
    {
      "provinceCode": "TR-37",
      "provinceName": "Kastamonu",
      "wmoStationId": "17074",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-67",
      "provinceName": "Zonguldak",
      "wmoStationId": "17022",
      "weight": 0.25
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.111676,
          "ecmwfAifs": 0.113429,
          "icon": 0.218035,
          "ukmo": 0.224718,
          "meteofrance": 0.121276,
          "gfs": 0.110091,
          "gem": 0.080775,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.1777,
        "spreadScale": 0.6476,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254764,
            "ecmwfAifs": 0.080665,
            "icon": 0.219732,
            "ukmo": 0.114501,
            "meteofrance": 0.151387,
            "gfs": 0.066893,
            "gem": 0.056602,
            "jma": 0.055456
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
          "ecmwfIfs": 0.162202,
          "ecmwfAifs": 0.166099,
          "icon": 0.188286,
          "ukmo": 0.189559,
          "meteofrance": 0.088339,
          "gfs": 0.078197,
          "gem": 0.101355,
          "jma": 0.025963
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
        "spreadBaseC2": 1.1699,
        "spreadScale": 0.7539,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254764,
            "ecmwfAifs": 0.080665,
            "icon": 0.219732,
            "ukmo": 0.114501,
            "meteofrance": 0.151387,
            "gfs": 0.066893,
            "gem": 0.056602,
            "jma": 0.055456
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
          "ecmwfIfs": 0.202932,
          "ecmwfAifs": 0.06464,
          "icon": 0.221988,
          "ukmo": 0.214082,
          "meteofrance": 0.128414,
          "gfs": 0.053319,
          "gem": 0.094625,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.1611,
        "spreadScale": 0.7906,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.2514,
            "ecmwfAifs": 0.069651,
            "icon": 0.217614,
            "ukmo": 0.120692,
            "meteofrance": 0.157273,
            "gfs": 0.066878,
            "gem": 0.061606,
            "jma": 0.054886
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
          "ecmwfIfs": 0.226571,
          "ecmwfAifs": 0.123228,
          "icon": 0.212504,
          "ukmo": 0.175175,
          "meteofrance": 0.091494,
          "gfs": 0.049523,
          "gem": 0.101505,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 1.171,
        "spreadScale": 0.8619,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.2514,
            "ecmwfAifs": 0.069651,
            "icon": 0.217614,
            "ukmo": 0.120692,
            "meteofrance": 0.157273,
            "gfs": 0.066878,
            "gem": 0.061606,
            "jma": 0.054886
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
          "ecmwfIfs": 0.222988,
          "ecmwfAifs": 0.11011,
          "icon": 0.114324,
          "ukmo": 0.187597,
          "meteofrance": 0.217413,
          "gfs": 0.050578,
          "gem": 0.07699,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.6066,
        "spreadScale": 0.7135,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252069,
            "ecmwfAifs": 0.075997,
            "icon": 0.213444,
            "ukmo": 0.122038,
            "meteofrance": 0.158441,
            "gfs": 0.065002,
            "gem": 0.058754,
            "jma": 0.054255
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
          "ecmwfIfs": 0.271002,
          "ecmwfAifs": 0.128925,
          "icon": 0.128584,
          "ukmo": 0.176073,
          "meteofrance": 0.159248,
          "gfs": 0.045696,
          "gem": 0.070472,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.5954,
        "spreadScale": 0.7643,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252069,
            "ecmwfAifs": 0.075997,
            "icon": 0.213444,
            "ukmo": 0.122038,
            "meteofrance": 0.158441,
            "gfs": 0.065002,
            "gem": 0.058754,
            "jma": 0.054255
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
          "ecmwfIfs": 0.179299,
          "ecmwfAifs": 0.054676,
          "icon": 0.116495,
          "ukmo": 0.227762,
          "meteofrance": 0.154799,
          "gfs": 0.132,
          "gem": 0.114969,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.6651,
        "spreadScale": 0.8056,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.266521,
            "ecmwfAifs": 0.080132,
            "icon": 0.201994,
            "ukmo": 0.114778,
            "meteofrance": 0.149089,
            "gfs": 0.06948,
            "gem": 0.060272,
            "jma": 0.057734
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
          "ecmwfIfs": 0.241333,
          "ecmwfAifs": 0.130236,
          "icon": 0.145409,
          "ukmo": 0.184871,
          "meteofrance": 0.092384,
          "gfs": 0.093488,
          "gem": 0.092279,
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
        "maxResidualShiftC": 0,
        "spreadBaseC2": 0.7032,
        "spreadScale": 0.8891,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.266521,
            "ecmwfAifs": 0.080132,
            "icon": 0.201994,
            "ukmo": 0.114778,
            "meteofrance": 0.149089,
            "gfs": 0.06948,
            "gem": 0.060272,
            "jma": 0.057734
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
          "ecmwfIfs": 0.111676,
          "ecmwfAifs": 0.113429,
          "icon": 0.218035,
          "ukmo": 0.224718,
          "meteofrance": 0.121276,
          "gfs": 0.110091,
          "gem": 0.080775,
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
        "spreadBaseC2": 1.1777,
        "spreadScale": 0.6476,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.136939,
          "ecmwfAifs": 0.139764,
          "icon": 0.203161,
          "ukmo": 0.207139,
          "meteofrance": 0.104807,
          "gfs": 0.094144,
          "gem": 0.091065,
          "jma": 0.022981
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
        "spreadBaseC2": 1.1777,
        "spreadScale": 0.6476,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.162202,
          "ecmwfAifs": 0.166099,
          "icon": 0.188286,
          "ukmo": 0.189559,
          "meteofrance": 0.088339,
          "gfs": 0.078197,
          "gem": 0.101355,
          "jma": 0.025963
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
        "spreadBaseC2": 1.1699,
        "spreadScale": 0.7539,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.202932,
          "ecmwfAifs": 0.06464,
          "icon": 0.221988,
          "ukmo": 0.214082,
          "meteofrance": 0.128414,
          "gfs": 0.053319,
          "gem": 0.094625,
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
        "spreadBaseC2": 1.1611,
        "spreadScale": 0.7906,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.214751,
          "ecmwfAifs": 0.093934,
          "icon": 0.217247,
          "ukmo": 0.194628,
          "meteofrance": 0.109954,
          "gfs": 0.051421,
          "gem": 0.098065,
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
        "spreadBaseC2": 1.1611,
        "spreadScale": 0.7906,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.226571,
          "ecmwfAifs": 0.123228,
          "icon": 0.212504,
          "ukmo": 0.175175,
          "meteofrance": 0.091494,
          "gfs": 0.049523,
          "gem": 0.101505,
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
        "spreadBaseC2": 1.171,
        "spreadScale": 0.8619,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.222988,
          "ecmwfAifs": 0.11011,
          "icon": 0.114324,
          "ukmo": 0.187597,
          "meteofrance": 0.217413,
          "gfs": 0.050578,
          "gem": 0.07699,
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
        "spreadBaseC2": 0.6066,
        "spreadScale": 0.7135,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.246994,
          "ecmwfAifs": 0.119518,
          "icon": 0.121454,
          "ukmo": 0.181835,
          "meteofrance": 0.188331,
          "gfs": 0.048137,
          "gem": 0.073731,
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
        "spreadBaseC2": 0.6066,
        "spreadScale": 0.7135,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.271002,
          "ecmwfAifs": 0.128925,
          "icon": 0.128584,
          "ukmo": 0.176073,
          "meteofrance": 0.159248,
          "gfs": 0.045696,
          "gem": 0.070472,
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
        "spreadBaseC2": 0.5954,
        "spreadScale": 0.7643,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.179299,
          "ecmwfAifs": 0.054676,
          "icon": 0.116495,
          "ukmo": 0.227762,
          "meteofrance": 0.154799,
          "gfs": 0.132,
          "gem": 0.114969,
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
        "spreadBaseC2": 0.6651,
        "spreadScale": 0.8056,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.210316,
          "ecmwfAifs": 0.092456,
          "icon": 0.130952,
          "ukmo": 0.206317,
          "meteofrance": 0.123591,
          "gfs": 0.112744,
          "gem": 0.103624,
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
        "spreadBaseC2": 0.6651,
        "spreadScale": 0.8056,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.241333,
          "ecmwfAifs": 0.130236,
          "icon": 0.145409,
          "ukmo": 0.184871,
          "meteofrance": 0.092384,
          "gfs": 0.093488,
          "gem": 0.092279,
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
        "spreadBaseC2": 0.7032,
        "spreadScale": 0.8891,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.254764,
        "ecmwfAifs": 0.080665,
        "icon": 0.219732,
        "ukmo": 0.114501,
        "meteofrance": 0.151387,
        "gfs": 0.066893,
        "gem": 0.056602,
        "jma": 0.055456
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.2514,
        "ecmwfAifs": 0.069651,
        "icon": 0.217614,
        "ukmo": 0.120692,
        "meteofrance": 0.157273,
        "gfs": 0.066878,
        "gem": 0.061606,
        "jma": 0.054886
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.252069,
        "ecmwfAifs": 0.075997,
        "icon": 0.213444,
        "ukmo": 0.122038,
        "meteofrance": 0.158441,
        "gfs": 0.065002,
        "gem": 0.058754,
        "jma": 0.054255
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.266521,
        "ecmwfAifs": 0.080132,
        "icon": 0.201994,
        "ukmo": 0.114778,
        "meteofrance": 0.149089,
        "gfs": 0.06948,
        "gem": 0.060272,
        "jma": 0.057734
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.229073,
    "ecmwfAifs": 0.070216,
    "icon": 0.241882,
    "ukmo": 0.176503,
    "meteofrance": 0.109225,
    "gfs": 0.095083,
    "gem": 0.039009,
    "jma": 0.039009
  },
  "pressureWeights": {
    "ecmwfIfs": 0.275105,
    "ecmwfAifs": 0.147407,
    "icon": 0.12975,
    "ukmo": 0.221389,
    "meteofrance": 0.077583,
    "gfs": 0.071184,
    "gem": 0.038791,
    "jma": 0.038791
  }
} as const;

export default PROVINCE_CALIBRATION_TR_78;
