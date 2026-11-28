import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_75: ProvinceCalibrationBundle = {
  "provinceCode": "TR-75",
  "provinceName": "Ardahan",
  "plateNumber": 75,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 41.1105,
  "stationLon": 42.7022,
  "stationElevationM": 1827,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-36",
    "TR-25",
    "TR-08"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-36",
      "provinceName": "Kars",
      "wmoStationId": "17098",
      "weight": 0.6
    },
    {
      "provinceCode": "TR-25",
      "provinceName": "Erzurum",
      "wmoStationId": "17096",
      "weight": 0.25
    },
    {
      "provinceCode": "TR-08",
      "provinceName": "Artvin",
      "wmoStationId": "17045",
      "weight": 0.15
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.23116,
          "icon": 0.231347,
          "ukmo": 0.02,
          "meteofrance": 0.166317,
          "gfs": 0.076363,
          "gem": 0.234813,
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
        "spreadBaseC2": 2.6561,
        "spreadScale": 0.9128,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247277,
            "ecmwfAifs": 0.082145,
            "icon": 0.21092,
            "ukmo": 0.11664,
            "meteofrance": 0.155228,
            "gfs": 0.072331,
            "gem": 0.056063,
            "jma": 0.059396
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
          "ecmwfIfs": 0.055004,
          "ecmwfAifs": 0.335558,
          "icon": 0.185198,
          "ukmo": 0.040851,
          "meteofrance": 0.109808,
          "gfs": 0.072375,
          "gem": 0.180108,
          "jma": 0.021098
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
        "spreadBaseC2": 2.5226,
        "spreadScale": 0.9927,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.247277,
            "ecmwfAifs": 0.082145,
            "icon": 0.21092,
            "ukmo": 0.11664,
            "meteofrance": 0.155228,
            "gfs": 0.072331,
            "gem": 0.056063,
            "jma": 0.059396
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
          "ecmwfIfs": 0.098844,
          "ecmwfAifs": 0.057765,
          "icon": 0.274297,
          "ukmo": 0.168618,
          "meteofrance": 0.032325,
          "gfs": 0.074563,
          "gem": 0.179206,
          "jma": 0.114382
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
        "spreadBaseC2": 1.1425,
        "spreadScale": 0.7212,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244672,
            "ecmwfAifs": 0.07388,
            "icon": 0.219833,
            "ukmo": 0.122555,
            "meteofrance": 0.155267,
            "gfs": 0.067602,
            "gem": 0.056496,
            "jma": 0.059695
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
          "ecmwfIfs": 0.197889,
          "ecmwfAifs": 0.125284,
          "icon": 0.210114,
          "ukmo": 0.142943,
          "meteofrance": 0.03763,
          "gfs": 0.057794,
          "gem": 0.131924,
          "jma": 0.096422
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
        "spreadBaseC2": 1.1217,
        "spreadScale": 0.7152,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244672,
            "ecmwfAifs": 0.07388,
            "icon": 0.219833,
            "ukmo": 0.122555,
            "meteofrance": 0.155267,
            "gfs": 0.067602,
            "gem": 0.056496,
            "jma": 0.059695
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
          "ecmwfIfs": 0.02701,
          "ecmwfAifs": 0.035189,
          "icon": 0.187343,
          "ukmo": 0.269545,
          "meteofrance": 0.038766,
          "gfs": 0.127347,
          "gem": 0.178778,
          "jma": 0.136022
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
        "spreadBaseC2": 1.0518,
        "spreadScale": 0.6529,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254992,
            "ecmwfAifs": 0.069166,
            "icon": 0.212138,
            "ukmo": 0.13068,
            "meteofrance": 0.155482,
            "gfs": 0.063653,
            "gem": 0.055439,
            "jma": 0.05845
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
          "ecmwfIfs": 0.201582,
          "ecmwfAifs": 0.085336,
          "icon": 0.151392,
          "ukmo": 0.184136,
          "meteofrance": 0.035164,
          "gfs": 0.086827,
          "gem": 0.148681,
          "jma": 0.106882
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
        "spreadBaseC2": 1.0593,
        "spreadScale": 0.6401,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254992,
            "ecmwfAifs": 0.069166,
            "icon": 0.212138,
            "ukmo": 0.13068,
            "meteofrance": 0.155482,
            "gfs": 0.063653,
            "gem": 0.055439,
            "jma": 0.05845
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
          "ecmwfAifs": 0.02,
          "icon": 0.237115,
          "ukmo": 0.171496,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.365389,
          "jma": 0.146
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
        "spreadBaseC2": 1.6394,
        "spreadScale": 0.6199,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256375,
            "ecmwfAifs": 0.072583,
            "icon": 0.213488,
            "ukmo": 0.119284,
            "meteofrance": 0.15553,
            "gfs": 0.067787,
            "gem": 0.056261,
            "jma": 0.058692
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
          "ecmwfIfs": 0.142963,
          "ecmwfAifs": 0.096452,
          "icon": 0.201507,
          "ukmo": 0.15111,
          "meteofrance": 0.020183,
          "gfs": 0.023818,
          "gem": 0.245355,
          "jma": 0.118612
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
        "spreadBaseC2": 1.1884,
        "spreadScale": 0.7995,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.256375,
            "ecmwfAifs": 0.072583,
            "icon": 0.213488,
            "ukmo": 0.119284,
            "meteofrance": 0.15553,
            "gfs": 0.067787,
            "gem": 0.056261,
            "jma": 0.058692
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
          "ecmwfAifs": 0.23116,
          "icon": 0.231347,
          "ukmo": 0.02,
          "meteofrance": 0.166317,
          "gfs": 0.076363,
          "gem": 0.234813,
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
        "spreadBaseC2": 2.6561,
        "spreadScale": 0.9128,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.037502,
          "ecmwfAifs": 0.283358,
          "icon": 0.208272,
          "ukmo": 0.030426,
          "meteofrance": 0.138063,
          "gfs": 0.074369,
          "gem": 0.207461,
          "jma": 0.020549
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
        "spreadBaseC2": 2.6561,
        "spreadScale": 0.9128,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.055004,
          "ecmwfAifs": 0.335558,
          "icon": 0.185198,
          "ukmo": 0.040851,
          "meteofrance": 0.109808,
          "gfs": 0.072375,
          "gem": 0.180108,
          "jma": 0.021098
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
        "spreadBaseC2": 2.5226,
        "spreadScale": 0.9927,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.098844,
          "ecmwfAifs": 0.057765,
          "icon": 0.274297,
          "ukmo": 0.168618,
          "meteofrance": 0.032325,
          "gfs": 0.074563,
          "gem": 0.179206,
          "jma": 0.114382
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
        "spreadBaseC2": 1.1425,
        "spreadScale": 0.7212,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.148367,
          "ecmwfAifs": 0.091525,
          "icon": 0.242205,
          "ukmo": 0.15578,
          "meteofrance": 0.034977,
          "gfs": 0.066179,
          "gem": 0.155565,
          "jma": 0.105402
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
        "spreadBaseC2": 1.1425,
        "spreadScale": 0.7212,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.197889,
          "ecmwfAifs": 0.125284,
          "icon": 0.210114,
          "ukmo": 0.142943,
          "meteofrance": 0.03763,
          "gfs": 0.057794,
          "gem": 0.131924,
          "jma": 0.096422
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
        "spreadBaseC2": 1.1217,
        "spreadScale": 0.7152,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02701,
          "ecmwfAifs": 0.035189,
          "icon": 0.187343,
          "ukmo": 0.269545,
          "meteofrance": 0.038766,
          "gfs": 0.127347,
          "gem": 0.178778,
          "jma": 0.136022
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
        "spreadBaseC2": 1.0518,
        "spreadScale": 0.6529,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.114296,
          "ecmwfAifs": 0.060262,
          "icon": 0.169368,
          "ukmo": 0.22684,
          "meteofrance": 0.036965,
          "gfs": 0.107087,
          "gem": 0.16373,
          "jma": 0.121452
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
        "spreadBaseC2": 1.0518,
        "spreadScale": 0.6529,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.201582,
          "ecmwfAifs": 0.085336,
          "icon": 0.151392,
          "ukmo": 0.184136,
          "meteofrance": 0.035164,
          "gfs": 0.086827,
          "gem": 0.148681,
          "jma": 0.106882
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
        "spreadBaseC2": 1.0593,
        "spreadScale": 0.6401,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.237115,
          "ukmo": 0.171496,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.365389,
          "jma": 0.146
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
        "spreadBaseC2": 1.6394,
        "spreadScale": 0.6199,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.081482,
          "ecmwfAifs": 0.058226,
          "icon": 0.219311,
          "ukmo": 0.161303,
          "meteofrance": 0.020092,
          "gfs": 0.021909,
          "gem": 0.305371,
          "jma": 0.132306
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
        "spreadBaseC2": 1.6394,
        "spreadScale": 0.6199,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.142963,
          "ecmwfAifs": 0.096452,
          "icon": 0.201507,
          "ukmo": 0.15111,
          "meteofrance": 0.020183,
          "gfs": 0.023818,
          "gem": 0.245355,
          "jma": 0.118612
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
        "spreadBaseC2": 1.1884,
        "spreadScale": 0.7995,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.247277,
        "ecmwfAifs": 0.082145,
        "icon": 0.21092,
        "ukmo": 0.11664,
        "meteofrance": 0.155228,
        "gfs": 0.072331,
        "gem": 0.056063,
        "jma": 0.059396
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.244672,
        "ecmwfAifs": 0.07388,
        "icon": 0.219833,
        "ukmo": 0.122555,
        "meteofrance": 0.155267,
        "gfs": 0.067602,
        "gem": 0.056496,
        "jma": 0.059695
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.254992,
        "ecmwfAifs": 0.069166,
        "icon": 0.212138,
        "ukmo": 0.13068,
        "meteofrance": 0.155482,
        "gfs": 0.063653,
        "gem": 0.055439,
        "jma": 0.05845
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.256375,
        "ecmwfAifs": 0.072583,
        "icon": 0.213488,
        "ukmo": 0.119284,
        "meteofrance": 0.15553,
        "gfs": 0.067787,
        "gem": 0.056261,
        "jma": 0.058692
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.209647,
    "ecmwfAifs": 0.070466,
    "icon": 0.260894,
    "ukmo": 0.168163,
    "meteofrance": 0.109614,
    "gfs": 0.10292,
    "gem": 0.039148,
    "jma": 0.039148
  },
  "pressureWeights": {
    "ecmwfIfs": 0.339498,
    "ecmwfAifs": 0.147769,
    "icon": 0.14768,
    "ukmo": 0.166928,
    "meteofrance": 0.077773,
    "gfs": 0.042578,
    "gem": 0.038887,
    "jma": 0.038887
  }
} as const;

export default PROVINCE_CALIBRATION_TR_75;
