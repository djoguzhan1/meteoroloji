import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_69: ProvinceCalibrationBundle = {
  "provinceCode": "TR-69",
  "provinceName": "Bayburt",
  "plateNumber": 69,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 40.2552,
  "stationLon": 40.2249,
  "stationElevationM": 1584,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-29",
    "TR-25",
    "TR-24"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-29",
      "provinceName": "Gümüşhane",
      "wmoStationId": "17088",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-25",
      "provinceName": "Erzurum",
      "wmoStationId": "17096",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-24",
      "provinceName": "Erzincan",
      "wmoStationId": "17092",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.290214,
          "ecmwfAifs": 0.159432,
          "icon": 0.264346,
          "ukmo": 0.049056,
          "meteofrance": 0.059986,
          "gfs": 0.06813,
          "gem": 0.088836,
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
        "spreadBaseC2": 1.815,
        "spreadScale": 0.8967,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249936,
            "ecmwfAifs": 0.085093,
            "icon": 0.220638,
            "ukmo": 0.108062,
            "meteofrance": 0.150557,
            "gfs": 0.067723,
            "gem": 0.059336,
            "jma": 0.058655
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
          "ecmwfIfs": 0.297243,
          "ecmwfAifs": 0.258632,
          "icon": 0.178717,
          "ukmo": 0.062998,
          "meteofrance": 0.053036,
          "gfs": 0.059871,
          "gem": 0.069503,
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
        "spreadBaseC2": 1.8239,
        "spreadScale": 0.9639,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.249936,
            "ecmwfAifs": 0.085093,
            "icon": 0.220638,
            "ukmo": 0.108062,
            "meteofrance": 0.150557,
            "gfs": 0.067723,
            "gem": 0.059336,
            "jma": 0.058655
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
          "ecmwfIfs": 0.321953,
          "ecmwfAifs": 0.142822,
          "icon": 0.173206,
          "ukmo": 0.135023,
          "meteofrance": 0.068888,
          "gfs": 0.058844,
          "gem": 0.079264,
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
        "spreadBaseC2": 0.5983,
        "spreadScale": 0.7324,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25447,
            "ecmwfAifs": 0.072484,
            "icon": 0.216657,
            "ukmo": 0.120231,
            "meteofrance": 0.154689,
            "gfs": 0.066346,
            "gem": 0.056784,
            "jma": 0.058339
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
          "ecmwfIfs": 0.366828,
          "ecmwfAifs": 0.172218,
          "icon": 0.13938,
          "ukmo": 0.12316,
          "meteofrance": 0.06197,
          "gfs": 0.049313,
          "gem": 0.067131,
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
        "spreadBaseC2": 0.5176,
        "spreadScale": 0.7731,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.25447,
            "ecmwfAifs": 0.072484,
            "icon": 0.216657,
            "ukmo": 0.120231,
            "meteofrance": 0.154689,
            "gfs": 0.066346,
            "gem": 0.056784,
            "jma": 0.058339
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
          "ecmwfIfs": 0.31776,
          "ecmwfAifs": 0.115285,
          "icon": 0.154358,
          "ukmo": 0.172009,
          "meteofrance": 0.073931,
          "gfs": 0.025741,
          "gem": 0.110624,
          "jma": 0.030292
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
        "spreadBaseC2": 0.5428,
        "spreadScale": 0.5666,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246506,
            "ecmwfAifs": 0.067101,
            "icon": 0.223367,
            "ukmo": 0.12757,
            "meteofrance": 0.160663,
            "gfs": 0.062576,
            "gem": 0.05622,
            "jma": 0.055997
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
          "ecmwfIfs": 0.363057,
          "ecmwfAifs": 0.168102,
          "icon": 0.115775,
          "ukmo": 0.130299,
          "meteofrance": 0.057629,
          "gfs": 0.044093,
          "gem": 0.089233,
          "jma": 0.031812
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
        "spreadBaseC2": 0.4417,
        "spreadScale": 0.6259,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246506,
            "ecmwfAifs": 0.067101,
            "icon": 0.223367,
            "ukmo": 0.12757,
            "meteofrance": 0.160663,
            "gfs": 0.062576,
            "gem": 0.05622,
            "jma": 0.055997
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
          "ecmwfIfs": 0.269188,
          "ecmwfAifs": 0.085915,
          "icon": 0.089273,
          "ukmo": 0.252634,
          "meteofrance": 0.020098,
          "gfs": 0.082897,
          "gem": 0.179995,
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
        "spreadBaseC2": 1.3833,
        "spreadScale": 0.5649,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254643,
            "ecmwfAifs": 0.072062,
            "icon": 0.218081,
            "ukmo": 0.121828,
            "meteofrance": 0.153701,
            "gfs": 0.066392,
            "gem": 0.056244,
            "jma": 0.057049
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
          "ecmwfIfs": 0.312864,
          "ecmwfAifs": 0.139601,
          "icon": 0.091663,
          "ukmo": 0.185851,
          "meteofrance": 0.037727,
          "gfs": 0.081341,
          "gem": 0.130953,
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
        "spreadBaseC2": 0.8007,
        "spreadScale": 0.8048,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.254643,
            "ecmwfAifs": 0.072062,
            "icon": 0.218081,
            "ukmo": 0.121828,
            "meteofrance": 0.153701,
            "gfs": 0.066392,
            "gem": 0.056244,
            "jma": 0.057049
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
          "ecmwfIfs": 0.290214,
          "ecmwfAifs": 0.159432,
          "icon": 0.264346,
          "ukmo": 0.049056,
          "meteofrance": 0.059986,
          "gfs": 0.06813,
          "gem": 0.088836,
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
        "spreadBaseC2": 1.815,
        "spreadScale": 0.8967,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.293728,
          "ecmwfAifs": 0.209032,
          "icon": 0.221531,
          "ukmo": 0.056027,
          "meteofrance": 0.056511,
          "gfs": 0.064001,
          "gem": 0.07917,
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
        "spreadBaseC2": 1.815,
        "spreadScale": 0.8967,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.297243,
          "ecmwfAifs": 0.258632,
          "icon": 0.178717,
          "ukmo": 0.062998,
          "meteofrance": 0.053036,
          "gfs": 0.059871,
          "gem": 0.069503,
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
        "spreadBaseC2": 1.8239,
        "spreadScale": 0.9639,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.321953,
          "ecmwfAifs": 0.142822,
          "icon": 0.173206,
          "ukmo": 0.135023,
          "meteofrance": 0.068888,
          "gfs": 0.058844,
          "gem": 0.079264,
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
        "spreadBaseC2": 0.5983,
        "spreadScale": 0.7324,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.34439,
          "ecmwfAifs": 0.157519,
          "icon": 0.156293,
          "ukmo": 0.129092,
          "meteofrance": 0.065429,
          "gfs": 0.054079,
          "gem": 0.073198,
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
        "spreadBaseC2": 0.5983,
        "spreadScale": 0.7324,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.366828,
          "ecmwfAifs": 0.172218,
          "icon": 0.13938,
          "ukmo": 0.12316,
          "meteofrance": 0.06197,
          "gfs": 0.049313,
          "gem": 0.067131,
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
        "spreadBaseC2": 0.5176,
        "spreadScale": 0.7731,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.31776,
          "ecmwfAifs": 0.115285,
          "icon": 0.154358,
          "ukmo": 0.172009,
          "meteofrance": 0.073931,
          "gfs": 0.025741,
          "gem": 0.110624,
          "jma": 0.030292
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
        "spreadBaseC2": 0.5428,
        "spreadScale": 0.5666,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.340408,
          "ecmwfAifs": 0.141694,
          "icon": 0.135067,
          "ukmo": 0.151153,
          "meteofrance": 0.06578,
          "gfs": 0.034917,
          "gem": 0.099929,
          "jma": 0.031052
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
        "spreadBaseC2": 0.5428,
        "spreadScale": 0.5666,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.363057,
          "ecmwfAifs": 0.168102,
          "icon": 0.115775,
          "ukmo": 0.130299,
          "meteofrance": 0.057629,
          "gfs": 0.044093,
          "gem": 0.089233,
          "jma": 0.031812
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
        "spreadBaseC2": 0.4417,
        "spreadScale": 0.6259,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.269188,
          "ecmwfAifs": 0.085915,
          "icon": 0.089273,
          "ukmo": 0.252634,
          "meteofrance": 0.020098,
          "gfs": 0.082897,
          "gem": 0.179995,
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
        "spreadBaseC2": 1.3833,
        "spreadScale": 0.5649,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.291025,
          "ecmwfAifs": 0.112758,
          "icon": 0.090468,
          "ukmo": 0.219243,
          "meteofrance": 0.028913,
          "gfs": 0.082119,
          "gem": 0.155474,
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
        "spreadBaseC2": 1.3833,
        "spreadScale": 0.5649,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.312864,
          "ecmwfAifs": 0.139601,
          "icon": 0.091663,
          "ukmo": 0.185851,
          "meteofrance": 0.037727,
          "gfs": 0.081341,
          "gem": 0.130953,
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
        "spreadBaseC2": 0.8007,
        "spreadScale": 0.8048,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.249936,
        "ecmwfAifs": 0.085093,
        "icon": 0.220638,
        "ukmo": 0.108062,
        "meteofrance": 0.150557,
        "gfs": 0.067723,
        "gem": 0.059336,
        "jma": 0.058655
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.25447,
        "ecmwfAifs": 0.072484,
        "icon": 0.216657,
        "ukmo": 0.120231,
        "meteofrance": 0.154689,
        "gfs": 0.066346,
        "gem": 0.056784,
        "jma": 0.058339
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.246506,
        "ecmwfAifs": 0.067101,
        "icon": 0.223367,
        "ukmo": 0.12757,
        "meteofrance": 0.160663,
        "gfs": 0.062576,
        "gem": 0.05622,
        "jma": 0.055997
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.254643,
        "ecmwfAifs": 0.072062,
        "icon": 0.218081,
        "ukmo": 0.121828,
        "meteofrance": 0.153701,
        "gfs": 0.066392,
        "gem": 0.056244,
        "jma": 0.057049
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.239443,
    "ecmwfAifs": 0.069004,
    "icon": 0.244733,
    "ukmo": 0.161366,
    "meteofrance": 0.107339,
    "gfs": 0.101445,
    "gem": 0.038335,
    "jma": 0.038335
  },
  "pressureWeights": {
    "ecmwfIfs": 0.390295,
    "ecmwfAifs": 0.134942,
    "icon": 0.142172,
    "ukmo": 0.150104,
    "meteofrance": 0.071022,
    "gfs": 0.040443,
    "gem": 0.035511,
    "jma": 0.035511
  }
} as const;

export default PROVINCE_CALIBRATION_TR_69;
