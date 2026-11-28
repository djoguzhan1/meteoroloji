import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_26: ProvinceCalibrationBundle = {
  "provinceCode": "TR-26",
  "provinceName": "Eskişehir",
  "plateNumber": 26,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17124",
  "stationLat": 39.7833,
  "stationLon": 30.5667,
  "stationElevationM": 785,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17440,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.032929,
          "ecmwfAifs": 0.197484,
          "icon": 0.263508,
          "ukmo": 0.02,
          "meteofrance": 0.17839,
          "gfs": 0.02,
          "gem": 0.267689,
          "jma": 0.02
        },
        "intercept": 0.3231,
        "betaDrivers": [
          0.1045,
          0.0437,
          -0.5517,
          0.0769,
          0.0205,
          -0.3
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.7093,
        "spreadScale": 0.6958,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.246486,
            "ecmwfAifs": 0.083859,
            "icon": 0.217703,
            "ukmo": 0.119359,
            "meteofrance": 0.160091,
            "gfs": 0.066671,
            "gem": 0.055955,
            "jma": 0.049876
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4476,
          "logisticSlope": 4.5069,
          "wetFractionWeight": 3.4936,
          "powerEta": 0.68,
          "rawBrier": 0.03564,
          "calibratedBrier": 0.03356
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4085,
          "rawIfsRmseC": 1.8067,
          "rawEqualMaeC": 1.222,
          "rawEqualRmseC": 1.6492,
          "cvSimplexMaeC": 1.0985,
          "cvCalibratedMaeC": 1.0895,
          "cvCalibratedRmseC": 1.4188
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.19001,
          "ecmwfAifs": 0.302518,
          "icon": 0.171488,
          "ukmo": 0.020132,
          "meteofrance": 0.098771,
          "gfs": 0.02,
          "gem": 0.177081,
          "jma": 0.02
        },
        "intercept": 0.123,
        "betaDrivers": [
          0.0009,
          -0.0052,
          -0.1283,
          0.0011,
          0.0358,
          -0.0589
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.6584,
        "spreadScale": 0.7788,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.320345,
            "ecmwfAifs": 0.22737,
            "icon": 0.13659,
            "ukmo": 0.108628,
            "meteofrance": 0.045186,
            "gfs": 0.065734,
            "gem": 0.055168,
            "jma": 0.040979
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.4508,
          "logisticSlope": 4.1507,
          "wetFractionWeight": 3.7032,
          "powerEta": 0.68,
          "rawBrier": 0.03564,
          "calibratedBrier": 0.03262
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 1.4085,
          "rawIfsRmseC": 1.8067,
          "rawEqualMaeC": 1.222,
          "rawEqualRmseC": 1.6492,
          "cvSimplexMaeC": 1.1122,
          "cvCalibratedMaeC": 1.1103,
          "cvCalibratedRmseC": 1.4552
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.057696,
          "ecmwfAifs": 0.088606,
          "icon": 0.382661,
          "ukmo": 0.02,
          "meteofrance": 0.062748,
          "gfs": 0.02,
          "gem": 0.348289,
          "jma": 0.02
        },
        "intercept": 0.0805,
        "betaDrivers": [
          -0.0001,
          -0.0603,
          -0.0496,
          -0.0097,
          0.0037,
          0.0126
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9424,
        "spreadScale": 0.7281,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.245746,
            "ecmwfAifs": 0.078831,
            "icon": 0.217965,
            "ukmo": 0.125519,
            "meteofrance": 0.159877,
            "gfs": 0.062663,
            "gem": 0.055733,
            "jma": 0.053666
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9186,
          "logisticSlope": 3.6937,
          "wetFractionWeight": 3.0862,
          "powerEta": 0.68,
          "rawBrier": 0.04372,
          "calibratedBrier": 0.04143
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.4672,
          "rawIfsRmseC": 1.8923,
          "rawEqualMaeC": 1.2953,
          "rawEqualRmseC": 1.739,
          "cvSimplexMaeC": 1.1466,
          "cvCalibratedMaeC": 1.1436,
          "cvCalibratedRmseC": 1.4839
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.211089,
          "ecmwfAifs": 0.20088,
          "icon": 0.219168,
          "ukmo": 0.04206,
          "meteofrance": 0.053048,
          "gfs": 0.02,
          "gem": 0.233755,
          "jma": 0.02
        },
        "intercept": 0.0467,
        "betaDrivers": [
          -0.0599,
          -0.124,
          -0.0674,
          -0.0335,
          0.0304,
          0.0528
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.8369,
        "spreadScale": 0.8448,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.322717,
            "ecmwfAifs": 0.215966,
            "icon": 0.138182,
            "ukmo": 0.115427,
            "meteofrance": 0.045206,
            "gfs": 0.062426,
            "gem": 0.055523,
            "jma": 0.044553
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0048,
          "logisticSlope": 3.392,
          "wetFractionWeight": 3.5771,
          "powerEta": 0.68,
          "rawBrier": 0.04372,
          "calibratedBrier": 0.03981
        },
        "verification": {
          "sampleHours": 4325,
          "rawIfsMaeC": 1.4672,
          "rawIfsRmseC": 1.8923,
          "rawEqualMaeC": 1.2953,
          "rawEqualRmseC": 1.739,
          "cvSimplexMaeC": 1.1701,
          "cvCalibratedMaeC": 1.167,
          "cvCalibratedRmseC": 1.516
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.081852,
          "ecmwfAifs": 0.156696,
          "icon": 0.387168,
          "ukmo": 0.02,
          "meteofrance": 0.067972,
          "gfs": 0.038293,
          "gem": 0.228019,
          "jma": 0.02
        },
        "intercept": 0.1666,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.9408,
        "spreadScale": 0.8699,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.237881,
            "ecmwfAifs": 0.079736,
            "icon": 0.227486,
            "ukmo": 0.122695,
            "meteofrance": 0.15795,
            "gfs": 0.063998,
            "gem": 0.055767,
            "jma": 0.054487
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.6754,
          "logisticSlope": 3.7828,
          "wetFractionWeight": 3.7474,
          "powerEta": 0.68,
          "rawBrier": 0.01722,
          "calibratedBrier": 0.01411
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3388,
          "rawIfsRmseC": 1.7612,
          "rawEqualMaeC": 1.2146,
          "rawEqualRmseC": 1.643,
          "cvSimplexMaeC": 1.1677,
          "cvCalibratedMaeC": 1.1544,
          "cvCalibratedRmseC": 1.5289
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.244293,
          "ecmwfAifs": 0.206987,
          "icon": 0.222929,
          "ukmo": 0.040796,
          "meteofrance": 0.052759,
          "gfs": 0.052391,
          "gem": 0.159845,
          "jma": 0.02
        },
        "intercept": 0.1419,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.9118,
        "spreadScale": 0.9356,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313171,
            "ecmwfAifs": 0.218994,
            "icon": 0.144579,
            "ukmo": 0.113112,
            "meteofrance": 0.045185,
            "gfs": 0.063916,
            "gem": 0.055695,
            "jma": 0.045348
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7906,
          "logisticSlope": 3.6834,
          "wetFractionWeight": 3.7433,
          "powerEta": 0.68,
          "rawBrier": 0.01722,
          "calibratedBrier": 0.01331
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.3388,
          "rawIfsRmseC": 1.7612,
          "rawEqualMaeC": 1.2146,
          "rawEqualRmseC": 1.643,
          "cvSimplexMaeC": 1.173,
          "cvCalibratedMaeC": 1.1654,
          "cvCalibratedRmseC": 1.5541
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.031681,
          "icon": 0.473473,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.394846,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.0163,
          -0.0869,
          -0.0749,
          0.0401,
          0.0772,
          0.0635
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.2164,
        "spreadScale": 0.978,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.2474,
            "ecmwfAifs": 0.077875,
            "icon": 0.21923,
            "ukmo": 0.118661,
            "meteofrance": 0.158541,
            "gfs": 0.066881,
            "gem": 0.057765,
            "jma": 0.053647
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7226,
          "logisticSlope": 4.6541,
          "wetFractionWeight": 4.5952,
          "powerEta": 0.68,
          "rawBrier": 0.01986,
          "calibratedBrier": 0.01727
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.6365,
          "rawIfsRmseC": 2.1525,
          "rawEqualMaeC": 1.5923,
          "rawEqualRmseC": 2.1468,
          "cvSimplexMaeC": 1.3713,
          "cvCalibratedMaeC": 1.3696,
          "cvCalibratedRmseC": 1.7582
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.207255,
          "ecmwfAifs": 0.212211,
          "icon": 0.219419,
          "ukmo": 0.02,
          "meteofrance": 0.030102,
          "gfs": 0.02,
          "gem": 0.271013,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.05,
          -0.1817,
          -0.1139,
          0.0213,
          0.117,
          0.0943
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 1.306,
        "spreadScale": 1.0292,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.324808,
            "ecmwfAifs": 0.213295,
            "icon": 0.138948,
            "ukmo": 0.109092,
            "meteofrance": 0.045187,
            "gfs": 0.066612,
            "gem": 0.057532,
            "jma": 0.044526
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.7677,
          "logisticSlope": 4.6196,
          "wetFractionWeight": 4.066,
          "powerEta": 0.68,
          "rawBrier": 0.01986,
          "calibratedBrier": 0.01711
        },
        "verification": {
          "sampleHours": 4355,
          "rawIfsMaeC": 1.6365,
          "rawIfsRmseC": 2.1525,
          "rawEqualMaeC": 1.5923,
          "rawEqualRmseC": 2.1468,
          "cvSimplexMaeC": 1.4096,
          "cvCalibratedMaeC": 1.4062,
          "cvCalibratedRmseC": 1.8107
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.032929,
          "ecmwfAifs": 0.197484,
          "icon": 0.263508,
          "ukmo": 0.02,
          "meteofrance": 0.17839,
          "gfs": 0.02,
          "gem": 0.267689,
          "jma": 0.02
        },
        "interceptC": 0.3231,
        "diurnalHarmonicsC": [
          0.1045,
          0.0437,
          0,
          0
        ],
        "driverBetasC": [
          -0.5517,
          -0.3,
          0.0769,
          0.0205
        ],
        "spreadBaseC2": 0.7093,
        "spreadScale": 0.6958,
        "cvMaeC": 1.0895,
        "cvRmseC": 1.4188,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.111469,
          "ecmwfAifs": 0.250002,
          "icon": 0.217498,
          "ukmo": 0.020066,
          "meteofrance": 0.13858,
          "gfs": 0.02,
          "gem": 0.222385,
          "jma": 0.02
        },
        "interceptC": 0.223,
        "diurnalHarmonicsC": [
          0.0527,
          0.0193,
          0,
          0
        ],
        "driverBetasC": [
          -0.34,
          -0.1794,
          0.039,
          0.0282
        ],
        "spreadBaseC2": 0.6839,
        "spreadScale": 0.7373,
        "cvMaeC": 1.0999,
        "cvRmseC": 1.437,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.19001,
          "ecmwfAifs": 0.302518,
          "icon": 0.171488,
          "ukmo": 0.020132,
          "meteofrance": 0.098771,
          "gfs": 0.02,
          "gem": 0.177081,
          "jma": 0.02
        },
        "interceptC": 0.123,
        "diurnalHarmonicsC": [
          0.0009,
          -0.0052,
          0,
          0
        ],
        "driverBetasC": [
          -0.1283,
          -0.0589,
          0.0011,
          0.0358
        ],
        "spreadBaseC2": 0.6584,
        "spreadScale": 0.7788,
        "cvMaeC": 1.1103,
        "cvRmseC": 1.4552,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.057696,
          "ecmwfAifs": 0.088606,
          "icon": 0.382661,
          "ukmo": 0.02,
          "meteofrance": 0.062748,
          "gfs": 0.02,
          "gem": 0.348289,
          "jma": 0.02
        },
        "interceptC": 0.0805,
        "diurnalHarmonicsC": [
          -0.0001,
          -0.0603,
          0,
          0
        ],
        "driverBetasC": [
          -0.0496,
          0.0126,
          -0.0097,
          0.0037
        ],
        "spreadBaseC2": 0.9424,
        "spreadScale": 0.7281,
        "cvMaeC": 1.1436,
        "cvRmseC": 1.4839,
        "sampleHours": 4325
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.134393,
          "ecmwfAifs": 0.144743,
          "icon": 0.300914,
          "ukmo": 0.03103,
          "meteofrance": 0.057898,
          "gfs": 0.02,
          "gem": 0.291022,
          "jma": 0.02
        },
        "interceptC": 0.0636,
        "diurnalHarmonicsC": [
          -0.03,
          -0.0921,
          0,
          0
        ],
        "driverBetasC": [
          -0.0585,
          0.0327,
          -0.0216,
          0.017
        ],
        "spreadBaseC2": 0.8897,
        "spreadScale": 0.7864,
        "cvMaeC": 1.1553,
        "cvRmseC": 1.5,
        "sampleHours": 4325
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.211089,
          "ecmwfAifs": 0.20088,
          "icon": 0.219168,
          "ukmo": 0.04206,
          "meteofrance": 0.053048,
          "gfs": 0.02,
          "gem": 0.233755,
          "jma": 0.02
        },
        "interceptC": 0.0467,
        "diurnalHarmonicsC": [
          -0.0599,
          -0.124,
          0,
          0
        ],
        "driverBetasC": [
          -0.0674,
          0.0528,
          -0.0335,
          0.0304
        ],
        "spreadBaseC2": 0.8369,
        "spreadScale": 0.8448,
        "cvMaeC": 1.167,
        "cvRmseC": 1.516,
        "sampleHours": 4325
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.081852,
          "ecmwfAifs": 0.156696,
          "icon": 0.387168,
          "ukmo": 0.02,
          "meteofrance": 0.067972,
          "gfs": 0.038293,
          "gem": 0.228019,
          "jma": 0.02
        },
        "interceptC": 0.1666,
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
        "spreadBaseC2": 0.9408,
        "spreadScale": 0.8699,
        "cvMaeC": 1.1544,
        "cvRmseC": 1.5289,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.163073,
          "ecmwfAifs": 0.181842,
          "icon": 0.305048,
          "ukmo": 0.030398,
          "meteofrance": 0.060366,
          "gfs": 0.045342,
          "gem": 0.193931,
          "jma": 0.02
        },
        "interceptC": 0.1542,
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
        "spreadBaseC2": 0.9263,
        "spreadScale": 0.9027,
        "cvMaeC": 1.1599,
        "cvRmseC": 1.5415,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.244293,
          "ecmwfAifs": 0.206987,
          "icon": 0.222929,
          "ukmo": 0.040796,
          "meteofrance": 0.052759,
          "gfs": 0.052391,
          "gem": 0.159845,
          "jma": 0.02
        },
        "interceptC": 0.1419,
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
        "spreadBaseC2": 0.9118,
        "spreadScale": 0.9356,
        "cvMaeC": 1.1654,
        "cvRmseC": 1.5541,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.031681,
          "icon": 0.473473,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.394846,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0163,
          -0.0869,
          0,
          0
        ],
        "driverBetasC": [
          -0.0749,
          0.0635,
          0.0401,
          0.0772
        ],
        "spreadBaseC2": 1.2164,
        "spreadScale": 0.978,
        "cvMaeC": 1.3696,
        "cvRmseC": 1.7582,
        "sampleHours": 4355
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.113628,
          "ecmwfAifs": 0.121946,
          "icon": 0.346445,
          "ukmo": 0.02,
          "meteofrance": 0.025051,
          "gfs": 0.02,
          "gem": 0.33293,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.0331,
          -0.1343,
          0,
          0
        ],
        "driverBetasC": [
          -0.0944,
          0.0789,
          0.0307,
          0.0971
        ],
        "spreadBaseC2": 1.2612,
        "spreadScale": 1.0036,
        "cvMaeC": 1.3879,
        "cvRmseC": 1.7845,
        "sampleHours": 4355
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.207255,
          "ecmwfAifs": 0.212211,
          "icon": 0.219419,
          "ukmo": 0.02,
          "meteofrance": 0.030102,
          "gfs": 0.02,
          "gem": 0.271013,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.05,
          -0.1817,
          0,
          0
        ],
        "driverBetasC": [
          -0.1139,
          0.0943,
          0.0213,
          0.117
        ],
        "spreadBaseC2": 1.306,
        "spreadScale": 1.0292,
        "cvMaeC": 1.4062,
        "cvRmseC": 1.8107,
        "sampleHours": 4355
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.246486,
        "ecmwfAifs": 0.083859,
        "icon": 0.217703,
        "ukmo": 0.119359,
        "meteofrance": 0.160091,
        "gfs": 0.066671,
        "gem": 0.055955,
        "jma": 0.049876
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.245746,
        "ecmwfAifs": 0.078831,
        "icon": 0.217965,
        "ukmo": 0.125519,
        "meteofrance": 0.159877,
        "gfs": 0.062663,
        "gem": 0.055733,
        "jma": 0.053666
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.237881,
        "ecmwfAifs": 0.079736,
        "icon": 0.227486,
        "ukmo": 0.122695,
        "meteofrance": 0.15795,
        "gfs": 0.063998,
        "gem": 0.055767,
        "jma": 0.054487
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.2474,
        "ecmwfAifs": 0.077875,
        "icon": 0.21923,
        "ukmo": 0.118661,
        "meteofrance": 0.158541,
        "gfs": 0.066881,
        "gem": 0.057765,
        "jma": 0.053647
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.08,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.214646,
    "ecmwfAifs": 0.0714,
    "icon": 0.253177,
    "ukmo": 0.17593,
    "meteofrance": 0.111067,
    "gfs": 0.094446,
    "gem": 0.039667,
    "jma": 0.039667
  },
  "pressureWeights": {
    "ecmwfIfs": 0.313874,
    "ecmwfAifs": 0.150367,
    "icon": 0.145607,
    "ukmo": 0.173297,
    "meteofrance": 0.07914,
    "gfs": 0.058575,
    "gem": 0.03957,
    "jma": 0.03957
  }
} as const;

export default PROVINCE_CALIBRATION_TR_26;
