/**
 * Diamond sieve size data mapping sieve sizes to mm sizes, number of stones, and carat weights
 */

export interface SieveDataItem {
  sieveSize: string;
  mmSize: number;
  noOfStones: number;
  caratWeight: number;
}

export interface SieveRangeGroup {
  range: string;
  items: SieveDataItem[];
}

export const SIEVE_DATA: SieveRangeGroup[] = [
  {
    range: "-2.0",
    items: [
      { sieveSize: "+0000 - 000", mmSize: 0.8, noOfStones: 303, caratWeight: 0.003 },
      { sieveSize: "+000 - 00", mmSize: 0.9, noOfStones: 250, caratWeight: 0.004 },
      { sieveSize: "+00 - 0", mmSize: 1.0, noOfStones: 200, caratWeight: 0.005 },
      { sieveSize: "+0 - 1.0", mmSize: 1.1, noOfStones: 167, caratWeight: 0.006 },
      { sieveSize: "+1.0 - 1.5", mmSize: 1.1, noOfStones: 143, caratWeight: 0.007 },
      { sieveSize: "+1.5 - 2.0", mmSize: 1.2, noOfStones: 125, caratWeight: 0.008 },
      { sieveSize: "+2.0 - 2.5", mmSize: 1.2, noOfStones: 111, caratWeight: 0.009 },
      { sieveSize: "+2.5 - 3.0", mmSize: 1.3, noOfStones: 100, caratWeight: 0.010 },
    ]
  },
  {
    range: "+2.0 - 6.5",
    items: [
      { sieveSize: "+3.0 - 3.5", mmSize: 1.3, noOfStones: 91, caratWeight: 0.011 },
      { sieveSize: "+3.5 - 4.0", mmSize: 1.4, noOfStones: 83, caratWeight: 0.012 },
      { sieveSize: "+4.0 - 4.5", mmSize: 1.4, noOfStones: 77, caratWeight: 0.014 },
      { sieveSize: "+4.5 - 5.0", mmSize: 1.5, noOfStones: 71, caratWeight: 0.014 },
      { sieveSize: "+5.0 - 5.5", mmSize: 1.5, noOfStones: 66, caratWeight: 0.017 },
      { sieveSize: "+5.5 - 6.0", mmSize: 1.6, noOfStones: 59, caratWeight: 0.020 },
      { sieveSize: "+6.0 - 6.5", mmSize: 1.7, noOfStones: 43, caratWeight: 0.023 },
    ]
  },
  {
    range: "+6.5 - 8.0",
    items: [
      { sieveSize: "+6.5 - 7.0", mmSize: 1.8, noOfStones: 37, caratWeight: 0.027 },
      { sieveSize: "+7.0 - 7.5", mmSize: 1.9, noOfStones: 33, caratWeight: 0.030 },
      { sieveSize: "+7.5 - 8.0", mmSize: 2.0, noOfStones: 29, caratWeight: 0.035 },
    ]
  },
  {
    range: "+8.0 - 11.0",
    items: [
      { sieveSize: "+8.0 - 8.5", mmSize: 2.1, noOfStones: 25, caratWeight: 0.040 },
      { sieveSize: "+8.5 - 9.0", mmSize: 2.2, noOfStones: 22, caratWeight: 0.045 },
      { sieveSize: "+9.0 - 9.5", mmSize: 2.3, noOfStones: 19, caratWeight: 0.053 },
      { sieveSize: "+9.5 - 10.0", mmSize: 2.4, noOfStones: 17, caratWeight: 0.060 },
      { sieveSize: "+10.0 - 10.5", mmSize: 2.5, noOfStones: 14, caratWeight: 0.070 },
      { sieveSize: "+10.0 - 11.0", mmSize: 2.6, noOfStones: 13, caratWeight: 0.075 },
      { sieveSize: "+10.5 - 11.5", mmSize: 2.7, noOfStones: 12, caratWeight: 0.080 },
    ]
  },
  {
    range: "+11.0 - 14.0",
    items: [
      { sieveSize: "+11.5 - 12.0", mmSize: 2.8, noOfStones: 11, caratWeight: 0.090 },
      { sieveSize: "+12.0 - 12.5", mmSize: 2.9, noOfStones: 10, caratWeight: 0.100 },
      { sieveSize: "+12.5 - 13.0", mmSize: 3.0, noOfStones: 9, caratWeight: 0.110 },
      { sieveSize: "+13.0 - 13.5", mmSize: 3.1, noOfStones: 8, caratWeight: 0.120 },
      { sieveSize: "+13.5 - 14.0", mmSize: 3.2, noOfStones: 7, caratWeight: 0.135 },
    ]
  },
  {
    range: "+14.0 - 16.0",
    items: [
      { sieveSize: "+14.0 - 14.5", mmSize: 3.3, noOfStones: 6, caratWeight: 0.150 },
      { sieveSize: "+14.5 - 15.0", mmSize: 3.4, noOfStones: 5, caratWeight: 0.160 },
      { sieveSize: "+15.0 - 15.5", mmSize: 3.5, noOfStones: 5, caratWeight: 0.170 },
      { sieveSize: "+15.5 - 16.0", mmSize: 3.6, noOfStones: 5, caratWeight: 0.180 },
      { sieveSize: "+16.0 - 16.5", mmSize: 3.7, noOfStones: 4, caratWeight: 0.190 },
      { sieveSize: "+16.5 - 17.0", mmSize: 3.8, noOfStones: 4, caratWeight: 0.210 },
      { sieveSize: "+17.0 - 17.5", mmSize: 3.9, noOfStones: 4, caratWeight: 0.230 },
      { sieveSize: "+17.5 - 18.0", mmSize: 4.0, noOfStones: 4, caratWeight: 0.250 },
    ]
  },
  {
    range: "+16.0 - 20.0",
    items: [
      { sieveSize: "+18.0 - 18.5", mmSize: 4.1, noOfStones: 3, caratWeight: 0.270 },
      { sieveSize: "+18.5 - 19.0", mmSize: 4.2, noOfStones: 3, caratWeight: 0.320 },
      { sieveSize: "+19.0 - 19.5", mmSize: 4.3, noOfStones: 3, caratWeight: 0.340 },
      { sieveSize: "+19.5 - 20.0", mmSize: 4.4, noOfStones: 3, caratWeight: 0.350 },
    ]
  },
  {
    range: "As Per MM Size",
    items: [
      { sieveSize: "4.5 mm", mmSize: 4.5, noOfStones: 2, caratWeight: 0.450 },
      { sieveSize: "5.0 mm", mmSize: 5.0, noOfStones: 2, caratWeight: 0.500 },
      { sieveSize: "5.5 mm", mmSize: 5.5, noOfStones: 2, caratWeight: 0.550 },
      { sieveSize: "6.0 mm", mmSize: 6.0, noOfStones: 2, caratWeight: 0.600 },
      { sieveSize: "6.5 mm", mmSize: 6.5, noOfStones: 2, caratWeight: 0.700 },
      { sieveSize: "7.0 mm", mmSize: 7.0, noOfStones: 2, caratWeight: 0.900 },
      { sieveSize: "7.5 mm", mmSize: 7.5, noOfStones: 1, caratWeight: 0.950 },
      { sieveSize: "8.0 mm", mmSize: 8.0, noOfStones: 1, caratWeight: 1.000 },
    ]
  }
];

/**
 * Flattened array of all sieve data items for searching
 */
export const ALL_SIEVE_DATA: (SieveDataItem & { range: string })[] = SIEVE_DATA.flatMap(group => 
  group.items.map(item => ({ ...item, range: group.range }))
);
