import type { ProvinceCalibrationBundle } from "./index";

export const PROVINCE_CALIBRATION_TR_25: ProvinceCalibrationBundle = {
  "provinceCode": "TR-25",
  "provinceName": "Erzurum",
  "plateNumber": 25,
  "tier": "TIER_A_EMPIRICAL_WMO",
  "calibrationTier": "TIER_A_WMO",
  "wmoStationId": "17096",
  "stationLat": 39.9167,
  "stationLon": 41.2667,
  "stationElevationM": 1756,
  "trainedAtIso": "2026-11-28T16:35:00.000Z",
  "matchedHours2024_2025": 17544,
  "alaroAnchorWeight0to72h": 0.12,
  "slices": {
    "DJF": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.16187,
          "icon": 0.71813,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.0682,
        "betaDrivers": [
          0.0046,
          0.3943,
          -1.7935,
          0.4411,
          1.3137,
          0.4422
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 3.1073,
        "spreadScale": 1.6261,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.235886,
            "ecmwfAifs": 0.083886,
            "icon": 0.220381,
            "ukmo": 0.116987,
            "meteofrance": 0.152203,
            "gfs": 0.070891,
            "gem": 0.059588,
            "jma": 0.060178
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1017,
          "logisticSlope": 6.6203,
          "wetFractionWeight": 2.3745,
          "powerEta": 0.68,
          "rawBrier": 0.03436,
          "calibratedBrier": 0.03436
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 3.3578,
          "rawIfsRmseC": 4.6861,
          "rawEqualMaeC": 3.1714,
          "rawEqualRmseC": 4.6077,
          "cvSimplexMaeC": 2.6964,
          "cvCalibratedMaeC": 2.5383,
          "cvCalibratedRmseC": 3.4957
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.058597,
          "ecmwfAifs": 0.371932,
          "icon": 0.469471,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": -0.184,
        "betaDrivers": [
          -0.0649,
          0.1125,
          -0.521,
          0.1789,
          0.4439,
          0.1896
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 3.232,
        "spreadScale": 1.77,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.305955,
            "ecmwfAifs": 0.226986,
            "icon": 0.137993,
            "ukmo": 0.106257,
            "meteofrance": 0.045078,
            "gfs": 0.069754,
            "gem": 0.058633,
            "jma": 0.049344
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1306,
          "logisticSlope": 6.5618,
          "wetFractionWeight": 2.2261,
          "powerEta": 0.68,
          "rawBrier": 0.03436,
          "calibratedBrier": 0.03436
        },
        "verification": {
          "sampleHours": 4344,
          "rawIfsMaeC": 3.3578,
          "rawIfsRmseC": 4.6861,
          "rawEqualMaeC": 3.1714,
          "rawEqualRmseC": 4.6077,
          "cvSimplexMaeC": 2.7734,
          "cvCalibratedMaeC": 2.7174,
          "cvCalibratedRmseC": 3.8104
        }
      }
    },
    "MAM": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.047135,
          "ecmwfAifs": 0.115592,
          "icon": 0.419985,
          "ukmo": 0.177003,
          "meteofrance": 0.069302,
          "gfs": 0.130983,
          "gem": 0.02,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.2623,
          0.0309,
          -0.6652,
          -0.0959,
          0.5496,
          0.0439
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.1581,
        "spreadScale": 1.4861,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.230781,
            "ecmwfAifs": 0.076211,
            "icon": 0.22115,
            "ukmo": 0.122876,
            "meteofrance": 0.157272,
            "gfs": 0.068098,
            "gem": 0.060495,
            "jma": 0.063117
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.1055,
          "logisticSlope": 2.5441,
          "wetFractionWeight": 3.1693,
          "powerEta": 0.68,
          "rawBrier": 0.08855,
          "calibratedBrier": 0.08855
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.1744,
          "rawIfsRmseC": 2.8916,
          "rawEqualMaeC": 1.5712,
          "rawEqualRmseC": 2.2096,
          "cvSimplexMaeC": 1.5845,
          "cvCalibratedMaeC": 1.5642,
          "cvCalibratedRmseC": 2.1598
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.120683,
          "ecmwfAifs": 0.17574,
          "icon": 0.292299,
          "ukmo": 0.161282,
          "meteofrance": 0.087111,
          "gfs": 0.103751,
          "gem": 0.039134,
          "jma": 0.02
        },
        "intercept": 0,
        "betaDrivers": [
          -0.1758,
          0.0247,
          -0.1949,
          -0.0257,
          0.1995,
          0.0651
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.15,
        "spreadScale": 1.4861,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.30603,
            "ecmwfAifs": 0.210832,
            "icon": 0.141573,
            "ukmo": 0.114102,
            "meteofrance": 0.045191,
            "gfs": 0.068504,
            "gem": 0.060856,
            "jma": 0.052912
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.1609,
          "logisticSlope": 2.75,
          "wetFractionWeight": 3.0411,
          "powerEta": 0.68,
          "rawBrier": 0.08855,
          "calibratedBrier": 0.08855
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 2.1744,
          "rawIfsRmseC": 2.8916,
          "rawEqualMaeC": 1.5712,
          "rawEqualRmseC": 2.2096,
          "cvSimplexMaeC": 1.5627,
          "cvCalibratedMaeC": 1.5529,
          "cvCalibratedRmseC": 2.153
        }
      }
    },
    "JJA": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.048039,
          "ecmwfAifs": 0.080754,
          "icon": 0.403881,
          "ukmo": 0.258071,
          "meteofrance": 0.095065,
          "gfs": 0.02,
          "gem": 0.07419,
          "jma": 0.02
        },
        "intercept": -0.0214,
        "betaDrivers": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 0.6096,
        "spreadScale": 0.9828,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.232561,
            "ecmwfAifs": 0.074473,
            "icon": 0.219419,
            "ukmo": 0.131658,
            "meteofrance": 0.159799,
            "gfs": 0.063677,
            "gem": 0.060123,
            "jma": 0.05829
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -3.9539,
          "logisticSlope": 3.0823,
          "wetFractionWeight": 1.9278,
          "powerEta": 0.68,
          "rawBrier": 0.04206,
          "calibratedBrier": 0.0353
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9728,
          "rawIfsRmseC": 2.4697,
          "rawEqualMaeC": 1.4249,
          "rawEqualRmseC": 1.9077,
          "cvSimplexMaeC": 1.3507,
          "cvCalibratedMaeC": 1.3506,
          "cvCalibratedRmseC": 1.7733
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.174422,
          "ecmwfAifs": 0.18741,
          "icon": 0.258127,
          "ukmo": 0.182492,
          "meteofrance": 0.080656,
          "gfs": 0.02,
          "gem": 0.076893,
          "jma": 0.02
        },
        "intercept": -0.0514,
        "betaDrivers": [
          -0.1079,
          0.0361,
          0.0547,
          -0.0162,
          0.06,
          -0.0169
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4525,
        "spreadScale": 1.0713,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.309761,
            "ecmwfAifs": 0.20694,
            "icon": 0.141089,
            "ukmo": 0.1228,
            "meteofrance": 0.045235,
            "gfs": 0.064342,
            "gem": 0.060751,
            "jma": 0.049082
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1171,
          "logisticSlope": 3.0933,
          "wetFractionWeight": 2.1479,
          "powerEta": 0.68,
          "rawBrier": 0.04206,
          "calibratedBrier": 0.03428
        },
        "verification": {
          "sampleHours": 4416,
          "rawIfsMaeC": 1.9728,
          "rawIfsRmseC": 2.4697,
          "rawEqualMaeC": 1.4249,
          "rawEqualRmseC": 1.9077,
          "cvSimplexMaeC": 1.3679,
          "cvCalibratedMaeC": 1.3652,
          "cvCalibratedRmseC": 1.7931
        }
      }
    },
    "SON": {
      "short_0_72h": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.217923,
          "ukmo": 0.533042,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.149035,
          "jma": 0.02
        },
        "intercept": -0.0899,
        "betaDrivers": [
          -0.5216,
          -0.5854,
          -0.7001,
          -0.0003,
          0.4112,
          0.2144
        ],
        "maxResidualShiftC": 4.2,
        "spreadBaseC2": 1.4417,
        "spreadScale": 1.1248,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.238197,
            "ecmwfAifs": 0.07743,
            "icon": 0.219539,
            "ukmo": 0.125766,
            "meteofrance": 0.156907,
            "gfs": 0.067157,
            "gem": 0.057482,
            "jma": 0.057522
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.0608,
          "logisticSlope": 3.792,
          "wetFractionWeight": 2.6349,
          "powerEta": 0.68,
          "rawBrier": 0.03648,
          "calibratedBrier": 0.03439
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.2917,
          "rawIfsRmseC": 3.0394,
          "rawEqualMaeC": 2.0911,
          "rawEqualRmseC": 2.8217,
          "cvSimplexMaeC": 1.813,
          "cvCalibratedMaeC": 1.7178,
          "cvCalibratedRmseC": 2.2149
        }
      },
      "medium_73_240h": {
        "weights": {
          "ecmwfIfs": 0.150924,
          "ecmwfAifs": 0.124235,
          "icon": 0.222808,
          "ukmo": 0.333642,
          "meteofrance": 0.02073,
          "gfs": 0.02,
          "gem": 0.107661,
          "jma": 0.02
        },
        "intercept": -0.0851,
        "betaDrivers": [
          -0.3451,
          -0.3101,
          -0.3105,
          0.015,
          0.2197,
          0.1032
        ],
        "maxResidualShiftC": 3.2,
        "spreadBaseC2": 0.4574,
        "spreadScale": 1.5841,
        "precip": {
          "weights": {
            "ecmwfIfs": 0.313834,
            "ecmwfAifs": 0.212828,
            "icon": 0.139639,
            "ukmo": 0.116035,
            "meteofrance": 0.045173,
            "gfs": 0.067125,
            "gem": 0.057454,
            "jma": 0.047912
          },
          "wetThresholdMmHr": 0.2,
          "logisticIntercept": -4.1181,
          "logisticSlope": 3.5731,
          "wetFractionWeight": 2.6897,
          "powerEta": 0.68,
          "rawBrier": 0.03648,
          "calibratedBrier": 0.03408
        },
        "verification": {
          "sampleHours": 4368,
          "rawIfsMaeC": 2.2917,
          "rawIfsRmseC": 3.0394,
          "rawEqualMaeC": 2.0911,
          "rawEqualRmseC": 2.8217,
          "cvSimplexMaeC": 1.8495,
          "cvCalibratedMaeC": 1.7781,
          "cvCalibratedRmseC": 2.2902
        }
      }
    }
  },
  "temperature": {
    "DJF": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.16187,
          "icon": 0.71813,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.0682,
        "diurnalHarmonicsC": [
          0.0046,
          0.3943,
          0,
          0
        ],
        "driverBetasC": [
          -1.7935,
          0.4422,
          0.4411,
          1.3137
        ],
        "spreadBaseC2": 3.1073,
        "spreadScale": 1.6261,
        "cvMaeC": 2.5383,
        "cvRmseC": 3.4957,
        "sampleHours": 4344
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.039298,
          "ecmwfAifs": 0.266901,
          "icon": 0.593801,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.1261,
        "diurnalHarmonicsC": [
          -0.0301,
          0.2534,
          0,
          0
        ],
        "driverBetasC": [
          -1.1573,
          0.3159,
          0.31,
          0.8788
        ],
        "spreadBaseC2": 3.1696,
        "spreadScale": 1.6981,
        "cvMaeC": 2.6279,
        "cvRmseC": 3.653,
        "sampleHours": 4344
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.058597,
          "ecmwfAifs": 0.371932,
          "icon": 0.469471,
          "ukmo": 0.02,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": -0.184,
        "diurnalHarmonicsC": [
          -0.0649,
          0.1125,
          0,
          0
        ],
        "driverBetasC": [
          -0.521,
          0.1896,
          0.1789,
          0.4439
        ],
        "spreadBaseC2": 3.232,
        "spreadScale": 1.77,
        "cvMaeC": 2.7174,
        "cvRmseC": 3.8104,
        "sampleHours": 4344
      }
    },
    "MAM": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.047135,
          "ecmwfAifs": 0.115592,
          "icon": 0.419985,
          "ukmo": 0.177003,
          "meteofrance": 0.069302,
          "gfs": 0.130983,
          "gem": 0.02,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.2623,
          0.0309,
          0,
          0
        ],
        "driverBetasC": [
          -0.6652,
          0.0439,
          -0.0959,
          0.5496
        ],
        "spreadBaseC2": 0.1581,
        "spreadScale": 1.4861,
        "cvMaeC": 1.5642,
        "cvRmseC": 2.1598,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.083909,
          "ecmwfAifs": 0.145666,
          "icon": 0.356141,
          "ukmo": 0.169143,
          "meteofrance": 0.078207,
          "gfs": 0.117367,
          "gem": 0.029567,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.219,
          0.0278,
          0,
          0
        ],
        "driverBetasC": [
          -0.43,
          0.0545,
          -0.0608,
          0.3745
        ],
        "spreadBaseC2": 0.154,
        "spreadScale": 1.4861,
        "cvMaeC": 1.5585,
        "cvRmseC": 2.1564,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.120683,
          "ecmwfAifs": 0.17574,
          "icon": 0.292299,
          "ukmo": 0.161282,
          "meteofrance": 0.087111,
          "gfs": 0.103751,
          "gem": 0.039134,
          "jma": 0.02
        },
        "interceptC": 0,
        "diurnalHarmonicsC": [
          -0.1758,
          0.0247,
          0,
          0
        ],
        "driverBetasC": [
          -0.1949,
          0.0651,
          -0.0257,
          0.1995
        ],
        "spreadBaseC2": 0.15,
        "spreadScale": 1.4861,
        "cvMaeC": 1.5529,
        "cvRmseC": 2.153,
        "sampleHours": 4416
      }
    },
    "JJA": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.048039,
          "ecmwfAifs": 0.080754,
          "icon": 0.403881,
          "ukmo": 0.258071,
          "meteofrance": 0.095065,
          "gfs": 0.02,
          "gem": 0.07419,
          "jma": 0.02
        },
        "interceptC": -0.0214,
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
        "spreadBaseC2": 0.6096,
        "spreadScale": 0.9828,
        "cvMaeC": 1.3506,
        "cvRmseC": 1.7733,
        "sampleHours": 4416
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.111231,
          "ecmwfAifs": 0.134082,
          "icon": 0.331003,
          "ukmo": 0.220281,
          "meteofrance": 0.087861,
          "gfs": 0.02,
          "gem": 0.075542,
          "jma": 0.02
        },
        "interceptC": -0.0364,
        "diurnalHarmonicsC": [
          -0.0539,
          0.0181,
          0,
          0
        ],
        "driverBetasC": [
          0.0273,
          -0.0084,
          -0.0081,
          0.03
        ],
        "spreadBaseC2": 0.5311,
        "spreadScale": 1.0271,
        "cvMaeC": 1.3579,
        "cvRmseC": 1.7832,
        "sampleHours": 4416
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.174422,
          "ecmwfAifs": 0.18741,
          "icon": 0.258127,
          "ukmo": 0.182492,
          "meteofrance": 0.080656,
          "gfs": 0.02,
          "gem": 0.076893,
          "jma": 0.02
        },
        "interceptC": -0.0514,
        "diurnalHarmonicsC": [
          -0.1079,
          0.0361,
          0,
          0
        ],
        "driverBetasC": [
          0.0547,
          -0.0169,
          -0.0162,
          0.06
        ],
        "spreadBaseC2": 0.4525,
        "spreadScale": 1.0713,
        "cvMaeC": 1.3652,
        "cvRmseC": 1.7931,
        "sampleHours": 4416
      }
    },
    "SON": {
      "d0_1": {
        "weights": {
          "ecmwfIfs": 0.02,
          "ecmwfAifs": 0.02,
          "icon": 0.217923,
          "ukmo": 0.533042,
          "meteofrance": 0.02,
          "gfs": 0.02,
          "gem": 0.149035,
          "jma": 0.02
        },
        "interceptC": -0.0899,
        "diurnalHarmonicsC": [
          -0.5216,
          -0.5854,
          0,
          0
        ],
        "driverBetasC": [
          -0.7001,
          0.2144,
          -0.0003,
          0.4112
        ],
        "spreadBaseC2": 1.4417,
        "spreadScale": 1.1248,
        "cvMaeC": 1.7178,
        "cvRmseC": 2.2149,
        "sampleHours": 4368
      },
      "d2_4": {
        "weights": {
          "ecmwfIfs": 0.085462,
          "ecmwfAifs": 0.072118,
          "icon": 0.220366,
          "ukmo": 0.433341,
          "meteofrance": 0.020365,
          "gfs": 0.02,
          "gem": 0.128348,
          "jma": 0.02
        },
        "interceptC": -0.0875,
        "diurnalHarmonicsC": [
          -0.4334,
          -0.4477,
          0,
          0
        ],
        "driverBetasC": [
          -0.5053,
          0.1588,
          0.0073,
          0.3155
        ],
        "spreadBaseC2": 0.9496,
        "spreadScale": 1.3544,
        "cvMaeC": 1.7479,
        "cvRmseC": 2.2526,
        "sampleHours": 4368
      },
      "d5_7": {
        "weights": {
          "ecmwfIfs": 0.150924,
          "ecmwfAifs": 0.124235,
          "icon": 0.222808,
          "ukmo": 0.333642,
          "meteofrance": 0.02073,
          "gfs": 0.02,
          "gem": 0.107661,
          "jma": 0.02
        },
        "interceptC": -0.0851,
        "diurnalHarmonicsC": [
          -0.3451,
          -0.3101,
          0,
          0
        ],
        "driverBetasC": [
          -0.3105,
          0.1032,
          0.015,
          0.2197
        ],
        "spreadBaseC2": 0.4574,
        "spreadScale": 1.5841,
        "cvMaeC": 1.7781,
        "cvRmseC": 2.2902,
        "sampleHours": 4368
      }
    }
  },
  "precipitation": {
    "DJF": {
      "weights": {
        "ecmwfIfs": 0.235886,
        "ecmwfAifs": 0.083886,
        "icon": 0.220381,
        "ukmo": 0.116987,
        "meteofrance": 0.152203,
        "gfs": 0.070891,
        "gem": 0.059588,
        "jma": 0.060178
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "MAM": {
      "weights": {
        "ecmwfIfs": 0.230781,
        "ecmwfAifs": 0.076211,
        "icon": 0.22115,
        "ukmo": 0.122876,
        "meteofrance": 0.157272,
        "gfs": 0.068098,
        "gem": 0.060495,
        "jma": 0.063117
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "JJA": {
      "weights": {
        "ecmwfIfs": 0.232561,
        "ecmwfAifs": 0.074473,
        "icon": 0.219419,
        "ukmo": 0.131658,
        "meteofrance": 0.159799,
        "gfs": 0.063677,
        "gem": 0.060123,
        "jma": 0.05829
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    },
    "SON": {
      "weights": {
        "ecmwfIfs": 0.238197,
        "ecmwfAifs": 0.07743,
        "icon": 0.219539,
        "ukmo": 0.125766,
        "meteofrance": 0.156907,
        "gfs": 0.067157,
        "gem": 0.057482,
        "jma": 0.057522
      },
      "wetThresholdMmHr": 0.2,
      "orographicAlpha": 0.14,
      "powerEta": 0.68,
      "alaroBlendWeight0To36h": 0.12
    }
  },
  "windWeights": {
    "ecmwfIfs": 0.216472,
    "ecmwfAifs": 0.070722,
    "icon": 0.262975,
    "ukmo": 0.167773,
    "meteofrance": 0.110012,
    "gfs": 0.093466,
    "gem": 0.03929,
    "jma": 0.03929
  },
  "pressureWeights": {
    "ecmwfIfs": 0.301699,
    "ecmwfAifs": 0.155571,
    "icon": 0.140094,
    "ukmo": 0.191407,
    "meteofrance": 0.081879,
    "gfs": 0.04747,
    "gem": 0.04094,
    "jma": 0.04094
  }
} as const;

export default PROVINCE_CALIBRATION_TR_25;
