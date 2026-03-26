document.addEventListener("DOMContentLoaded", function () {
    const rows = Array.from(document.querySelectorAll("#surveyTable tbody .data-row"));

    const filteredCountBadge = document.getElementById("filteredCountBadge");
    const filteredCountText = document.getElementById("filteredCountText");

    const fOffice = document.getElementById("fOffice");
    const fSex = document.getElementById("fSex");
    const fClientType = document.getElementById("fClientType");
    const fAgeMin = document.getElementById("fAgeMin");
    const fAgeMax = document.getElementById("fAgeMax");
    const fFrom = document.getElementById("fFrom");
    const fTo = document.getElementById("fTo");
    const tableSearch = document.getElementById("tableSearch");

    const btnApply = document.getElementById("btnApply");
    const btnReset = document.getElementById("btnReset");
    const generateSurveyReportBtn = document.getElementById("generateSurveyReportBtn");

    const kpiTotal = document.getElementById("kpiTotal");
    const kpiAvgAge = document.getElementById("kpiAvgAge");
    const kpiOverallSQD = document.getElementById("kpiOverallSQD");
    const kpiTopOffice = document.getElementById("kpiTopOffice");
    const topClientTypeText = document.getElementById("topClientTypeText");
    const tableVisibleCount = document.getElementById("tableVisibleCount");
    const topOfficeSummary = document.getElementById("topOfficeSummary");

    const sqdLabels = ["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"];

    let sqdChart, sexChart, clientChart, officeChart;

    function normalize(v) {
        return (v || "").toString().trim().toLowerCase();
    }

    function getVisibleRows() {
        return rows.filter(r => r.style.display !== "none");
    }

    function parseRowSQDs(row) {
        const raw = row.dataset.sqds || "";
        return raw
            .split(",")
            .map(x => parseFloat(x))
            .filter(x => !isNaN(x));
    }

    function getDashboardSummary(visibleRows) {
        const total = visibleRows.length;

        let ageTotal = 0;
        let sqdGrandTotal = 0;
        let sqdValueCount = 0;

        const officeMap = {};
        const clientMap = {};

        visibleRows.forEach(r => {
            const cells = r.querySelectorAll("td");

            const office = cells[1]?.innerText.trim() || "Unknown";
            const age = parseInt(cells[2]?.innerText.trim() || "0", 10);
            const clientType = cells[4]?.innerText.trim() || "Unknown";
            const sqds = parseRowSQDs(r);

            ageTotal += age;

            sqds.forEach(v => {
                sqdGrandTotal += v;
                sqdValueCount++;
            });

            officeMap[office] = (officeMap[office] || 0) + 1;
            clientMap[clientType] = (clientMap[clientType] || 0) + 1;
        });

        const avgAge = total > 0 ? ageTotal / total : 0;
        const overallSQD = sqdValueCount > 0 ? sqdGrandTotal / sqdValueCount : 0;

        let topOffice = "N/A";
        let topOfficeCount = 0;
        Object.entries(officeMap).forEach(([office, count]) => {
            if (count > topOfficeCount) {
                topOfficeCount = count;
                topOffice = office;
            }
        });

        let topClientType = "N/A";
        let topClientCount = 0;
        Object.entries(clientMap).forEach(([clientType, count]) => {
            if (count > topClientCount) {
                topClientCount = count;
                topClientType = clientType;
            }
        });

        return {
            total,
            avgAge,
            overallSQD,
            topOffice,
            topClientType
        };
    }

    function updateKPIs(visibleRows) {
        const summary = getDashboardSummary(visibleRows);

        if (kpiTotal) kpiTotal.textContent = summary.total;
        if (kpiAvgAge) kpiAvgAge.textContent = summary.avgAge.toFixed(1);
        if (kpiOverallSQD) kpiOverallSQD.textContent = summary.overallSQD.toFixed(2);
        if (kpiTopOffice) kpiTopOffice.textContent = summary.topOffice;
        if (topClientTypeText) topClientTypeText.textContent = summary.topClientType;
        if (topOfficeSummary) topOfficeSummary.textContent = summary.topOffice;
    }

    function buildCharts(visibleRows) {
        const sqdTotals = Array(9).fill(0);
        let sqdCount = 0;

        let male = 0, female = 0, other = 0;
        const clientMap = {};
        const officeMap = {};

        visibleRows.forEach(r => {
            const cells = r.querySelectorAll("td");

            const office = cells[1]?.innerText.trim() || "Unknown";
            const sex = normalize(cells[3]?.innerText);
            const clientType = cells[4]?.innerText.trim() || "Unknown";
            const sqds = parseRowSQDs(r);

            if (sqds.length === 9) {
                for (let i = 0; i < 9; i++) {
                    sqdTotals[i] += sqds[i];
                }
                sqdCount++;
            }

            if (sex === "male") male++;
            else if (sex === "female") female++;
            else other++;

            clientMap[clientType] = (clientMap[clientType] || 0) + 1;
            officeMap[office] = (officeMap[office] || 0) + 1;
        });

        const sqdAvg = sqdTotals.map(x => sqdCount > 0 ? x / sqdCount : 0);

        const clientLabels = Object.keys(clientMap);
        const clientCounts = Object.values(clientMap);

        const sortedOffices = Object.entries(officeMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const officeDisplayMap = {
            "City Mayor's Office": "Mayor",
            "City Vice Mayor's Office": "Vice Mayor",
            "City Treasurer's Office": "Treasurer",
            "City Administrator": "Administrator",
            "City Legal Office": "Legal",
            "City Assessor's Office": "Assessor",
            "City Accounting Office": "Accounting",
            "City Agriculture Office": "Agriculture",
            "City Budget Office": "Budget",
            "City Civil Registrar's Office": "Registrar",
            "City Community Affairs Office": "Community Affairs",
            "City Cooperatives Office": "Cooperatives",
            "City Disaster Risk Reduction and Management Office": "DRRMO",
            "City Engineering Office": "Engineering",
            "City Environment and Natural Resources Office": "ENRO",
            "City General Services Office": "Gen. Services",
            "City Health Office": "Health",
            "City Hospital Systems Office": "Hospital",
            "City Permits and Licensing Office": "Permits",
            "City Personnel Office": "Personnel",
            "City Planning and Development Office": "Planning",
            "City Public Order and Safety Office": "Public Safety",
            "City Social Welfare and Development Office": "Social Welfare",
            "City Traffic Management and Transportation Office": "Traffic",
            "City Veterinary Office": "Veterinary",
            "City Sangguniang Panlungsod Office": "SP Office",
            "Kolehiyo ng Lungsod ng Lipa": "KLL",
            "Ospital ng Lipa": "Ospital"
        };

        // ✅ shorten ONLY labels (no logic changed)
        const officeLabels = sortedOffices.map(x => officeDisplayMap[x[0]] || x[0]); const officeCounts = sortedOffices.map(x => x[1]);

        if (sqdChart) sqdChart.destroy();
        if (sexChart) sexChart.destroy();
        if (clientChart) clientChart.destroy();
        if (officeChart) officeChart.destroy();

        sqdChart = new Chart(document.getElementById("sqdChart"), {
            type: "bar",
            data: {
                labels: sqdLabels,
                datasets: [{
                    label: "Average Rating",
                    data: sqdAvg,
                    backgroundColor: "rgba(124, 10, 2, 0.78)",
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        beginAtZero: true,
                        suggestedMax: 5
                    }
                }
            }
        });

        sexChart = new Chart(document.getElementById("sexChart"), {
            type: "pie",
            data: {
                labels: ["Male", "Female", "Other"],
                datasets: [{
                    data: [male, female, other],
                    backgroundColor: ["#7C0A02", "#DC2626", "#F59E0B"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        clientChart = new Chart(document.getElementById("clientChart"), {
            type: "doughnut",
            data: {
                labels: clientLabels,
                datasets: [{
                    data: clientCounts,
                    backgroundColor: [
                        "#7C0A02", "#B91C1C", "#EF4444", "#F97316",
                        "#F59E0B", "#22C55E", "#06B6D4", "#3B82F6",
                        "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        officeChart = new Chart(document.getElementById("officeChart"), {
            type: "bar",
            data: {
                labels: officeLabels,
                datasets: [{
                    label: "Responses",
                    data: officeCounts,
                    backgroundColor: "rgba(124, 10, 2, 0.78)",
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function refreshDashboard() {
        const visibleRows = getVisibleRows();
        const text = `Showing: ${visibleRows.length} / ${rows.length}`;

        if (filteredCountBadge) filteredCountBadge.textContent = text;
        if (filteredCountText) filteredCountText.textContent = text;
        if (tableVisibleCount) tableVisibleCount.textContent = visibleRows.length;

        updateKPIs(visibleRows);
        buildCharts(visibleRows);
    }

    function applyFilters() {
        const officeVal = normalize(fOffice?.value);
        const sexVal = normalize(fSex?.value);
        const clientVal = normalize(fClientType?.value);
        const searchVal = normalize(tableSearch?.value);

        const ageMin = fAgeMin?.value ? parseInt(fAgeMin.value, 10) : null;
        const ageMax = fAgeMax?.value ? parseInt(fAgeMax.value, 10) : null;

        const fromDate = fFrom?.value ? new Date(fFrom.value + "T00:00:00") : null;
        const toDate = fTo?.value ? new Date(fTo.value + "T23:59:59") : null;

        rows.forEach(r => {
            const rOffice = normalize(r.dataset.office);
            const rSex = normalize(r.dataset.sex);
            const rClient = normalize(r.dataset.client);
            const rAge = parseInt(r.dataset.age || "0", 10);

            const rDateStr = r.dataset.date || "";
            const rDate = rDateStr ? new Date(rDateStr + "T12:00:00") : null;
            const rowText = normalize(r.innerText);

            let ok = true;

            if (officeVal && rOffice !== officeVal) ok = false;

            if (sexVal) {
                if (sexVal === "other") {
                    if (rSex === "male" || rSex === "female") ok = false;
                } else if (rSex !== sexVal) {
                    ok = false;
                }
            }

            if (clientVal && rClient !== clientVal) ok = false;
            if (ageMin !== null && rAge < ageMin) ok = false;
            if (ageMax !== null && rAge > ageMax) ok = false;
            if (fromDate && rDate && rDate < fromDate) ok = false;
            if (toDate && rDate && rDate > toDate) ok = false;
            if (searchVal && !rowText.includes(searchVal)) ok = false;

            r.style.display = ok ? "" : "none";
        });

        refreshDashboard();
    }

    function resetFilters() {
        if (fOffice) fOffice.value = "";
        if (fSex) fSex.value = "";
        if (fClientType) fClientType.value = "";
        if (fAgeMin) fAgeMin.value = "";
        if (fAgeMax) fAgeMax.value = "";
        if (fFrom) fFrom.value = "";
        if (fTo) fTo.value = "";
        if (tableSearch) tableSearch.value = "";

        rows.forEach(r => r.style.display = "");
        refreshDashboard();
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

    function formatPrettyDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function formatDateRange(from, to) {
        if (from && to) return `${formatPrettyDate(from)} - ${formatPrettyDate(to)}`;
        if (from) return `From ${formatPrettyDate(from)}`;
        if (to) return `Until ${formatPrettyDate(to)}`;
        return "All Dates";
    }

    async function generateSurveyPdf() {
        const visibleRows = getVisibleRows();

        if (visibleRows.length === 0) {
            alert("No visible survey records to export.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const logoBase64 = await loadImageAsBase64("/images/logo.png");
        const summary = getDashboardSummary(visibleRows);

        const officeValue = fOffice?.value || "All Offices";
        const sexValue = fSex?.value || "All";
        const clientTypeValue = fClientType?.value || "All";
        const dateRangeText = formatDateRange(fFrom?.value || "", fTo?.value || "");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        function addHeader() {
            if (logoBase64) {
                doc.addImage(logoBase64, "PNG", 14, 10, 16, 16);
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Survey Results Report", 35, 16);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("Lipa City Anti-Red Tape Authority", 35, 22);

            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.3);
            doc.line(14, 30, pageWidth - 14, 30);
        }

        function addFooter() {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text(`Generated on ${new Date().toLocaleString()}`, 14, pageHeight - 7);
            doc.text("Page 1", pageWidth - 14, pageHeight - 7, { align: "right" });
        }

        function addSectionTitle(text, y) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(text, 14, y);
            return y + 7;
        }

        function addParagraph(text, y, maxWidth = 182) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, 14, y);
            return y + (lines.length * 5);
        }

        function addInfoLine(label, value, y) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, 14, y);

            doc.setFont("helvetica", "normal");
            doc.text(String(value), 50, y);
            return y + 6;
        }

        function getSexBreakdown(rows) {
            let male = 0, female = 0, other = 0;

            rows.forEach(r => {
                const sex = normalize(r.dataset.sex);
                if (sex === "male") male++;
                else if (sex === "female") female++;
                else other++;
            });

            const total = rows.length || 1;

            return {
                male,
                female,
                other,
                malePct: ((male / total) * 100).toFixed(1),
                femalePct: ((female / total) * 100).toFixed(1),
                otherPct: ((other / total) * 100).toFixed(1)
            };
        }

        function getSQDAverages(rows) {
            const totals = Array(9).fill(0);
            let count = 0;

            rows.forEach(r => {
                const sqds = parseRowSQDs(r);

                if (sqds.length === 9) {
                    for (let i = 0; i < 9; i++) {
                        totals[i] += sqds[i];
                    }
                    count++;
                }
            });

            return totals.map(v => count > 0 ? v / count : 0);
        }

        function getTopItems(rows, cellIndex) {
            const map = {};

            rows.forEach(r => {
                const value = r.querySelectorAll("td")[cellIndex]?.innerText.trim() || "Unknown";
                map[value] = (map[value] || 0) + 1;
            });

            return Object.entries(map).sort((a, b) => b[1] - a[1]);
        }

        const sexStats = getSexBreakdown(visibleRows);
        const sqdAvg = getSQDAverages(visibleRows);
        const topOffices = getTopItems(visibleRows, 1);
        const topClientTypes = getTopItems(visibleRows, 4);

        const highestSQD = sqdAvg
            .map((v, i) => ({ label: `SQD${i}`, value: v }))
            .sort((a, b) => b.value - a.value)[0];

        const lowestSQD = sqdAvg
            .map((v, i) => ({ label: `SQD${i}`, value: v }))
            .sort((a, b) => a.value - b.value)[0];

        addHeader();

        let y = 40;

        y = addSectionTitle("Report Overview", y);

        const overviewText =
            "This report summarizes the survey responses collected based on the selected filters. It presents the respondent profile, service quality results, and major response patterns for administrative review.";

        y = addParagraph(overviewText, y);
        y += 4;

        y = addInfoLine("Office Scope:", officeValue, y);
        y = addInfoLine("Sex Filter:", sexValue, y);
        y = addInfoLine("Client Type:", clientTypeValue, y);
        y = addInfoLine("Date Coverage:", dateRangeText, y);

        y += 4;
        y = addSectionTitle("Key Metrics", y);

        y = addInfoLine("Total Responses:", summary.total, y);
        y = addInfoLine("Average Age:", summary.avgAge.toFixed(1), y);
        y = addInfoLine("Overall SQD:", summary.overallSQD.toFixed(2), y);
        y = addInfoLine("Top Office:", topOffices[0]?.[0] || "N/A", y);

        y += 4;
        y = addSectionTitle("Key Findings", y);

        const findings1 =
            `A total of ${summary.total} responses were included in the report. The average age of respondents was ${summary.avgAge.toFixed(1)} years.`;

        y = addParagraph(findings1, y);
        y += 2;

        const findings2 =
            `${sexStats.male} (${sexStats.malePct}%) were male, ${sexStats.female} (${sexStats.femalePct}%) were female, and ${sexStats.other} (${sexStats.otherPct}%) were classified as other or unspecified.`;

        y = addParagraph(findings2, y);
        y += 2;

        const findings3 =
            `The overall SQD average was ${summary.overallSQD.toFixed(2)}. The highest-rated dimension was ${highestSQD.label} (${highestSQD.value.toFixed(2)}), while the lowest-rated dimension was ${lowestSQD.label} (${lowestSQD.value.toFixed(2)}).`;

        y = addParagraph(findings3, y);
        y += 2;

        const findings4 =
            `The office with the highest response count was ${topOffices[0]?.[0] || "N/A"}, while the most common client type was ${topClientTypes[0]?.[0] || "N/A"}.`;

        y = addParagraph(findings4, y);

        addFooter();

        const fileDate = new Date().toISOString().slice(0, 10);
        doc.save(`LIPACITY_Survey_Report_${fileDate}.pdf`);
    }
    if (btnApply) btnApply.addEventListener("click", applyFilters);
    if (btnReset) btnReset.addEventListener("click", resetFilters);
    if (tableSearch) tableSearch.addEventListener("input", applyFilters);
    if (generateSurveyReportBtn) generateSurveyReportBtn.addEventListener("click", generateSurveyPdf);

    refreshDashboard();
});
