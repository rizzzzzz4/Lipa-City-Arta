document.addEventListener("DOMContentLoaded", function () {

    const surveyData = JSON.parse(document.getElementById("surveyData").textContent);

    const kpiTotal = document.getElementById("kpiTotal");
    const kpiAvgAge = document.getElementById("kpiAvgAge");
    const kpiOverallSQD = document.getElementById("kpiOverallSQD");
    const kpiTopOffice = document.getElementById("kpiTopOffice");

    const sqdLabels = ["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"];

    let sqdChart, sexChart, clientChart, officeChart;

    function normalize(v) {
        return (v || "").toLowerCase().trim();
    }

    function createGradient(ctx, c1, c2) {
        const g = ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        return g;
    }

    // ✅ FIXED (MISSING FUNCTION)
    function getBase64Image(imgUrl, callback) {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            const dataURL = canvas.toDataURL("image/png");
            callback(dataURL);
        };

        img.onerror = function () {
            alert("Logo failed to load. Check /images/logo.png");
        };

        img.src = imgUrl;
    }

    function getFilteredData() {
        const from = document.querySelector("input[name='dateFrom']").value;
        const to = document.querySelector("input[name='dateTo']").value;
        const office = document.querySelector("select[name='office']").value;

        return surveyData.filter(s => {
            const d = new Date(s.date);
            if (isNaN(d)) return false;

            if (from && d < new Date(from)) return false;

            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                if (d > end) return false;
            }

            if (office && normalize(s.office) !== normalize(office)) return false;

            return true;
        });
    }

    function compute(data) {
        const total = data.length;
        let ageTotal = 0;
        let sqdTotals = Array(9).fill(0);

        const officeMap = {}, clientMap = {}, sexMap = { male: 0, female: 0, other: 0 };

        data.forEach(s => {
            ageTotal += Number(s.age) || 0;

            for (let i = 0; i < 9; i++) {
                sqdTotals[i] += Number(s["sqd" + i]) || 0;
            }

            officeMap[s.office] = (officeMap[s.office] || 0) + 1;
            clientMap[s.client] = (clientMap[s.client] || 0) + 1;

            const sex = normalize(s.sex);
            if (sex === "male") sexMap.male++;
            else if (sex === "female") sexMap.female++;
            else sexMap.other++;
        });

        return {
            total,
            avgAge: total ? ageTotal / total : 0,
            overallSQD: total ? sqdTotals.reduce((a, b) => a + b, 0) / (total * 9) : 0,
            sqdAvg: sqdTotals.map(x => total ? x / total : 0),
            officeMap,
            clientMap,
            sexMap
        };
    }

    function buildCharts() {

        let filtered = getFilteredData();
        if (!filtered.length) filtered = surveyData;

        const data = compute(filtered);

        kpiTotal.textContent = data.total;
        kpiAvgAge.textContent = data.avgAge.toFixed(1);
        kpiOverallSQD.textContent = data.overallSQD.toFixed(2);

        let top = "-", max = 0;
        Object.entries(data.officeMap).forEach(([k, v]) => {
            if (v > max) { max = v; top = k; }
        });
        kpiTopOffice.textContent = top;

        if (sqdChart) sqdChart.destroy();
        if (sexChart) sexChart.destroy();
        if (clientChart) clientChart.destroy();
        if (officeChart) officeChart.destroy();

        const sqdCtx = document.getElementById("sqdChart").getContext("2d");

        sqdChart = new Chart(sqdCtx, {
            type: "bar",
            data: {
                labels: sqdLabels,
                datasets: [{
                    label: "SQD Average",
                    data: data.sqdAvg,
                    backgroundColor: createGradient(sqdCtx, "#7C0A02", "#DC2626"),
                    borderRadius: 8,
                    barThickness: 40
                }]
            }
        });

        sexChart = new Chart(document.getElementById("sexChart"), {
            type: "pie",
            data: {
                labels: ["Male", "Female", "Other"],
                datasets: [{ data: Object.values(data.sexMap) }]
            }
        });

        clientChart = new Chart(document.getElementById("clientChart"), {
            type: "doughnut",
            data: {
                labels: Object.keys(data.clientMap),
                datasets: [{ data: Object.values(data.clientMap) }]
            }
        });

        const officeCtx = document.getElementById("officeChart").getContext("2d");

        officeChart = new Chart(officeCtx, {
            type: "bar",
            data: {
                labels: Object.keys(data.officeMap),
                datasets: [{
                    label: "Office Responses",
                    data: Object.values(data.officeMap),
                    backgroundColor: createGradient(officeCtx, "#7C0A02", "#F97316"),
                    borderRadius: 6
                }]
            },
            options: { indexAxis: 'y' }
        });
    }

    document.getElementById("applyBtn").addEventListener("click", buildCharts);

    buildCharts();

    const generateBtn = document.getElementById("generateSurveyReportBtn");

    if (generateBtn) {
        generateBtn.addEventListener("click", function () {

            if (!window.jspdf) {
                alert("jsPDF not loaded!");
                return;
            }

            const { jsPDF } = window.jspdf;

            let data = getFilteredData();
            if (!data.length) data = surveyData;

            const computed = compute(data);

            getBase64Image("/images/logo.png", function (logoBase64) {

                const doc = new jsPDF();
                let y = 15;

                // =========================
                // HEADER + LOGO
                // =========================
                doc.addImage(logoBase64, "PNG", 14, 10, 25, 25);

                doc.setFontSize(18);
                doc.text("Analytics Performance Report", 45, 18);

                doc.setFontSize(11);
                doc.text("Lipa City Anti-Red Tape Authority", 45, 24);

                y = 40;

                doc.setFontSize(10);
                doc.text("Generated: " + new Date().toLocaleString(), 14, y);

                y += 10;

                // =========================
                // KEY METRICS
                // =========================
                doc.setFontSize(12);
                doc.setFont(undefined, "bold");
                doc.text("Key Metrics", 14, y);

                y += 6;

                doc.setFont(undefined, "normal");
                doc.setFontSize(11);

                doc.text(`Total Responses: ${computed.total}`, 14, y); y += 6;
                doc.text(`Average Age: ${computed.avgAge.toFixed(1)}`, 14, y); y += 6;
                doc.text(`Overall SQD: ${computed.overallSQD.toFixed(2)}`, 14, y);

                y += 10;

                // =========================
                // KEY FINDINGS
                // =========================
                doc.setFont(undefined, "bold");
                doc.text("Key Findings", 14, y);

                y += 6;

                doc.setFont(undefined, "normal");

                let findings = [];

                findings.push(`A total of ${computed.total} survey responses were analyzed.`);
                findings.push(`The overall satisfaction score is ${computed.overallSQD.toFixed(2)}.`);

                let topOffice = "-", max = 0;
                Object.entries(computed.officeMap).forEach(([k, v]) => {
                    if (v > max) { max = v; topOffice = k; }
                });

                findings.push(`The office with the highest responses is ${topOffice}.`);

                findings.forEach(f => {
                    doc.text("• " + f, 14, y);
                    y += 6;
                });

                y += 5;

                // =========================
                // PAGE 1 → SUMMARY TABLE
                // =========================
                const officeSummary = {};

                data.forEach(s => {
                    if (!officeSummary[s.office]) {
                        officeSummary[s.office] = {
                            count: 0,
                            totalSQD: 0
                        };
                    }

                    const avg =
                        (s.sqd0 + s.sqd1 + s.sqd2 + s.sqd3 +
                            s.sqd4 + s.sqd5 + s.sqd6 + s.sqd7 + s.sqd8) / 9;

                    officeSummary[s.office].count++;
                    officeSummary[s.office].totalSQD += avg;
                });

                const summaryData = Object.entries(officeSummary).map(([office, val]) => {
                    return [
                        office,
                        val.count,
                        (val.totalSQD / val.count).toFixed(2)
                    ];
                });

                doc.autoTable({
                    startY: y,
                    head: [["Office", "Responses", "Avg SQD"]],
                    body: summaryData,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [124, 10, 2] }
                });

                // =========================
                // PAGE 2 → DETAILED TABLE
                // =========================
                doc.addPage();

                doc.setFontSize(14);
                doc.text("Detailed Survey Records", 14, 15);

                const detailedData = data
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(s => {

                        const avg =
                            (s.sqd0 + s.sqd1 + s.sqd2 + s.sqd3 +
                                s.sqd4 + s.sqd5 + s.sqd6 + s.sqd7 + s.sqd8) / 9;

                        return [
                            s.office,
                            s.age,
                            s.sex,
                            avg.toFixed(2),
                            s.date
                        ];
                    });

                doc.autoTable({
                    startY: 25,
                    head: [["Office", "Age", "Sex", "SQD Avg", "Date"]],
                    body: detailedData,
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [124, 10, 2] }
                });

                // =========================
                // SAVE PDF
                // =========================
                doc.save("ARTA_Survey_Report.pdf");

            });
        });
    }
});