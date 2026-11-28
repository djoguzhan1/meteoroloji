import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_79: ProvinceCalibrationBundle = {
  "provinceCode": "TR-79",
  "provinceName": "Kilis",
  "plateNumber": 79,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 36.7184,
  "stationLon": 37.1212,
  "stationElevationM": 640,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-27",
    "TR-63",
    "TR-46"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-27",
      "provinceName": "Gaziantep",
      "wmoStationId": "17260",
      "weight": 0.6
    },
    {
      "provinceCode": "TR-63",
      "provinceName": "Şanlıurfa",
      "wmoStationId": "17270",
      "weight": 0.25
    },
    {
      "provinceCode": "TR-46",
      "provinceName": "Kahramanmaraş",
      "wmoStationId": "17255",
      "weight": 0.15
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.222064,
          "ecmwfAifs": 0.094207,
          "icon": 0.204921,
          "ukmo": 0.162147,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.256661,
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
        "spreadBaseC2": 0.6076,
        "spreadScale": 0.5057,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245909,
            "ecmwfAifs": 0.08648,
            "icon": 0.217315,
            "ukmo": 0.122799,
            "meteofrance": 0.152711,
            "gfs": 0.063699,
            "gem": 0.055847,
            "jma": 0.05524
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
          "ecmwfIfs": 0.280741,
          "ecmwfAifs": 0.153547,
          "icon": 0.136482,
          "ukmo": 0.139381,
          "meteofrance": 0.036977,
          "gfs": 0.02,
          "gem": 0.212872,
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
        "spreadBaseC2": 0.6919,
        "spreadScale": 0.5054,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245909,
            "ecmwfAifs": 0.08648,
            "icon": 0.217315,
            "ukmo": 0.122799,
            "meteofrance": 0.152711,
            "gfs": 0.063699,
            "gem": 0.055847,
            "jma": 0.05524
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
          "ecmwfIfs": 0.234765,
          "ecmwfAifs": 0.02,
          "icon": 0.147846,
          "ukmo": 0.21707,
          "meteofrance": 0.02,
          "gfs": 0.022485,
          "gem": 0.317834,
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
        "spreadBaseC2": 0.8737,
        "spreadScale": 0.5588,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240209,
            "ecmwfAifs": 0.075757,
            "icon": 0.227229,
            "ukmo": 0.122868,
            "meteofrance": 0.155202,
            "gfs": 0.063803,
            "gem": 0.057838,
            "jma": 0.057094
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
          "ecmwfIfs": 0.38319,
          "ecmwfAifs": 0.073815,
          "icon": 0.104527,
          "ukmo": 0.158482,
          "meteofrance": 0.023241,
          "gfs": 0.02,
          "gem": 0.216745,
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
        "spreadBaseC2": 0.7996,
        "spreadScale": 0.635,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240209,
            "ecmwfAifs": 0.075757,
            "icon": 0.227229,
            "ukmo": 0.122868,
            "meteofrance": 0.155202,
            "gfs": 0.063803,
            "gem": 0.057838,
            "jma": 0.057094
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
          "ecmwfIfs": 0.200727,
          "ecmwfAifs": 0.138721,
          "icon": 0.164925,
          "ukmo": 0.099043,
          "meteofrance": 0.058084,
          "gfs": 0.02,
          "gem": 0.2985,
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
        "spreadBaseC2": 0.8516,
        "spreadScale": 0.4973,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.225227,
            "ecmwfAifs": 0.079176,
            "icon": 0.220864,
            "ukmo": 0.129691,
            "meteofrance": 0.162468,
            "gfs": 0.069336,
            "gem": 0.052538,
            "jma": 0.0607
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
          "ecmwfIfs": 0.37943,
          "ecmwfAifs": 0.147355,
          "icon": 0.101119,
          "ukmo": 0.101143,
          "meteofrance": 0.041572,
          "gfs": 0.02,
          "gem": 0.189381,
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
        "spreadBaseC2": 0.9542,
        "spreadScale": 0.4462,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.225227,
            "ecmwfAifs": 0.079176,
            "icon": 0.220864,
            "ukmo": 0.129691,
            "meteofrance": 0.162468,
            "gfs": 0.069336,
            "gem": 0.052538,
            "jma": 0.0607
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
          "ecmwfIfs": 0.209399,
          "ecmwfAifs": 0.02,
          "icon": 0.125096,
          "ukmo": 0.202692,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.382813,
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
        "spreadBaseC2": 1.1119,
        "spreadScale": 0.4811,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239516,
            "ecmwfAifs": 0.080502,
            "icon": 0.218622,
            "ukmo": 0.125097,
            "meteofrance": 0.154977,
            "gfs": 0.066168,
            "gem": 0.057637,
            "jma": 0.057481
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
          "ecmwfIfs": 0.269651,
          "ecmwfAifs": 0.073707,
          "icon": 0.111322,
          "ukmo": 0.17901,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.30631,
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
        "spreadBaseC2": 1.0159,
        "spreadScale": 0.6211,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.239516,
            "ecmwfAifs": 0.080502,
            "icon": 0.218622,
            "ukmo": 0.125097,
            "meteofrance": 0.154977,
            "gfs": 0.066168,
            "gem": 0.057637,
            "jma": 0.057481
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
          "ecmwfIfs": 0.222064,
          "ecmwfAifs": 0.094207,
          "icon": 0.204921,
          "ukmo": 0.162147,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.256661,
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
        "spreadBaseC2": 0.6076,
        "spreadScale": 0.5057,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.251404,
          "ecmwfAifs": 0.123877,
          "icon": 0.170701,
          "ukmo": 0.150764,
          "meteofrance": 0.028488,
          "gfs": 0.02,
          "gem": 0.234766,
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
        "spreadBaseC2": 0.6076,
        "spreadScale": 0.5057,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.280741,
          "ecmwfAifs": 0.153547,
          "icon": 0.136482,
          "ukmo": 0.139381,
          "meteofrance": 0.036977,
          "gfs": 0.02,
          "gem": 0.212872,
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
        "spreadBaseC2": 0.6919,
        "spreadScale": 0.5054,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.234765,
          "ecmwfAifs": 0.02,
          "icon": 0.147846,
          "ukmo": 0.21707,
          "meteofrance": 0.02,
          "gfs": 0.022485,
          "gem": 0.317834,
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
        "spreadBaseC2": 0.8737,
        "spreadScale": 0.5588,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.308979,
          "ecmwfAifs": 0.046907,
          "icon": 0.126186,
          "ukmo": 0.187776,
          "meteofrance": 0.02162,
          "gfs": 0.021242,
          "gem": 0.26729,
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
        "spreadBaseC2": 0.8737,
        "spreadScale": 0.5588,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.38319,
          "ecmwfAifs": 0.073815,
          "icon": 0.104527,
          "ukmo": 0.158482,
          "meteofrance": 0.023241,
          "gfs": 0.02,
          "gem": 0.216745,
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
        "spreadBaseC2": 0.7996,
        "spreadScale": 0.635,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.200727,
          "ecmwfAifs": 0.138721,
          "icon": 0.164925,
          "ukmo": 0.099043,
          "meteofrance": 0.058084,
          "gfs": 0.02,
          "gem": 0.2985,
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
        "spreadBaseC2": 0.8516,
        "spreadScale": 0.4973,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.290078,
          "ecmwfAifs": 0.143038,
          "icon": 0.133022,
          "ukmo": 0.100093,
          "meteofrance": 0.049828,
          "gfs": 0.02,
          "gem": 0.243941,
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
        "spreadBaseC2": 0.8516,
        "spreadScale": 0.4973,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.37943,
          "ecmwfAifs": 0.147355,
          "icon": 0.101119,
          "ukmo": 0.101143,
          "meteofrance": 0.041572,
          "gfs": 0.02,
          "gem": 0.189381,
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
        "spreadBaseC2": 0.9542,
        "spreadScale": 0.4462,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.209399,
          "ecmwfAifs": 0.02,
          "icon": 0.125096,
          "ukmo": 0.202692,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.382813,
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
        "spreadBaseC2": 1.1119,
        "spreadScale": 0.4811,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.239525,
          "ecmwfAifs": 0.046854,
          "icon": 0.118209,
          "ukmo": 0.190851,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.344561,
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
        "spreadBaseC2": 1.1119,
        "spreadScale": 0.4811,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.269651,
          "ecmwfAifs": 0.073707,
          "icon": 0.111322,
          "ukmo": 0.17901,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.30631,
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
        "spreadBaseC2": 1.0159,
        "spreadScale": 0.6211,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.245909,
        "ecmwfAifs": 0.08648,
        "icon": 0.217315,
        "ukmo": 0.122799,
        "meteofrance": 0.152711,
        "gfs": 0.063699,
        "gem": 0.055847,
        "jma": 0.05524
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.240209,
        "ecmwfAifs": 0.075757,
        "icon": 0.227229,
        "ukmo": 0.122868,
        "meteofrance": 0.155202,
        "gfs": 0.063803,
        "gem": 0.057838,
        "jma": 0.057094
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.225227,
        "ecmwfAifs": 0.079176,
        "icon": 0.220864,
        "ukmo": 0.129691,
        "meteofrance": 0.162468,
        "gfs": 0.069336,
        "gem": 0.052538,
        "jma": 0.0607
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.239516,
        "ecmwfAifs": 0.080502,
        "icon": 0.218622,
        "ukmo": 0.125097,
        "meteofrance": 0.154977,
        "gfs": 0.066168,
        "gem": 0.057637,
        "jma": 0.057481
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.229024,
    "ecmwfAifs": 0.069153,
    "icon": 0.261259,
    "ukmo": 0.167011,
    "meteofrance": 0.107571,
    "gfs": 0.089144,
    "gem": 0.038419,
    "jma": 0.038419
  },
  "pressureWeights": {
    "ecmwfIfs": 0.33569,
    "ecmwfAifs": 0.141054,
    "icon": 0.137021,
    "ukmo": 0.175212,
    "meteofrance": 0.074239,
    "gfs": 0.062544,
    "gem": 0.03712,
    "jma": 0.03712
  }
} as const;

export default PROVINCE_CALIBRATION_TR_79;
