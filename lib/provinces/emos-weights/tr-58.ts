import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_58: ProvinceCalibrationBundle = {
  "provinceCode": "TR-58",
  "provinceName": "Sivas",
  "plateNumber": 58,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17090",
  "stationLat": 39.75,
  "stationLon": 37.0167,
  "stationElevationM": 1285,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.214239,
          "ecmwfAifs": 0.02,
          "icon": 0.27775,
          "ukmo": 0.02,
          "meteofrance": 0.129893,
          "gfs": 0.048606,
          "gem": 0.269512,
          "jma": 0.02
        },
        "intercept": -1.1773,
        "betaDrivers": [
          0.6413,
          0.4685,
          0.0688,
          -0.0482,
          -0.7257,
          -0.3224
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.247,
        "spreadScale": 0.3615,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245141,
            "ecmwfAifs": 0.088071,
            "icon": 0.213497,
            "ukmo": 0.11425,
            "meteofrance": 0.158154,
            "gfs": 0.065748,
            "gem": 0.059544,
            "jma": 0.055595
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0239,
          "logisticSlope": 4.504,
          "wetFractionWeight": 3.0774,
          "powerEta": 0.68,
          "rawBrier": 0.04568,
          "calibratedBrier": 0.04497
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.9066,
          "rawIfsRmseC": 2.3371,
          "rawEqualMaeC": 1.9468,
          "rawEqualRmseC": 2.3087,
          "cvSimplexMaeC": 1.6926,
          "cvCalibratedMaeC": 1.2118,
          "cvCalibratedRmseC": 1.5692
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.272355,
          "ecmwfAifs": 0.159701,
          "icon": 0.183071,
          "ukmo": 0.02,
          "meteofrance": 0.078274,
          "gfs": 0.04081,
          "gem": 0.225789,
          "jma": 0.02
        },
        "intercept": -1.3329,
        "betaDrivers": [
          0.3314,
          0.2474,
          0.0539,
          -0.0125,
          -0.2462,
          -0.068
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.1827,
        "spreadScale": 0.3621,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.315403,
            "ecmwfAifs": 0.236398,
            "icon": 0.132609,
            "ukmo": 0.102937,
            "meteofrance": 0.04514,
            "gfs": 0.064174,
            "gem": 0.058119,
            "jma": 0.04522
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0776,
          "logisticSlope": 4.8852,
          "wetFractionWeight": 2.9,
          "powerEta": 0.68,
          "rawBrier": 0.04568,
          "calibratedBrier": 0.04336
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.9066,
          "rawIfsRmseC": 2.3371,
          "rawEqualMaeC": 1.9468,
          "rawEqualRmseC": 2.3087,
          "cvSimplexMaeC": 1.7114,
          "cvCalibratedMaeC": 1.1999,
          "cvCalibratedRmseC": 1.5466
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.262744,
          "ecmwfAifs": 0.134125,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.237547,
          "gfs": 0.02,
          "gem": 0.285584,
          "jma": 0.02
        },
        "intercept": -1.7922,
        "betaDrivers": [
          0.8776,
          0.2787,
          0.4239,
          0.1425,
          -0.8486,
          -0.4013
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.8599,
        "spreadScale": 0.6658,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.243764,
            "ecmwfAifs": 0.076623,
            "icon": 0.223543,
            "ukmo": 0.118277,
            "meteofrance": 0.162789,
            "gfs": 0.060111,
            "gem": 0.059093,
            "jma": 0.0558
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6702,
          "logisticSlope": 2.9882,
          "wetFractionWeight": 3.2345,
          "powerEta": 0.68,
          "rawBrier": 0.07013,
          "calibratedBrier": 0.06444
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.3036,
          "rawIfsRmseC": 2.7468,
          "rawEqualMaeC": 2.3214,
          "rawEqualRmseC": 2.6798,
          "cvSimplexMaeC": 2.2169,
          "cvCalibratedMaeC": 1.4405,
          "cvCalibratedRmseC": 1.9039
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.27151,
          "ecmwfAifs": 0.284746,
          "icon": 0.075843,
          "ukmo": 0.02,
          "meteofrance": 0.095022,
          "gfs": 0.02,
          "gem": 0.212879,
          "jma": 0.02
        },
        "intercept": -1.8662,
        "betaDrivers": [
          0.4111,
          0.1033,
          0.1506,
          0.0478,
          -0.3072,
          -0.0814
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.8099,
        "spreadScale": 0.6389,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.323207,
            "ecmwfAifs": 0.211948,
            "icon": 0.143087,
            "ukmo": 0.109818,
            "meteofrance": 0.045266,
            "gfs": 0.060463,
            "gem": 0.059439,
            "jma": 0.046772
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.6651,
          "logisticSlope": 3.225,
          "wetFractionWeight": 2.9932,
          "powerEta": 0.68,
          "rawBrier": 0.07013,
          "calibratedBrier": 0.06475
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.3036,
          "rawIfsRmseC": 2.7468,
          "rawEqualMaeC": 2.3214,
          "rawEqualRmseC": 2.6798,
          "cvSimplexMaeC": 2.2017,
          "cvCalibratedMaeC": 1.4093,
          "cvCalibratedRmseC": 1.8652
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.455583,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.089516,
          "jma": 0.354901
        },
        "intercept": -2.3142,
        "betaDrivers": [
          0.6001,
          -0.2535,
          0.0183,
          0.0122,
          -0.2324,
          -0.4443
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4029,
        "spreadScale": 0.5159,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.233936,
            "ecmwfAifs": 0.079853,
            "icon": 0.226878,
            "ukmo": 0.125159,
            "meteofrance": 0.156969,
            "gfs": 0.064621,
            "gem": 0.057562,
            "jma": 0.055022
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4688,
          "logisticSlope": 4.4155,
          "wetFractionWeight": 2.9881,
          "powerEta": 0.68,
          "rawBrier": 0.01966,
          "calibratedBrier": 0.01758
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.9226,
          "rawIfsRmseC": 3.2748,
          "rawEqualMaeC": 2.6666,
          "rawEqualRmseC": 2.9924,
          "cvSimplexMaeC": 2.4439,
          "cvCalibratedMaeC": 1.2493,
          "cvCalibratedRmseC": 1.597
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.202401,
          "icon": 0.111405,
          "ukmo": 0.299192,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.102587,
          "jma": 0.224415
        },
        "intercept": -2.2945,
        "betaDrivers": [
          0.4283,
          -0.1817,
          -0.0225,
          0.13,
          -0.1774,
          -0.2089
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.3026,
        "spreadScale": 0.5282,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.308023,
            "ecmwfAifs": 0.219348,
            "icon": 0.144213,
            "ukmo": 0.1154,
            "meteofrance": 0.045172,
            "gfs": 0.064548,
            "gem": 0.057497,
            "jma": 0.045799
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.5495,
          "logisticSlope": 4.2877,
          "wetFractionWeight": 3.008,
          "powerEta": 0.68,
          "rawBrier": 0.01966,
          "calibratedBrier": 0.01708
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.9226,
          "rawIfsRmseC": 3.2748,
          "rawEqualMaeC": 2.6666,
          "rawEqualRmseC": 2.9924,
          "cvSimplexMaeC": 2.5192,
          "cvCalibratedMaeC": 1.2039,
          "cvCalibratedRmseC": 1.5738
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.159759,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.340063,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.308112,
          "jma": 0.112066
        },
        "intercept": -1.4592,
        "betaDrivers": [
          1.0703,
          0.3109,
          0.0068,
          0.3539,
          -0.9054,
          -0.4432
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.9864,
        "spreadScale": 0.4541,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235963,
            "ecmwfAifs": 0.085872,
            "icon": 0.21965,
            "ukmo": 0.115493,
            "meteofrance": 0.155911,
            "gfs": 0.068121,
            "gem": 0.05729,
            "jma": 0.0617
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3025,
          "logisticSlope": 2.8928,
          "wetFractionWeight": 4.5552,
          "powerEta": 0.68,
          "rawBrier": 0.02907,
          "calibratedBrier": 0.02882
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.3651,
          "rawIfsRmseC": 2.796,
          "rawEqualMaeC": 2.2678,
          "rawEqualRmseC": 2.6333,
          "cvSimplexMaeC": 2.0295,
          "cvCalibratedMaeC": 1.4611,
          "cvCalibratedRmseC": 1.9137
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.236483,
          "ecmwfAifs": 0.129334,
          "icon": 0.088477,
          "ukmo": 0.256543,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.214515,
          "jma": 0.034648
        },
        "intercept": -1.5139,
        "betaDrivers": [
          0.5356,
          0.0906,
          0.0098,
          0.1307,
          -0.3321,
          -0.0855
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.7301,
        "spreadScale": 0.5949,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.306064,
            "ecmwfAifs": 0.232368,
            "icon": 0.13754,
            "ukmo": 0.104903,
            "meteofrance": 0.045127,
            "gfs": 0.067031,
            "gem": 0.056373,
            "jma": 0.050594
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.3523,
          "logisticSlope": 2.5241,
          "wetFractionWeight": 4.6643,
          "powerEta": 0.68,
          "rawBrier": 0.02907,
          "calibratedBrier": 0.02805
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.3651,
          "rawIfsRmseC": 2.796,
          "rawEqualMaeC": 2.2678,
          "rawEqualRmseC": 2.6333,
          "cvSimplexMaeC": 2.0505,
          "cvCalibratedMaeC": 1.5089,
          "cvCalibratedRmseC": 1.9975
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.214239,
          "ecmwfAifs": 0.02,
          "icon": 0.27775,
          "ukmo": 0.02,
          "meteofrance": 0.129893,
          "gfs": 0.048606,
          "gem": 0.269512,
          "jma": 0.02
        },
        "interceptC": -1.1773,
        "diurnalHarmonicsC": [
          0.6413,
          0.4685,
          0,
          0
        ],
        "driverBetasC": [
          0.0688,
          -0.3224,
          -0.0482,
          -0.7257
        ],
        "spreadBaseC2": 1.247,
        "spreadScale": 0.3615,
        "cvMaeC": 1.2118,
        "cvRmseC": 1.5692,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.243297,
          "ecmwfAifs": 0.08985,
          "icon": 0.230411,
          "ukmo": 0.02,
          "meteofrance": 0.104083,
          "gfs": 0.044708,
          "gem": 0.247651,
          "jma": 0.02
        },
        "interceptC": -1.2551,
        "diurnalHarmonicsC": [
          0.4863,
          0.3579,
          0,
          0
        ],
        "driverBetasC": [
          0.0614,
          -0.1952,
          -0.0304,
          -0.4859
        ],
        "spreadBaseC2": 1.2149,
        "spreadScale": 0.3618,
        "cvMaeC": 1.2058,
        "cvRmseC": 1.5579,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.272355,
          "ecmwfAifs": 0.159701,
          "icon": 0.183071,
          "ukmo": 0.02,
          "meteofrance": 0.078274,
          "gfs": 0.04081,
          "gem": 0.225789,
          "jma": 0.02
        },
        "interceptC": -1.3329,
        "diurnalHarmonicsC": [
          0.3314,
          0.2474,
          0,
          0
        ],
        "driverBetasC": [
          0.0539,
          -0.068,
          -0.0125,
          -0.2462
        ],
        "spreadBaseC2": 1.1827,
        "spreadScale": 0.3621,
        "cvMaeC": 1.1999,
        "cvRmseC": 1.5466,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.262744,
          "ecmwfAifs": 0.134125,
          "icon": 0.02,
          "ukmo": 0.02,
          "meteofrance": 0.237547,
          "gfs": 0.02,
          "gem": 0.285584,
          "jma": 0.02
        },
        "interceptC": -1.7922,
        "diurnalHarmonicsC": [
          0.8776,
          0.2787,
          0,
          0
        ],
        "driverBetasC": [
          0.4239,
          -0.4013,
          0.1425,
          -0.8486
        ],
        "spreadBaseC2": 1.8599,
        "spreadScale": 0.6658,
        "cvMaeC": 1.4405,
        "cvRmseC": 1.9039,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.267128,
          "ecmwfAifs": 0.209435,
          "icon": 0.047921,
          "ukmo": 0.02,
          "meteofrance": 0.166284,
          "gfs": 0.02,
          "gem": 0.249232,
          "jma": 0.02
        },
        "interceptC": -1.8292,
        "diurnalHarmonicsC": [
          0.6443,
          0.191,
          0,
          0
        ],
        "driverBetasC": [
          0.2873,
          -0.2414,
          0.0951,
          -0.5779
        ],
        "spreadBaseC2": 1.8349,
        "spreadScale": 0.6523,
        "cvMaeC": 1.4249,
        "cvRmseC": 1.8845,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.27151,
          "ecmwfAifs": 0.284746,
          "icon": 0.075843,
          "ukmo": 0.02,
          "meteofrance": 0.095022,
          "gfs": 0.02,
          "gem": 0.212879,
          "jma": 0.02
        },
        "interceptC": -1.8662,
        "diurnalHarmonicsC": [
          0.4111,
          0.1033,
          0,
          0
        ],
        "driverBetasC": [
          0.1506,
          -0.0814,
          0.0478,
          -0.3072
        ],
        "spreadBaseC2": 1.8099,
        "spreadScale": 0.6389,
        "cvMaeC": 1.4093,
        "cvRmseC": 1.8652,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.455583,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.089516,
          "jma": 0.354901
        },
        "interceptC": -2.3142,
        "diurnalHarmonicsC": [
          0.6001,
          -0.2535,
          0,
          0
        ],
        "driverBetasC": [
          0.0183,
          -0.4443,
          0.0122,
          -0.2324
        ],
        "spreadBaseC2": 1.4029,
        "spreadScale": 0.5159,
        "cvMaeC": 1.2493,
        "cvRmseC": 1.597,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.111201,
          "icon": 0.065703,
          "ukmo": 0.377387,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.096052,
          "jma": 0.289657
        },
        "interceptC": -2.3044,
        "diurnalHarmonicsC": [
          0.5142,
          -0.2176,
          0,
          0
        ],
        "driverBetasC": [
          -0.0021,
          -0.3266,
          0.0711,
          -0.2049
        ],
        "spreadBaseC2": 1.3527,
        "spreadScale": 0.5221,
        "cvMaeC": 1.2266,
        "cvRmseC": 1.5854,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.202401,
          "icon": 0.111405,
          "ukmo": 0.299192,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.102587,
          "jma": 0.224415
        },
        "interceptC": -2.2945,
        "diurnalHarmonicsC": [
          0.4283,
          -0.1817,
          0,
          0
        ],
        "driverBetasC": [
          -0.0225,
          -0.2089,
          0.13,
          -0.1774
        ],
        "spreadBaseC2": 1.3026,
        "spreadScale": 0.5282,
        "cvMaeC": 1.2039,
        "cvRmseC": 1.5738,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.159759,
          "ecmwfAifs": 0.02,
          "icon": 0.02,
          "ukmo": 0.340063,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.308112,
          "jma": 0.112066
        },
        "interceptC": -1.4592,
        "diurnalHarmonicsC": [
          1.0703,
          0.3109,
          0,
          0
        ],
        "driverBetasC": [
          0.0068,
          -0.4432,
          0.3539,
          -0.9054
        ],
        "spreadBaseC2": 1.9864,
        "spreadScale": 0.4541,
        "cvMaeC": 1.4611,
        "cvRmseC": 1.9137,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.198121,
          "ecmwfAifs": 0.074667,
          "icon": 0.054239,
          "ukmo": 0.298302,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.261314,
          "jma": 0.073357
        },
        "interceptC": -1.4866,
        "diurnalHarmonicsC": [
          0.803,
          0.2008,
          0,
          0
        ],
        "driverBetasC": [
          0.0083,
          -0.2643,
          0.2423,
          -0.6188
        ],
        "spreadBaseC2": 1.8582,
        "spreadScale": 0.5245,
        "cvMaeC": 1.485,
        "cvRmseC": 1.9556,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.236483,
          "ecmwfAifs": 0.129334,
          "icon": 0.088477,
          "ukmo": 0.256543,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.214515,
          "jma": 0.034648
        },
        "interceptC": -1.5139,
        "diurnalHarmonicsC": [
          0.5356,
          0.0906,
          0,
          0
        ],
        "driverBetasC": [
          0.0098,
          -0.0855,
          0.1307,
          -0.3321
        ],
        "spreadBaseC2": 1.7301,
        "spreadScale": 0.5949,
        "cvMaeC": 1.5089,
        "cvRmseC": 1.9975,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.245141,
        "ecmwfAifs": 0.088071,
        "icon": 0.213497,
        "ukmo": 0.11425,
        "meteofrance": 0.158154,
        "gfs": 0.065748,
        "gem": 0.059544,
        "jma": 0.055595
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.243764,
        "ecmwfAifs": 0.076623,
        "icon": 0.223543,
        "ukmo": 0.118277,
        "meteofrance": 0.162789,
        "gfs": 0.060111,
        "gem": 0.059093,
        "jma": 0.0558
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.233936,
        "ecmwfAifs": 0.079853,
        "icon": 0.226878,
        "ukmo": 0.125159,
        "meteofrance": 0.156969,
        "gfs": 0.064621,
        "gem": 0.057562,
        "jma": 0.055022
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.235963,
        "ecmwfAifs": 0.085872,
        "icon": 0.21965,
        "ukmo": 0.115493,
        "meteofrance": 0.155911,
        "gfs": 0.068121,
        "gem": 0.05729,
        "jma": 0.0617
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.231956,
    "ecmwfAifs": 0.070706,
    "icon": 0.232369,
    "ukmo": 0.168969,
    "meteofrance": 0.109987,
    "gfs": 0.107451,
    "gem": 0.039281,
    "jma": 0.039281
  },
  "pressureWeights": {
    "ecmwfIfs": 0.321848,
    "ecmwfAifs": 0.147858,
    "icon": 0.135812,
    "ukmo": 0.17854,
    "meteofrance": 0.07782,
    "gfs": 0.060302,
    "gem": 0.03891,
    "jma": 0.03891
  }
} as const;

export default PROVINCE_CALIBRATION_TR_58;
