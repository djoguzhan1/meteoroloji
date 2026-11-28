import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_76: ProvinceCalibrationBundle = {
  "provinceCode": "TR-76",
  "provinceName": "Iğdır",
  "plateNumber": 76,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 39.9237,
  "stationLon": 44.045,
  "stationElevationM": 856,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-24",
    "TR-04",
    "TR-44"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-24",
      "provinceName": "Erzincan",
      "wmoStationId": "17092",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-04",
      "provinceName": "Ağrı",
      "wmoStationId": "17099",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-44",
      "provinceName": "Malatya",
      "wmoStationId": "LTAO0",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.166291,
          "ecmwfAifs": 0.269358,
          "icon": 0.088437,
          "ukmo": 0.085375,
          "meteofrance": 0.099098,
          "gfs": 0.058437,
          "gem": 0.213004,
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
        "spreadBaseC2": 1.8925,
        "spreadScale": 0.8601,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.264917,
            "ecmwfAifs": 0.087798,
            "icon": 0.209734,
            "ukmo": 0.109635,
            "meteofrance": 0.151354,
            "gfs": 0.066559,
            "gem": 0.054972,
            "jma": 0.055031
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
          "ecmwfIfs": 0.178755,
          "ecmwfAifs": 0.32807,
          "icon": 0.066813,
          "ukmo": 0.100999,
          "meteofrance": 0.086914,
          "gfs": 0.051284,
          "gem": 0.167165,
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
        "spreadBaseC2": 1.8324,
        "spreadScale": 0.8897,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.264917,
            "ecmwfAifs": 0.087798,
            "icon": 0.209734,
            "ukmo": 0.109635,
            "meteofrance": 0.151354,
            "gfs": 0.066559,
            "gem": 0.054972,
            "jma": 0.055031
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
          "ecmwfIfs": 0.47244,
          "ecmwfAifs": 0.02,
          "icon": 0.058147,
          "ukmo": 0.155161,
          "meteofrance": 0.098498,
          "gfs": 0.02,
          "gem": 0.155754,
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
        "spreadBaseC2": 1.4846,
        "spreadScale": 0.5929,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.26277,
            "ecmwfAifs": 0.072895,
            "icon": 0.219468,
            "ukmo": 0.117918,
            "meteofrance": 0.150297,
            "gfs": 0.064328,
            "gem": 0.056677,
            "jma": 0.055647
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
          "ecmwfIfs": 0.358097,
          "ecmwfAifs": 0.130594,
          "icon": 0.102488,
          "ukmo": 0.126432,
          "meteofrance": 0.079279,
          "gfs": 0.021197,
          "gem": 0.161913,
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
        "spreadBaseC2": 1.276,
        "spreadScale": 0.6542,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.26277,
            "ecmwfAifs": 0.072895,
            "icon": 0.219468,
            "ukmo": 0.117918,
            "meteofrance": 0.150297,
            "gfs": 0.064328,
            "gem": 0.056677,
            "jma": 0.055647
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
          "ecmwfIfs": 0.338708,
          "ecmwfAifs": 0.053255,
          "icon": 0.026616,
          "ukmo": 0.208293,
          "meteofrance": 0.082232,
          "gfs": 0.052461,
          "gem": 0.218435,
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
        "spreadBaseC2": 0.9848,
        "spreadScale": 0.7148,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239539,
            "ecmwfAifs": 0.077497,
            "icon": 0.223711,
            "ukmo": 0.123125,
            "meteofrance": 0.165702,
            "gfs": 0.063997,
            "gem": 0.050089,
            "jma": 0.05634
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
          "ecmwfIfs": 0.376349,
          "ecmwfAifs": 0.123664,
          "icon": 0.057645,
          "ukmo": 0.1649,
          "meteofrance": 0.056898,
          "gfs": 0.044095,
          "gem": 0.156449,
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
        "spreadBaseC2": 0.8465,
        "spreadScale": 0.7805,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239539,
            "ecmwfAifs": 0.077497,
            "icon": 0.223711,
            "ukmo": 0.123125,
            "meteofrance": 0.165702,
            "gfs": 0.063997,
            "gem": 0.050089,
            "jma": 0.05634
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
          "ecmwfIfs": 0.321673,
          "ecmwfAifs": 0.022551,
          "icon": 0.044012,
          "ukmo": 0.171704,
          "meteofrance": 0.02022,
          "gfs": 0.033089,
          "gem": 0.366751,
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
        "spreadBaseC2": 2.449,
        "spreadScale": 0.5185,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250884,
            "ecmwfAifs": 0.079733,
            "icon": 0.219215,
            "ukmo": 0.115606,
            "meteofrance": 0.1556,
            "gfs": 0.065406,
            "gem": 0.05658,
            "jma": 0.056976
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
          "ecmwfIfs": 0.280399,
          "ecmwfAifs": 0.099195,
          "icon": 0.062945,
          "ukmo": 0.185896,
          "meteofrance": 0.061983,
          "gfs": 0.025265,
          "gem": 0.264317,
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
        "spreadBaseC2": 1.8687,
        "spreadScale": 0.6839,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250884,
            "ecmwfAifs": 0.079733,
            "icon": 0.219215,
            "ukmo": 0.115606,
            "meteofrance": 0.1556,
            "gfs": 0.065406,
            "gem": 0.05658,
            "jma": 0.056976
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
          "ecmwfIfs": 0.166291,
          "ecmwfAifs": 0.269358,
          "icon": 0.088437,
          "ukmo": 0.085375,
          "meteofrance": 0.099098,
          "gfs": 0.058437,
          "gem": 0.213004,
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
        "spreadBaseC2": 1.8925,
        "spreadScale": 0.8601,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.172523,
          "ecmwfAifs": 0.298713,
          "icon": 0.077625,
          "ukmo": 0.093187,
          "meteofrance": 0.093006,
          "gfs": 0.054861,
          "gem": 0.190085,
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
        "spreadBaseC2": 1.8925,
        "spreadScale": 0.8601,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.178755,
          "ecmwfAifs": 0.32807,
          "icon": 0.066813,
          "ukmo": 0.100999,
          "meteofrance": 0.086914,
          "gfs": 0.051284,
          "gem": 0.167165,
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
        "spreadBaseC2": 1.8324,
        "spreadScale": 0.8897,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.47244,
          "ecmwfAifs": 0.02,
          "icon": 0.058147,
          "ukmo": 0.155161,
          "meteofrance": 0.098498,
          "gfs": 0.02,
          "gem": 0.155754,
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
        "spreadBaseC2": 1.4846,
        "spreadScale": 0.5929,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.415269,
          "ecmwfAifs": 0.075297,
          "icon": 0.080317,
          "ukmo": 0.140796,
          "meteofrance": 0.088889,
          "gfs": 0.020598,
          "gem": 0.158834,
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
        "spreadBaseC2": 1.4846,
        "spreadScale": 0.5929,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.358097,
          "ecmwfAifs": 0.130594,
          "icon": 0.102488,
          "ukmo": 0.126432,
          "meteofrance": 0.079279,
          "gfs": 0.021197,
          "gem": 0.161913,
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
        "spreadBaseC2": 1.276,
        "spreadScale": 0.6542,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.338708,
          "ecmwfAifs": 0.053255,
          "icon": 0.026616,
          "ukmo": 0.208293,
          "meteofrance": 0.082232,
          "gfs": 0.052461,
          "gem": 0.218435,
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
        "spreadBaseC2": 0.9848,
        "spreadScale": 0.7148,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.357528,
          "ecmwfAifs": 0.08846,
          "icon": 0.04213,
          "ukmo": 0.186597,
          "meteofrance": 0.069565,
          "gfs": 0.048278,
          "gem": 0.187442,
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
        "spreadBaseC2": 0.9848,
        "spreadScale": 0.7148,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.376349,
          "ecmwfAifs": 0.123664,
          "icon": 0.057645,
          "ukmo": 0.1649,
          "meteofrance": 0.056898,
          "gfs": 0.044095,
          "gem": 0.156449,
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
        "spreadBaseC2": 0.8465,
        "spreadScale": 0.7805,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.321673,
          "ecmwfAifs": 0.022551,
          "icon": 0.044012,
          "ukmo": 0.171704,
          "meteofrance": 0.02022,
          "gfs": 0.033089,
          "gem": 0.366751,
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
        "spreadBaseC2": 2.449,
        "spreadScale": 0.5185,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.301036,
          "ecmwfAifs": 0.060873,
          "icon": 0.053479,
          "ukmo": 0.1788,
          "meteofrance": 0.041102,
          "gfs": 0.029177,
          "gem": 0.315533,
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
        "spreadBaseC2": 2.449,
        "spreadScale": 0.5185,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.280399,
          "ecmwfAifs": 0.099195,
          "icon": 0.062945,
          "ukmo": 0.185896,
          "meteofrance": 0.061983,
          "gfs": 0.025265,
          "gem": 0.264317,
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
        "spreadBaseC2": 1.8687,
        "spreadScale": 0.6839,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.264917,
        "ecmwfAifs": 0.087798,
        "icon": 0.209734,
        "ukmo": 0.109635,
        "meteofrance": 0.151354,
        "gfs": 0.066559,
        "gem": 0.054972,
        "jma": 0.055031
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.26277,
        "ecmwfAifs": 0.072895,
        "icon": 0.219468,
        "ukmo": 0.117918,
        "meteofrance": 0.150297,
        "gfs": 0.064328,
        "gem": 0.056677,
        "jma": 0.055647
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.239539,
        "ecmwfAifs": 0.077497,
        "icon": 0.223711,
        "ukmo": 0.123125,
        "meteofrance": 0.165702,
        "gfs": 0.063997,
        "gem": 0.050089,
        "jma": 0.05634
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.250884,
        "ecmwfAifs": 0.079733,
        "icon": 0.219215,
        "ukmo": 0.115606,
        "meteofrance": 0.1556,
        "gfs": 0.065406,
        "gem": 0.05658,
        "jma": 0.056976
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.215894,
    "ecmwfAifs": 0.070735,
    "icon": 0.253816,
    "ukmo": 0.16425,
    "meteofrance": 0.110033,
    "gfs": 0.106678,
    "gem": 0.039297,
    "jma": 0.039297
  },
  "pressureWeights": {
    "ecmwfIfs": 0.325951,
    "ecmwfAifs": 0.150219,
    "icon": 0.14587,
    "ukmo": 0.170611,
    "meteofrance": 0.079062,
    "gfs": 0.049225,
    "gem": 0.039531,
    "jma": 0.039531
  }
} as const;

export default PROVINCE_CALIBRATION_TR_76;
