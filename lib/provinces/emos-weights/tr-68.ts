import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_68: ProvinceCalibrationBundle = {
  "provinceCode": "TR-68",
  "provinceName": "Aksaray",
  "plateNumber": 68,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 38.3687,
  "stationLon": 34.037,
  "stationElevationM": 970,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-51",
    "TR-42",
    "TR-50"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-51",
      "provinceName": "Niğde",
      "wmoStationId": "17250",
      "weight": 0.4
    },
    {
      "provinceCode": "TR-42",
      "provinceName": "Konya",
      "wmoStationId": "17244",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-50",
      "provinceName": "Nevşehir",
      "wmoStationId": "17193",
      "weight": 0.25
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.440678,
          "ecmwfAifs": 0.031682,
          "icon": 0.204308,
          "ukmo": 0.088932,
          "meteofrance": 0.032577,
          "gfs": 0.136125,
          "gem": 0.045698,
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
        "spreadBaseC2": 0.6941,
        "spreadScale": 0.1587,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239786,
            "ecmwfAifs": 0.084367,
            "icon": 0.219367,
            "ukmo": 0.121687,
            "meteofrance": 0.153102,
            "gfs": 0.067207,
            "gem": 0.057209,
            "jma": 0.057275
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
          "ecmwfIfs": 0.424485,
          "ecmwfAifs": 0.132297,
          "icon": 0.133725,
          "ukmo": 0.073135,
          "meteofrance": 0.056171,
          "gfs": 0.097943,
          "gem": 0.062244,
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
        "spreadBaseC2": 0.6856,
        "spreadScale": 0.1813,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239786,
            "ecmwfAifs": 0.084367,
            "icon": 0.219367,
            "ukmo": 0.121687,
            "meteofrance": 0.153102,
            "gfs": 0.067207,
            "gem": 0.057209,
            "jma": 0.057275
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
          "ecmwfIfs": 0.445619,
          "ecmwfAifs": 0.032253,
          "icon": 0.158495,
          "ukmo": 0.125175,
          "meteofrance": 0.034226,
          "gfs": 0.052601,
          "gem": 0.131631,
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
        "spreadBaseC2": 0.9171,
        "spreadScale": 0.2677,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240378,
            "ecmwfAifs": 0.078534,
            "icon": 0.221624,
            "ukmo": 0.123769,
            "meteofrance": 0.15384,
            "gfs": 0.067358,
            "gem": 0.058588,
            "jma": 0.055909
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
          "ecmwfIfs": 0.426116,
          "ecmwfAifs": 0.103276,
          "icon": 0.114633,
          "ukmo": 0.115961,
          "meteofrance": 0.045413,
          "gfs": 0.043817,
          "gem": 0.130784,
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
        "spreadBaseC2": 0.9133,
        "spreadScale": 0.269,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240378,
            "ecmwfAifs": 0.078534,
            "icon": 0.221624,
            "ukmo": 0.123769,
            "meteofrance": 0.15384,
            "gfs": 0.067358,
            "gem": 0.058588,
            "jma": 0.055909
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
          "ecmwfIfs": 0.468538,
          "ecmwfAifs": 0.068082,
          "icon": 0.120524,
          "ukmo": 0.076695,
          "meteofrance": 0.032088,
          "gfs": 0.127833,
          "gem": 0.08624,
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
        "spreadBaseC2": 0.2942,
        "spreadScale": 0.3911,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23582,
            "ecmwfAifs": 0.083084,
            "icon": 0.220836,
            "ukmo": 0.126591,
            "meteofrance": 0.154805,
            "gfs": 0.065586,
            "gem": 0.057256,
            "jma": 0.056022
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
          "ecmwfIfs": 0.434257,
          "ecmwfAifs": 0.140372,
          "icon": 0.109464,
          "ukmo": 0.088959,
          "meteofrance": 0.045248,
          "gfs": 0.095276,
          "gem": 0.066424,
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
        "spreadBaseC2": 0.3254,
        "spreadScale": 0.3798,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.23582,
            "ecmwfAifs": 0.083084,
            "icon": 0.220836,
            "ukmo": 0.126591,
            "meteofrance": 0.154805,
            "gfs": 0.065586,
            "gem": 0.057256,
            "jma": 0.056022
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
          "ecmwfIfs": 0.480577,
          "ecmwfAifs": 0.034838,
          "icon": 0.183546,
          "ukmo": 0.085452,
          "meteofrance": 0.02266,
          "gfs": 0.087271,
          "gem": 0.085656,
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
        "spreadBaseC2": 0.4538,
        "spreadScale": 0.3412,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235002,
            "ecmwfAifs": 0.079997,
            "icon": 0.224318,
            "ukmo": 0.12113,
            "meteofrance": 0.157315,
            "gfs": 0.067053,
            "gem": 0.058183,
            "jma": 0.057002
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
          "ecmwfIfs": 0.495624,
          "ecmwfAifs": 0.095714,
          "icon": 0.125646,
          "ukmo": 0.078314,
          "meteofrance": 0.042306,
          "gfs": 0.067927,
          "gem": 0.074469,
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
        "spreadBaseC2": 0.4542,
        "spreadScale": 0.3528,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235002,
            "ecmwfAifs": 0.079997,
            "icon": 0.224318,
            "ukmo": 0.12113,
            "meteofrance": 0.157315,
            "gfs": 0.067053,
            "gem": 0.058183,
            "jma": 0.057002
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
          "ecmwfIfs": 0.440678,
          "ecmwfAifs": 0.031682,
          "icon": 0.204308,
          "ukmo": 0.088932,
          "meteofrance": 0.032577,
          "gfs": 0.136125,
          "gem": 0.045698,
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
        "spreadBaseC2": 0.6941,
        "spreadScale": 0.1587,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.432581,
          "ecmwfAifs": 0.08199,
          "icon": 0.169016,
          "ukmo": 0.081034,
          "meteofrance": 0.044374,
          "gfs": 0.117034,
          "gem": 0.053971,
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
        "spreadBaseC2": 0.6941,
        "spreadScale": 0.1587,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.424485,
          "ecmwfAifs": 0.132297,
          "icon": 0.133725,
          "ukmo": 0.073135,
          "meteofrance": 0.056171,
          "gfs": 0.097943,
          "gem": 0.062244,
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
        "spreadBaseC2": 0.6856,
        "spreadScale": 0.1813,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.445619,
          "ecmwfAifs": 0.032253,
          "icon": 0.158495,
          "ukmo": 0.125175,
          "meteofrance": 0.034226,
          "gfs": 0.052601,
          "gem": 0.131631,
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
        "spreadBaseC2": 0.9171,
        "spreadScale": 0.2677,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.435866,
          "ecmwfAifs": 0.067765,
          "icon": 0.136564,
          "ukmo": 0.120568,
          "meteofrance": 0.03982,
          "gfs": 0.048209,
          "gem": 0.131208,
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
        "spreadBaseC2": 0.9171,
        "spreadScale": 0.2677,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.426116,
          "ecmwfAifs": 0.103276,
          "icon": 0.114633,
          "ukmo": 0.115961,
          "meteofrance": 0.045413,
          "gfs": 0.043817,
          "gem": 0.130784,
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
        "spreadBaseC2": 0.9133,
        "spreadScale": 0.269,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.468538,
          "ecmwfAifs": 0.068082,
          "icon": 0.120524,
          "ukmo": 0.076695,
          "meteofrance": 0.032088,
          "gfs": 0.127833,
          "gem": 0.08624,
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
        "spreadBaseC2": 0.2942,
        "spreadScale": 0.3911,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.451397,
          "ecmwfAifs": 0.104227,
          "icon": 0.114994,
          "ukmo": 0.082827,
          "meteofrance": 0.038668,
          "gfs": 0.111555,
          "gem": 0.076332,
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
        "spreadBaseC2": 0.2942,
        "spreadScale": 0.3911,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.434257,
          "ecmwfAifs": 0.140372,
          "icon": 0.109464,
          "ukmo": 0.088959,
          "meteofrance": 0.045248,
          "gfs": 0.095276,
          "gem": 0.066424,
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
        "spreadBaseC2": 0.3254,
        "spreadScale": 0.3798,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.480577,
          "ecmwfAifs": 0.034838,
          "icon": 0.183546,
          "ukmo": 0.085452,
          "meteofrance": 0.02266,
          "gfs": 0.087271,
          "gem": 0.085656,
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
        "spreadBaseC2": 0.4538,
        "spreadScale": 0.3412,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.4881,
          "ecmwfAifs": 0.065276,
          "icon": 0.154596,
          "ukmo": 0.081883,
          "meteofrance": 0.032483,
          "gfs": 0.077599,
          "gem": 0.080063,
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
        "spreadBaseC2": 0.4538,
        "spreadScale": 0.3412,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.495624,
          "ecmwfAifs": 0.095714,
          "icon": 0.125646,
          "ukmo": 0.078314,
          "meteofrance": 0.042306,
          "gfs": 0.067927,
          "gem": 0.074469,
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
        "spreadBaseC2": 0.4542,
        "spreadScale": 0.3528,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.239786,
        "ecmwfAifs": 0.084367,
        "icon": 0.219367,
        "ukmo": 0.121687,
        "meteofrance": 0.153102,
        "gfs": 0.067207,
        "gem": 0.057209,
        "jma": 0.057275
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.240378,
        "ecmwfAifs": 0.078534,
        "icon": 0.221624,
        "ukmo": 0.123769,
        "meteofrance": 0.15384,
        "gfs": 0.067358,
        "gem": 0.058588,
        "jma": 0.055909
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.23582,
        "ecmwfAifs": 0.083084,
        "icon": 0.220836,
        "ukmo": 0.126591,
        "meteofrance": 0.154805,
        "gfs": 0.065586,
        "gem": 0.057256,
        "jma": 0.056022
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.235002,
        "ecmwfAifs": 0.079997,
        "icon": 0.224318,
        "ukmo": 0.12113,
        "meteofrance": 0.157315,
        "gfs": 0.067053,
        "gem": 0.058183,
        "jma": 0.057002
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.259178,
    "ecmwfAifs": 0.06794,
    "icon": 0.2321,
    "ukmo": 0.164508,
    "meteofrance": 0.105684,
    "gfs": 0.095102,
    "gem": 0.037744,
    "jma": 0.037744
  },
  "pressureWeights": {
    "ecmwfIfs": 0.527025,
    "ecmwfAifs": 0.097153,
    "icon": 0.141117,
    "ukmo": 0.09565,
    "meteofrance": 0.051069,
    "gfs": 0.035958,
    "gem": 0.026014,
    "jma": 0.026014
  }
} as const;

export default PROVINCE_CALIBRATION_TR_68;
