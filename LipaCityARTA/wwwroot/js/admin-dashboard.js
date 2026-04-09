document.addEventListener("DOMContentLoaded", () => {
    if (typeof Chart === "undefined") {
        console.error("Chart.js did not load.");
        return;
    }

    const readJson = (id) => {
        const el = document.getElementById(id);
        return el ? JSON.parse(el.textContent) : [];
    };

    const sqdLabels = ["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"];
    const sqdAverages = readJson("sqdJson");

    const trendLabels = readJson("trendLabelsJson"); 
    const trendCounts = readJson("trendCountsJson");

    const officeLabels = readJson("officeLabelsJson");
    const officeCounts = readJson("officeCountsJson");

    const avgEl = document.getElementById("avgSQDChart");
    const trendEl = document.getElementById("trendChart");
    const officeEl = document.getElementById("officePieChart");

    if (!avgEl || !trendEl || !officeEl) return;

    new Chart(avgEl, {
        type: "bar",
        data: {
            labels: sqdLabels,
            datasets: [{
                data: sqdAverages,
                backgroundColor: "rgba(124, 10, 2, 0.75)",
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    new Chart(trendEl, {
        type: "line",
        data: {
            labels: trendLabels,
            datasets: [{
                label: "Survey Submissions",
                data: trendCounts,
                borderColor: "#7C0A02",
                backgroundColor: "rgba(124, 10, 2, 0.12)",
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 800,
                easing: "easeOutQuart"
            },

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: true,
                    position: "top"
                }
            },

            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        minRotation: 0,
                        font: {
                            size: 11
                        }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });

    const total = officeCounts.reduce((a, b) => a + b, 0);

    if (!officeLabels.length || total === 0) {
        const ctx = officeEl.getContext("2d");
        ctx.clearRect(0, 0, officeEl.width, officeEl.height);
        ctx.font = "600 18px system-ui";
        ctx.fillStyle = "#6b7280";
        ctx.fillText("No office data available.", 20, 40);
        return;
    }

    const palette = [
        "#7C0A02", "#B91C1C", "#EF4444", "#F97316",
        "#F59E0B", "#22C55E", "#06B6D4", "#3B82F6",
        "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6"
    ];

    const colors = officeLabels.map((_, i) => palette[i % palette.length]);

    const centerTextPlugin = {
        id: "centerTextPlugin",
        afterDraw(chart) {
            const meta = chart.getDatasetMeta(0);
            if (!meta?.data?.length) return;

            const { ctx } = chart;
            const x = meta.data[0].x;
            const y = meta.data[0].y;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.font = "600 12px system-ui";
            ctx.fillStyle = "#6b7280";
            ctx.fillText("TOTAL", x, y - 12);

            ctx.font = "800 26px system-ui";
            ctx.fillStyle = "#111827";
            ctx.fillText(String(total), x, y + 14);

            ctx.restore();
        }
    };

    new Chart(officeEl, {
        type: "doughnut",
        data: {
            labels: officeLabels,
            datasets: [{
                data: officeCounts,
                backgroundColor: colors,
                borderColor: "#ffffff",
                borderWidth: 4,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        boxWidth: 14,
                        padding: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            const val = ctx.raw || 0;
                            const pct = (val / total) * 100;
                            return ` ${ctx.label}: ${val} (${pct.toFixed(1)}%)`;
                        }
                    }
                }
            }
        },
        plugins: [centerTextPlugin]
    });

});