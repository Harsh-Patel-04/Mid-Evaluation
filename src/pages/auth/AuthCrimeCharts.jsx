import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { supabase } from "../../lib/supabase";
Chart.register(...registerables);

const AuthCrimeCharts = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);

  useEffect(() => {
    fetchData();
  }, [selectedType, startDate, endDate]);

  const fetchData = async () => {
    try {
      // Validate date range
      let start = startDate ? new Date(startDate) : null;
      let end = endDate ? new Date(endDate) : null;

      // Swap dates if end is before start
      if (start && end && start > end) {
        [start, end] = [end, start];
        setStartDate(endDate);
        setEndDate(startDate);
      }

      let query = supabase
        .from("reports")
        .select("reported_at, crime_type")
        .order("reported_at", { ascending: true });

      if (selectedType !== "all") query = query.eq("crime_type", selectedType);
      if (start) query = query.gte("reported_at", start.toISOString());
      if (end) query = query.lte("reported_at", end.toISOString());

      const { data: crimesData, error: crimesError } = await query;

      if (crimesError) throw crimesError;

      const typeCounts = {};
      crimesData.forEach(({ crime_type }) => {
        typeCounts[crime_type] = (typeCounts[crime_type] || 0) + 1;
      });

      const dateCounts = processDateData(crimesData);
      const typeData = {
        labels: Object.keys(typeCounts),
        counts: Object.values(typeCounts),
      };

      updateCharts(dateCounts, typeData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const updateCharts = (dateData, typeData) => {
    if (barChartInstance.current) barChartInstance.current.destroy();
    if (pieChartInstance.current) pieChartInstance.current.destroy();

    createBarChart(dateData);
    createPieChart(typeData);
  };

  const processDateData = (data) => {
    const counts = {};
    data.forEach(({ reported_at }) => {
      // Use UTC to avoid timezone issues
      const date = new Date(reported_at);
      const dateString = `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
      counts[dateString] = (counts[dateString] || 0) + 1;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(counts).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      values: sortedDates.map((date) => counts[date]),
    };
  };

  // Updated FilterPanel with better CSS
  const FilterPanel = () => (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex flex-col gap-4 w-full">
        {/* Crime Type Filter - Full width */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-black mb-2">
            CRIME TYPE
          </label>
          <select
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg 
              bg-white text-gray-800 font-medium shadow-sm"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="theft">Theft</option>
            <option value="assault">Assault</option>
            <option value="vandalism">Vandalism</option>
            <option value="fraud">Fraud</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Clear Filter Button - Full width */}
        <button
          onClick={() => {
            setSelectedType("all");
            setStartDate("");
            setEndDate("");
          }}
          className="w-full h-[42px] px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 text-sm font-medium transition"
        >
          Clear Filters
        </button>

        {/* Date Range Section - Below filters */}
        <div className="w-full mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DATE RANGE
          </label>
          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Start Date
              </span>
            </div>
            <div className="flex-1">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span className="text-xs text-gray-500 mt-1 block">End Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const createBarChart = (dateData) => {
    const ctx = barChartRef.current.getContext("2d");

    if (barChartInstance.current) barChartInstance.current.destroy();

    barChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dateData.labels,
        datasets: [
          {
            label: "CRIMES PER DAY",
            data: dateData.values,
            backgroundColor: "skyblue",
            borderColor: "skyblue",
            borderWidth: 1,
            borderRadius: 8, // Rounded bars
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1f2937",
            titleFont: { weight: "bold", size: 14 },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb" },
            ticks: { color: "#6b7280" },
            title: {
              display: true,
              text: "NUMBER OF CRIMES",
              font: { weight: "bold", size: 12 },
              color: "#374151",
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: "#6b7280",
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    });
  };

  const createPieChart = (typeData) => {
    const ctx = pieChartRef.current.getContext("2d");

    if (pieChartInstance.current) pieChartInstance.current.destroy();

    pieChartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: typeData.labels,
        datasets: [
          {
            data: typeData.counts,
            backgroundColor: [
              "skyblue", // Red
              "darkblue", // Orange
              "yellow", // Yellow
              "lightgreen", // Green
              "pink", // Blue
              "#9333ea", // Purple
            ],
            borderWidth: 2,
            borderColor: "#f3f4f6",
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              font: { size: 12 },
              color: "#374151",
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "#1f2937",
            bodyFont: { size: 14 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <FilterPanel />

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wide">
            Date-wise Crime Distribution
          </h2>
          <div className="relative h-80">
            <canvas ref={barChartRef} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-bold mb-4 text-gray-800 uppercase tracking-wide">
            Crime Type Analysis
          </h2>
          <div className="relative h-80">
            <canvas ref={pieChartRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCrimeCharts;
