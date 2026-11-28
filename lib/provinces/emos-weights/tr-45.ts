import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_45: ProvinceCalibrationBundle = {
  "provinceCode": "TR-45",
  "provinceName": "Manisa",
  "plateNumber": 45,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 38.6191,
  "stationLon": 27.4289,
  "stationElevationM": 71,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-09",
    "TR-20",
    "TR-10"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-09",
      "provinceName": "Aydın",
      "wmoStationId": "17234",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-20",
      "provinceName": "Denizli",
      "wmoStationId": "17237",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-10",
      "provinceName": "Balıkesir",
      "wmoStationId": "17150",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.259222,
          "ecmwfAifs": 0.222717,
          "icon": 0.103762,
          "ukmo": 0.118236,
          "meteofrance": 0.13531,
          "gfs": 0.06019,
          "gem": 0.080563,
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
        "spreadBaseC2": 0.9614,
        "spreadScale": 0.2768,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259339,
            "ecmwfAifs": 0.08443,
            "icon": 0.207838,
            "ukmo": 0.110251,
            "meteofrance": 0.155156,
            "gfs": 0.065362,
            "gem": 0.05749,
            "jma": 0.060134
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
          "ecmwfIfs": 0.308436,
          "ecmwfAifs": 0.248045,
          "icon": 0.108246,
          "ukmo": 0.110479,
          "meteofrance": 0.07785,
          "gfs": 0.04976,
          "gem": 0.064055,
          "jma": 0.033129
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
        "spreadBaseC2": 0.9255,
        "spreadScale": 0.316,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.259339,
            "ecmwfAifs": 0.08443,
            "icon": 0.207838,
            "ukmo": 0.110251,
            "meteofrance": 0.155156,
            "gfs": 0.065362,
            "gem": 0.05749,
            "jma": 0.060134
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
          "ecmwfIfs": 0.505835,
          "ecmwfAifs": 0.047447,
          "icon": 0.146792,
          "ukmo": 0.072105,
          "meteofrance": 0.062295,
          "gfs": 0.036578,
          "gem": 0.095852,
          "jma": 0.033096
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
        "spreadBaseC2": 0.8376,
        "spreadScale": 0.5329,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252258,
            "ecmwfAifs": 0.079175,
            "icon": 0.209344,
            "ukmo": 0.12056,
            "meteofrance": 0.155252,
            "gfs": 0.068504,
            "gem": 0.057796,
            "jma": 0.057111
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
          "ecmwfIfs": 0.388902,
          "ecmwfAifs": 0.140696,
          "icon": 0.152689,
          "ukmo": 0.100461,
          "meteofrance": 0.054106,
          "gfs": 0.036267,
          "gem": 0.104143,
          "jma": 0.022736
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
        "spreadBaseC2": 0.8725,
        "spreadScale": 0.4936,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252258,
            "ecmwfAifs": 0.079175,
            "icon": 0.209344,
            "ukmo": 0.12056,
            "meteofrance": 0.155252,
            "gfs": 0.068504,
            "gem": 0.057796,
            "jma": 0.057111
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
          "ecmwfIfs": 0.243986,
          "ecmwfAifs": 0.059409,
          "icon": 0.227974,
          "ukmo": 0.079476,
          "meteofrance": 0.028996,
          "gfs": 0.064308,
          "gem": 0.275851,
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
        "spreadBaseC2": 0.8274,
        "spreadScale": 0.4159,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234204,
            "ecmwfAifs": 0.080929,
            "icon": 0.214703,
            "ukmo": 0.123214,
            "meteofrance": 0.164504,
            "gfs": 0.067916,
            "gem": 0.05712,
            "jma": 0.05741
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
          "ecmwfIfs": 0.270463,
          "ecmwfAifs": 0.121313,
          "icon": 0.22345,
          "ukmo": 0.070627,
          "meteofrance": 0.023714,
          "gfs": 0.061859,
          "gem": 0.208574,
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
        "spreadBaseC2": 0.8892,
        "spreadScale": 0.3852,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234204,
            "ecmwfAifs": 0.080929,
            "icon": 0.214703,
            "ukmo": 0.123214,
            "meteofrance": 0.164504,
            "gfs": 0.067916,
            "gem": 0.05712,
            "jma": 0.05741
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
          "ecmwfIfs": 0.299943,
          "ecmwfAifs": 0.123147,
          "icon": 0.277259,
          "ukmo": 0.063452,
          "meteofrance": 0.02,
          "gfs": 0.061781,
          "gem": 0.134418,
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
        "spreadBaseC2": 1.0647,
        "spreadScale": 0.3292,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239111,
            "ecmwfAifs": 0.080554,
            "icon": 0.212051,
            "ukmo": 0.123601,
            "meteofrance": 0.159403,
            "gfs": 0.064845,
            "gem": 0.060199,
            "jma": 0.060236
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
          "ecmwfIfs": 0.359967,
          "ecmwfAifs": 0.167616,
          "icon": 0.210493,
          "ukmo": 0.054667,
          "meteofrance": 0.020452,
          "gfs": 0.041775,
          "gem": 0.12503,
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
        "spreadBaseC2": 1.1136,
        "spreadScale": 0.3068,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239111,
            "ecmwfAifs": 0.080554,
            "icon": 0.212051,
            "ukmo": 0.123601,
            "meteofrance": 0.159403,
            "gfs": 0.064845,
            "gem": 0.060199,
            "jma": 0.060236
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
          "ecmwfIfs": 0.259222,
          "ecmwfAifs": 0.222717,
          "icon": 0.103762,
          "ukmo": 0.118236,
          "meteofrance": 0.13531,
          "gfs": 0.06019,
          "gem": 0.080563,
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
        "spreadBaseC2": 0.9614,
        "spreadScale": 0.2768,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.28383,
          "ecmwfAifs": 0.235381,
          "icon": 0.106004,
          "ukmo": 0.114357,
          "meteofrance": 0.10658,
          "gfs": 0.054975,
          "gem": 0.072309,
          "jma": 0.026564
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
        "spreadBaseC2": 0.9614,
        "spreadScale": 0.2768,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.308436,
          "ecmwfAifs": 0.248045,
          "icon": 0.108246,
          "ukmo": 0.110479,
          "meteofrance": 0.07785,
          "gfs": 0.04976,
          "gem": 0.064055,
          "jma": 0.033129
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
        "spreadBaseC2": 0.9255,
        "spreadScale": 0.316,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.505835,
          "ecmwfAifs": 0.047447,
          "icon": 0.146792,
          "ukmo": 0.072105,
          "meteofrance": 0.062295,
          "gfs": 0.036578,
          "gem": 0.095852,
          "jma": 0.033096
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
        "spreadBaseC2": 0.8376,
        "spreadScale": 0.5329,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.447368,
          "ecmwfAifs": 0.094072,
          "icon": 0.14974,
          "ukmo": 0.086283,
          "meteofrance": 0.058201,
          "gfs": 0.036423,
          "gem": 0.099997,
          "jma": 0.027916
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
        "spreadBaseC2": 0.8376,
        "spreadScale": 0.5329,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.388902,
          "ecmwfAifs": 0.140696,
          "icon": 0.152689,
          "ukmo": 0.100461,
          "meteofrance": 0.054106,
          "gfs": 0.036267,
          "gem": 0.104143,
          "jma": 0.022736
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
        "spreadBaseC2": 0.8725,
        "spreadScale": 0.4936,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.243986,
          "ecmwfAifs": 0.059409,
          "icon": 0.227974,
          "ukmo": 0.079476,
          "meteofrance": 0.028996,
          "gfs": 0.064308,
          "gem": 0.275851,
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
        "spreadBaseC2": 0.8274,
        "spreadScale": 0.4159,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.257225,
          "ecmwfAifs": 0.090361,
          "icon": 0.225712,
          "ukmo": 0.075051,
          "meteofrance": 0.026355,
          "gfs": 0.063083,
          "gem": 0.242213,
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
        "spreadBaseC2": 0.8274,
        "spreadScale": 0.4159,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.270463,
          "ecmwfAifs": 0.121313,
          "icon": 0.22345,
          "ukmo": 0.070627,
          "meteofrance": 0.023714,
          "gfs": 0.061859,
          "gem": 0.208574,
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
        "spreadBaseC2": 0.8892,
        "spreadScale": 0.3852,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.299943,
          "ecmwfAifs": 0.123147,
          "icon": 0.277259,
          "ukmo": 0.063452,
          "meteofrance": 0.02,
          "gfs": 0.061781,
          "gem": 0.134418,
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
        "spreadBaseC2": 1.0647,
        "spreadScale": 0.3292,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.329954,
          "ecmwfAifs": 0.145382,
          "icon": 0.243876,
          "ukmo": 0.05906,
          "meteofrance": 0.020226,
          "gfs": 0.051778,
          "gem": 0.129724,
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
        "spreadBaseC2": 1.0647,
        "spreadScale": 0.3292,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.359967,
          "ecmwfAifs": 0.167616,
          "icon": 0.210493,
          "ukmo": 0.054667,
          "meteofrance": 0.020452,
          "gfs": 0.041775,
          "gem": 0.12503,
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
        "spreadBaseC2": 1.1136,
        "spreadScale": 0.3068,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.259339,
        "ecmwfAifs": 0.08443,
        "icon": 0.207838,
        "ukmo": 0.110251,
        "meteofrance": 0.155156,
        "gfs": 0.065362,
        "gem": 0.05749,
        "jma": 0.060134
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.252258,
        "ecmwfAifs": 0.079175,
        "icon": 0.209344,
        "ukmo": 0.12056,
        "meteofrance": 0.155252,
        "gfs": 0.068504,
        "gem": 0.057796,
        "jma": 0.057111
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.234204,
        "ecmwfAifs": 0.080929,
        "icon": 0.214703,
        "ukmo": 0.123214,
        "meteofrance": 0.164504,
        "gfs": 0.067916,
        "gem": 0.05712,
        "jma": 0.05741
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.239111,
        "ecmwfAifs": 0.080554,
        "icon": 0.212051,
        "ukmo": 0.123601,
        "meteofrance": 0.159403,
        "gfs": 0.064845,
        "gem": 0.060199,
        "jma": 0.060236
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.231011,
    "ecmwfAifs": 0.070231,
    "icon": 0.234826,
    "ukmo": 0.174224,
    "meteofrance": 0.109249,
    "gfs": 0.102425,
    "gem": 0.039017,
    "jma": 0.039017
  },
  "pressureWeights": {
    "ecmwfIfs": 0.3534,
    "ecmwfAifs": 0.137702,
    "icon": 0.118986,
    "ukmo": 0.178697,
    "meteofrance": 0.072475,
    "gfs": 0.066266,
    "gem": 0.036237,
    "jma": 0.036237
  }
} as const;

export default PROVINCE_CALIBRATION_TR_45;
