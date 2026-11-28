import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_39: ProvinceCalibrationBundle = {
  "provinceCode": "TR-39",
  "provinceName": "Kırklareli",
  "plateNumber": 39,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 41.7351,
  "stationLon": 27.2252,
  "stationElevationM": 232,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-22",
    "TR-59"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-22",
      "provinceName": "Edirne",
      "wmoStationId": "17050",
      "weight": 0.6
    },
    {
      "provinceCode": "TR-59",
      "provinceName": "Tekirdağ",
      "wmoStationId": "17056",
      "weight": 0.4
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.224594,
          "icon": 0.22656,
          "ukmo": 0.0914,
          "meteofrance": 0.185205,
          "gfs": 0.093756,
          "gem": 0.02,
          "jma": 0.138485
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
        "spreadBaseC2": 0.8731,
        "spreadScale": 0.3272,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243716,
            "ecmwfAifs": 0.083729,
            "icon": 0.221063,
            "ukmo": 0.113065,
            "meteofrance": 0.158618,
            "gfs": 0.06654,
            "gem": 0.05712,
            "jma": 0.056149
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
          "ecmwfIfs": 0.097152,
          "ecmwfAifs": 0.345221,
          "icon": 0.173266,
          "ukmo": 0.093962,
          "meteofrance": 0.112728,
          "gfs": 0.072494,
          "gem": 0.02,
          "jma": 0.085177
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
        "spreadBaseC2": 0.9613,
        "spreadScale": 0.2678,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243716,
            "ecmwfAifs": 0.083729,
            "icon": 0.221063,
            "ukmo": 0.113065,
            "meteofrance": 0.158618,
            "gfs": 0.06654,
            "gem": 0.05712,
            "jma": 0.056149
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
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.101235,
          "icon": 0.189155,
          "ukmo": 0.023378,
          "meteofrance": 0.473776,
          "gfs": 0.077174,
          "gem": 0.064144,
          "jma": 0.051138
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
        "spreadBaseC2": 1.1234,
        "spreadScale": 0.1693,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246782,
            "ecmwfAifs": 0.073382,
            "icon": 0.218536,
            "ukmo": 0.121126,
            "meteofrance": 0.161571,
            "gfs": 0.064036,
            "gem": 0.058207,
            "jma": 0.05636
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
          "ecmwfIfs": 0.040441,
          "ecmwfAifs": 0.278594,
          "icon": 0.173069,
          "ukmo": 0.043594,
          "meteofrance": 0.266971,
          "gfs": 0.064676,
          "gem": 0.069435,
          "jma": 0.06322
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
        "spreadBaseC2": 1.1191,
        "spreadScale": 0.2495,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246782,
            "ecmwfAifs": 0.073382,
            "icon": 0.218536,
            "ukmo": 0.121126,
            "meteofrance": 0.161571,
            "gfs": 0.064036,
            "gem": 0.058207,
            "jma": 0.05636
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
          "ecmwfIfs": 0.030723,
          "ecmwfAifs": 0.210604,
          "icon": 0.193856,
          "ukmo": 0.02,
          "meteofrance": 0.213186,
          "gfs": 0.115079,
          "gem": 0.196552,
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
        "spreadBaseC2": 0.4645,
        "spreadScale": 0.512,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236337,
            "ecmwfAifs": 0.081238,
            "icon": 0.221775,
            "ukmo": 0.116115,
            "meteofrance": 0.159333,
            "gfs": 0.066809,
            "gem": 0.05887,
            "jma": 0.059523
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
          "ecmwfIfs": 0.154071,
          "ecmwfAifs": 0.280943,
          "icon": 0.15763,
          "ukmo": 0.02,
          "meteofrance": 0.134174,
          "gfs": 0.092852,
          "gem": 0.14033,
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
        "spreadBaseC2": 0.5219,
        "spreadScale": 0.6193,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236337,
            "ecmwfAifs": 0.081238,
            "icon": 0.221775,
            "ukmo": 0.116115,
            "meteofrance": 0.159333,
            "gfs": 0.066809,
            "gem": 0.05887,
            "jma": 0.059523
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
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.099429,
          "icon": 0.236302,
          "ukmo": 0.107782,
          "meteofrance": 0.264052,
          "gfs": 0.153195,
          "gem": 0.04018,
          "jma": 0.07906
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
        "spreadBaseC2": 0.775,
        "spreadScale": 0.2403,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23967,
            "ecmwfAifs": 0.082514,
            "icon": 0.212881,
            "ukmo": 0.125197,
            "meteofrance": 0.157095,
            "gfs": 0.06637,
            "gem": 0.0593,
            "jma": 0.056973
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
          "ecmwfIfs": 0.147335,
          "ecmwfAifs": 0.258111,
          "icon": 0.176331,
          "ukmo": 0.076359,
          "meteofrance": 0.149543,
          "gfs": 0.100897,
          "gem": 0.030502,
          "jma": 0.060922
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
        "spreadBaseC2": 0.8197,
        "spreadScale": 0.2483,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23967,
            "ecmwfAifs": 0.082514,
            "icon": 0.212881,
            "ukmo": 0.125197,
            "meteofrance": 0.157095,
            "gfs": 0.06637,
            "gem": 0.0593,
            "jma": 0.056973
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
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.224594,
          "icon": 0.22656,
          "ukmo": 0.0914,
          "meteofrance": 0.185205,
          "gfs": 0.093756,
          "gem": 0.02,
          "jma": 0.138485
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
        "spreadBaseC2": 0.8731,
        "spreadScale": 0.3272,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.058576,
          "ecmwfAifs": 0.284907,
          "icon": 0.199913,
          "ukmo": 0.092681,
          "meteofrance": 0.148967,
          "gfs": 0.083125,
          "gem": 0.02,
          "jma": 0.111831
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
        "spreadBaseC2": 0.8731,
        "spreadScale": 0.3272,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.097152,
          "ecmwfAifs": 0.345221,
          "icon": 0.173266,
          "ukmo": 0.093962,
          "meteofrance": 0.112728,
          "gfs": 0.072494,
          "gem": 0.02,
          "jma": 0.085177
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
        "spreadBaseC2": 0.9613,
        "spreadScale": 0.2678,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.101235,
          "icon": 0.189155,
          "ukmo": 0.023378,
          "meteofrance": 0.473776,
          "gfs": 0.077174,
          "gem": 0.064144,
          "jma": 0.051138
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
        "spreadBaseC2": 1.1234,
        "spreadScale": 0.1693,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.03022,
          "ecmwfAifs": 0.189915,
          "icon": 0.181112,
          "ukmo": 0.033486,
          "meteofrance": 0.370374,
          "gfs": 0.070925,
          "gem": 0.066789,
          "jma": 0.057179
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
        "spreadBaseC2": 1.1234,
        "spreadScale": 0.1693,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.040441,
          "ecmwfAifs": 0.278594,
          "icon": 0.173069,
          "ukmo": 0.043594,
          "meteofrance": 0.266971,
          "gfs": 0.064676,
          "gem": 0.069435,
          "jma": 0.06322
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
        "spreadBaseC2": 1.1191,
        "spreadScale": 0.2495,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.030723,
          "ecmwfAifs": 0.210604,
          "icon": 0.193856,
          "ukmo": 0.02,
          "meteofrance": 0.213186,
          "gfs": 0.115079,
          "gem": 0.196552,
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
        "spreadBaseC2": 0.4645,
        "spreadScale": 0.512,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.092397,
          "ecmwfAifs": 0.245774,
          "icon": 0.175743,
          "ukmo": 0.02,
          "meteofrance": 0.17368,
          "gfs": 0.103965,
          "gem": 0.168441,
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
        "spreadBaseC2": 0.4645,
        "spreadScale": 0.512,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.154071,
          "ecmwfAifs": 0.280943,
          "icon": 0.15763,
          "ukmo": 0.02,
          "meteofrance": 0.134174,
          "gfs": 0.092852,
          "gem": 0.14033,
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
        "spreadBaseC2": 0.5219,
        "spreadScale": 0.6193,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.099429,
          "icon": 0.236302,
          "ukmo": 0.107782,
          "meteofrance": 0.264052,
          "gfs": 0.153195,
          "gem": 0.04018,
          "jma": 0.07906
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
        "spreadBaseC2": 0.775,
        "spreadScale": 0.2403,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.083667,
          "ecmwfAifs": 0.17877,
          "icon": 0.206317,
          "ukmo": 0.092071,
          "meteofrance": 0.206797,
          "gfs": 0.127046,
          "gem": 0.035341,
          "jma": 0.069991
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
        "spreadBaseC2": 0.775,
        "spreadScale": 0.2403,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.147335,
          "ecmwfAifs": 0.258111,
          "icon": 0.176331,
          "ukmo": 0.076359,
          "meteofrance": 0.149543,
          "gfs": 0.100897,
          "gem": 0.030502,
          "jma": 0.060922
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
        "spreadBaseC2": 0.8197,
        "spreadScale": 0.2483,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243716,
        "ecmwfAifs": 0.083729,
        "icon": 0.221063,
        "ukmo": 0.113065,
        "meteofrance": 0.158618,
        "gfs": 0.06654,
        "gem": 0.05712,
        "jma": 0.056149
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.246782,
        "ecmwfAifs": 0.073382,
        "icon": 0.218536,
        "ukmo": 0.121126,
        "meteofrance": 0.161571,
        "gfs": 0.064036,
        "gem": 0.058207,
        "jma": 0.05636
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.236337,
        "ecmwfAifs": 0.081238,
        "icon": 0.221775,
        "ukmo": 0.116115,
        "meteofrance": 0.159333,
        "gfs": 0.066809,
        "gem": 0.05887,
        "jma": 0.059523
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.23967,
        "ecmwfAifs": 0.082514,
        "icon": 0.212881,
        "ukmo": 0.125197,
        "meteofrance": 0.157095,
        "gfs": 0.06637,
        "gem": 0.0593,
        "jma": 0.056973
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.20812,
    "ecmwfAifs": 0.069259,
    "icon": 0.297909,
    "ukmo": 0.167564,
    "meteofrance": 0.107737,
    "gfs": 0.072457,
    "gem": 0.038477,
    "jma": 0.038477
  },
  "pressureWeights": {
    "ecmwfIfs": 0.296623,
    "ecmwfAifs": 0.151847,
    "icon": 0.137303,
    "ukmo": 0.182541,
    "meteofrance": 0.07992,
    "gfs": 0.071846,
    "gem": 0.03996,
    "jma": 0.03996
  }
} as const;

export default PROVINCE_CALIBRATION_TR_39;
