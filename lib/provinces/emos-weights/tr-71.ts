import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_71: ProvinceCalibrationBundle = {
  "provinceCode": "TR-71",
  "provinceName": "Kırıkkale",
  "plateNumber": 71,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 39.8468,
  "stationLon": 33.5153,
  "stationElevationM": 751,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-06",
    "TR-40",
    "TR-18"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-06",
      "provinceName": "Ankara",
      "wmoStationId": "17130",
      "weight": 0.5
    },
    {
      "provinceCode": "TR-40",
      "provinceName": "Kırşehir",
      "wmoStationId": "17160",
      "weight": 0.3
    },
    {
      "provinceCode": "TR-18",
      "provinceName": "Çankırı",
      "wmoStationId": "17080",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.842521,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02114,
          "gfs": 0.02,
          "gem": 0.036339,
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
        "spreadBaseC2": 0.4684,
        "spreadScale": 0.064,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242369,
            "ecmwfAifs": 0.084831,
            "icon": 0.215065,
            "ukmo": 0.118033,
            "meteofrance": 0.158149,
            "gfs": 0.066774,
            "gem": 0.05602,
            "jma": 0.058759
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
          "ecmwfIfs": 0.841467,
          "ecmwfAifs": 0.025481,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.024142,
          "gfs": 0.02,
          "gem": 0.02891,
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
        "spreadBaseC2": 0.476,
        "spreadScale": 0.0627,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.242369,
            "ecmwfAifs": 0.084831,
            "icon": 0.215065,
            "ukmo": 0.118033,
            "meteofrance": 0.158149,
            "gfs": 0.066774,
            "gem": 0.05602,
            "jma": 0.058759
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
          "ecmwfIfs": 0.785241,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.030042,
          "meteofrance": 0.02,
          "gfs": 0.026197,
          "gem": 0.07852,
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
        "spreadBaseC2": 0.5008,
        "spreadScale": 0.1308,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256091,
            "ecmwfAifs": 0.075798,
            "icon": 0.221638,
            "ukmo": 0.117269,
            "meteofrance": 0.151582,
            "gfs": 0.064753,
            "gem": 0.05735,
            "jma": 0.055519
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
          "ecmwfIfs": 0.820416,
          "ecmwfAifs": 0.033693,
          "icon": 0.021651,
          "ukmo": 0.023253,
          "meteofrance": 0.02,
          "gfs": 0.022155,
          "gem": 0.038832,
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
        "spreadBaseC2": 0.5104,
        "spreadScale": 0.1324,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256091,
            "ecmwfAifs": 0.075798,
            "icon": 0.221638,
            "ukmo": 0.117269,
            "meteofrance": 0.151582,
            "gfs": 0.064753,
            "gem": 0.05735,
            "jma": 0.055519
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
          "ecmwfIfs": 0.762336,
          "ecmwfAifs": 0.020137,
          "icon": 0.023724,
          "ukmo": 0.03459,
          "meteofrance": 0.02,
          "gfs": 0.038013,
          "gem": 0.0812,
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
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1647,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238066,
            "ecmwfAifs": 0.079915,
            "icon": 0.225703,
            "ukmo": 0.123653,
            "meteofrance": 0.161017,
            "gfs": 0.064821,
            "gem": 0.053802,
            "jma": 0.053023
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
          "ecmwfIfs": 0.762956,
          "ecmwfAifs": 0.035409,
          "icon": 0.02506,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.042736,
          "gem": 0.073839,
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
        "spreadBaseC2": 0.1616,
        "spreadScale": 0.1621,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238066,
            "ecmwfAifs": 0.079915,
            "icon": 0.225703,
            "ukmo": 0.123653,
            "meteofrance": 0.161017,
            "gfs": 0.064821,
            "gem": 0.053802,
            "jma": 0.053023
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
          "ecmwfIfs": 0.765171,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.025325,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.109504,
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
        "spreadBaseC2": 0.3166,
        "spreadScale": 0.0791,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241487,
            "ecmwfAifs": 0.079183,
            "icon": 0.221237,
            "ukmo": 0.118831,
            "meteofrance": 0.158723,
            "gfs": 0.067147,
            "gem": 0.055999,
            "jma": 0.057393
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
          "ecmwfIfs": 0.77388,
          "ecmwfAifs": 0.03165,
          "icon": 0.022483,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.091987,
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
        "spreadBaseC2": 0.3227,
        "spreadScale": 0.0797,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241487,
            "ecmwfAifs": 0.079183,
            "icon": 0.221237,
            "ukmo": 0.118831,
            "meteofrance": 0.158723,
            "gfs": 0.067147,
            "gem": 0.055999,
            "jma": 0.057393
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
          "ecmwfIfs": 0.842521,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02114,
          "gfs": 0.02,
          "gem": 0.036339,
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
        "spreadBaseC2": 0.4684,
        "spreadScale": 0.064,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.841993,
          "ecmwfAifs": 0.022741,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.022641,
          "gfs": 0.02,
          "gem": 0.032625,
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
        "spreadBaseC2": 0.4684,
        "spreadScale": 0.064,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.841467,
          "ecmwfAifs": 0.025481,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.024142,
          "gfs": 0.02,
          "gem": 0.02891,
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
        "spreadBaseC2": 0.476,
        "spreadScale": 0.0627,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.785241,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.030042,
          "meteofrance": 0.02,
          "gfs": 0.026197,
          "gem": 0.07852,
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
        "spreadBaseC2": 0.5008,
        "spreadScale": 0.1308,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.802828,
          "ecmwfAifs": 0.026847,
          "icon": 0.020826,
          "ukmo": 0.026647,
          "meteofrance": 0.02,
          "gfs": 0.024176,
          "gem": 0.058676,
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
        "spreadBaseC2": 0.5008,
        "spreadScale": 0.1308,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.820416,
          "ecmwfAifs": 0.033693,
          "icon": 0.021651,
          "ukmo": 0.023253,
          "meteofrance": 0.02,
          "gfs": 0.022155,
          "gem": 0.038832,
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
        "spreadBaseC2": 0.5104,
        "spreadScale": 0.1324,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.762336,
          "ecmwfAifs": 0.020137,
          "icon": 0.023724,
          "ukmo": 0.03459,
          "meteofrance": 0.02,
          "gfs": 0.038013,
          "gem": 0.0812,
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
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1647,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.762645,
          "ecmwfAifs": 0.027773,
          "icon": 0.024392,
          "ukmo": 0.027295,
          "meteofrance": 0.02,
          "gfs": 0.040375,
          "gem": 0.07752,
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
        "spreadBaseC2": 0.15,
        "spreadScale": 0.1647,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.762956,
          "ecmwfAifs": 0.035409,
          "icon": 0.02506,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.042736,
          "gem": 0.073839,
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
        "spreadBaseC2": 0.1616,
        "spreadScale": 0.1621,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.765171,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.025325,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.109504,
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
        "spreadBaseC2": 0.3166,
        "spreadScale": 0.0791,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.769527,
          "ecmwfAifs": 0.025825,
          "icon": 0.021241,
          "ukmo": 0.022662,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.100745,
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
        "spreadBaseC2": 0.3166,
        "spreadScale": 0.0791,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.77388,
          "ecmwfAifs": 0.03165,
          "icon": 0.022483,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.091987,
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
        "spreadBaseC2": 0.3227,
        "spreadScale": 0.0797,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.242369,
        "ecmwfAifs": 0.084831,
        "icon": 0.215065,
        "ukmo": 0.118033,
        "meteofrance": 0.158149,
        "gfs": 0.066774,
        "gem": 0.05602,
        "jma": 0.058759
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.256091,
        "ecmwfAifs": 0.075798,
        "icon": 0.221638,
        "ukmo": 0.117269,
        "meteofrance": 0.151582,
        "gfs": 0.064753,
        "gem": 0.05735,
        "jma": 0.055519
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.238066,
        "ecmwfAifs": 0.079915,
        "icon": 0.225703,
        "ukmo": 0.123653,
        "meteofrance": 0.161017,
        "gfs": 0.064821,
        "gem": 0.053802,
        "jma": 0.053023
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.241487,
        "ecmwfAifs": 0.079183,
        "icon": 0.221237,
        "ukmo": 0.118831,
        "meteofrance": 0.158723,
        "gfs": 0.067147,
        "gem": 0.055999,
        "jma": 0.057393
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.274025,
    "ecmwfAifs": 0.067921,
    "icon": 0.232444,
    "ukmo": 0.158984,
    "meteofrance": 0.105655,
    "gfs": 0.085503,
    "gem": 0.037734,
    "jma": 0.037734
  },
  "pressureWeights": {
    "ecmwfIfs": 0.553948,
    "ecmwfAifs": 0.096375,
    "icon": 0.096395,
    "ukmo": 0.113471,
    "meteofrance": 0.050724,
    "gfs": 0.038363,
    "gem": 0.025362,
    "jma": 0.025362
  }
} as const;

export default PROVINCE_CALIBRATION_TR_71;
