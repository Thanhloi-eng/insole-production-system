import { useState, useMemo } from "react";

// ============================================================
// RAW MOLD DATA FROM EXCEL (OVN sheet)
// Each entry: moldId -> [{size, qty}, ...]
// size = range label from raw data, qty = khuôn count
// ============================================================
const MOLD_INVENTORY = {
  "OE-0002": [{"size":"3.5-4#","qty":5},{"size":"4.5-5.5#","qty":21},{"size":"6-7#","qty":27},{"size":"7.5-8.5#","qty":33},{"size":"9-10#","qty":30},{"size":"10.5-11.5#","qty":23},{"size":"12-13#","qty":15},{"size":"14-15#","qty":5},{"size":"16-18#","qty":3},{"size":"19-20#","qty":1},{"size":"21-22#","qty":1}],
  "OE-0198": [{"size":"3#","qty":1},{"size":"3.5#","qty":3},{"size":"4#","qty":4},{"size":"4.5#","qty":7},{"size":"5#","qty":10},{"size":"5.5#","qty":14},{"size":"6#","qty":15},{"size":"6.5#","qty":16},{"size":"7#","qty":16},{"size":"7.5#","qty":13},{"size":"8#","qty":14},{"size":"8.5#","qty":14},{"size":"9#","qty":12},{"size":"9.5#","qty":13},{"size":"10#","qty":13},{"size":"10.5#","qty":10},{"size":"11#","qty":10},{"size":"11.5#","qty":5},{"size":"12#","qty":7},{"size":"12.5#","qty":2},{"size":"13#","qty":4},{"size":"14#","qty":2},{"size":"14.5#","qty":1},{"size":"15#","qty":2},{"size":"15.5#","qty":1},{"size":"16#","qty":1},{"size":"16.5#","qty":1},{"size":"17#","qty":1},{"size":"18#","qty":1}],
  "OV-0256": [{"size":"3.5#","qty":8},{"size":"5#","qty":34},{"size":"8#","qty":36},{"size":"9.5#","qty":34},{"size":"11#","qty":20},{"size":"12.5#","qty":6},{"size":"14#","qty":2}],
  "OSC-0003": [{"size":"3.5#-5#","qty":10},{"size":"5.5#-6.5#","qty":23},{"size":"7#-8#","qty":20},{"size":"8.5#-9.5#","qty":26},{"size":"10#-11#","qty":20},{"size":"11.5#-12.5#","qty":8},{"size":"13#-15#","qty":3}],
  "OE-1128": [{"size":"3#","qty":1},{"size":"3.5#","qty":1},{"size":"4#","qty":3},{"size":"4.5#","qty":6},{"size":"5#","qty":6},{"size":"5.5#","qty":14},{"size":"6#","qty":16},{"size":"6.5#","qty":14},{"size":"7#","qty":16},{"size":"7.5#","qty":14},{"size":"8#","qty":18},{"size":"8.5#","qty":16},{"size":"9#","qty":18},{"size":"9.5#","qty":18},{"size":"10#","qty":18},{"size":"10.5#","qty":12},{"size":"11#","qty":14},{"size":"11.5#","qty":8},{"size":"12#","qty":9},{"size":"12.5#","qty":4},{"size":"13#","qty":4},{"size":"13.5#","qty":1},{"size":"14#","qty":2},{"size":"15#","qty":1},{"size":"16#","qty":1},{"size":"17#","qty":1}],
  "OV-0208": [{"size":"3.5#-4#","qty":4},{"size":"4.5#-5.5#","qty":16},{"size":"6#-7#","qty":18},{"size":"7.5#-8.5#","qty":24},{"size":"9#-10#","qty":26},{"size":"10.5#-11.5#","qty":20},{"size":"12#-13#","qty":8},{"size":"14#-15#","qty":2},{"size":"16#-18#","qty":1}],
  "OE-0656": [{"size":"3.5#","qty":1},{"size":"4#","qty":2},{"size":"4.5#","qty":4},{"size":"5#","qty":6},{"size":"5.5#","qty":7},{"size":"6#","qty":7},{"size":"6.5#","qty":11},{"size":"7#","qty":11},{"size":"7.5#","qty":10},{"size":"8#","qty":8},{"size":"8.5#","qty":8},{"size":"9#","qty":6},{"size":"9.5#","qty":7},{"size":"10#","qty":7},{"size":"10.5#","qty":8},{"size":"11#","qty":9},{"size":"11.5#","qty":6},{"size":"12#","qty":6},{"size":"12.5#","qty":3},{"size":"13#","qty":5},{"size":"14#","qty":3},{"size":"15#","qty":1},{"size":"16#","qty":1}],
  "OI-0023": [{"size":"3.5-4.5#","qty":3},{"size":"5-6#","qty":10},{"size":"6.5-7.5#","qty":13},{"size":"8-9#","qty":16},{"size":"9.5-10.5#","qty":18},{"size":"11-12#","qty":12},{"size":"12.5-13.5#","qty":4},{"size":"14-15#","qty":1},{"size":"16-18#","qty":1}],
  "OV-0435": [{"size":"3.5#","qty":1},{"size":"4#","qty":1},{"size":"4.5#","qty":1},{"size":"5#","qty":2},{"size":"5.5#","qty":2},{"size":"6#","qty":2},{"size":"6.5#","qty":3},{"size":"7#","qty":3},{"size":"7.5#","qty":3},{"size":"8#","qty":2},{"size":"8.5#","qty":3},{"size":"9#","qty":3},{"size":"9.5#","qty":3},{"size":"10#","qty":3},{"size":"10.5#","qty":3},{"size":"11#","qty":3},{"size":"11.5#","qty":3},{"size":"12#","qty":3},{"size":"12.5#","qty":1},{"size":"13#","qty":1},{"size":"14#","qty":1}],
  "OV-0339": [{"size":"3.5-4.5#","qty":3},{"size":"5-6#","qty":6},{"size":"6.5-7.5#","qty":6},{"size":"8-9#","qty":6},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":3},{"size":"12.5-14#","qty":1}],
  "OV-0436": [{"size":"3.5-4.5#","qty":3},{"size":"5-6#","qty":7},{"size":"6.5-7.5#","qty":8},{"size":"8-9#","qty":7},{"size":"9.5-10.5#","qty":7},{"size":"11-12#","qty":5},{"size":"12.5-14#","qty":2},{"size":"15-16#","qty":1}],
  "OV-0394-L1": [{"size":"3.5#","qty":1},{"size":"4#","qty":1},{"size":"4.5#","qty":1},{"size":"5#","qty":1},{"size":"5.5#","qty":1},{"size":"6#","qty":1},{"size":"6.5#","qty":1},{"size":"7#","qty":1},{"size":"7.5#","qty":1},{"size":"8#","qty":1},{"size":"8.5#","qty":1},{"size":"9#","qty":1},{"size":"9.5#","qty":1},{"size":"10#","qty":1},{"size":"10.5#","qty":1},{"size":"11#","qty":1},{"size":"11.5#","qty":1},{"size":"12#","qty":1},{"size":"12.5#","qty":1},{"size":"13#","qty":1},{"size":"14#","qty":1},{"size":"15#","qty":1}],
  "OV-0394-L2": [{"size":"3.5#","qty":1},{"size":"4#","qty":1},{"size":"4.5#","qty":1},{"size":"5#","qty":1},{"size":"5.5#","qty":1},{"size":"6#","qty":1},{"size":"6.5#","qty":1},{"size":"7#","qty":1},{"size":"7.5#","qty":1},{"size":"8#","qty":1},{"size":"8.5#","qty":1},{"size":"9#","qty":1},{"size":"9.5#","qty":1},{"size":"10#","qty":1},{"size":"10.5#","qty":1},{"size":"11#","qty":1},{"size":"11.5#","qty":1},{"size":"12#","qty":1},{"size":"12.5#","qty":1},{"size":"13#","qty":1},{"size":"14#","qty":1},{"size":"15#","qty":1}],
  "OV-0286-1": [{"size":"2.5-4#","qty":17},{"size":"4.5-5.5#","qty":25},{"size":"6-7#","qty":17},{"size":"7.5-8.5#","qty":11},{"size":"9-10#","qty":9},{"size":"10.5-11.5#","qty":4},{"size":"12-13.5#","qty":1}],
  "OV-0446-L1": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":2},{"size":"12.5-14#","qty":1}],
  "OV-0446-L2": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":2},{"size":"12.5-14#","qty":1}],
  "OV-0267": [{"size":"3.5-5#","qty":1},{"size":"5.5-6.5#","qty":5},{"size":"7-8#","qty":10},{"size":"8.5-9.5#","qty":7},{"size":"10-11#","qty":2}],
  "OE-0002": [{"size":"3.5-4#","qty":5},{"size":"4.5-5.5#","qty":21},{"size":"6-7#","qty":27},{"size":"7.5-8.5#","qty":33},{"size":"9-10#","qty":30},{"size":"10.5-11.5#","qty":23},{"size":"12-13#","qty":15},{"size":"14-15#","qty":5},{"size":"16-18#","qty":3},{"size":"19-20#","qty":1},{"size":"21-22#","qty":1}],
  "OV-0345": [{"size":"6-8.5#","qty":2},{"size":"9-10#","qty":2},{"size":"10.5-11.5#","qty":2},{"size":"12-15#","qty":2}],
  "OV-0459": [{"size":"3.5-4.5#","qty":1},{"size":"5-6#","qty":1},{"size":"6.5-7.5#","qty":1},{"size":"8-9#","qty":1},{"size":"9.5-10.5#","qty":1},{"size":"11-12#","qty":1},{"size":"12.5-14#","qty":1},{"size":"15-16#","qty":1}],
  "OV-0341-L2": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":3},{"size":"6.5-7.5#","qty":3},{"size":"8-9#","qty":3},{"size":"9.5-10.5#","qty":3},{"size":"11-12#","qty":2},{"size":"12.5-14#","qty":1}],
  "OV-0333": [{"size":"3-4.5#","qty":1},{"size":"5-6#","qty":3},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":3},{"size":"12.5-14#","qty":1}],
  "OV-0356-L2": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":3},{"size":"6.5-7.5#","qty":3},{"size":"8-9#","qty":3},{"size":"9.5-10.5#","qty":3},{"size":"11-12#","qty":2},{"size":"12.5-14#","qty":1}],
  "OV-0363": [{"size":"5-6#","qty":1},{"size":"6.5-7.5#","qty":1},{"size":"8-9#","qty":1},{"size":"9.5-10.5#","qty":1},{"size":"11-12#","qty":1},{"size":"12.5-13.5#","qty":1},{"size":"14-15#","qty":1}],
  "OV-0337": [{"size":"5-6#","qty":1},{"size":"6.5-7.5#","qty":1},{"size":"8-9#","qty":1},{"size":"9.5-10.5#","qty":1},{"size":"11-12#","qty":1},{"size":"12.5-13.5#","qty":1},{"size":"14-15#","qty":1}],
  "OV-0398": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":2},{"size":"12.5-14#","qty":1}],
  "OV-0385": [{"size":"3.5-4.5#","qty":1},{"size":"5-6#","qty":2},{"size":"6.5-7.5#","qty":2},{"size":"8-9#","qty":2},{"size":"9.5-10.5#","qty":2},{"size":"11-12#","qty":1}],
  "OV-0419": [{"size":"3.5-4.5#","qty":1},{"size":"5-6#","qty":2},{"size":"6.5-7.5#","qty":2},{"size":"8-9#","qty":2},{"size":"9.5-10.5#","qty":2},{"size":"11-12#","qty":1}],
  "OV-0420": [{"size":"3.5-4.5#","qty":1},{"size":"5-6#","qty":2},{"size":"6.5-7.5#","qty":2},{"size":"8-9#","qty":2},{"size":"9.5-10.5#","qty":2},{"size":"11-12#","qty":1}],
  "OV-0423": [{"size":"3.5-4#","qty":1},{"size":"4.5-5.5#","qty":1},{"size":"6-7#","qty":1},{"size":"7.5-8.5#","qty":2},{"size":"9-10#","qty":2},{"size":"10.5-11.5#","qty":2},{"size":"12-13#","qty":1},{"size":"14-16#","qty":1}],
  "OE-1429": [{"size":"3.5#","qty":1},{"size":"4#","qty":1},{"size":"4.5#","qty":2},{"size":"5#","qty":3},{"size":"5.5#","qty":5},{"size":"6#","qty":7},{"size":"6.5#","qty":7},{"size":"7#","qty":6},{"size":"7.5#","qty":6},{"size":"8#","qty":6},{"size":"8.5#","qty":6},{"size":"9#","qty":6},{"size":"9.5#","qty":5},{"size":"10#","qty":5},{"size":"10.5#","qty":6},{"size":"11#","qty":6}],
  "OV-0229": [{"size":"3.5#","qty":1},{"size":"4#","qty":1},{"size":"4.5#","qty":4},{"size":"5#","qty":4},{"size":"5.5#","qty":5},{"size":"6#","qty":7},{"size":"6.5#","qty":8},{"size":"7#","qty":7},{"size":"7.5#","qty":6},{"size":"8#","qty":6},{"size":"8.5#","qty":6},{"size":"9#","qty":4},{"size":"9.5#","qty":6},{"size":"10#","qty":6},{"size":"10.5#","qty":5},{"size":"11#","qty":5},{"size":"11.5#","qty":4},{"size":"12#","qty":4},{"size":"12.5#","qty":2},{"size":"13#","qty":4},{"size":"14#","qty":1},{"size":"15#","qty":1}],
  "OV-0292-L1": [{"size":"3.5-5#","qty":6},{"size":"5.5-7#","qty":12},{"size":"7.5-9#","qty":12},{"size":"9.5-11#","qty":10},{"size":"11.5-13#","qty":3},{"size":"13.5-15#","qty":2}],
  "OS-0312": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":3},{"size":"11-12#","qty":2}],
  "OS-0111": [{"size":"3.5-4#","qty":2},{"size":"4.5-5.5#","qty":6},{"size":"6-7#","qty":13},{"size":"7.5-8.5#","qty":15},{"size":"9-10#","qty":17},{"size":"10.5-11.5#","qty":17},{"size":"12-13#","qty":11},{"size":"14-15#","qty":3},{"size":"16-18#","qty":2}],
  "OV-0408": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":2}],
  "OV-0428": [{"size":"3.5-4.5#","qty":2},{"size":"5-6#","qty":4},{"size":"6.5-7.5#","qty":4},{"size":"8-9#","qty":4},{"size":"9.5-10.5#","qty":4},{"size":"11-12#","qty":2}],
};

// ============================================================
// MACHINE DATA - 50 machines with molds on them
// ============================================================
const MACHINES = [
  { id: "M-01", name: "Molding Machine 01", capacity: 12, molds: [{ moldId: "OV-0394-L2", sizes: ["3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#"] }] },
  { id: "M-02", name: "Molding Machine 02", capacity: 12, molds: [{ moldId: "OV-0394-L2", sizes: ["9#","9.5#","10#","10.5#","11#","11.5#"] }, { moldId: "OV-0394-L1", sizes: ["3.5#","4#","4.5#","5#","5.5#"] }] },
  { id: "M-03", name: "Molding Machine 03", capacity: 12, molds: [{ moldId: "OV-0408", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-04", name: "Molding Machine 04", capacity: 12, molds: [{ moldId: "OV-0394-L1", sizes: ["3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#"] }] },
  { id: "M-05", name: "Molding Machine 05", capacity: 12, molds: [{ moldId: "OV-0408", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#"] }, { moldId: "OE-0656", sizes: ["6.5#","7#"] }] },
  { id: "M-06", name: "Molding Machine 06", capacity: 12, molds: [{ moldId: "OSC-0003", sizes: ["3.5#-5#","5.5#-6.5#","7#-8#","8.5#-9.5#","10#-11#","11.5#-12.5#","13#-15#"] }] },
  { id: "M-07", name: "Molding Machine 07", capacity: 12, molds: [{ moldId: "OV-0420", sizes: ["8-10#","5-7#"] }, { moldId: "OV-0256", sizes: ["5#-6#"] }] },
  { id: "M-08", name: "Molding Machine 08", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#"] }, { moldId: "OV-0423", sizes: ["7.5-8.5#","9-10#","10.5-11.5#"] }] },
  { id: "M-09", name: "Molding Machine 09", capacity: 12, molds: [{ moldId: "OV-0428", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-10", name: "Molding Machine 10", capacity: 12, molds: [{ moldId: "OSC-0003", sizes: ["3.5#-5#","5.5#-6.5#","7#-8#","8.5#-9.5#","10#-11#","11.5#-12.5#","13#-15#"] }] },
  { id: "M-11", name: "Molding Machine 11", capacity: 12, molds: [{ moldId: "OSC-0003", sizes: ["3.5#-5#","5.5#-6.5#","7#-8#","8.5#-9.5#","10#-11#","11.5#-12.5#","13#-15#"] }] },
  { id: "M-12", name: "Molding Machine 12", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#","12.5#","14#"] }] },
  { id: "M-13", name: "Molding Machine 13", capacity: 12, molds: [{ moldId: "OE-1429", sizes: ["3.5#","4#","4.5#","5#"] }, { moldId: "OSC-0003", sizes: ["3.5#-5#","5.5#-6.5#","7#-8#"] }] },
  { id: "M-14", name: "Molding Machine 14", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#","12.5#","14#","3.5#"] }] },
  { id: "M-15", name: "Molding Machine 15", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#"] }] },
  { id: "M-16", name: "Molding Machine 16", capacity: 12, molds: [{ moldId: "OV-0419", sizes: ["3.5-4.5#","5-6#"] }, { moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#","12.5#","14#","3.5#","8#","5#"] }] },
  { id: "M-17", name: "Molding Machine 17", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#","12.5#","14#","3.5#"] }] },
  { id: "M-18", name: "Molding Machine 18", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["5#","8#","9.5#","11#","12.5#","14#","3.5#"] }] },
  { id: "M-19", name: "Molding Machine 19", capacity: 12, molds: [{ moldId: "OV-0339", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#"] }] },
  { id: "M-20", name: "Molding Machine 20", capacity: 12, molds: [{ moldId: "OV-0436", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-21", name: "Molding Machine 21", capacity: 12, molds: [{ moldId: "OV-0339", sizes: ["3.5-4.5#","5-6#","6.5-7.5#"] }, { moldId: "OV-0459", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#"] }] },
  { id: "M-22", name: "Molding Machine 22", capacity: 12, molds: [{ moldId: "OV-0341-L2", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#"] }, { moldId: "OV-0333", sizes: ["5-6#","6.5-7.5#","8-9#"] }] },
  { id: "M-23", name: "Molding Machine 23", capacity: 12, molds: [{ moldId: "OV-0446-L1", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }, { moldId: "OV-0398", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-24", name: "Molding Machine 24", capacity: 12, molds: [{ moldId: "OV-0286-1", sizes: ["2.5-4#","4.5-5.5#","6-7#","7.5-8.5#","9-10#","10.5-11.5#"] }, { moldId: "OV-0446-L2", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-25", name: "Molding Machine 25", capacity: 12, molds: [{ moldId: "OV-0356-L2", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#"] }, { moldId: "OV-0363", sizes: ["5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-26", name: "Molding Machine 26", capacity: 12, molds: [{ moldId: "OV-0436", sizes: ["3.5-4.5#","5-6#","6.5-7.5#"] }, { moldId: "OV-0385", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#"] }] },
  { id: "M-27", name: "Molding Machine 27", capacity: 12, molds: [{ moldId: "OV-0337", sizes: ["5-6#","6.5-7.5#","8-9#"] }, { moldId: "OV-0446-L2", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-28", name: "Molding Machine 28", capacity: 12, molds: [{ moldId: "OE-0002", sizes: ["3.5-4#","4.5-5.5#","6-7#","7.5-8.5#","9-10#","10.5-11.5#"] }] },
  { id: "M-29", name: "Molding Machine 29", capacity: 12, molds: [{ moldId: "OV-0435", sizes: ["3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#"] }] },
  { id: "M-30", name: "Molding Machine 30", capacity: 12, molds: [{ moldId: "OE-0002", sizes: ["6-7#","7.5-8.5#","9-10#","10.5-11.5#","12-13#","14-15#"] }] },
  { id: "M-31", name: "Molding Machine 31", capacity: 12, molds: [{ moldId: "OV-0435", sizes: ["9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","14#"] }] },
  { id: "M-32", name: "Molding Machine 32", capacity: 12, molds: [{ moldId: "OV-0267", sizes: ["5.5-6.5#","7-8#","8.5-9.5#","10-11#"] }] },
  { id: "M-33", name: "Molding Machine 33", capacity: 24, molds: [{ moldId: "OV-0345", sizes: ["6-8.5#","9-10#","10.5-11.5#","12-15#"] }, { moldId: "OE-1128", sizes: ["3#","3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#"] }] },
  { id: "M-34", name: "Molding Machine 34", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","13.5#","14#","15#","16#","17#","18#"] }] },
  { id: "M-35", name: "Molding Machine 35", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","16#","17#"] }] },
  { id: "M-36", name: "Molding Machine 36", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["3#","3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#"] }] },
  { id: "M-37", name: "Molding Machine 37", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","13.5#","14#","15#","16#","17#"] }] },
  { id: "M-38", name: "Molding Machine 38", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","13.5#","14#","15#","16#","17#"] }] },
  { id: "M-39", name: "Molding Machine 39", capacity: 24, molds: [{ moldId: "OE-1128", sizes: ["5#","5.5#","6#","6.5#","7#","7.5#","8#","8.5#","9#","9.5#","10#","10.5#","11#","11.5#","12#","12.5#","13#","13.5#","14#","15#","16#","17#"] }] },
  { id: "M-40", name: "Molding Machine 40", capacity: 24, molds: [{ moldId: "OV-0256", sizes: ["3.5#","5#","8#","9.5#","11#","12.5#","14#"] }] },
  { id: "M-41", name: "Molding Machine 41", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["3.5#","5#","8#","9.5#","11#","12.5#","14#"] }] },
  { id: "M-42", name: "Molding Machine 42", capacity: 12, molds: [{ moldId: "OV-0256", sizes: ["3.5#","5#","8#","9.5#","11#"] }] },
  { id: "M-43", name: "Molding Machine 43", capacity: 12, molds: [{ moldId: "OV-0229", sizes: ["3.5#","4#","4.5#","5#","5.5#","6#","6.5#","7#"] }, { moldId: "OV-0292-L1", sizes: ["3.5-5#","5.5-7#"] }, { moldId: "OV-0208", sizes: ["3.5#-4#"] }] },
  { id: "M-44", name: "Molding Machine 44", capacity: 12, molds: [{ moldId: "OS-0312", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#"] }] },
  { id: "M-45", name: "Molding Machine 45", capacity: 32, molds: [{ moldId: "OI-0023", sizes: ["3.5-4.5#","5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#","12.5-13.5#","14-15#","16-18#"] }] },
  { id: "M-46", name: "Molding Machine 46", capacity: 32, molds: [{ moldId: "OV-0208", sizes: ["3.5#-4#","4.5#-5.5#","6#-7#","7.5#-8.5#","9#-10#","10.5#-11.5#","12#-13#","14#-15#","16#-18#"] }] },
  { id: "M-47", name: "Molding Machine 47", capacity: 32, molds: [{ moldId: "OI-0023", sizes: ["5-6#","6.5-7.5#","8-9#","9.5-10.5#","11-12#","12.5-13.5#","14-15#","16-18#"] }] },
  { id: "M-48", name: "Molding Machine 48", capacity: 32, molds: [{ moldId: "OV-0208", sizes: ["3.5#-4#","4.5#-5.5#","6#-7#","7.5#-8.5#","9#-10#","10.5#-11.5#","12#-13#","14#-15#","16#-18#"] }] },
  { id: "M-49", name: "Molding Machine 49", capacity: 32, molds: [{ moldId: "OS-0111", sizes: ["3.5-4#","4.5-5.5#","6-7#","7.5-8.5#","9-10#","10.5-11.5#","12-13#"] }] },
  { id: "M-50", name: "Molding Machine 50", capacity: 32, molds: [{ moldId: "OV-0208", sizes: ["3.5#-4#","4.5#-5.5#","6#-7#","7.5#-8.5#","9#-10#","10.5#-11.5#","12#-13#","14#-15#","16#-18#"] }] },
];

// ============================================================
// HELPER: Normalize mold ID for matching
// ============================================================
function normalizeMoldId(id) {
  return id.toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "-")
    .replace("OV-394", "OV-0394")
    .replace("OV-0341-LAYER2", "OV-0341-L2")
    .replace("OV-0341LAYER2", "OV-0341-L2")
    .replace("OV-0356-LAYER2", "OV-0356-L2")
    .replace("OV-0356LAYER2", "OV-0356-L2")
    .replace("OV-0446-L1", "OV-0446-L1")
    .replace("OV-0446L1", "OV-0446-L1")
    .replace("OV-0446-L2", "OV-0446-L2")
    .replace("OV-0446L2", "OV-0446-L2");
}

// ============================================================
// COMPUTE: For each mold, count how many size-slots are on machines
// ============================================================
function computeMoldMachineStatus() {
  // moldId -> { [sizeLabel]: [{machineId, qty}] }
  const machineMap = {};
  
  MACHINES.forEach(machine => {
    machine.molds.forEach(({ moldId, sizes }) => {
      const normId = normalizeMoldId(moldId);
      if (!machineMap[normId]) machineMap[normId] = {};
      sizes.forEach(size => {
        if (!machineMap[normId][size]) machineMap[normId][size] = [];
        machineMap[normId][size].push({ machineId: machine.id, qty: 1 });
      });
    });
  });
  
  return machineMap;
}

// ============================================================
// COMPUTE: Analysis per mold - match inventory vs on-machine
// ============================================================
function computeMoldAnalysis() {
  const machineMap = computeMoldMachineStatus();
  
  const results = [];
  
  Object.entries(MOLD_INVENTORY).forEach(([moldId, sizes]) => {
    const normId = normalizeMoldId(moldId);
    const onMachine = machineMap[normId] || {};
    
    const totalInventorySlots = sizes.length;
    let slotsOnMachine = 0;
    let shortageSlots = 0;
    
    const sizeDetails = sizes.map(({ size, qty }) => {
      // Try to find matching size on machine (fuzzy)
      const matchedKey = Object.keys(onMachine).find(k => 
        normSize(k) === normSize(size)
      );
      const machineCount = matchedKey ? onMachine[matchedKey].length : 0;
      const machines = matchedKey ? onMachine[matchedKey].map(m => m.machineId) : [];
      
      const isOnMachine = machineCount > 0;
      if (isOnMachine) slotsOnMachine++;
      else shortageSlots++;
      
      return {
        size,
        inventoryQty: qty,
        onMachine: machineCount,
        machines,
        missing: !isOnMachine
      };
    });
    
    results.push({
      moldId,
      totalSizeSlots: totalInventorySlots,
      slotsOnMachine,
      shortageSlots,
      coveragePercent: totalInventorySlots > 0 ? Math.round((slotsOnMachine / totalInventorySlots) * 100) : 0,
      sizeDetails,
      hasShortage: shortageSlots > 0
    });
  });
  
  return results.sort((a, b) => b.shortageSlots - a.shortageSlots);
}

function normSize(s) {
  return s.toLowerCase()
    .replace(/\s+/g, "")
    .replace(/#/g, "")
    .replace(/[,،]/g, ".")
    .replace(/\./g, ".");
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MoldScheduler() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | shortage | ok
  const [expandedMold, setExpandedMold] = useState(null);
  const [activeTab, setActiveTab] = useState("scheduler");

  const analysis = useMemo(() => computeMoldAnalysis(), []);
  
  const filtered = useMemo(() => {
    return analysis.filter(m => {
      const matchSearch = !searchQuery || m.moldId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterMode === "all" || 
        (filterMode === "shortage" && m.hasShortage) ||
        (filterMode === "ok" && !m.hasShortage);
      return matchSearch && matchFilter;
    });
  }, [analysis, searchQuery, filterMode]);

  const stats = useMemo(() => ({
    total: analysis.length,
    shortage: analysis.filter(m => m.hasShortage).length,
    ok: analysis.filter(m => !m.hasShortage).length,
    totalShortageSlots: analysis.reduce((s, m) => s + m.shortageSlots, 0),
  }), [analysis]);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "#1a1f2e", borderBottom: "1px solid #2d3748", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.05em" }}>MOLD SCHEDULING SYSTEM</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: 2 }}>Molding Insole Production • Size-Based Analysis</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["overview", "scheduler", "tracker"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid", fontSize: "11px", fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em",
                background: activeTab === t ? "#3b82f6" : "transparent",
                borderColor: activeTab === t ? "#3b82f6" : "#2d3748",
                color: activeTab === t ? "#fff" : "#94a3b8"
              }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#2d3748", margin: "0 24px 24px", marginTop: 24, borderRadius: 10, overflow: "hidden" }}>
        {[
          { label: "Total Mold Types", value: stats.total, sub: "in inventory", color: "#60a5fa" },
          { label: "Size Slots Missing", value: stats.totalShortageSlots, sub: "not on any machine", color: "#f87171" },
          { label: "Molds with Shortage", value: stats.shortage, sub: `${Math.round(stats.shortage/stats.total*100)}% of total`, color: "#fb923c" },
          { label: "Fully Covered", value: stats.ok, sub: "all sizes on machine", color: "#34d399" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#1a1f2e", padding: "20px 24px" }}>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: s.color, lineHeight: 1.2, marginTop: 8 }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#475569", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search mold ID..."
            style={{ flex: 1, maxWidth: 280, padding: "8px 14px", background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, color: "#e2e8f0", fontFamily: "inherit", fontSize: "13px", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {[["all", "All"], ["shortage", "⚠ Shortage"], ["ok", "✓ OK"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilterMode(v)}
                style={{ padding: "7px 14px", borderRadius: 6, border: "1px solid", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
                  background: filterMode === v ? (v === "shortage" ? "#7c2d12" : v === "ok" ? "#064e3b" : "#1e3a5f") : "transparent",
                  borderColor: filterMode === v ? (v === "shortage" ? "#ef4444" : v === "ok" ? "#10b981" : "#3b82f6") : "#2d3748",
                  color: filterMode === v ? "#fff" : "#94a3b8"
                }}>{l}</button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", fontSize: "12px", color: "#475569" }}>
            Showing {filtered.length} / {analysis.length} molds
          </div>
        </div>

        {/* Mold List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(mold => {
            const isExpanded = expandedMold === mold.moldId;
            const missingSizes = mold.sizeDetails.filter(s => s.missing);
            
            return (
              <div key={mold.moldId}
                style={{ background: "#1a1f2e", border: `1px solid ${mold.hasShortage ? "#7c2d12" : "#1e3a5f"}`, borderRadius: 8, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Row Header */}
                <div
                  onClick={() => setExpandedMold(isExpanded ? null : mold.moldId)}
                  style={{ display: "grid", gridTemplateColumns: "220px 80px 1fr 140px 120px 40px", alignItems: "center", padding: "12px 16px", cursor: "pointer", gap: 16 }}>
                  
                  {/* Mold ID */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: mold.hasShortage ? "#ef4444" : "#10b981" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{mold.moldId}</span>
                  </div>

                  {/* Coverage % */}
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: mold.coveragePercent === 100 ? "#34d399" : mold.coveragePercent > 50 ? "#fb923c" : "#f87171" }}>
                      {mold.coveragePercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ position: "relative", height: 6, background: "#0f1117", borderRadius: 3 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 3, transition: "width 0.3s",
                      width: `${mold.coveragePercent}%`,
                      background: mold.coveragePercent === 100 ? "#10b981" : mold.coveragePercent > 60 ? "#f59e0b" : "#ef4444"
                    }} />
                  </div>

                  {/* Slots */}
                  <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                    <span style={{ color: "#60a5fa" }}>{mold.slotsOnMachine}</span>
                    <span style={{ color: "#334155" }}> / </span>
                    <span>{mold.totalSizeSlots}</span>
                    <span style={{ color: "#64748b" }}> slots</span>
                  </div>

                  {/* Shortage Badge */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {mold.hasShortage ? (
                      <span style={{ background: "#7c2d12", color: "#fca5a5", padding: "3px 10px", borderRadius: 20, fontSize: "11px", fontWeight: 600 }}>
                        ⚠ {mold.shortageSlots} missing
                      </span>
                    ) : (
                      <span style={{ background: "#064e3b", color: "#6ee7b7", padding: "3px 10px", borderRadius: 20, fontSize: "11px", fontWeight: 600 }}>
                        ✓ Full coverage
                      </span>
                    )}
                  </div>

                  {/* Expand */}
                  <div style={{ color: "#475569", fontSize: "14px", textAlign: "center" }}>{isExpanded ? "▲" : "▼"}</div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #0f1117", padding: "16px" }}>
                    {/* Missing sizes alert */}
                    {missingSizes.length > 0 && (
                      <div style={{ background: "#1c0f0f", border: "1px solid #7c2d12", borderRadius: 6, padding: "10px 14px", marginBottom: 14 }}>
                        <div style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          ⚠ Size slots NOT on any machine ({missingSizes.length})
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {missingSizes.map(s => (
                            <span key={s.size} style={{ background: "#2d1515", color: "#fca5a5", border: "1px solid #7c2d12", padding: "3px 10px", borderRadius: 4, fontSize: "12px", fontFamily: "inherit" }}>
                              {s.size} <span style={{ color: "#6b2222" }}>×{s.inventoryQty}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All sizes table */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "#0f1117", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ background: "#111827", padding: "8px 12px", fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>SIZE RANGE</div>
                      <div style={{ background: "#111827", padding: "8px 12px", fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>INV QTY</div>
                      <div style={{ background: "#111827", padding: "8px 12px", fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>STATUS</div>
                      <div style={{ background: "#111827", padding: "8px 12px", fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>MACHINES</div>
                      
                      {mold.sizeDetails.map((s, i) => (
                        <>
                          <div key={`sz-${i}`} style={{ background: i % 2 === 0 ? "#161b27" : "#1a1f2e", padding: "8px 12px", fontSize: "13px", fontWeight: 600, color: s.missing ? "#fca5a5" : "#e2e8f0" }}>
                            {s.size}
                          </div>
                          <div style={{ background: i % 2 === 0 ? "#161b27" : "#1a1f2e", padding: "8px 12px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                            ×{s.inventoryQty}
                          </div>
                          <div style={{ background: i % 2 === 0 ? "#161b27" : "#1a1f2e", padding: "8px 12px" }}>
                            {s.missing ? (
                              <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>✗ NOT ON MACHINE</span>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>✓ ON MACHINE</span>
                            )}
                          </div>
                          <div style={{ background: i % 2 === 0 ? "#161b27" : "#1a1f2e", padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {s.machines.length > 0 ? s.machines.map(m => (
                              <span key={m} style={{ background: "#1e3a5f", color: "#93c5fd", padding: "1px 7px", borderRadius: 3, fontSize: "11px" }}>{m}</span>
                            )) : (
                              <span style={{ fontSize: "11px", color: "#374151" }}>—</span>
                            )}
                          </div>
                        </>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}