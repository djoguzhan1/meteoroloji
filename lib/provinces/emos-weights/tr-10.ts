import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_10: ProvinceCalibrationBundle = {
  "provinceCode": "TR-10",
  "provinceName": "Balıkesir",
  "plateNumber": 10,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17150",
  "stationLat": 39.6167,
  "stationLon": 27.9167,
  "stationElevationM": 101,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.373704,
          "ukmo": 0.211737,
          "meteofrance": 0.114106,
          "gfs": 0.02,
          "gem": 0.220453,
          "jma": 0.02
        },
        "intercept": 0.2397,
        "betaDrivers": [
          0.0958,
          0.1773,
          -0.2619,
          0.1234,
          0.3166,
          -0.229
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.8849,
        "spreadScale": 0.5972,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.250156,
            "ecmwfAifs": 0.085108,
            "icon": 0.219991,
            "ukmo": 0.108867,
            "meteofrance": 0.1486,
            "gfs": 0.067919,
            "gem": 0.058629,
            "jma": 0.06073
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0491,
          "logisticSlope": 3.1948,
          "wetFractionWeight": 3.9414,
          "powerEta": 0.68,
          "rawBrier": 0.0458,
          "calibratedBrier": 0.04238
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3743,
          "rawIfsRmseC": 1.8343,
          "rawEqualMaeC": 1.208,
          "rawEqualRmseC": 1.6178,
          "cvSimplexMaeC": 1.0258,
          "cvCalibratedMaeC": 1.0174,
          "cvCalibratedRmseC": 1.3625
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.129944,
          "ecmwfAifs": 0.181043,
          "icon": 0.248237,
          "ukmo": 0.163804,
          "meteofrance": 0.087421,
          "gfs": 0.02,
          "gem": 0.149551,
          "jma": 0.02
        },
        "intercept": 0.0539,
        "betaDrivers": [
          0.0197,
          0.109,
          -0.1238,
          -0.0221,
          0.2433,
          -0.1019
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.7564,
        "spreadScale": 0.7488,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320865,
            "ecmwfAifs": 0.227738,
            "icon": 0.136222,
            "ukmo": 0.097784,
            "meteofrance": 0.045008,
            "gfs": 0.066089,
            "gem": 0.057049,
            "jma": 0.049245
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1662,
          "logisticSlope": 3.35,
          "wetFractionWeight": 3.7119,
          "powerEta": 0.68,
          "rawBrier": 0.0458,
          "calibratedBrier": 0.04093
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.3743,
          "rawIfsRmseC": 1.8343,
          "rawEqualMaeC": 1.208,
          "rawEqualRmseC": 1.6178,
          "cvSimplexMaeC": 1.0655,
          "cvCalibratedMaeC": 1.0502,
          "cvCalibratedRmseC": 1.4093
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.050871,
          "icon": 0.389349,
          "ukmo": 0.247368,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.232412,
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
        "spreadBaseC2": 1.2644,
        "spreadScale": 0.2829,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.241309,
            "ecmwfAifs": 0.07329,
            "icon": 0.228147,
            "ukmo": 0.116133,
            "meteofrance": 0.163771,
            "gfs": 0.066733,
            "gem": 0.05667,
            "jma": 0.053947
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.2906,
          "logisticSlope": 4.3554,
          "wetFractionWeight": 3.4776,
          "powerEta": 0.68,
          "rawBrier": 0.03528,
          "calibratedBrier": 0.03284
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.369,
          "rawIfsRmseC": 1.7239,
          "rawEqualMaeC": 1.2404,
          "rawEqualRmseC": 1.5781,
          "cvSimplexMaeC": 1.034,
          "cvCalibratedMaeC": 1.034,
          "cvCalibratedRmseC": 1.3565
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.18556,
          "ecmwfAifs": 0.11227,
          "icon": 0.284515,
          "ukmo": 0.188858,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.168797,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0057,
          -0.0045,
          -0.0316,
          0.011,
          0.0294,
          -0.0516
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.2875,
        "spreadScale": 0.2944,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.322932,
            "ecmwfAifs": 0.204615,
            "icon": 0.147396,
            "ukmo": 0.108832,
            "meteofrance": 0.0453,
            "gfs": 0.06775,
            "gem": 0.057534,
            "jma": 0.045641
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3094,
          "logisticSlope": 4.0802,
          "wetFractionWeight": 3.5687,
          "powerEta": 0.68,
          "rawBrier": 0.03528,
          "calibratedBrier": 0.03347
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.369,
          "rawIfsRmseC": 1.7239,
          "rawEqualMaeC": 1.2404,
          "rawEqualRmseC": 1.5781,
          "cvSimplexMaeC": 1.0619,
          "cvCalibratedMaeC": 1.0616,
          "cvCalibratedRmseC": 1.3721
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.27736,
          "ukmo": 0.312847,
          "meteofrance": 0.02,
          "gfs": 0.028044,
          "gem": 0.301749,
          "jma": 0.02
        },
        "intercept": 0.0562,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.5499,
        "spreadScale": 0.6837,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.227752,
            "ecmwfAifs": 0.079369,
            "icon": 0.223581,
            "ukmo": 0.119165,
            "meteofrance": 0.165433,
            "gfs": 0.06729,
            "gem": 0.059542,
            "jma": 0.057868
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.473,
          "logisticSlope": 2.8855,
          "wetFractionWeight": 2.9308,
          "powerEta": 0.68,
          "rawBrier": 0.00682,
          "calibratedBrier": 0.00568
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.226,
          "rawIfsRmseC": 1.5403,
          "rawEqualMaeC": 1.011,
          "rawEqualRmseC": 1.3385,
          "cvSimplexMaeC": 0.9097,
          "cvCalibratedMaeC": 0.9064,
          "cvCalibratedRmseC": 1.2179
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.196386,
          "ecmwfAifs": 0.059016,
          "icon": 0.21766,
          "ukmo": 0.224426,
          "meteofrance": 0.02,
          "gfs": 0.052905,
          "gem": 0.209607,
          "jma": 0.02
        },
        "intercept": 0.0746,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.5235,
        "spreadScale": 0.75,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.303037,
            "ecmwfAifs": 0.220313,
            "icon": 0.143614,
            "ukmo": 0.11103,
            "meteofrance": 0.045309,
            "gfs": 0.067921,
            "gem": 0.0601,
            "jma": 0.048676
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -5.515,
          "logisticSlope": 2.8202,
          "wetFractionWeight": 3.0832,
          "powerEta": 0.68,
          "rawBrier": 0.00682,
          "calibratedBrier": 0.00568
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.226,
          "rawIfsRmseC": 1.5403,
          "rawEqualMaeC": 1.011,
          "rawEqualRmseC": 1.3385,
          "cvSimplexMaeC": 0.9493,
          "cvCalibratedMaeC": 0.9405,
          "cvCalibratedRmseC": 1.2436
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.036831,
          "icon": 0.327095,
          "ukmo": 0.23726,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.318814,
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
        "spreadBaseC2": 1.5356,
        "spreadScale": 0.4163,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.234148,
            "ecmwfAifs": 0.083221,
            "icon": 0.208621,
            "ukmo": 0.117084,
            "meteofrance": 0.164619,
            "gfs": 0.068675,
            "gem": 0.061558,
            "jma": 0.062074
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.007,
          "logisticSlope": 3.2632,
          "wetFractionWeight": 3.5015,
          "powerEta": 0.68,
          "rawBrier": 0.03212,
          "calibratedBrier": 0.03212
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.4162,
          "rawIfsRmseC": 1.7865,
          "rawEqualMaeC": 1.3034,
          "rawEqualRmseC": 1.6685,
          "cvSimplexMaeC": 1.1457,
          "cvCalibratedMaeC": 1.1457,
          "cvCalibratedRmseC": 1.4808
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.184151,
          "ecmwfAifs": 0.151967,
          "icon": 0.221857,
          "ukmo": 0.177689,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.204336,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0108,
          -0.0081,
          -0.0364,
          -0.0191,
          0.0602,
          -0.0594
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.5455,
        "spreadScale": 0.4432,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306858,
            "ecmwfAifs": 0.227531,
            "icon": 0.131988,
            "ukmo": 0.107451,
            "meteofrance": 0.045265,
            "gfs": 0.068277,
            "gem": 0.061201,
            "jma": 0.051429
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0671,
          "logisticSlope": 2.5603,
          "wetFractionWeight": 3.9781,
          "powerEta": 0.68,
          "rawBrier": 0.03212,
          "calibratedBrier": 0.03212
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.4162,
          "rawIfsRmseC": 1.7865,
          "rawEqualMaeC": 1.3034,
          "rawEqualRmseC": 1.6685,
          "cvSimplexMaeC": 1.176,
          "cvCalibratedMaeC": 1.1753,
          "cvCalibratedRmseC": 1.4977
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.373704,
          "ukmo": 0.211737,
          "meteofrance": 0.114106,
          "gfs": 0.02,
          "gem": 0.220453,
          "jma": 0.02
        },
        "interceptC": 0.2397,
        "diurnalHarmonicsC": [
          0.0958,
          0.1773,
          0,
          0
        ],
        "driverBetasC": [
          -0.2619,
          -0.229,
          0.1234,
          0.3166
        ],
        "spreadBaseC2": 0.8849,
        "spreadScale": 0.5972,
        "cvMaeC": 1.0174,
        "cvRmseC": 1.3625,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.074972,
          "ecmwfAifs": 0.100522,
          "icon": 0.31097,
          "ukmo": 0.18777,
          "meteofrance": 0.100764,
          "gfs": 0.02,
          "gem": 0.185002,
          "jma": 0.02
        },
        "interceptC": 0.1468,
        "diurnalHarmonicsC": [
          0.0577,
          0.1431,
          0,
          0
        ],
        "driverBetasC": [
          -0.1929,
          -0.1655,
          0.0507,
          0.2799
        ],
        "spreadBaseC2": 0.8206,
        "spreadScale": 0.673,
        "cvMaeC": 1.0338,
        "cvRmseC": 1.3859,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.129944,
          "ecmwfAifs": 0.181043,
          "icon": 0.248237,
          "ukmo": 0.163804,
          "meteofrance": 0.087421,
          "gfs": 0.02,
          "gem": 0.149551,
          "jma": 0.02
        },
        "interceptC": 0.0539,
        "diurnalHarmonicsC": [
          0.0197,
          0.109,
          0,
          0
        ],
        "driverBetasC": [
          -0.1238,
          -0.1019,
          -0.0221,
          0.2433
        ],
        "spreadBaseC2": 0.7564,
        "spreadScale": 0.7488,
        "cvMaeC": 1.0502,
        "cvRmseC": 1.4093,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.050871,
          "icon": 0.389349,
          "ukmo": 0.247368,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.232412,
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
        "spreadBaseC2": 1.2644,
        "spreadScale": 0.2829,
        "cvMaeC": 1.034,
        "cvRmseC": 1.3565,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.10278,
          "ecmwfAifs": 0.08157,
          "icon": 0.336932,
          "ukmo": 0.218113,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.200605,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0029,
          -0.0022,
          0,
          0
        ],
        "driverBetasC": [
          -0.0158,
          -0.0258,
          0.0055,
          0.0147
        ],
        "spreadBaseC2": 1.2759,
        "spreadScale": 0.2886,
        "cvMaeC": 1.0478,
        "cvRmseC": 1.3643,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.18556,
          "ecmwfAifs": 0.11227,
          "icon": 0.284515,
          "ukmo": 0.188858,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.168797,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0057,
          -0.0045,
          0,
          0
        ],
        "driverBetasC": [
          -0.0316,
          -0.0516,
          0.011,
          0.0294
        ],
        "spreadBaseC2": 1.2875,
        "spreadScale": 0.2944,
        "cvMaeC": 1.0616,
        "cvRmseC": 1.3721,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.27736,
          "ukmo": 0.312847,
          "meteofrance": 0.02,
          "gfs": 0.028044,
          "gem": 0.301749,
          "jma": 0.02
        },
        "interceptC": 0.0562,
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
        "spreadBaseC2": 0.5499,
        "spreadScale": 0.6837,
        "cvMaeC": 0.9064,
        "cvRmseC": 1.2179,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.108193,
          "ecmwfAifs": 0.039508,
          "icon": 0.24751,
          "ukmo": 0.268636,
          "meteofrance": 0.02,
          "gfs": 0.040475,
          "gem": 0.255678,
          "jma": 0.02
        },
        "interceptC": 0.0654,
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
        "spreadBaseC2": 0.5367,
        "spreadScale": 0.7168,
        "cvMaeC": 0.9234,
        "cvRmseC": 1.2308,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.196386,
          "ecmwfAifs": 0.059016,
          "icon": 0.21766,
          "ukmo": 0.224426,
          "meteofrance": 0.02,
          "gfs": 0.052905,
          "gem": 0.209607,
          "jma": 0.02
        },
        "interceptC": 0.0746,
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
        "spreadBaseC2": 0.5235,
        "spreadScale": 0.75,
        "cvMaeC": 0.9405,
        "cvRmseC": 1.2436,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.036831,
          "icon": 0.327095,
          "ukmo": 0.23726,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.318814,
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
        "spreadBaseC2": 1.5356,
        "spreadScale": 0.4163,
        "cvMaeC": 1.1457,
        "cvRmseC": 1.4808,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.102076,
          "ecmwfAifs": 0.094399,
          "icon": 0.274475,
          "ukmo": 0.207475,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.261575,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0054,
          -0.004,
          0,
          0
        ],
        "driverBetasC": [
          -0.0182,
          -0.0297,
          -0.0095,
          0.0301
        ],
        "spreadBaseC2": 1.5406,
        "spreadScale": 0.4297,
        "cvMaeC": 1.1605,
        "cvRmseC": 1.4892,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.184151,
          "ecmwfAifs": 0.151967,
          "icon": 0.221857,
          "ukmo": 0.177689,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.204336,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0108,
          -0.0081,
          0,
          0
        ],
        "driverBetasC": [
          -0.0364,
          -0.0594,
          -0.0191,
          0.0602
        ],
        "spreadBaseC2": 1.5455,
        "spreadScale": 0.4432,
        "cvMaeC": 1.1753,
        "cvRmseC": 1.4977,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.250156,
        "ecmwfAifs": 0.085108,
        "icon": 0.219991,
        "ukmo": 0.108867,
        "meteofrance": 0.1486,
        "gfs": 0.067919,
        "gem": 0.058629,
        "jma": 0.06073
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.241309,
        "ecmwfAifs": 0.07329,
        "icon": 0.228147,
        "ukmo": 0.116133,
        "meteofrance": 0.163771,
        "gfs": 0.066733,
        "gem": 0.05667,
        "jma": 0.053947
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.227752,
        "ecmwfAifs": 0.079369,
        "icon": 0.223581,
        "ukmo": 0.119165,
        "meteofrance": 0.165433,
        "gfs": 0.06729,
        "gem": 0.059542,
        "jma": 0.057868
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.234148,
        "ecmwfAifs": 0.083221,
        "icon": 0.208621,
        "ukmo": 0.117084,
        "meteofrance": 0.164619,
        "gfs": 0.068675,
        "gem": 0.061558,
        "jma": 0.062074
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.215869,
    "ecmwfAifs": 0.071061,
    "icon": 0.243281,
    "ukmo": 0.165747,
    "meteofrance": 0.11054,
    "gfs": 0.114544,
    "gem": 0.039479,
    "jma": 0.039479
  },
  "pressureWeights": {
    "ecmwfIfs": 0.317949,
    "ecmwfAifs": 0.146736,
    "icon": 0.128213,
    "ukmo": 0.186029,
    "meteofrance": 0.077229,
    "gfs": 0.066614,
    "gem": 0.038615,
    "jma": 0.038615
  }
} as const;

export default PROVINCE_CALIBRATION_TR_10;
