document.addEventListener("DOMContentLoaded", function () {

    const readJson = (id) => {
        const el = document.getElementById(id);
        return el ? JSON.parse(el.textContent) : [];
    };

    const offices = readJson("officesJson");
    const satisfaction = readJson("officeSatJson");
    const complaints = readJson("officeCmpJson");

    const trendLabels = readJson("trendLabelsJson");

    const trendSat = readJson("trendSatJson");
    const trendCmp = readJson("trendCmpJson");

    const sqdLabels = readJson("sqdLabelsJson");

    const sqdMeaningMap = {
        "SQD0": "I am satisfied with the service that I availed.",
        "SQD1": "I spent a reasonable amount of time for my transaction.",
        "SQD2": "The office followed the transaction's requirements and steps based on the information provided.",
        "SQD3": "The steps (including payment) I needed to do for my transaction were easy and simple.",
        "SQD4": "I easily found information about my transaction from the office or its website.",
        "SQD5": "I paid a reasonable amount of fees for my transaction.",
        "SQD6": "I feel the office was fair to everyone, or walang palakasan, during my transaction.",
        "SQD7": "I was treated courteously by the staff, and if asked for help, the staff was helpful.",
        "SQD8": "I got what I needed from the government office, or if denied, denial of request was sufficiently explained to me."
    };

    const sqdShortLabels = {
        "SQD0": "Overall Satisfaction",
        "SQD1": "Reasonable Time",
        "SQD2": "Requirements Followed",
        "SQD3": "Easy Process",
        "SQD4": "Easy to Find Info",
        "SQD5": "Reasonable Fees",
        "SQD6": "Fair Treatment",
        "SQD7": "Staff Courtesy",
        "SQD8": "Service Outcome"
    };

    const sqdScores = readJson("sqdScoresJson");
    const formattedSqdLabels = sqdLabels.map(code => sqdShortLabels[code] || code);

    const topOffices = readJson("topOfficesJson");
    const bottomOffices = readJson("bottomOfficesJson");
    const lowestQuestions = readJson("lowestQuestionsJson");
    const reportMeta = readJson("reportMetaJson");

    const generateAnalyticsReportBtn = document.getElementById("generateAnalyticsReportBtn");
    const applyFiltersBtn = document.getElementById("applyFiltersBtn");
    const analyticsFilterForm = document.getElementById("analyticsFilterForm");

    if (applyFiltersBtn && analyticsFilterForm) {
        applyFiltersBtn.addEventListener("click", function () {
            analyticsFilterForm.requestSubmit();
        });
    }

    const trendCanvas = document.getElementById("trendChart");

    if (trendCanvas) {
        new Chart(trendCanvas, {
            type: "line",
            data: {
                labels: trendLabels,
                datasets: [
                    {
                        label: "Avg Satisfaction",
                        data: trendSat,
                        borderColor: "#f59e0b",
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        tension: 0.35,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "Complaints",
                        data: trendCmp,
                        borderColor: "#7c0a02",
                        backgroundColor: "rgba(124, 10, 2, 0.12)",
                        tension: 0.35,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.dataset.label === "Avg Satisfaction") {
                                    return `Satisfaction: ${Number(context.raw).toFixed(2)}`;
                                }
                                return `Complaints: ${context.raw}`;
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 5,
                            maxRotation: 0,
                            minRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    const officeCanvas = document.getElementById("officeChart");

    if (officeCanvas) {
        const officeDisplayLabels = offices.map(name => {
            const map = {
                "City Mayor's Office": "Mayor",
                "City Vice Mayor's Office": "Vice Mayor",
                "City Treasurer's Office": "Treasurer",
                "City Administrator": "Administrator",
                "City Legal Office": "Legal",
                "City Assessor's Office": "Assessor",
                "City Accounting Office": "Accounting",
                "City Agriculture Office": "Agri",
                "City Civil Registrar's Office": "Registrar",
                "City Community Affairs Office": "Community Affairs",
                "City Cooperatives Office": "Coop",
                "City Disaster Risk Reduction and Management Office": "DRRMO",
                "City Engineering Office": "Engineering",
                "City Environment and Natural Resources Office": "CENRO",
                "City General Services Office": "Gen. Services",
                "City Health Office": "Health",
                "City Hospital Systems Office": "Hospital",
                "City Permits and Licensing Office": "Permits & Licensing",
                "City Personnel Office": "Personnel",
                "City Planning and Development Office": "Planning & Dev.",
                "City Public Order and Safety Office": "Public Safety",
                "City Social Welfare and Development Office": "SWDO",
                "City Traffic Management and Transportation Office": "Traffic Mgmt",
                "City Veterinary Office": "Veterinary",
                "City Sangguniang Panlungsod Office": "Sangguniang",
                "Kolehiyo ng Lungsod ng Lipa": "KLL",
                "Ospital ng Lipa": "Ospital"
            };

            return map[name] || name;
        });

        new Chart(officeCanvas, {
            type: "bar",
            data: {
                labels: officeDisplayLabels,
                datasets: [
                    {
                        label: "Complaints",
                        data: complaints,
                        backgroundColor: "rgba(124, 10, 2, 0.8)",
                        borderRadius: 8,
                        barPercentage: 0.5,
                        categoryPercentage: 0.6
                    },
                    {
                        label: "Satisfaction (1–5)",
                        data: satisfaction,
                        backgroundColor: "rgba(245, 158, 11, 0.8)",
                        borderRadius: 8,
                        barPercentage: 0.5,
                        categoryPercentage: 0.6
                    }
                ]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            boxWidth: 14,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                const index = tooltipItems[0].dataIndex;
                                return offices[index];
                            },
                            label: function (context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        suggestedMax: 5,
                        grid: {
                            color: "rgba(0,0,0,0.08)"
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    const sqdCanvas = document.getElementById("sqdChart");

    if (sqdCanvas) {
        new Chart(sqdCanvas, {
            type: "bar",
            data: {
                labels: formattedSqdLabels,
                datasets: [
                    {
                        label: "Average Score",
                        data: sqdScores,
                        backgroundColor: "rgba(245,158,11,0.75)",
                        borderColor: "rgba(245,158,11,1)",
                        borderWidth: 1,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                const index = tooltipItems[0].dataIndex;
                                const code = sqdLabels[index];
                                return code;
                            },
                            label: function (context) {
                                const code = sqdLabels[context.dataIndex];
                                const question = sqdMeaningMap[code] || code;
                                return [
                                    question,
                                    `Average Score: ${Number(context.raw).toFixed(2)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    async function loadImageAsBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    }

    function getProp(obj, pascalName, camelName) {
        if (!obj) return null;
        if (obj[pascalName] !== undefined && obj[pascalName] !== null) return obj[pascalName];
        if (obj[camelName] !== undefined && obj[camelName] !== null) return obj[camelName];
        return null;
    }

    async function generateAnalyticsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const logoBase64 = await loadImageAsBase64("/images/logo.png");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - (margin * 2);

        const selectedOffice = reportMeta.selectedOffice || "All Offices";
        const fromText = reportMeta.fromText || "All Dates";
        const toText = reportMeta.toText || "";
        const totalSurveys = Number(reportMeta.totalSurveys || 0);
        const totalComplaints = Number(reportMeta.totalComplaints || 0);
        const avgSatisfaction = Number(reportMeta.avgSatisfaction || 0).toFixed(2);

        const bestOffice = topOffices.length > 0 ? topOffices[0] : null;
        const weakestOffice = bottomOffices.length > 0 ? bottomOffices[0] : null;
        const lowestQuestion = lowestQuestions.length > 0 ? lowestQuestions[0] : null;

        const bestOfficeName = bestOffice ? (getProp(bestOffice, "Office", "office") || "N/A") : "N/A";
        const weakestOfficeName = weakestOffice ? (getProp(weakestOffice, "Office", "office") || "N/A") : "N/A";
        const lowestQuestionName = lowestQuestion ? (getProp(lowestQuestion, "Question", "question") || "N/A") : "N/A";
        const lowestQuestionScore = lowestQuestion ? Number(getProp(lowestQuestion, "Score", "score") || 0).toFixed(2) : "0.00";

        function formatDateCoverage(from, to) {
            if (!from && !to) return "All Dates";
            if (from && to) return `${from} - ${to}`;
            return from || to || "All Dates";
        }

        function ensureSpace(currentY, neededHeight = 10) {
            if (currentY + neededHeight > pageHeight - 18) {
                addFooter(doc.getNumberOfPages());
                doc.addPage();
                drawHeader();
                return 48;
            }
            return currentY;
        }

        function drawHeader() {
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, 40, "F");

            if (logoBase64) {
                doc.addImage(logoBase64, "PNG", margin, 10, 16, 16);
            }

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(17);
            doc.text("Analytics Performance Report", margin + 20, 18);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            doc.text("Lipa City Anti-Red Tape Authority", margin + 20, 25);

            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.35);
            doc.line(margin, 32, pageWidth - margin, 32);
        }

        function addFooter(pageNo) {
            doc.setDrawColor(210, 210, 210);
            doc.setLineWidth(0.2);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(90, 90, 90);
            doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 7);
            doc.text(`Page ${pageNo}`, pageWidth - margin, pageHeight - 7, { align: "right" });

            doc.setTextColor(0, 0, 0);
        }

        function addSectionTitle(title, y) {
            y = ensureSpace(y, 10);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(0, 0, 0);
            doc.text(title, margin, y);
            return y + 8;
        }

        function addParagraph(text, y, width = contentWidth) {
            y = ensureSpace(y, 12);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            doc.setTextColor(20, 20, 20);

            const lines = doc.splitTextToSize(text, width);
            doc.text(lines, margin, y);
            return y + (lines.length * 5.2);
        }

        function drawInfoRow(label, value, y) {
            y = ensureSpace(y, 8);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.text(label, margin, y);

            doc.setFont("helvetica", "normal");
            doc.text(String(value || "N/A"), margin + 40, y);

            return y + 7;
        }

        drawHeader();

        let y = 46;

        y = addSectionTitle("Report Overview", y);

        const overviewText =
            "This report summarizes the analytics results collected based on the selected filters. It presents the performance indicators, service quality results, complaint trends, and major response patterns for administrative review.";

        y = addParagraph(overviewText, y);
        y += 6;

        y = drawInfoRow("Office Scope:", selectedOffice, y);
        y = drawInfoRow("Date Coverage:", formatDateCoverage(fromText, toText), y);
        y += 4;

        y = addSectionTitle("Key Metrics", y);

        y = drawInfoRow("Total Surveys:", totalSurveys, y);
        y = drawInfoRow("Total Complaints:", totalComplaints, y);
        y = drawInfoRow("Average Satisfaction:", avgSatisfaction, y);
        y = drawInfoRow("Top Office:", bestOfficeName, y);
        y += 4;

        y = addSectionTitle("Key Findings", y);

        const findings1 =
            `A total of ${totalSurveys} survey records and ${totalComplaints} complaint records were included in this report. The average satisfaction score across the selected scope was ${avgSatisfaction}.`;

        y = addParagraph(findings1, y);
        y += 3;

        const findings2 =
            bestOffice && weakestOffice
                ? `${bestOfficeName} recorded the highest office satisfaction score, while ${weakestOfficeName} recorded the lowest among ranked offices.`
                : "Office comparison data was not sufficient to produce a complete ranking across offices.";

        y = addParagraph(findings2, y);
        y += 3;

        const findings3 =
            lowestQuestion
                ? `The lowest-rated service quality dimension was ${lowestQuestionName} with an average score of ${lowestQuestionScore}. This may indicate an area that requires closer operational review and improvement.`
                : "No low-performing service quality dimension could be identified from the current filtered dataset.";

        y = addParagraph(findings3, y);
        y += 3;

        const findings4 =
            totalComplaints > 0
                ? "Complaint volume should be interpreted together with satisfaction results to better understand current service conditions and possible improvement priorities."
                : "No complaint records were included in the selected scope, which may suggest low complaint incidence or limited complaint data for the chosen filters.";

        y = addParagraph(findings4, y);

        addFooter(1);

        doc.addPage();
        drawHeader();
        y = 46;

        y = addSectionTitle("Interpretation", y);

        const interpretationText =
            "The analytics results provide a consolidated view of service performance for the selected office scope and reporting period. Higher satisfaction scores may reflect stronger service delivery and better client experience, while low-rated dimensions may point to procedural delays, communication gaps, or service inefficiencies. Complaint counts should be reviewed together with survey results to support balanced performance assessment.";

        y = addParagraph(interpretationText, y);
        y += 6;

        y = addSectionTitle("Recommendations", y);

        const recommendations = [
            "Review offices with lower satisfaction performance and compare them against complaint volume for possible operational issues.",
            "Prioritize the lowest-rated service quality indicator and determine whether process, communication, or staffing improvements are needed.",
            "Use recurring analytics reports to monitor whether service quality is improving over time.",
            "Discuss office-level findings during administrative review meetings to identify best practices and improvement targets.",
            "Maintain consistent report filters and reporting periods to support clearer trend comparison."
        ];

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);

        recommendations.forEach((rec) => {
            y = ensureSpace(y, 10);
            const lines = doc.splitTextToSize(`• ${rec}`, contentWidth - 4);
            doc.text(lines, margin, y);
            y += (lines.length * 5.2) + 2;
        });

        y += 2;
        y = addSectionTitle("Summary", y);

        const summaryText =
            "Overall, this analytics report provides a concise presentation of survey performance, complaint volume, office comparison, and service quality patterns. It may be used as a reference for decision-making, operational review, and routine administrative reporting.";

        y = addParagraph(summaryText, y);

        addFooter(2);

        doc.addPage();
        drawHeader();
        y = 46;

        y = addSectionTitle("Appendix A. Office Performance", y);

        const officeTable = [];
        const maxRows = Math.max(topOffices.length, bottomOffices.length);

        for (let i = 0; i < maxRows; i++) {
            const topItem = topOffices[i];
            const bottomItem = bottomOffices[i];

            officeTable.push([
                topItem ? (getProp(topItem, "Office", "office") || "") : "",
                topItem ? Number(getProp(topItem, "Score", "score") || 0).toFixed(2) : "",
                bottomItem ? (getProp(bottomItem, "Office", "office") || "") : "",
                bottomItem ? Number(getProp(bottomItem, "Score", "score") || 0).toFixed(2) : ""
            ]);
        }

        doc.autoTable({
            startY: y,
            head: [["Top Office", "Score", "Lowest Office", "Score"]],
            body: officeTable.length ? officeTable : [["No data available", "", "", ""]],
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 3,
                textColor: [30, 30, 30],
                lineColor: [210, 210, 210],
                lineWidth: 0.2
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: "bold"
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            margin: { left: margin, right: margin }
        });

        y = doc.lastAutoTable.finalY + 10;
        y = ensureSpace(y, 20);

        y = addSectionTitle("Appendix B. Lowest Service Quality Indicators", y);

        doc.autoTable({
            startY: y,
            head: [["Question / Indicator", "Average Score"]],
            body: lowestQuestions.length
                ? lowestQuestions.map(x => [
                    getProp(x, "Question", "question") || "",
                    Number(getProp(x, "Score", "score") || 0).toFixed(2)
                ])
                : [["No data available", ""]],
            theme: "grid",
            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 3,
                textColor: [30, 30, 30],
                lineColor: [210, 210, 210],
                lineWidth: 0.2
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: "bold"
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            margin: { left: margin, right: margin }
        });

        addFooter(3);

        const fileDate = new Date().toISOString().slice(0, 10);
        doc.save(`ARTA_Analytics_Report_${fileDate}.pdf`);
    }

    if (generateAnalyticsReportBtn) {
        generateAnalyticsReportBtn.addEventListener("click", generateAnalyticsPdf);
    }
});
