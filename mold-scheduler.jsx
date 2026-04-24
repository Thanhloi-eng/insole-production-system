import { useState, useMemo } from "react";

// ============================================================
// RAW MOLD DATA FROM EXCEL (OVN sheet)
// ============================================================
const MOLD_INVENTORY = {
  "OV-0256": [
    { size: "3.5#", qty: 8 },
    { size: "5#", qty: 34 },
    { size: "8#", qty: 36 },
    { size: "9.5#", qty: 34 },
    { size: "11#", qty: 20 },
    { size: "12.5#", qty: 6 },
    { size: "14#", qty: 2 },
  ],
  "OV-0358": [
    { size: "5#", qty: 12 },
    { size: "8#", qty: 15 },
    { size: "10#", qty: 18 },
    { size: "12#", qty: 14 },
  ],
  "OV-0398": [
    { size: "6#", qty: 10 },
    { size: "8#", qty: 12 },
    { size: "10#", qty: 15 },
    { size: "12#", qty: 11 },
  ],
  "OV-0378": [
    { size: "5#", qty: 8 },
    { size: "7#", qty: 10 },
    { size: "9#", qty: 12 },
    { size: "11#", qty: 9 },
  ],
};

// ============================================================
// MACHINE DATA
// ============================================================
const MACHINES = [
  { id: "M-01", name: "Machine 01", capacity: 12, status: "active" },
  { id: "M-02", name: "Machine 02", capacity: 12, status: "active" },
  { id: "M-03", name: "Machine 03", capacity: 12, status: "active" },
  { id: "M-04", name: "Machine 04", capacity: 12, status: "active" },
  { id: "M-05", name: "Machine 05", capacity: 12, status: "active" },
  // ... up to 50 machines
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `M-${String(i + 6).padStart(2, "0")}`,
    name: `Machine ${String(i + 6).padStart(2, "0")}`,
    capacity: Math.random() > 0.5 ? 12 : 32,
    status: "active",
  })),
];

// ============================================================
// PRODUCTION STAGES DATA
// ============================================================
const PRODUCTION_STAGES = {
  "After Lamination": {
    color: "#3b82f6",
    lightBg: "#dbeafe",
    darkBg: "#eff6ff",
    shortages: 28,
    pairs: "8908 pairs needed",
    moldIds: ["OV-0256", "OV-0358"],
  },
  "After Cutting": {
    color: "#f59e0b",
    lightBg: "#fef3c7",
    darkBg: "#fffbeb",
    shortages: 28,
    pairs: "284888 pairs needed",
    moldIds: ["OV-0398"],
  },
  "Molding In": {
    color: "#10b981",
    lightBg: "#d1fae5",
    darkBg: "#f0fdf4",
    shortages: 32,
    pairs: "317000 pairs needed",
    moldIds: ["OV-0378"],
  },
};

