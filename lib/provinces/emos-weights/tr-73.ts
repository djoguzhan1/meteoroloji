import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_73: ProvinceCalibrationBundle = {
  "provinceCode": "TR-73",
  "provinceName": "Şırnak",
  "plateNumber": 73,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 37.5164,
  "stationLon": 42.4611,
  "stationElevationM": 1350,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-56",
    "TR-72",
    "TR-65"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-56",
      "provinceName": "Siirt",
      "wmoStationId": "17210",
      "weight": 0.5
    },
    {
      "provinceCode": "TR-72",
      "provinceName": "Batman",
      "wmoStationId": "17282",
      "weight": 0.3
    },
    {
      "provinceCode": "TR-65",
      "provinceName": "Van",
      "wmoStationId": "17170",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.475271,
          "ecmwfAifs": 0.099677,
          "icon": 0.075782,
          "ukmo": 0.073332,
          "meteofrance": 0.047377,
          "gfs": 0.02,
          "gem": 0.183462,
          "jma": 0.025099
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
        "spreadBaseC2": 0.9549,
        "spreadScale": 0.1767,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249056,
            "ecmwfAifs": 0.088506,
            "icon": 0.215067,
            "ukmo": 0.116287,
            "meteofrance": 0.154156,
            "gfs": 0.06175,
            "gem": 0.056066,
            "jma": 0.059112
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
          "ecmwfIfs": 0.525281,
          "ecmwfAifs": 0.124729,
          "icon": 0.059944,
          "ukmo": 0.068873,
          "meteofrance": 0.025229,
          "gfs": 0.02,
          "gem": 0.149114,
          "jma": 0.02683
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
        "spreadBaseC2": 0.9788,
        "spreadScale": 0.178,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249056,
            "ecmwfAifs": 0.088506,
            "icon": 0.215067,
            "ukmo": 0.116287,
            "meteofrance": 0.154156,
            "gfs": 0.06175,
            "gem": 0.056066,
            "jma": 0.059112
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
          "ecmwfIfs": 0.480351,
          "ecmwfAifs": 0.074797,
          "icon": 0.097796,
          "ukmo": 0.120232,
          "meteofrance": 0.025488,
          "gfs": 0.020364,
          "gem": 0.157066,
          "jma": 0.023906
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
        "spreadBaseC2": 0.9084,
        "spreadScale": 0.2943,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248816,
            "ecmwfAifs": 0.069427,
            "icon": 0.222548,
            "ukmo": 0.124002,
            "meteofrance": 0.15923,
            "gfs": 0.0636,
            "gem": 0.056197,
            "jma": 0.05618
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
          "ecmwfIfs": 0.513461,
          "ecmwfAifs": 0.10143,
          "icon": 0.07948,
          "ukmo": 0.104984,
          "meteofrance": 0.021946,
          "gfs": 0.023483,
          "gem": 0.131272,
          "jma": 0.023944
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
        "spreadBaseC2": 0.9626,
        "spreadScale": 0.2792,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.248816,
            "ecmwfAifs": 0.069427,
            "icon": 0.222548,
            "ukmo": 0.124002,
            "meteofrance": 0.15923,
            "gfs": 0.0636,
            "gem": 0.056197,
            "jma": 0.05618
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
          "ecmwfIfs": 0.539616,
          "ecmwfAifs": 0.02,
          "icon": 0.020262,
          "ukmo": 0.154867,
          "meteofrance": 0.044402,
          "gfs": 0.02,
          "gem": 0.180853,
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
        "spreadBaseC2": 1.054,
        "spreadScale": 0.2446,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22843,
            "ecmwfAifs": 0.082563,
            "icon": 0.222612,
            "ukmo": 0.125769,
            "meteofrance": 0.161093,
            "gfs": 0.06912,
            "gem": 0.053403,
            "jma": 0.05701
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
          "ecmwfIfs": 0.566541,
          "ecmwfAifs": 0.033058,
          "icon": 0.036011,
          "ukmo": 0.142654,
          "meteofrance": 0.036501,
          "gfs": 0.021979,
          "gem": 0.143256,
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
        "spreadBaseC2": 1.0825,
        "spreadScale": 0.2189,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.22843,
            "ecmwfAifs": 0.082563,
            "icon": 0.222612,
            "ukmo": 0.125769,
            "meteofrance": 0.161093,
            "gfs": 0.06912,
            "gem": 0.053403,
            "jma": 0.05701
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
          "ecmwfIfs": 0.540081,
          "ecmwfAifs": 0.035866,
          "icon": 0.044502,
          "ukmo": 0.114532,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.205019,
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
        "spreadBaseC2": 0.9515,
        "spreadScale": 0.2316,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237103,
            "ecmwfAifs": 0.08331,
            "icon": 0.224174,
            "ukmo": 0.117508,
            "meteofrance": 0.155875,
            "gfs": 0.065553,
            "gem": 0.055867,
            "jma": 0.06061
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
          "ecmwfIfs": 0.566158,
          "ecmwfAifs": 0.047518,
          "icon": 0.051047,
          "ukmo": 0.109834,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.165443,
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
        "spreadBaseC2": 0.9892,
        "spreadScale": 0.2095,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237103,
            "ecmwfAifs": 0.08331,
            "icon": 0.224174,
            "ukmo": 0.117508,
            "meteofrance": 0.155875,
            "gfs": 0.065553,
            "gem": 0.055867,
            "jma": 0.06061
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
          "ecmwfIfs": 0.475271,
          "ecmwfAifs": 0.099677,
          "icon": 0.075782,
          "ukmo": 0.073332,
          "meteofrance": 0.047377,
          "gfs": 0.02,
          "gem": 0.183462,
          "jma": 0.025099
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
        "spreadBaseC2": 0.9549,
        "spreadScale": 0.1767,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.500275,
          "ecmwfAifs": 0.112203,
          "icon": 0.067863,
          "ukmo": 0.071103,
          "meteofrance": 0.036303,
          "gfs": 0.02,
          "gem": 0.166288,
          "jma": 0.025965
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
        "spreadBaseC2": 0.9549,
        "spreadScale": 0.1767,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.525281,
          "ecmwfAifs": 0.124729,
          "icon": 0.059944,
          "ukmo": 0.068873,
          "meteofrance": 0.025229,
          "gfs": 0.02,
          "gem": 0.149114,
          "jma": 0.02683
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
        "spreadBaseC2": 0.9788,
        "spreadScale": 0.178,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.480351,
          "ecmwfAifs": 0.074797,
          "icon": 0.097796,
          "ukmo": 0.120232,
          "meteofrance": 0.025488,
          "gfs": 0.020364,
          "gem": 0.157066,
          "jma": 0.023906
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
        "spreadBaseC2": 0.9084,
        "spreadScale": 0.2943,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.496905,
          "ecmwfAifs": 0.088114,
          "icon": 0.088638,
          "ukmo": 0.112608,
          "meteofrance": 0.023717,
          "gfs": 0.021924,
          "gem": 0.144169,
          "jma": 0.023925
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
        "spreadBaseC2": 0.9084,
        "spreadScale": 0.2943,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.513461,
          "ecmwfAifs": 0.10143,
          "icon": 0.07948,
          "ukmo": 0.104984,
          "meteofrance": 0.021946,
          "gfs": 0.023483,
          "gem": 0.131272,
          "jma": 0.023944
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
        "spreadBaseC2": 0.9626,
        "spreadScale": 0.2792,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.539616,
          "ecmwfAifs": 0.02,
          "icon": 0.020262,
          "ukmo": 0.154867,
          "meteofrance": 0.044402,
          "gfs": 0.02,
          "gem": 0.180853,
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
        "spreadBaseC2": 1.054,
        "spreadScale": 0.2446,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.553078,
          "ecmwfAifs": 0.026529,
          "icon": 0.028137,
          "ukmo": 0.14876,
          "meteofrance": 0.040452,
          "gfs": 0.02099,
          "gem": 0.162054,
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
        "spreadBaseC2": 1.054,
        "spreadScale": 0.2446,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.566541,
          "ecmwfAifs": 0.033058,
          "icon": 0.036011,
          "ukmo": 0.142654,
          "meteofrance": 0.036501,
          "gfs": 0.021979,
          "gem": 0.143256,
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
        "spreadBaseC2": 1.0825,
        "spreadScale": 0.2189,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.540081,
          "ecmwfAifs": 0.035866,
          "icon": 0.044502,
          "ukmo": 0.114532,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.205019,
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
        "spreadBaseC2": 0.9515,
        "spreadScale": 0.2316,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.55312,
          "ecmwfAifs": 0.041692,
          "icon": 0.047774,
          "ukmo": 0.112183,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.185231,
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
        "spreadBaseC2": 0.9515,
        "spreadScale": 0.2316,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.566158,
          "ecmwfAifs": 0.047518,
          "icon": 0.051047,
          "ukmo": 0.109834,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.165443,
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
        "spreadBaseC2": 0.9892,
        "spreadScale": 0.2095,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.249056,
        "ecmwfAifs": 0.088506,
        "icon": 0.215067,
        "ukmo": 0.116287,
        "meteofrance": 0.154156,
        "gfs": 0.06175,
        "gem": 0.056066,
        "jma": 0.059112
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.248816,
        "ecmwfAifs": 0.069427,
        "icon": 0.222548,
        "ukmo": 0.124002,
        "meteofrance": 0.15923,
        "gfs": 0.0636,
        "gem": 0.056197,
        "jma": 0.05618
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.22843,
        "ecmwfAifs": 0.082563,
        "icon": 0.222612,
        "ukmo": 0.125769,
        "meteofrance": 0.161093,
        "gfs": 0.06912,
        "gem": 0.053403,
        "jma": 0.05701
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.237103,
        "ecmwfAifs": 0.08331,
        "icon": 0.224174,
        "ukmo": 0.117508,
        "meteofrance": 0.155875,
        "gfs": 0.065553,
        "gem": 0.055867,
        "jma": 0.06061
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.261765,
    "ecmwfAifs": 0.068266,
    "icon": 0.251501,
    "ukmo": 0.143337,
    "meteofrance": 0.106191,
    "gfs": 0.09309,
    "gem": 0.037925,
    "jma": 0.037925
  },
  "pressureWeights": {
    "ecmwfIfs": 0.415367,
    "ecmwfAifs": 0.130032,
    "icon": 0.14158,
    "ukmo": 0.141847,
    "meteofrance": 0.068438,
    "gfs": 0.034298,
    "gem": 0.034219,
    "jma": 0.034219
  }
} as const;

export default PROVINCE_CALIBRATION_TR_73;
