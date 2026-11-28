import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_47: ProvinceCalibrationBundle = {
  "provinceCode": "TR-47",
  "provinceName": "Mardin",
  "plateNumber": 47,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 37.3129,
  "stationLon": 40.735,
  "stationElevationM": 1040,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-56",
    "TR-21",
    "TR-63"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-56",
      "provinceName": "Siirt",
      "wmoStationId": "17210",
      "weight": 0.4
    },
    {
      "provinceCode": "TR-21",
      "provinceName": "Diyarbakır",
      "wmoStationId": "17280",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-63",
      "provinceName": "Şanlıurfa",
      "wmoStationId": "17270",
      "weight": 0.25
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.587829,
          "ecmwfAifs": 0.02,
          "icon": 0.191145,
          "ukmo": 0.070997,
          "meteofrance": 0.03149,
          "gfs": 0.02,
          "gem": 0.058539,
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
        "spreadBaseC2": 0.6097,
        "spreadScale": 0.1434,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249487,
            "ecmwfAifs": 0.087056,
            "icon": 0.213378,
            "ukmo": 0.120276,
            "meteofrance": 0.153263,
            "gfs": 0.062502,
            "gem": 0.055839,
            "jma": 0.058199
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
          "ecmwfIfs": 0.614424,
          "ecmwfAifs": 0.084902,
          "icon": 0.106802,
          "ukmo": 0.057509,
          "meteofrance": 0.027958,
          "gfs": 0.02,
          "gem": 0.068405,
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
        "spreadBaseC2": 0.6622,
        "spreadScale": 0.1311,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249487,
            "ecmwfAifs": 0.087056,
            "icon": 0.213378,
            "ukmo": 0.120276,
            "meteofrance": 0.153263,
            "gfs": 0.062502,
            "gem": 0.055839,
            "jma": 0.058199
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
          "ecmwfIfs": 0.590855,
          "ecmwfAifs": 0.030504,
          "icon": 0.171834,
          "ukmo": 0.062005,
          "meteofrance": 0.063261,
          "gfs": 0.022484,
          "gem": 0.039057,
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
        "spreadBaseC2": 0.8502,
        "spreadScale": 0.1643,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251909,
            "ecmwfAifs": 0.07146,
            "icon": 0.218185,
            "ukmo": 0.125248,
            "meteofrance": 0.1576,
            "gfs": 0.062859,
            "gem": 0.056097,
            "jma": 0.056642
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
          "ecmwfIfs": 0.630522,
          "ecmwfAifs": 0.067939,
          "icon": 0.108548,
          "ukmo": 0.058308,
          "meteofrance": 0.036577,
          "gfs": 0.02,
          "gem": 0.058106,
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
        "spreadBaseC2": 0.8322,
        "spreadScale": 0.1787,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251909,
            "ecmwfAifs": 0.07146,
            "icon": 0.218185,
            "ukmo": 0.125248,
            "meteofrance": 0.1576,
            "gfs": 0.062859,
            "gem": 0.056097,
            "jma": 0.056642
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
          "ecmwfIfs": 0.622013,
          "ecmwfAifs": 0.02,
          "icon": 0.118425,
          "ukmo": 0.116785,
          "meteofrance": 0.041271,
          "gfs": 0.02,
          "gem": 0.041506,
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
        "spreadBaseC2": 0.4733,
        "spreadScale": 0.1948,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22714,
            "ecmwfAifs": 0.081712,
            "icon": 0.222195,
            "ukmo": 0.125371,
            "meteofrance": 0.16181,
            "gfs": 0.06953,
            "gem": 0.053162,
            "jma": 0.05908
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
          "ecmwfIfs": 0.678496,
          "ecmwfAifs": 0.052713,
          "icon": 0.082665,
          "ukmo": 0.085964,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.040162,
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
        "spreadBaseC2": 0.4758,
        "spreadScale": 0.1888,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22714,
            "ecmwfAifs": 0.081712,
            "icon": 0.222195,
            "ukmo": 0.125371,
            "meteofrance": 0.16181,
            "gfs": 0.06953,
            "gem": 0.053162,
            "jma": 0.05908
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
          "ecmwfIfs": 0.615698,
          "ecmwfAifs": 0.02,
          "icon": 0.164439,
          "ukmo": 0.055785,
          "meteofrance": 0.032304,
          "gfs": 0.02,
          "gem": 0.071774,
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
        "spreadBaseC2": 0.6417,
        "spreadScale": 0.1126,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236414,
            "ecmwfAifs": 0.080239,
            "icon": 0.22249,
            "ukmo": 0.124077,
            "meteofrance": 0.154662,
            "gfs": 0.066202,
            "gem": 0.057334,
            "jma": 0.058582
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
          "ecmwfIfs": 0.657527,
          "ecmwfAifs": 0.060343,
          "icon": 0.101028,
          "ukmo": 0.042747,
          "meteofrance": 0.028434,
          "gfs": 0.02,
          "gem": 0.069921,
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
        "spreadBaseC2": 0.649,
        "spreadScale": 0.1135,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236414,
            "ecmwfAifs": 0.080239,
            "icon": 0.22249,
            "ukmo": 0.124077,
            "meteofrance": 0.154662,
            "gfs": 0.066202,
            "gem": 0.057334,
            "jma": 0.058582
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
          "ecmwfIfs": 0.587829,
          "ecmwfAifs": 0.02,
          "icon": 0.191145,
          "ukmo": 0.070997,
          "meteofrance": 0.03149,
          "gfs": 0.02,
          "gem": 0.058539,
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
        "spreadBaseC2": 0.6097,
        "spreadScale": 0.1434,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.601126,
          "ecmwfAifs": 0.052451,
          "icon": 0.148974,
          "ukmo": 0.064253,
          "meteofrance": 0.029724,
          "gfs": 0.02,
          "gem": 0.063472,
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
        "spreadBaseC2": 0.6097,
        "spreadScale": 0.1434,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.614424,
          "ecmwfAifs": 0.084902,
          "icon": 0.106802,
          "ukmo": 0.057509,
          "meteofrance": 0.027958,
          "gfs": 0.02,
          "gem": 0.068405,
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
        "spreadBaseC2": 0.6622,
        "spreadScale": 0.1311,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.590855,
          "ecmwfAifs": 0.030504,
          "icon": 0.171834,
          "ukmo": 0.062005,
          "meteofrance": 0.063261,
          "gfs": 0.022484,
          "gem": 0.039057,
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
        "spreadBaseC2": 0.8502,
        "spreadScale": 0.1643,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.61069,
          "ecmwfAifs": 0.049221,
          "icon": 0.140191,
          "ukmo": 0.060156,
          "meteofrance": 0.049919,
          "gfs": 0.021242,
          "gem": 0.048581,
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
        "spreadBaseC2": 0.8502,
        "spreadScale": 0.1643,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.630522,
          "ecmwfAifs": 0.067939,
          "icon": 0.108548,
          "ukmo": 0.058308,
          "meteofrance": 0.036577,
          "gfs": 0.02,
          "gem": 0.058106,
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
        "spreadBaseC2": 0.8322,
        "spreadScale": 0.1787,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.622013,
          "ecmwfAifs": 0.02,
          "icon": 0.118425,
          "ukmo": 0.116785,
          "meteofrance": 0.041271,
          "gfs": 0.02,
          "gem": 0.041506,
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
        "spreadBaseC2": 0.4733,
        "spreadScale": 0.1948,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.650254,
          "ecmwfAifs": 0.036357,
          "icon": 0.100545,
          "ukmo": 0.101374,
          "meteofrance": 0.030636,
          "gfs": 0.02,
          "gem": 0.040834,
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
        "spreadBaseC2": 0.4733,
        "spreadScale": 0.1948,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.678496,
          "ecmwfAifs": 0.052713,
          "icon": 0.082665,
          "ukmo": 0.085964,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.040162,
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
        "spreadBaseC2": 0.4758,
        "spreadScale": 0.1888,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.615698,
          "ecmwfAifs": 0.02,
          "icon": 0.164439,
          "ukmo": 0.055785,
          "meteofrance": 0.032304,
          "gfs": 0.02,
          "gem": 0.071774,
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
        "spreadBaseC2": 0.6417,
        "spreadScale": 0.1126,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.636614,
          "ecmwfAifs": 0.040171,
          "icon": 0.132733,
          "ukmo": 0.049266,
          "meteofrance": 0.030369,
          "gfs": 0.02,
          "gem": 0.070847,
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
        "spreadBaseC2": 0.6417,
        "spreadScale": 0.1126,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.657527,
          "ecmwfAifs": 0.060343,
          "icon": 0.101028,
          "ukmo": 0.042747,
          "meteofrance": 0.028434,
          "gfs": 0.02,
          "gem": 0.069921,
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
        "spreadBaseC2": 0.649,
        "spreadScale": 0.1135,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.249487,
        "ecmwfAifs": 0.087056,
        "icon": 0.213378,
        "ukmo": 0.120276,
        "meteofrance": 0.153263,
        "gfs": 0.062502,
        "gem": 0.055839,
        "jma": 0.058199
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.251909,
        "ecmwfAifs": 0.07146,
        "icon": 0.218185,
        "ukmo": 0.125248,
        "meteofrance": 0.1576,
        "gfs": 0.062859,
        "gem": 0.056097,
        "jma": 0.056642
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.22714,
        "ecmwfAifs": 0.081712,
        "icon": 0.222195,
        "ukmo": 0.125371,
        "meteofrance": 0.16181,
        "gfs": 0.06953,
        "gem": 0.053162,
        "jma": 0.05908
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.236414,
        "ecmwfAifs": 0.080239,
        "icon": 0.22249,
        "ukmo": 0.124077,
        "meteofrance": 0.154662,
        "gfs": 0.066202,
        "gem": 0.057334,
        "jma": 0.058582
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.259334,
    "ecmwfAifs": 0.067815,
    "icon": 0.254921,
    "ukmo": 0.145549,
    "meteofrance": 0.105489,
    "gfs": 0.091542,
    "gem": 0.037675,
    "jma": 0.037675
  },
  "pressureWeights": {
    "ecmwfIfs": 0.421407,
    "ecmwfAifs": 0.128544,
    "icon": 0.127077,
    "ukmo": 0.147762,
    "meteofrance": 0.067655,
    "gfs": 0.039899,
    "gem": 0.033828,
    "jma": 0.033828
  }
} as const;

export default PROVINCE_CALIBRATION_TR_47;
