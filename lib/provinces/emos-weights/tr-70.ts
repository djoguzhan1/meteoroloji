import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_70: ProvinceCalibrationBundle = {
  "provinceCode": "TR-70",
  "provinceName": "Karaman",
  "plateNumber": 70,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 37.1759,
  "stationLon": 33.2287,
  "stationElevationM": 1018,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-42",
    "TR-51",
    "TR-32"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-42",
      "provinceName": "Konya",
      "wmoStationId": "17244",
      "weight": 0.55
    },
    {
      "provinceCode": "TR-51",
      "provinceName": "Niğde",
      "wmoStationId": "17250",
      "weight": 0.3
    },
    {
      "provinceCode": "TR-32",
      "provinceName": "Isparta",
      "wmoStationId": "17240",
      "weight": 0.15
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.201933,
          "ecmwfAifs": 0.038357,
          "icon": 0.339795,
          "ukmo": 0.12012,
          "meteofrance": 0.118119,
          "gfs": 0.099349,
          "gem": 0.05675,
          "jma": 0.025577
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
        "spreadBaseC2": 0.8199,
        "spreadScale": 0.2042,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241669,
            "ecmwfAifs": 0.082791,
            "icon": 0.216765,
            "ukmo": 0.12374,
            "meteofrance": 0.1541,
            "gfs": 0.066354,
            "gem": 0.056921,
            "jma": 0.05766
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
          "ecmwfIfs": 0.228485,
          "ecmwfAifs": 0.194024,
          "icon": 0.225751,
          "ukmo": 0.093632,
          "meteofrance": 0.08764,
          "gfs": 0.067311,
          "gem": 0.067794,
          "jma": 0.035363
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
        "spreadBaseC2": 0.7955,
        "spreadScale": 0.2389,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241669,
            "ecmwfAifs": 0.082791,
            "icon": 0.216765,
            "ukmo": 0.12374,
            "meteofrance": 0.1541,
            "gfs": 0.066354,
            "gem": 0.056921,
            "jma": 0.05766
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
          "ecmwfIfs": 0.216078,
          "ecmwfAifs": 0.039254,
          "icon": 0.256834,
          "ukmo": 0.133197,
          "meteofrance": 0.149155,
          "gfs": 0.04806,
          "gem": 0.137422,
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
        "spreadBaseC2": 1.0312,
        "spreadScale": 0.3479,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240735,
            "ecmwfAifs": 0.076431,
            "icon": 0.224308,
            "ukmo": 0.123574,
            "meteofrance": 0.152922,
            "gfs": 0.068154,
            "gem": 0.058291,
            "jma": 0.055585
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
          "ecmwfIfs": 0.254145,
          "ecmwfAifs": 0.136993,
          "icon": 0.197445,
          "ukmo": 0.112773,
          "meteofrance": 0.113057,
          "gfs": 0.036526,
          "gem": 0.116124,
          "jma": 0.032937
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
        "spreadBaseC2": 0.9864,
        "spreadScale": 0.3694,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240735,
            "ecmwfAifs": 0.076431,
            "icon": 0.224308,
            "ukmo": 0.123574,
            "meteofrance": 0.152922,
            "gfs": 0.068154,
            "gem": 0.058291,
            "jma": 0.055585
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
          "ecmwfIfs": 0.292952,
          "ecmwfAifs": 0.051135,
          "icon": 0.197943,
          "ukmo": 0.079449,
          "meteofrance": 0.129101,
          "gfs": 0.123285,
          "gem": 0.106135,
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
        "spreadBaseC2": 0.4063,
        "spreadScale": 0.5131,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239249,
            "ecmwfAifs": 0.082513,
            "icon": 0.2195,
            "ukmo": 0.125746,
            "meteofrance": 0.15641,
            "gfs": 0.065364,
            "gem": 0.056352,
            "jma": 0.054866
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
          "ecmwfIfs": 0.326459,
          "ecmwfAifs": 0.124953,
          "icon": 0.157008,
          "ukmo": 0.087304,
          "meteofrance": 0.128745,
          "gfs": 0.081688,
          "gem": 0.073843,
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
        "spreadBaseC2": 0.4352,
        "spreadScale": 0.4982,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239249,
            "ecmwfAifs": 0.082513,
            "icon": 0.2195,
            "ukmo": 0.125746,
            "meteofrance": 0.15641,
            "gfs": 0.065364,
            "gem": 0.056352,
            "jma": 0.054866
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
          "ecmwfIfs": 0.253076,
          "ecmwfAifs": 0.031128,
          "icon": 0.312289,
          "ukmo": 0.094429,
          "meteofrance": 0.114892,
          "gfs": 0.075569,
          "gem": 0.098617,
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
        "spreadBaseC2": 0.5883,
        "spreadScale": 0.4177,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239476,
            "ecmwfAifs": 0.077328,
            "icon": 0.225107,
            "ukmo": 0.121966,
            "meteofrance": 0.154373,
            "gfs": 0.066794,
            "gem": 0.057427,
            "jma": 0.057529
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
          "ecmwfIfs": 0.298165,
          "ecmwfAifs": 0.12133,
          "icon": 0.218464,
          "ukmo": 0.082569,
          "meteofrance": 0.109339,
          "gfs": 0.062791,
          "gem": 0.087342,
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
        "spreadBaseC2": 0.5611,
        "spreadScale": 0.4426,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239476,
            "ecmwfAifs": 0.077328,
            "icon": 0.225107,
            "ukmo": 0.121966,
            "meteofrance": 0.154373,
            "gfs": 0.066794,
            "gem": 0.057427,
            "jma": 0.057529
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
          "ecmwfIfs": 0.201933,
          "ecmwfAifs": 0.038357,
          "icon": 0.339795,
          "ukmo": 0.12012,
          "meteofrance": 0.118119,
          "gfs": 0.099349,
          "gem": 0.05675,
          "jma": 0.025577
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
        "spreadBaseC2": 0.8199,
        "spreadScale": 0.2042,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.215209,
          "ecmwfAifs": 0.116191,
          "icon": 0.282772,
          "ukmo": 0.106876,
          "meteofrance": 0.10288,
          "gfs": 0.08333,
          "gem": 0.062272,
          "jma": 0.03047
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
        "spreadBaseC2": 0.8199,
        "spreadScale": 0.2042,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.228485,
          "ecmwfAifs": 0.194024,
          "icon": 0.225751,
          "ukmo": 0.093632,
          "meteofrance": 0.08764,
          "gfs": 0.067311,
          "gem": 0.067794,
          "jma": 0.035363
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
        "spreadBaseC2": 0.7955,
        "spreadScale": 0.2389,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.216078,
          "ecmwfAifs": 0.039254,
          "icon": 0.256834,
          "ukmo": 0.133197,
          "meteofrance": 0.149155,
          "gfs": 0.04806,
          "gem": 0.137422,
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
        "spreadBaseC2": 1.0312,
        "spreadScale": 0.3479,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.235113,
          "ecmwfAifs": 0.088123,
          "icon": 0.227139,
          "ukmo": 0.122985,
          "meteofrance": 0.131106,
          "gfs": 0.042293,
          "gem": 0.126773,
          "jma": 0.026468
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
        "spreadBaseC2": 1.0312,
        "spreadScale": 0.3479,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.254145,
          "ecmwfAifs": 0.136993,
          "icon": 0.197445,
          "ukmo": 0.112773,
          "meteofrance": 0.113057,
          "gfs": 0.036526,
          "gem": 0.116124,
          "jma": 0.032937
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
        "spreadBaseC2": 0.9864,
        "spreadScale": 0.3694,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.292952,
          "ecmwfAifs": 0.051135,
          "icon": 0.197943,
          "ukmo": 0.079449,
          "meteofrance": 0.129101,
          "gfs": 0.123285,
          "gem": 0.106135,
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
        "spreadBaseC2": 0.4063,
        "spreadScale": 0.5131,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.309704,
          "ecmwfAifs": 0.088044,
          "icon": 0.177476,
          "ukmo": 0.083377,
          "meteofrance": 0.128923,
          "gfs": 0.102487,
          "gem": 0.089989,
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
        "spreadBaseC2": 0.4063,
        "spreadScale": 0.5131,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.326459,
          "ecmwfAifs": 0.124953,
          "icon": 0.157008,
          "ukmo": 0.087304,
          "meteofrance": 0.128745,
          "gfs": 0.081688,
          "gem": 0.073843,
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
        "spreadBaseC2": 0.4352,
        "spreadScale": 0.4982,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.253076,
          "ecmwfAifs": 0.031128,
          "icon": 0.312289,
          "ukmo": 0.094429,
          "meteofrance": 0.114892,
          "gfs": 0.075569,
          "gem": 0.098617,
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
        "spreadBaseC2": 0.5883,
        "spreadScale": 0.4177,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.27562,
          "ecmwfAifs": 0.076229,
          "icon": 0.265377,
          "ukmo": 0.088499,
          "meteofrance": 0.112116,
          "gfs": 0.06918,
          "gem": 0.092979,
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
        "spreadBaseC2": 0.5883,
        "spreadScale": 0.4177,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.298165,
          "ecmwfAifs": 0.12133,
          "icon": 0.218464,
          "ukmo": 0.082569,
          "meteofrance": 0.109339,
          "gfs": 0.062791,
          "gem": 0.087342,
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
        "spreadBaseC2": 0.5611,
        "spreadScale": 0.4426,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.241669,
        "ecmwfAifs": 0.082791,
        "icon": 0.216765,
        "ukmo": 0.12374,
        "meteofrance": 0.1541,
        "gfs": 0.066354,
        "gem": 0.056921,
        "jma": 0.05766
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.240735,
        "ecmwfAifs": 0.076431,
        "icon": 0.224308,
        "ukmo": 0.123574,
        "meteofrance": 0.152922,
        "gfs": 0.068154,
        "gem": 0.058291,
        "jma": 0.055585
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.239249,
        "ecmwfAifs": 0.082513,
        "icon": 0.2195,
        "ukmo": 0.125746,
        "meteofrance": 0.15641,
        "gfs": 0.065364,
        "gem": 0.056352,
        "jma": 0.054866
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.239476,
        "ecmwfAifs": 0.077328,
        "icon": 0.225107,
        "ukmo": 0.121966,
        "meteofrance": 0.154373,
        "gfs": 0.066794,
        "gem": 0.057427,
        "jma": 0.057529
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.240983,
    "ecmwfAifs": 0.068984,
    "icon": 0.244026,
    "ukmo": 0.164584,
    "meteofrance": 0.107309,
    "gfs": 0.097464,
    "gem": 0.038325,
    "jma": 0.038325
  },
  "pressureWeights": {
    "ecmwfIfs": 0.414092,
    "ecmwfAifs": 0.119741,
    "icon": 0.133415,
    "ukmo": 0.151391,
    "meteofrance": 0.062973,
    "gfs": 0.054694,
    "gem": 0.031847,
    "jma": 0.031847
  }
} as const;

export default PROVINCE_CALIBRATION_TR_70;
