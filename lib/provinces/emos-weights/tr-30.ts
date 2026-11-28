import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_30: ProvinceCalibrationBundle = {
  "provinceCode": "TR-30",
  "provinceName": "Hakkari",
  "plateNumber": 30,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 37.5744,
  "stationLon": 43.7408,
  "stationElevationM": 1727,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-65",
    "TR-56",
    "TR-49"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-65",
      "provinceName": "Van",
      "wmoStationId": "17170",
      "weight": 0.5
    },
    {
      "provinceCode": "TR-56",
      "provinceName": "Siirt",
      "wmoStationId": "17210",
      "weight": 0.3
    },
    {
      "provinceCode": "TR-49",
      "provinceName": "Muş",
      "wmoStationId": "17204",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.375905,
          "ecmwfAifs": 0.239696,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.031072,
          "gfs": 0.039607,
          "gem": 0.197627,
          "jma": 0.076093
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
        "spreadBaseC2": 1.0756,
        "spreadScale": 0.2371,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255524,
            "ecmwfAifs": 0.085815,
            "icon": 0.221902,
            "ukmo": 0.111454,
            "meteofrance": 0.150517,
            "gfs": 0.062953,
            "gem": 0.053773,
            "jma": 0.058062
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
          "ecmwfIfs": 0.443679,
          "ecmwfAifs": 0.239008,
          "icon": 0.027619,
          "ukmo": 0.029751,
          "meteofrance": 0.023258,
          "gfs": 0.030235,
          "gem": 0.128547,
          "jma": 0.077903
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
        "spreadBaseC2": 1.057,
        "spreadScale": 0.263,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.255524,
            "ecmwfAifs": 0.085815,
            "icon": 0.221902,
            "ukmo": 0.111454,
            "meteofrance": 0.150517,
            "gfs": 0.062953,
            "gem": 0.053773,
            "jma": 0.058062
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
          "ecmwfIfs": 0.467049,
          "ecmwfAifs": 0.180458,
          "icon": 0.049988,
          "ukmo": 0.085362,
          "meteofrance": 0.03372,
          "gfs": 0.020909,
          "gem": 0.093033,
          "jma": 0.069481
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
        "spreadBaseC2": 1.1235,
        "spreadScale": 0.261,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244796,
            "ecmwfAifs": 0.07316,
            "icon": 0.222744,
            "ukmo": 0.120828,
            "meteofrance": 0.158837,
            "gfs": 0.065113,
            "gem": 0.056657,
            "jma": 0.057865
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
          "ecmwfIfs": 0.460824,
          "ecmwfAifs": 0.204926,
          "icon": 0.067103,
          "ukmo": 0.073007,
          "meteofrance": 0.02885,
          "gfs": 0.032027,
          "gem": 0.073692,
          "jma": 0.059571
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
        "spreadBaseC2": 1.1646,
        "spreadScale": 0.2491,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.244796,
            "ecmwfAifs": 0.07316,
            "icon": 0.222744,
            "ukmo": 0.120828,
            "meteofrance": 0.158837,
            "gfs": 0.065113,
            "gem": 0.056657,
            "jma": 0.057865
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
          "ecmwfIfs": 0.590326,
          "ecmwfAifs": 0.02,
          "icon": 0.020656,
          "ukmo": 0.02,
          "meteofrance": 0.085854,
          "gfs": 0.051061,
          "gem": 0.129298,
          "jma": 0.082805
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
        "spreadBaseC2": 1.5925,
        "spreadScale": 0.1154,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231539,
            "ecmwfAifs": 0.083493,
            "icon": 0.220912,
            "ukmo": 0.12378,
            "meteofrance": 0.162027,
            "gfs": 0.068445,
            "gem": 0.054123,
            "jma": 0.055681
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
          "ecmwfIfs": 0.55779,
          "ecmwfAifs": 0.07269,
          "icon": 0.060028,
          "ukmo": 0.02,
          "meteofrance": 0.075693,
          "gfs": 0.041577,
          "gem": 0.103947,
          "jma": 0.068275
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
        "spreadBaseC2": 1.6241,
        "spreadScale": 0.0973,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.231539,
            "ecmwfAifs": 0.083493,
            "icon": 0.220912,
            "ukmo": 0.12378,
            "meteofrance": 0.162027,
            "gfs": 0.068445,
            "gem": 0.054123,
            "jma": 0.055681
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
          "ecmwfIfs": 0.58989,
          "ecmwfAifs": 0.059665,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.082242,
          "gem": 0.150132,
          "jma": 0.058071
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
        "spreadBaseC2": 0.8512,
        "spreadScale": 0.4123,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230696,
            "ecmwfAifs": 0.083786,
            "icon": 0.22562,
            "ukmo": 0.118613,
            "meteofrance": 0.159447,
            "gfs": 0.066643,
            "gem": 0.055712,
            "jma": 0.059483
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
          "ecmwfIfs": 0.57218,
          "ecmwfAifs": 0.100463,
          "icon": 0.039874,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.067547,
          "gem": 0.120604,
          "jma": 0.059332
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
        "spreadBaseC2": 0.9662,
        "spreadScale": 0.3511,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230696,
            "ecmwfAifs": 0.083786,
            "icon": 0.22562,
            "ukmo": 0.118613,
            "meteofrance": 0.159447,
            "gfs": 0.066643,
            "gem": 0.055712,
            "jma": 0.059483
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
          "ecmwfIfs": 0.375905,
          "ecmwfAifs": 0.239696,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.031072,
          "gfs": 0.039607,
          "gem": 0.197627,
          "jma": 0.076093
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
        "spreadBaseC2": 1.0756,
        "spreadScale": 0.2371,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.409791,
          "ecmwfAifs": 0.239352,
          "icon": 0.02381,
          "ukmo": 0.024876,
          "meteofrance": 0.027165,
          "gfs": 0.034921,
          "gem": 0.163087,
          "jma": 0.076998
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
        "spreadBaseC2": 1.0756,
        "spreadScale": 0.2371,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.443679,
          "ecmwfAifs": 0.239008,
          "icon": 0.027619,
          "ukmo": 0.029751,
          "meteofrance": 0.023258,
          "gfs": 0.030235,
          "gem": 0.128547,
          "jma": 0.077903
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
        "spreadBaseC2": 1.057,
        "spreadScale": 0.263,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.467049,
          "ecmwfAifs": 0.180458,
          "icon": 0.049988,
          "ukmo": 0.085362,
          "meteofrance": 0.03372,
          "gfs": 0.020909,
          "gem": 0.093033,
          "jma": 0.069481
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
        "spreadBaseC2": 1.1235,
        "spreadScale": 0.261,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.463936,
          "ecmwfAifs": 0.192692,
          "icon": 0.058546,
          "ukmo": 0.079184,
          "meteofrance": 0.031285,
          "gfs": 0.026468,
          "gem": 0.083363,
          "jma": 0.064526
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
        "spreadBaseC2": 1.1235,
        "spreadScale": 0.261,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.460824,
          "ecmwfAifs": 0.204926,
          "icon": 0.067103,
          "ukmo": 0.073007,
          "meteofrance": 0.02885,
          "gfs": 0.032027,
          "gem": 0.073692,
          "jma": 0.059571
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
        "spreadBaseC2": 1.1646,
        "spreadScale": 0.2491,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.590326,
          "ecmwfAifs": 0.02,
          "icon": 0.020656,
          "ukmo": 0.02,
          "meteofrance": 0.085854,
          "gfs": 0.051061,
          "gem": 0.129298,
          "jma": 0.082805
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
        "spreadBaseC2": 1.5925,
        "spreadScale": 0.1154,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.574057,
          "ecmwfAifs": 0.046345,
          "icon": 0.040342,
          "ukmo": 0.02,
          "meteofrance": 0.080774,
          "gfs": 0.046319,
          "gem": 0.116623,
          "jma": 0.07554
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
        "spreadBaseC2": 1.5925,
        "spreadScale": 0.1154,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.55779,
          "ecmwfAifs": 0.07269,
          "icon": 0.060028,
          "ukmo": 0.02,
          "meteofrance": 0.075693,
          "gfs": 0.041577,
          "gem": 0.103947,
          "jma": 0.068275
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
        "spreadBaseC2": 1.6241,
        "spreadScale": 0.0973,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.58989,
          "ecmwfAifs": 0.059665,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.082242,
          "gem": 0.150132,
          "jma": 0.058071
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
        "spreadBaseC2": 0.8512,
        "spreadScale": 0.4123,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.581034,
          "ecmwfAifs": 0.080064,
          "icon": 0.029937,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.074895,
          "gem": 0.135368,
          "jma": 0.058702
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
        "spreadBaseC2": 0.8512,
        "spreadScale": 0.4123,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.57218,
          "ecmwfAifs": 0.100463,
          "icon": 0.039874,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.067547,
          "gem": 0.120604,
          "jma": 0.059332
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
        "spreadBaseC2": 0.9662,
        "spreadScale": 0.3511,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.255524,
        "ecmwfAifs": 0.085815,
        "icon": 0.221902,
        "ukmo": 0.111454,
        "meteofrance": 0.150517,
        "gfs": 0.062953,
        "gem": 0.053773,
        "jma": 0.058062
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.244796,
        "ecmwfAifs": 0.07316,
        "icon": 0.222744,
        "ukmo": 0.120828,
        "meteofrance": 0.158837,
        "gfs": 0.065113,
        "gem": 0.056657,
        "jma": 0.057865
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.231539,
        "ecmwfAifs": 0.083493,
        "icon": 0.220912,
        "ukmo": 0.12378,
        "meteofrance": 0.162027,
        "gfs": 0.068445,
        "gem": 0.054123,
        "jma": 0.055681
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.230696,
        "ecmwfAifs": 0.083786,
        "icon": 0.22562,
        "ukmo": 0.118613,
        "meteofrance": 0.159447,
        "gfs": 0.066643,
        "gem": 0.055712,
        "jma": 0.059483
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.261467,
    "ecmwfAifs": 0.068497,
    "icon": 0.2339,
    "ukmo": 0.154386,
    "meteofrance": 0.10655,
    "gfs": 0.099092,
    "gem": 0.038054,
    "jma": 0.038054
  },
  "pressureWeights": {
    "ecmwfIfs": 0.398813,
    "ecmwfAifs": 0.131387,
    "icon": 0.168519,
    "ukmo": 0.132536,
    "meteofrance": 0.069151,
    "gfs": 0.030442,
    "gem": 0.034576,
    "jma": 0.034576
  }
} as const;

export default PROVINCE_CALIBRATION_TR_30;
