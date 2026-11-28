import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_11: ProvinceCalibrationBundle = {
  "provinceCode": "TR-11",
  "provinceName": "Bilecik",
  "plateNumber": 11,
  "tier": "TIER_B_DONOR_ALARO",
  "calibrationTier": "TIER_B_DONOR_KALMAN",
  "wmoStationId": null,
  "stationLat": 40.1419,
  "stationLon": 29.9793,
  "stationElevationM": 539,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 0,
  "alaroAnchorWeight0to72h": 0.24,
  "donorProvinces": [
    "TR-26",
    "TR-43",
    "TR-54"
  ],
  "donorStations": [
    {
      "provinceCode": "TR-26",
      "provinceName": "Eskişehir",
      "wmoStationId": "17124",
      "weight": 0.45
    },
    {
      "provinceCode": "TR-43",
      "provinceName": "Kütahya",
      "wmoStationId": "17155",
      "weight": 0.35
    },
    {
      "provinceCode": "TR-54",
      "provinceName": "Sakarya",
      "wmoStationId": "17069",
      "weight": 0.2
    }
  ],
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.44663,
          "ecmwfAifs": 0.100768,
          "icon": 0.129579,
          "ukmo": 0.02,
          "meteofrance": 0.091276,
          "gfs": 0.02,
          "gem": 0.171747,
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
        "spreadBaseC2": 0.506,
        "spreadScale": 0.3587,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252672,
            "ecmwfAifs": 0.08306,
            "icon": 0.212315,
            "ukmo": 0.117,
            "meteofrance": 0.160897,
            "gfs": 0.065482,
            "gem": 0.055818,
            "jma": 0.052756
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
          "ecmwfIfs": 0.520034,
          "ecmwfAifs": 0.154733,
          "icon": 0.088697,
          "ukmo": 0.023811,
          "meteofrance": 0.055447,
          "gfs": 0.02506,
          "gem": 0.112218,
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
        "spreadBaseC2": 0.5011,
        "spreadScale": 0.3926,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.252672,
            "ecmwfAifs": 0.08306,
            "icon": 0.212315,
            "ukmo": 0.117,
            "meteofrance": 0.160897,
            "gfs": 0.065482,
            "gem": 0.055818,
            "jma": 0.052756
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
          "ecmwfIfs": 0.476845,
          "ecmwfAifs": 0.05486,
          "icon": 0.183197,
          "ukmo": 0.02,
          "meteofrance": 0.039237,
          "gfs": 0.027013,
          "gem": 0.178848,
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
        "spreadBaseC2": 0.6113,
        "spreadScale": 0.3911,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251963,
            "ecmwfAifs": 0.07543,
            "icon": 0.218293,
            "ukmo": 0.12238,
            "meteofrance": 0.15651,
            "gfs": 0.063775,
            "gem": 0.05587,
            "jma": 0.055779
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
          "ecmwfIfs": 0.531942,
          "ecmwfAifs": 0.107479,
          "icon": 0.112699,
          "ukmo": 0.030765,
          "meteofrance": 0.034872,
          "gfs": 0.028337,
          "gem": 0.131668,
          "jma": 0.022238
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
        "spreadBaseC2": 0.5595,
        "spreadScale": 0.4498,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.251963,
            "ecmwfAifs": 0.07543,
            "icon": 0.218293,
            "ukmo": 0.12238,
            "meteofrance": 0.15651,
            "gfs": 0.063775,
            "gem": 0.05587,
            "jma": 0.055779
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
          "ecmwfIfs": 0.482763,
          "ecmwfAifs": 0.090058,
          "icon": 0.190832,
          "ukmo": 0.02,
          "meteofrance": 0.045319,
          "gfs": 0.028232,
          "gem": 0.122796,
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
        "spreadBaseC2": 0.5059,
        "spreadScale": 0.5089,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240492,
            "ecmwfAifs": 0.078227,
            "icon": 0.227123,
            "ukmo": 0.120796,
            "meteofrance": 0.155966,
            "gfs": 0.065747,
            "gem": 0.056432,
            "jma": 0.055217
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
          "ecmwfIfs": 0.538741,
          "ecmwfAifs": 0.116675,
          "icon": 0.118636,
          "ukmo": 0.029358,
          "meteofrance": 0.04492,
          "gfs": 0.038464,
          "gem": 0.093069,
          "jma": 0.020137
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
        "spreadBaseC2": 0.4928,
        "spreadScale": 0.5379,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.240492,
            "ecmwfAifs": 0.078227,
            "icon": 0.227123,
            "ukmo": 0.120796,
            "meteofrance": 0.155966,
            "gfs": 0.065747,
            "gem": 0.056432,
            "jma": 0.055217
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
          "ecmwfIfs": 0.440373,
          "ecmwfAifs": 0.029506,
          "icon": 0.224063,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.025412,
          "gem": 0.220646,
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
        "spreadBaseC2": 0.682,
        "spreadScale": 0.4836,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243429,
            "ecmwfAifs": 0.07709,
            "icon": 0.221539,
            "ukmo": 0.117611,
            "meteofrance": 0.158812,
            "gfs": 0.067871,
            "gem": 0.057617,
            "jma": 0.056031
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
          "ecmwfIfs": 0.491791,
          "ecmwfAifs": 0.115883,
          "icon": 0.120689,
          "ukmo": 0.026374,
          "meteofrance": 0.024546,
          "gfs": 0.028585,
          "gem": 0.169663,
          "jma": 0.022469
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
        "spreadBaseC2": 0.7207,
        "spreadScale": 0.5156,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243429,
            "ecmwfAifs": 0.07709,
            "icon": 0.221539,
            "ukmo": 0.117611,
            "meteofrance": 0.158812,
            "gfs": 0.067871,
            "gem": 0.057617,
            "jma": 0.056031
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
          "ecmwfIfs": 0.44663,
          "ecmwfAifs": 0.100768,
          "icon": 0.129579,
          "ukmo": 0.02,
          "meteofrance": 0.091276,
          "gfs": 0.02,
          "gem": 0.171747,
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
        "spreadBaseC2": 0.506,
        "spreadScale": 0.3587,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.483331,
          "ecmwfAifs": 0.12775,
          "icon": 0.109138,
          "ukmo": 0.021906,
          "meteofrance": 0.073362,
          "gfs": 0.02253,
          "gem": 0.141983,
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
        "spreadBaseC2": 0.506,
        "spreadScale": 0.3587,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.520034,
          "ecmwfAifs": 0.154733,
          "icon": 0.088697,
          "ukmo": 0.023811,
          "meteofrance": 0.055447,
          "gfs": 0.02506,
          "gem": 0.112218,
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
        "spreadBaseC2": 0.5011,
        "spreadScale": 0.3926,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.476845,
          "ecmwfAifs": 0.05486,
          "icon": 0.183197,
          "ukmo": 0.02,
          "meteofrance": 0.039237,
          "gfs": 0.027013,
          "gem": 0.178848,
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
        "spreadBaseC2": 0.6113,
        "spreadScale": 0.3911,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.504393,
          "ecmwfAifs": 0.08117,
          "icon": 0.147948,
          "ukmo": 0.025383,
          "meteofrance": 0.037055,
          "gfs": 0.027675,
          "gem": 0.155257,
          "jma": 0.021119
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
        "spreadBaseC2": 0.6113,
        "spreadScale": 0.3911,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.531942,
          "ecmwfAifs": 0.107479,
          "icon": 0.112699,
          "ukmo": 0.030765,
          "meteofrance": 0.034872,
          "gfs": 0.028337,
          "gem": 0.131668,
          "jma": 0.022238
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
        "spreadBaseC2": 0.5595,
        "spreadScale": 0.4498,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.482763,
          "ecmwfAifs": 0.090058,
          "icon": 0.190832,
          "ukmo": 0.02,
          "meteofrance": 0.045319,
          "gfs": 0.028232,
          "gem": 0.122796,
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
        "spreadBaseC2": 0.5059,
        "spreadScale": 0.5089,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.510751,
          "ecmwfAifs": 0.103367,
          "icon": 0.154733,
          "ukmo": 0.024679,
          "meteofrance": 0.04512,
          "gfs": 0.033348,
          "gem": 0.107933,
          "jma": 0.020069
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
        "spreadBaseC2": 0.5059,
        "spreadScale": 0.5089,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.538741,
          "ecmwfAifs": 0.116675,
          "icon": 0.118636,
          "ukmo": 0.029358,
          "meteofrance": 0.04492,
          "gfs": 0.038464,
          "gem": 0.093069,
          "jma": 0.020137
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
        "spreadBaseC2": 0.4928,
        "spreadScale": 0.5379,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.440373,
          "ecmwfAifs": 0.029506,
          "icon": 0.224063,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.025412,
          "gem": 0.220646,
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
        "spreadBaseC2": 0.682,
        "spreadScale": 0.4836,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.466082,
          "ecmwfAifs": 0.072695,
          "icon": 0.172376,
          "ukmo": 0.023187,
          "meteofrance": 0.022273,
          "gfs": 0.026998,
          "gem": 0.195155,
          "jma": 0.021234
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
        "spreadBaseC2": 0.682,
        "spreadScale": 0.4836,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.491791,
          "ecmwfAifs": 0.115883,
          "icon": 0.120689,
          "ukmo": 0.026374,
          "meteofrance": 0.024546,
          "gfs": 0.028585,
          "gem": 0.169663,
          "jma": 0.022469
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
        "spreadBaseC2": 0.7207,
        "spreadScale": 0.5156,
        "cvMaeC": null,
        "cvRmseC": null,
        "sampleHours": 0
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.252672,
        "ecmwfAifs": 0.08306,
        "icon": 0.212315,
        "ukmo": 0.117,
        "meteofrance": 0.160897,
        "gfs": 0.065482,
        "gem": 0.055818,
        "jma": 0.052756
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.251963,
        "ecmwfAifs": 0.07543,
        "icon": 0.218293,
        "ukmo": 0.12238,
        "meteofrance": 0.15651,
        "gfs": 0.063775,
        "gem": 0.05587,
        "jma": 0.055779
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.240492,
        "ecmwfAifs": 0.078227,
        "icon": 0.227123,
        "ukmo": 0.120796,
        "meteofrance": 0.155966,
        "gfs": 0.065747,
        "gem": 0.056432,
        "jma": 0.055217
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.243429,
        "ecmwfAifs": 0.07709,
        "icon": 0.221539,
        "ukmo": 0.117611,
        "meteofrance": 0.158812,
        "gfs": 0.067871,
        "gem": 0.057617,
        "jma": 0.056031
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.24
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.245673,
    "ecmwfAifs": 0.070458,
    "icon": 0.22681,
    "ukmo": 0.179516,
    "meteofrance": 0.109601,
    "gfs": 0.089656,
    "gem": 0.039143,
    "jma": 0.039143
  },
  "pressureWeights": {
    "ecmwfIfs": 0.406983,
    "ecmwfAifs": 0.128545,
    "icon": 0.132561,
    "ukmo": 0.145222,
    "meteofrance": 0.067655,
    "gfs": 0.051378,
    "gem": 0.033828,
    "jma": 0.033828
  }
} as const;

export default PROVINCE_CALIBRATION_TR_11;