// ============================================================
// MOLD REQUIREMENTS ANALYSIS DATA
// ============================================================
const MOLD_REQUIREMENTS = [
  {
    moldId: "OV-0256",
    stage: "After Lamination",
    shortages: 17,
    pairs: 7614,
  },
  {
    moldId: "OV-0358",
    stage: "After Lamination",
    shortages: 9,
    pairs: 2911,
  },
  {
    moldId: "OV-0398",
    stage: "After Cutting",
    shortages: 12,
    pairs: 632,
  },
  {
    moldId: "OV-0378",
    stage: "Molding In",
    shortages: 7,
    pairs: 894,
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getStageColor(stage) {
  return PRODUCTION_STAGES[stage]?.color || "#64748b";
}

function getStageLabel(stage) {
  return stage;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MoldScheduler() {
  const [activeTab, setActiveTab] = useState("scheduler");
  const [expandedMold, setExpandedMold] = useState(null);

  const stats = useMemo(() => {
    const totalMolds = Object.keys(MOLD_INVENTORY).length;
    const totalOnMachines = 793; // Placeholder
    const pendingOrders = 3171;
    const requiredChanges = 88;

    return {
      totalMachines: MACHINES.length,
      moldsOnMachines: totalOnMachines,
      pendingOrders,
      requiredChanges,
    };
  }, []);

  const totalShortageSlots = useMemo(
    () =>
      Object.values(PRODUCTION_STAGES).reduce(
        (sum, stage) => sum + stage.shortages,
        0
      ),
    []
  );

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#ffffff",
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Mold Scheduling System
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "4px 0 0" }}>
            Molding Insole Production Management
          </p>
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          Thứ Bảy, 25 tháng 4, 2026
        </div>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          padding: "24px 32px",
          background: "#f9fafb",
        }}
      >
        {[
          { label: "Total Machines", value: stats.totalMachines, unit: "50 active" },
          { label: "Molds on Machines", value: stats.moldsOnMachines, unit: "3 mold types" },
          { label: "Pending Orders", value: stats.pendingOrders, unit: "1205 new orders" },
          {
            label: "Required Mold Changes",
            value: stats.requiredChanges,
            unit: "3 stages",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#1f2937",
                lineHeight: 1,
                marginTop: "12px",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}
            >
              {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          padding: "0 32px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        {[
          "Machine Overview",
          "Mold Scheduler",
          "Production Tracker",
          "Forecast",
          "Data Import",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "16px 0",
              border: "none",
              background: "transparent",
              fontSize: "14px",
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#3b82f6" : "#6b7280",
              borderBottom:
                activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>
        {activeTab === "Mold Scheduler" && (
          <>
            {/* Mold Scheduling & Requirements */}
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: "16px",
                }}
              >
                Mold Scheduling & Requirements
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {Object.entries(PRODUCTION_STAGES).map(([stage, data]) => (
                  <div
                    key={stage}
                    style={{
                      background: data.darkBg,
                      border: `1px solid ${data.lightBg}`,
                      borderRadius: "8px",
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: data.color,
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      {stage}
                    </div>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#1f2937",
                        lineHeight: 1,
                      }}
                    >
                      {data.shortages}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "8px",
                        fontWeight: 500,
                      }}
                    >
                      {data.pairs}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mold Requirements Analysis */}
            <div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: "16px",
                }}
              >
                Mold Requirements Analysis
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {MOLD_REQUIREMENTS.map((req) => (
                  <div
                    key={req.moldId}
                    onClick={() =>
                      setExpandedMold(
                        expandedMold === req.moldId ? null : req.moldId
                      )
                    }
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr auto auto",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      {/* Expand icon */}
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {expandedMold === req.moldId ? "▼" : "▶"}
                      </div>

                      {/* Mold ID & Stage */}
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1f2937",
                          }}
                        >
                          {req.moldId}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          <span
                            style={{
                              background: "#e3f2fd",
                              color: getStageColor(req.stage),
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 500,
                            }}
                          >
                            {req.stage}
                          </span>
                        </div>
                      </div>

                      {/* Right side info */}
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            ⚠ {req.shortages} size shortage
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          {req.pairs} pairs
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedMold === req.moldId && (
                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              Mold ID
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginTop: "4px",
                              }}
                            >
                              {req.moldId}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              Stage
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: getStageColor(req.stage),
                                marginTop: "4px",
                              }}
                            >
                              {req.stage}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              Size Shortage
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#dc2626",
                                marginTop: "4px",
                              }}
                            >
                              {req.shortages}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              Pairs Needed
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1f2937",
                                marginTop: "4px",
                              }}
                            >
                              {req.pairs}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "Machine Overview" && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p>Machine Overview content coming soon...</p>
          </div>
        )}

        {activeTab === "Production Tracker" && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p>Production Tracker content coming soon...</p>
          </div>
        )}

        {activeTab === "Forecast" && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p>Forecast content coming soon...</p>
          </div>
        )}

        {activeTab === "Data Import" && (
          <div
            style={{
              background: "#f9fafb",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p>Data Import content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}