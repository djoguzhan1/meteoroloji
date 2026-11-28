import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_74: ProvinceCalibrationBundle = {
  "provinceCode": "TR-74",
  "provinceName": "Bartın",
  "plateNumber": 74,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 41.6344,
  "stationLon": 32.3375,
  "stationElevationM": 33,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-67",
    "TR-57",
    "TR-37"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-67",
      "provinceName": "Zonguldak",
      "wmoStationId": "17022",
      "weight": 0.6
    },
    {
      "provinceCode": "TR-57",
      "provinceName": "Sinop",
      "wmoStationId": "17026",
      "weight": 0.25
    },
    {
      "provinceCode": "TR-37",
      "provinceName": "Kastamonu",
      "wmoStationId": "17074",
      "weight": 0.15
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.05929,
          "ecmwfAifs": 0.02,
          "icon": 0.298339,
          "ukmo": 0.191606,
          "meteofrance": 0.098515,
          "gfs": 0.239115,
          "gem": 0.073135,
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
        "spreadBaseC2": 1.0422,
        "spreadScale": 0.8597,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248588,
            "ecmwfAifs": 0.086299,
            "icon": 0.224569,
            "ukmo": 0.108284,
            "meteofrance": 0.153146,
            "gfs": 0.065763,
            "gem": 0.055202,
            "jma": 0.058149
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
          "ecmwfIfs": 0.17308,
          "ecmwfAifs": 0.095661,
          "icon": 0.221062,
          "ukmo": 0.160339,
          "meteofrance": 0.051216,
          "gfs": 0.178528,
          "gem": 0.100114,
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
        "spreadBaseC2": 0.9852,
        "spreadScale": 1.0852,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248588,
            "ecmwfAifs": 0.086299,
            "icon": 0.224569,
            "ukmo": 0.108284,
            "meteofrance": 0.153146,
            "gfs": 0.065763,
            "gem": 0.055202,
            "jma": 0.058149
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
          "ecmwfIfs": 0.0984,
          "ecmwfAifs": 0.084885,
          "icon": 0.123477,
          "ukmo": 0.275125,
          "meteofrance": 0.083286,
          "gfs": 0.099966,
          "gem": 0.1139,
          "jma": 0.120961
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
        "spreadBaseC2": 1.0443,
        "spreadScale": 1.1577,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248947,
            "ecmwfAifs": 0.069955,
            "icon": 0.219161,
            "ukmo": 0.120127,
            "meteofrance": 0.156699,
            "gfs": 0.067331,
            "gem": 0.060555,
            "jma": 0.057225
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
          "ecmwfIfs": 0.184763,
          "ecmwfAifs": 0.205049,
          "icon": 0.1334,
          "ukmo": 0.171243,
          "meteofrance": 0.054288,
          "gfs": 0.090856,
          "gem": 0.088785,
          "jma": 0.071616
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
        "spreadBaseC2": 0.971,
        "spreadScale": 1.2941,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248947,
            "ecmwfAifs": 0.069955,
            "icon": 0.219161,
            "ukmo": 0.120127,
            "meteofrance": 0.156699,
            "gfs": 0.067331,
            "gem": 0.060555,
            "jma": 0.057225
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
          "ecmwfIfs": 0.106995,
          "ecmwfAifs": 0.19307,
          "icon": 0.03752,
          "ukmo": 0.1911,
          "meteofrance": 0.216496,
          "gfs": 0.093387,
          "gem": 0.141432,
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
        "spreadBaseC2": 0.9993,
        "spreadScale": 1.1568,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240542,
            "ecmwfAifs": 0.081283,
            "icon": 0.216262,
            "ukmo": 0.117704,
            "meteofrance": 0.156383,
            "gfs": 0.068254,
            "gem": 0.059904,
            "jma": 0.059668
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
          "ecmwfIfs": 0.233564,
          "ecmwfAifs": 0.252164,
          "icon": 0.039913,
          "ukmo": 0.150133,
          "meteofrance": 0.127162,
          "gfs": 0.08167,
          "gem": 0.095394,
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
        "spreadBaseC2": 1.0176,
        "spreadScale": 1.0719,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240542,
            "ecmwfAifs": 0.081283,
            "icon": 0.216262,
            "ukmo": 0.117704,
            "meteofrance": 0.156383,
            "gfs": 0.068254,
            "gem": 0.059904,
            "jma": 0.059668
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
          "ecmwfIfs": 0.091134,
          "ecmwfAifs": 0.061255,
          "icon": 0.132661,
          "ukmo": 0.07774,
          "meteofrance": 0.124262,
          "gfs": 0.309298,
          "gem": 0.18365,
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
        "spreadBaseC2": 0.5905,
        "spreadScale": 1.0527,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258736,
            "ecmwfAifs": 0.086397,
            "icon": 0.205566,
            "ukmo": 0.111824,
            "meteofrance": 0.150325,
            "gfs": 0.069965,
            "gem": 0.057758,
            "jma": 0.059429
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
          "ecmwfIfs": 0.248525,
          "ecmwfAifs": 0.149239,
          "icon": 0.118206,
          "ukmo": 0.085152,
          "meteofrance": 0.065063,
          "gfs": 0.207278,
          "gem": 0.106537,
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
        "spreadBaseC2": 0.6185,
        "spreadScale": 1.2533,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.258736,
            "ecmwfAifs": 0.086397,
            "icon": 0.205566,
            "ukmo": 0.111824,
            "meteofrance": 0.150325,
            "gfs": 0.069965,
            "gem": 0.057758,
            "jma": 0.059429
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
          "ecmwfIfs": 0.05929,
          "ecmwfAifs": 0.02,
          "icon": 0.298339,
          "ukmo": 0.191606,
          "meteofrance": 0.098515,
          "gfs": 0.239115,
          "gem": 0.073135,
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
        "spreadBaseC2": 1.0422,
        "spreadScale": 0.8597,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.116185,
          "ecmwfAifs": 0.057831,
          "icon": 0.2597,
          "ukmo": 0.175972,
          "meteofrance": 0.074866,
          "gfs": 0.208821,
          "gem": 0.086625,
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
        "spreadBaseC2": 1.0422,
        "spreadScale": 0.8597,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.17308,
          "ecmwfAifs": 0.095661,
          "icon": 0.221062,
          "ukmo": 0.160339,
          "meteofrance": 0.051216,
          "gfs": 0.178528,
          "gem": 0.100114,
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
        "spreadBaseC2": 0.9852,
        "spreadScale": 1.0852,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.0984,
          "ecmwfAifs": 0.084885,
          "icon": 0.123477,
          "ukmo": 0.275125,
          "meteofrance": 0.083286,
          "gfs": 0.099966,
          "gem": 0.1139,
          "jma": 0.120961
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
        "spreadBaseC2": 1.0443,
        "spreadScale": 1.1577,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.141581,
          "ecmwfAifs": 0.144968,
          "icon": 0.128438,
          "ukmo": 0.223185,
          "meteofrance": 0.068787,
          "gfs": 0.095411,
          "gem": 0.101342,
          "jma": 0.096288
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
        "spreadBaseC2": 1.0443,
        "spreadScale": 1.1577,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.184763,
          "ecmwfAifs": 0.205049,
          "icon": 0.1334,
          "ukmo": 0.171243,
          "meteofrance": 0.054288,
          "gfs": 0.090856,
          "gem": 0.088785,
          "jma": 0.071616
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
        "spreadBaseC2": 0.971,
        "spreadScale": 1.2941,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.106995,
          "ecmwfAifs": 0.19307,
          "icon": 0.03752,
          "ukmo": 0.1911,
          "meteofrance": 0.216496,
          "gfs": 0.093387,
          "gem": 0.141432,
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
        "spreadBaseC2": 0.9993,
        "spreadScale": 1.1568,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.170279,
          "ecmwfAifs": 0.222618,
          "icon": 0.038716,
          "ukmo": 0.170616,
          "meteofrance": 0.171829,
          "gfs": 0.087529,
          "gem": 0.118413,
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
        "spreadBaseC2": 0.9993,
        "spreadScale": 1.1568,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.233564,
          "ecmwfAifs": 0.252164,
          "icon": 0.039913,
          "ukmo": 0.150133,
          "meteofrance": 0.127162,
          "gfs": 0.08167,
          "gem": 0.095394,
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
        "spreadBaseC2": 1.0176,
        "spreadScale": 1.0719,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.091134,
          "ecmwfAifs": 0.061255,
          "icon": 0.132661,
          "ukmo": 0.07774,
          "meteofrance": 0.124262,
          "gfs": 0.309298,
          "gem": 0.18365,
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
        "spreadBaseC2": 0.5905,
        "spreadScale": 1.0527,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.169829,
          "ecmwfAifs": 0.105247,
          "icon": 0.125434,
          "ukmo": 0.081446,
          "meteofrance": 0.094663,
          "gfs": 0.258287,
          "gem": 0.145094,
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
        "spreadBaseC2": 0.5905,
        "spreadScale": 1.0527,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.248525,
          "ecmwfAifs": 0.149239,
          "icon": 0.118206,
          "ukmo": 0.085152,
          "meteofrance": 0.065063,
          "gfs": 0.207278,
          "gem": 0.106537,
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
        "spreadBaseC2": 0.6185,
        "spreadScale": 1.2533,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.248588,
        "ecmwfAifs": 0.086299,
        "icon": 0.224569,
        "ukmo": 0.108284,
        "meteofrance": 0.153146,
        "gfs": 0.065763,
        "gem": 0.055202,
        "jma": 0.058149
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.248947,
        "ecmwfAifs": 0.069955,
        "icon": 0.219161,
        "ukmo": 0.120127,
        "meteofrance": 0.156699,
        "gfs": 0.067331,
        "gem": 0.060555,
        "jma": 0.057225
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.240542,
        "ecmwfAifs": 0.081283,
        "icon": 0.216262,
        "ukmo": 0.117704,
        "meteofrance": 0.156383,
        "gfs": 0.068254,
        "gem": 0.059904,
        "jma": 0.059668
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.258736,
        "ecmwfAifs": 0.086397,
        "icon": 0.205566,
        "ukmo": 0.111824,
        "meteofrance": 0.150325,
        "gfs": 0.069965,
        "gem": 0.057758,
        "jma": 0.059429
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.212869,
    "ecmwfAifs": 0.067814,
    "icon": 0.257679,
    "ukmo": 0.183046,
    "meteofrance": 0.105489,
    "gfs": 0.097753,
    "gem": 0.037675,
    "jma": 0.037675
  },
  "pressureWeights": {
    "ecmwfIfs": 0.30709,
    "ecmwfAifs": 0.149288,
    "icon": 0.135817,
    "ukmo": 0.182265,
    "meteofrance": 0.078572,
    "gfs": 0.068396,
    "gem": 0.039286,
    "jma": 0.039286
  }
} as const;

export default PROVINCE_CALIBRATION_TR_74;
