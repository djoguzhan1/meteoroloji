import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_04: ProvinceCalibrationBundle = {
  "provinceCode": "TR-04",
  "provinceName": "Ağrı",
  "plateNumber": 4,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17099",
  "stationLat": 39.7167,
  "stationLon": 43.05,
  "stationElevationM": 1632,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17216,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.316872,
          "ecmwfAifs": 0.342504,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.10416,
          "gfs": 0.129821,
          "gem": 0.046643,
          "jma": 0.02
        },
        "intercept": 0.0447,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8781,
        "spreadScale": 0.5947,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243378,
            "ecmwfAifs": 0.087929,
            "icon": 0.213532,
            "ukmo": 0.113909,
            "meteofrance": 0.15966,
            "gfs": 0.069361,
            "gem": 0.053935,
            "jma": 0.058296
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3988,
          "logisticSlope": 4.7356,
          "wetFractionWeight": 4.1876,
          "powerEta": 0.68,
          "rawBrier": 0.03432,
          "calibratedBrier": 0.03343
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.1015,
          "rawIfsRmseC": 2.8384,
          "rawEqualMaeC": 2.0672,
          "rawEqualRmseC": 2.8785,
          "cvSimplexMaeC": 1.8982,
          "cvCalibratedMaeC": 1.8973,
          "cvCalibratedRmseC": 2.5266
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.32117,
          "ecmwfAifs": 0.387213,
          "icon": 0.036631,
          "ukmo": 0.02,
          "meteofrance": 0.065774,
          "gfs": 0.109382,
          "gem": 0.03983,
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
        "maxResidualShiftC": 0.5,
        "spreadBaseC2": 1.9578,
        "spreadScale": 0.5615,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.31401,
            "ecmwfAifs": 0.236676,
            "icon": 0.133002,
            "ukmo": 0.102916,
            "meteofrance": 0.045165,
            "gfs": 0.06789,
            "gem": 0.052791,
            "jma": 0.04755
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3685,
          "logisticSlope": 4.7644,
          "wetFractionWeight": 3.7064,
          "powerEta": 0.68,
          "rawBrier": 0.03432,
          "calibratedBrier": 0.03332
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 2.1015,
          "rawIfsRmseC": 2.8384,
          "rawEqualMaeC": 2.0672,
          "rawEqualRmseC": 2.8785,
          "cvSimplexMaeC": 1.8747,
          "cvCalibratedMaeC": 1.8747,
          "cvCalibratedRmseC": 2.4928
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.6054,
        "betaDrivers": [
          -0.0243,
          -0.0429,
          0.0064,
          -0.0607,
          -0.0184,
          0.0164
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.3585,
        "spreadScale": 0.1347,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241898,
            "ecmwfAifs": 0.076832,
            "icon": 0.229016,
            "ukmo": 0.116404,
            "meteofrance": 0.155408,
            "gfs": 0.06267,
            "gem": 0.060443,
            "jma": 0.057329
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5659,
          "logisticSlope": 3.0727,
          "wetFractionWeight": 3.2808,
          "powerEta": 0.68,
          "rawBrier": 0.08322,
          "calibratedBrier": 0.07981
        },
        "verification": {
          "sampleHours": 4189,
          "rawIfsMaeC": 1.3556,
          "rawIfsRmseC": 1.7888,
          "rawEqualMaeC": 1.6501,
          "rawEqualRmseC": 2.0059,
          "cvSimplexMaeC": 1.3399,
          "cvCalibratedMaeC": 1.2363,
          "cvCalibratedRmseC": 1.6686
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.536619,
          "ecmwfAifs": 0.246474,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.116907,
          "jma": 0.02
        },
        "intercept": -0.5079,
        "betaDrivers": [
          -0.0775,
          -0.2168,
          -0.0181,
          -0.0695,
          -0.0054,
          -0.1185
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.1443,
        "spreadScale": 0.1253,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.319072,
            "ecmwfAifs": 0.211425,
            "icon": 0.145832,
            "ukmo": 0.107519,
            "meteofrance": 0.045155,
            "gfs": 0.06271,
            "gem": 0.060482,
            "jma": 0.047805
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.5804,
          "logisticSlope": 3.461,
          "wetFractionWeight": 2.992,
          "powerEta": 0.68,
          "rawBrier": 0.08322,
          "calibratedBrier": 0.08069
        },
        "verification": {
          "sampleHours": 4189,
          "rawIfsMaeC": 1.3556,
          "rawIfsRmseC": 1.7888,
          "rawEqualMaeC": 1.6501,
          "rawEqualRmseC": 2.0059,
          "cvSimplexMaeC": 1.3518,
          "cvCalibratedMaeC": 1.2258,
          "cvCalibratedRmseC": 1.5907
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.450594,
          "ecmwfAifs": 0.115015,
          "icon": 0.038903,
          "ukmo": 0.116444,
          "meteofrance": 0.02,
          "gfs": 0.112746,
          "gem": 0.126298,
          "jma": 0.02
        },
        "intercept": -0.0474,
        "betaDrivers": [
          0.0243,
          -0.099,
          0.0558,
          -0.0195,
          -0.0258,
          -0.2044
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9907,
        "spreadScale": 0.4188,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.236465,
            "ecmwfAifs": 0.085173,
            "icon": 0.22185,
            "ukmo": 0.122247,
            "meteofrance": 0.161982,
            "gfs": 0.066509,
            "gem": 0.047765,
            "jma": 0.058009
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0979,
          "logisticSlope": 4.0755,
          "wetFractionWeight": 2.0767,
          "powerEta": 0.68,
          "rawBrier": 0.03267,
          "calibratedBrier": 0.03041
        },
        "verification": {
          "sampleHours": 4367,
          "rawIfsMaeC": 1.1828,
          "rawIfsRmseC": 1.5857,
          "rawEqualMaeC": 1.1773,
          "rawEqualRmseC": 1.5382,
          "cvSimplexMaeC": 1.0644,
          "cvCalibratedMaeC": 1.0551,
          "cvCalibratedRmseC": 1.4367
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.415586,
          "ecmwfAifs": 0.182966,
          "icon": 0.07698,
          "ukmo": 0.102834,
          "meteofrance": 0.02,
          "gfs": 0.088843,
          "gem": 0.092791,
          "jma": 0.02
        },
        "intercept": -0.0366,
        "betaDrivers": [
          0.0106,
          -0.1288,
          0.0408,
          -0.0049,
          -0.0113,
          -0.177
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9186,
        "spreadScale": 0.4241,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30918,
            "ecmwfAifs": 0.232331,
            "icon": 0.140035,
            "ukmo": 0.11193,
            "meteofrance": 0.045224,
            "gfs": 0.065971,
            "gem": 0.047379,
            "jma": 0.04795
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1657,
          "logisticSlope": 4.3664,
          "wetFractionWeight": 1.8567,
          "powerEta": 0.68,
          "rawBrier": 0.03267,
          "calibratedBrier": 0.02969
        },
        "verification": {
          "sampleHours": 4367,
          "rawIfsMaeC": 1.1828,
          "rawIfsRmseC": 1.5857,
          "rawEqualMaeC": 1.1773,
          "rawEqualRmseC": 1.5382,
          "cvSimplexMaeC": 1.0535,
          "cvCalibratedMaeC": 1.0403,
          "cvCalibratedRmseC": 1.4168
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.470941,
          "ecmwfAifs": 0.02,
          "icon": 0.050659,
          "ukmo": 0.094482,
          "meteofrance": 0.02,
          "gfs": 0.057396,
          "gem": 0.266522,
          "jma": 0.02
        },
        "intercept": -0.1857,
        "betaDrivers": [
          -0.0169,
          -0.379,
          0.1537,
          -0.0726,
          -0.3022,
          -0.0779
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 2.2808,
        "spreadScale": 0.1499,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235281,
            "ecmwfAifs": 0.087982,
            "icon": 0.222118,
            "ukmo": 0.114872,
            "meteofrance": 0.156867,
            "gfs": 0.066604,
            "gem": 0.057691,
            "jma": 0.058585
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9974,
          "logisticSlope": 3.6487,
          "wetFractionWeight": 3.278,
          "powerEta": 0.68,
          "rawBrier": 0.03801,
          "calibratedBrier": 0.03801
        },
        "verification": {
          "sampleHours": 4316,
          "rawIfsMaeC": 1.3418,
          "rawIfsRmseC": 1.8356,
          "rawEqualMaeC": 1.5166,
          "rawEqualRmseC": 1.8572,
          "cvSimplexMaeC": 1.2973,
          "cvCalibratedMaeC": 1.282,
          "cvCalibratedRmseC": 1.682
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.429623,
          "ecmwfAifs": 0.129099,
          "icon": 0.087532,
          "ukmo": 0.098517,
          "meteofrance": 0.02,
          "gfs": 0.035042,
          "gem": 0.180187,
          "jma": 0.02
        },
        "intercept": -0.0237,
        "betaDrivers": [
          0.0228,
          -0.2626,
          0.0645,
          -0.0306,
          -0.117,
          -0.0961
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 2.1255,
        "spreadScale": 0.1592,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30449,
            "ecmwfAifs": 0.23754,
            "icon": 0.138772,
            "ukmo": 0.104103,
            "meteofrance": 0.045135,
            "gfs": 0.06539,
            "gem": 0.056639,
            "jma": 0.047931
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0327,
          "logisticSlope": 3.5126,
          "wetFractionWeight": 3.3587,
          "powerEta": 0.68,
          "rawBrier": 0.03801,
          "calibratedBrier": 0.03795
        },
        "verification": {
          "sampleHours": 4316,
          "rawIfsMaeC": 1.3418,
          "rawIfsRmseC": 1.8356,
          "rawEqualMaeC": 1.5166,
          "rawEqualRmseC": 1.8572,
          "cvSimplexMaeC": 1.2917,
          "cvCalibratedMaeC": 1.2756,
          "cvCalibratedRmseC": 1.6425
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.316872,
          "ecmwfAifs": 0.342504,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.10416,
          "gfs": 0.129821,
          "gem": 0.046643,
          "jma": 0.02
        },
        "interceptC": 0.0447,
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
        "spreadBaseC2": 1.8781,
        "spreadScale": 0.5947,
        "cvMaeC": 1.8973,
        "cvRmseC": 2.5266,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.31902,
          "ecmwfAifs": 0.364858,
          "icon": 0.028316,
          "ukmo": 0.02,
          "meteofrance": 0.084967,
          "gfs": 0.119602,
          "gem": 0.043237,
          "jma": 0.02
        },
        "interceptC": 0.0223,
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
        "spreadBaseC2": 1.918,
        "spreadScale": 0.5781,
        "cvMaeC": 1.886,
        "cvRmseC": 2.5097,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.32117,
          "ecmwfAifs": 0.387213,
          "icon": 0.036631,
          "ukmo": 0.02,
          "meteofrance": 0.065774,
          "gfs": 0.109382,
          "gem": 0.03983,
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
        "spreadBaseC2": 1.9578,
        "spreadScale": 0.5615,
        "cvMaeC": 1.8747,
        "cvRmseC": 2.4928,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.86,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.6054,
        "diurnalHarmonicsC": [
          -0.0243,
          -0.0429,
          0,
          0
        ],
        "driverBetasC": [
          0.0064,
          0.0164,
          -0.0607,
          -0.0184
        ],
        "spreadBaseC2": 2.3585,
        "spreadScale": 0.1347,
        "cvMaeC": 1.2363,
        "cvRmseC": 1.6686,
        "sampleHours": 4189
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.698309,
          "ecmwfAifs": 0.133237,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.068454,
          "jma": 0.02
        },
        "interceptC": -0.5567,
        "diurnalHarmonicsC": [
          -0.0509,
          -0.1298,
          0,
          0
        ],
        "driverBetasC": [
          -0.0059,
          -0.051,
          -0.0651,
          -0.0119
        ],
        "spreadBaseC2": 2.2514,
        "spreadScale": 0.13,
        "cvMaeC": 1.231,
        "cvRmseC": 1.6297,
        "sampleHours": 4189
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.536619,
          "ecmwfAifs": 0.246474,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.116907,
          "jma": 0.02
        },
        "interceptC": -0.5079,
        "diurnalHarmonicsC": [
          -0.0775,
          -0.2168,
          0,
          0
        ],
        "driverBetasC": [
          -0.0181,
          -0.1185,
          -0.0695,
          -0.0054
        ],
        "spreadBaseC2": 2.1443,
        "spreadScale": 0.1253,
        "cvMaeC": 1.2258,
        "cvRmseC": 1.5907,
        "sampleHours": 4189
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.450594,
          "ecmwfAifs": 0.115015,
          "icon": 0.038903,
          "ukmo": 0.116444,
          "meteofrance": 0.02,
          "gfs": 0.112746,
          "gem": 0.126298,
          "jma": 0.02
        },
        "interceptC": -0.0474,
        "diurnalHarmonicsC": [
          0.0243,
          -0.099,
          0,
          0
        ],
        "driverBetasC": [
          0.0558,
          -0.2044,
          -0.0195,
          -0.0258
        ],
        "spreadBaseC2": 0.9907,
        "spreadScale": 0.4188,
        "cvMaeC": 1.0551,
        "cvRmseC": 1.4367,
        "sampleHours": 4367
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.433089,
          "ecmwfAifs": 0.148991,
          "icon": 0.057942,
          "ukmo": 0.109639,
          "meteofrance": 0.02,
          "gfs": 0.100795,
          "gem": 0.109544,
          "jma": 0.02
        },
        "interceptC": -0.042,
        "diurnalHarmonicsC": [
          0.0175,
          -0.1139,
          0,
          0
        ],
        "driverBetasC": [
          0.0483,
          -0.1907,
          -0.0122,
          -0.0186
        ],
        "spreadBaseC2": 0.9546,
        "spreadScale": 0.4214,
        "cvMaeC": 1.0477,
        "cvRmseC": 1.4268,
        "sampleHours": 4367
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.415586,
          "ecmwfAifs": 0.182966,
          "icon": 0.07698,
          "ukmo": 0.102834,
          "meteofrance": 0.02,
          "gfs": 0.088843,
          "gem": 0.092791,
          "jma": 0.02
        },
        "interceptC": -0.0366,
        "diurnalHarmonicsC": [
          0.0106,
          -0.1288,
          0,
          0
        ],
        "driverBetasC": [
          0.0408,
          -0.177,
          -0.0049,
          -0.0113
        ],
        "spreadBaseC2": 0.9186,
        "spreadScale": 0.4241,
        "cvMaeC": 1.0403,
        "cvRmseC": 1.4168,
        "sampleHours": 4367
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.470941,
          "ecmwfAifs": 0.02,
          "icon": 0.050659,
          "ukmo": 0.094482,
          "meteofrance": 0.02,
          "gfs": 0.057396,
          "gem": 0.266522,
          "jma": 0.02
        },
        "interceptC": -0.1857,
        "diurnalHarmonicsC": [
          -0.0169,
          -0.379,
          0,
          0
        ],
        "driverBetasC": [
          0.1537,
          -0.0779,
          -0.0726,
          -0.3022
        ],
        "spreadBaseC2": 2.2808,
        "spreadScale": 0.1499,
        "cvMaeC": 1.282,
        "cvRmseC": 1.682,
        "sampleHours": 4316
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.450281,
          "ecmwfAifs": 0.07455,
          "icon": 0.069096,
          "ukmo": 0.0965,
          "meteofrance": 0.02,
          "gfs": 0.046219,
          "gem": 0.223354,
          "jma": 0.02
        },
        "interceptC": -0.1047,
        "diurnalHarmonicsC": [
          0.003,
          -0.3208,
          0,
          0
        ],
        "driverBetasC": [
          0.1091,
          -0.087,
          -0.0516,
          -0.2096
        ],
        "spreadBaseC2": 2.2031,
        "spreadScale": 0.1546,
        "cvMaeC": 1.2788,
        "cvRmseC": 1.6623,
        "sampleHours": 4316
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.429623,
          "ecmwfAifs": 0.129099,
          "icon": 0.087532,
          "ukmo": 0.098517,
          "meteofrance": 0.02,
          "gfs": 0.035042,
          "gem": 0.180187,
          "jma": 0.02
        },
        "interceptC": -0.0237,
        "diurnalHarmonicsC": [
          0.0228,
          -0.2626,
          0,
          0
        ],
        "driverBetasC": [
          0.0645,
          -0.0961,
          -0.0306,
          -0.117
        ],
        "spreadBaseC2": 2.1255,
        "spreadScale": 0.1592,
        "cvMaeC": 1.2756,
        "cvRmseC": 1.6425,
        "sampleHours": 4316
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.243378,
        "ecmwfAifs": 0.087929,
        "icon": 0.213532,
        "ukmo": 0.113909,
        "meteofrance": 0.15966,
        "gfs": 0.069361,
        "gem": 0.053935,
        "jma": 0.058296
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.241898,
        "ecmwfAifs": 0.076832,
        "icon": 0.229016,
        "ukmo": 0.116404,
        "meteofrance": 0.155408,
        "gfs": 0.06267,
        "gem": 0.060443,
        "jma": 0.057329
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.236465,
        "ecmwfAifs": 0.085173,
        "icon": 0.22185,
        "ukmo": 0.122247,
        "meteofrance": 0.161982,
        "gfs": 0.066509,
        "gem": 0.047765,
        "jma": 0.058009
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.235281,
        "ecmwfAifs": 0.087982,
        "icon": 0.222118,
        "ukmo": 0.114872,
        "meteofrance": 0.156867,
        "gfs": 0.066604,
        "gem": 0.057691,
        "jma": 0.058585
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.218521,
    "ecmwfAifs": 0.069225,
    "icon": 0.27008,
    "ukmo": 0.151422,
    "meteofrance": 0.107684,
    "gfs": 0.106152,
    "gem": 0.038458,
    "jma": 0.038458
  },
  "pressureWeights": {
    "ecmwfIfs": 0.312581,
    "ecmwfAifs": 0.153413,
    "icon": 0.147255,
    "ukmo": 0.17813,
    "meteofrance": 0.080744,
    "gfs": 0.047133,
    "gem": 0.040372,
    "jma": 0.040372
  }
} as const;

export default PROVINCE_CALIBRATION_TR_04;
