document.addEventListener("DOMContentLoaded", function () {
    const search = document.getElementById("complaintSearch");
    const filterOffice = document.getElementById("filterOffice");
    const filterClient = document.getElementById("filterClient");
    const filterFromDate = document.getElementById("filterFromDate");
    const filterToDate = document.getElementById("filterToDate");

    const applyFiltersBtn = document.getElementById("applyFiltersBtn");
    const generateReportBtn = document.getElementById("generateReportBtn");

    const tabButtons = document.querySelectorAll(".c-tab-btn");
    const tabPanels = document.querySelectorAll(".c-tab-panel");

    const modal = document.getElementById("complaintModal");
    const closeModalBtn = document.getElementById("closeComplaintModal");

    const workflowModal = document.getElementById("workflowModal");
    const closeWorkflowModal = document.getElementById("closeWorkflowModal");
    const cancelWorkflowModal = document.getElementById("cancelWorkflowModal");
    const workflowForm = document.getElementById("workflowForm");

    const mTrackingId = document.getElementById("mTrackingId");
    const mOffice = document.getElementById("mOffice");
    const mClientType = document.getElementById("mClientType");
    const mEmail = document.getElementById("mEmail");
    const mStatus = document.getElementById("mStatus");
    const mDate = document.getElementById("mDate");
    const mReason = document.getElementById("mReason");
    const mMessage = document.getElementById("mMessage");
    const mLatestAction = document.getElementById("mLatestAction");
    const mIsClosed = document.getElementById("mIsClosed");
    const mResolvedAt = document.getElementById("mResolvedAt");
    const mActionHistory = document.getElementById("mActionHistory");

    const wfId = document.getElementById("wfId");
    const wfTrackingId = document.getElementById("wfTrackingId");
    const wfOffice = document.getElementById("wfOffice");
    const wfEmail = document.getElementById("wfEmail");
    const wfReason = document.getElementById("wfReason");
    const wfMessage = document.getElementById("wfMessage");
    const wfCurrentStatusBadge = document.getElementById("wfCurrentStatusBadge");
    const wfStatus = document.getElementById("wfStatus");
    const wfActionNote = document.getElementById("wfActionNote");
    const wfIsClosed = document.getElementById("wfIsClosed");
    const wfIsClosedHidden = document.getElementById("wfIsClosedHidden");
    const wfActionHistory = document.getElementById("wfActionHistory");
    const wfStatusHint = document.getElementById("wfStatusHint");

    function getStatusBadgeClass(status) {
        const s = (status || "").trim();

        if (s === "Pending") return "c-status-badge c-badge-pending";
        if (s === "In Progress") return "c-status-badge c-badge-inprogress";
        if (s === "Overdue") return "c-status-badge c-badge-overdue";
        if (s === "Escalated") return "c-status-badge c-badge-escalated";
        if (s === "Resolved") return "c-status-badge c-badge-resolved";

        return "c-status-badge";
    }

    function syncCaseClosedHidden() {
        if (wfIsClosed && wfIsClosedHidden) {
            wfIsClosedHidden.value = wfIsClosed.checked ? "true" : "false";
        }
    }

    function updateWorkflowStatusHint() {
        if (!wfStatusHint || !wfStatus) return;

        if (wfStatus.value === "Resolved") {
            wfStatusHint.className = "c-status-hint c-status-hint-resolved";
            wfStatusHint.textContent = "The complaint will be closed after confirmation and the final action note will be saved.";
        } else {
            wfStatusHint.className = "c-status-hint c-status-hint-progress";
            wfStatusHint.textContent = "The complaint will remain active and the new action note will be added to its history.";
        }
    }

    function openComplaintModal(ticket) {
        mTrackingId.textContent = ticket.dataset.trackingid || "";
        mOffice.textContent = ticket.dataset.office || "";
        mClientType.textContent = ticket.dataset.clienttype || "";
        mEmail.textContent = ticket.dataset.email || "";
        mStatus.textContent = ticket.dataset.status || "";
        mDate.textContent = ticket.dataset.date || "";
        mReason.textContent = ticket.dataset.reason || "";
        mMessage.textContent = ticket.dataset.message || "";
        mLatestAction.textContent = ticket.dataset.latestaction || "No action yet.";
        mIsClosed.textContent = ticket.dataset.isclosed === "true" ? "Yes" : "No";
        mResolvedAt.textContent = ticket.dataset.resolvedat || "Not yet resolved";

        const historyContainer = ticket.querySelector(".c-history-data");
        mActionHistory.innerHTML = historyContainer
            ? historyContainer.innerHTML
            : "<div class='c-history-entry'>No action history yet.</div>";

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeComplaintModal() {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }

    function openWorkflowModal(button) {
        const ticket = button.closest(".c-ticket");

        wfId.value = button.dataset.id || "";
        wfTrackingId.textContent = button.dataset.trackingid || "";
        wfOffice.textContent = button.dataset.office || "";
        wfEmail.textContent = button.dataset.email || "";
        wfReason.textContent = ticket?.dataset.reason || "";
        wfMessage.textContent = ticket?.dataset.message || "";
        wfActionNote.value = "";
        wfIsClosed.checked = false;
        syncCaseClosedHidden();

        const currentStatus = (button.dataset.status || "Pending").trim();

        wfCurrentStatusBadge.textContent = currentStatus;
        wfCurrentStatusBadge.className = getStatusBadgeClass(currentStatus);

        wfStatus.dataset.currentStatus = currentStatus;

        if (currentStatus === "Pending") {
            wfStatus.value = "In Progress";
        } else if (currentStatus === "Resolved") {
            wfStatus.value = "Resolved";
            wfIsClosed.checked = true;
            syncCaseClosedHidden();
        } else {
            wfStatus.value = currentStatus;
        }

        updateWorkflowStatusHint();

        const historyContainer = ticket ? ticket.querySelector(".c-history-data") : null;
        wfActionHistory.innerHTML = historyContainer
            ? historyContainer.innerHTML
            : "<div class='c-history-entry'>No action history yet.</div>";

        workflowModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function closeWorkflowModalFn() {
        workflowModal.style.display = "none";
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".js-view-complaint").forEach(button => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            const ticket = this.closest(".c-ticket");
            if (ticket) {
                openComplaintModal(ticket);
            }
        });
    });

    document.querySelectorAll(".js-open-workflow").forEach(button => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            openWorkflowModal(this);
        });
    });

    if (wfStatus) {
        wfStatus.addEventListener("change", function () {
            updateWorkflowStatusHint();

            if (wfStatus.value === "Resolved" && wfIsClosed) {
                wfIsClosed.focus();
            }
        });
    }

    if (wfIsClosed) {
        wfIsClosed.addEventListener("change", syncCaseClosedHidden);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeComplaintModal);
    }

    if (closeWorkflowModal) {
        closeWorkflowModal.addEventListener("click", closeWorkflowModalFn);
    }

    if (cancelWorkflowModal) {
        cancelWorkflowModal.addEventListener("click", closeWorkflowModalFn);
    }

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeComplaintModal();
        }

        if (e.target === workflowModal) {
            closeWorkflowModalFn();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeComplaintModal();
        }

        if (e.key === "Escape" && workflowModal.style.display === "flex") {
            closeWorkflowModalFn();
        }
    });

    if (workflowForm) {
        workflowForm.addEventListener("submit", function (e) {
            syncCaseClosedHidden();

            const selectedStatus = (wfStatus.value || "").trim();
            const currentStatus = (wfStatus.dataset.currentStatus || "").trim();
            const note = (wfActionNote.value || "").trim();
            const allowedBeforeResolved = ["In Progress", "Overdue", "Escalated"];

            if (selectedStatus === "In Progress" && !note) {
                e.preventDefault();
                alert("Please enter a new action note before saving the complaint as In Progress.");
                return;
            }

            if (selectedStatus === "Resolved") {
                if (!allowedBeforeResolved.includes(currentStatus) && currentStatus !== "Resolved") {
                    e.preventDefault();
                    alert("Complaint must first be active before it can be resolved.");
                    return;
                }

                if (!note) {
                    e.preventDefault();
                    alert("Please enter a final action note before resolving the complaint.");
                    return;
                }

                if (!wfIsClosed.checked) {
                    e.preventDefault();
                    alert("Please confirm that the case is closed before resolving the complaint.");
                    return;
                }
            }
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const target = this.dataset.tab;

            tabButtons.forEach(b => b.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            this.classList.add("active");
            document.getElementById(target)?.classList.add("active");
        });
    });

    function updateDashboardCounts() {
        const visibleTickets = Array.from(document.querySelectorAll(".c-ticket"))
            .filter(ticket => ticket.style.display !== "none");

        const pendingCount = visibleTickets.filter(ticket =>
            (ticket.dataset.status || "").trim() === "Pending"
        ).length;

        const progressCount = visibleTickets.filter(ticket => {
            const s = (ticket.dataset.status || "").trim();
            return s === "In Progress" || s === "Overdue" || s === "Escalated";
        }).length;

        const resolvedCount = visibleTickets.filter(ticket =>
            (ticket.dataset.status || "").trim() === "Resolved"
        ).length;

        const overdueCount = visibleTickets.filter(ticket =>
            (ticket.dataset.status || "").trim() === "Overdue"
        ).length;

        const openCount = visibleTickets.filter(ticket => {
            const s = (ticket.dataset.status || "").trim();
            return s === "Pending" || s === "In Progress" || s === "Overdue" || s === "Escalated";
        }).length;

        const newComplaintsCount = visibleTickets.filter(ticket => {
            const ticketDate = ticket.dataset.date || "";
            if (!ticketDate) return false;

            const today = new Date();
            const d = new Date(ticketDate + "T00:00:00");
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            return d >= new Date(sevenDaysAgo.toDateString());
        }).length;

        const boardSummaryCountEl = document.getElementById("boardSummaryCount");
        const pendingTabCountEl = document.getElementById("pendingTabCount");
        const progressTabCountEl = document.getElementById("progressTabCount");
        const resolvedTabCountEl = document.getElementById("resolvedTabCount");

        const openCountEl = document.getElementById("openCount");
        const overdueCountEl = document.getElementById("overdueCount");
        const newComplaintsCountEl = document.getElementById("newComplaintsCount");
        const resolvedCountEl = document.getElementById("resolvedCount");
        const backlogCountEl = document.getElementById("backlogCount");

        if (boardSummaryCountEl) boardSummaryCountEl.textContent = `${visibleTickets.length} complaint records`;
        if (pendingTabCountEl) pendingTabCountEl.textContent = pendingCount;
        if (progressTabCountEl) progressTabCountEl.textContent = progressCount;
        if (resolvedTabCountEl) resolvedTabCountEl.textContent = resolvedCount;

        if (openCountEl) openCountEl.textContent = openCount;
        if (overdueCountEl) overdueCountEl.textContent = overdueCount;
        if (newComplaintsCountEl) newComplaintsCountEl.textContent = newComplaintsCount;
        if (resolvedCountEl) resolvedCountEl.textContent = resolvedCount;
        if (backlogCountEl) backlogCountEl.textContent = openCount;
    }

    function applyFilters() {
        const q = (search?.value || "").toLowerCase().trim();
        const officeValue = (filterOffice?.value || "").toLowerCase().trim();
        const clientValue = (filterClient?.value || "").toLowerCase().trim();
        const fromDate = filterFromDate?.value || "";
        const toDate = filterToDate?.value || "";

        const tickets = document.querySelectorAll(".c-ticket");
        const panels = document.querySelectorAll(".c-tab-panel");

        tickets.forEach(ticket => {
            const text = ticket.innerText.toLowerCase();
            const office = (ticket.dataset.office || "").toLowerCase().trim();
            const client = (ticket.dataset.clienttype || "").toLowerCase().trim();
            const ticketDate = ticket.dataset.date || "";

            let visible = true;

            if (q && !text.includes(q)) visible = false;
            if (officeValue && office !== officeValue) visible = false;
            if (clientValue && client !== clientValue) visible = false;
            if (fromDate && ticketDate < fromDate) visible = false;
            if (toDate && ticketDate > toDate) visible = false;

            ticket.style.display = visible ? "" : "none";
        });

        panels.forEach(panel => {
            const oldEmpty = panel.querySelector(".c-search-empty");
            if (oldEmpty) oldEmpty.remove();

            const allTickets = panel.querySelectorAll(".c-ticket");
            const visibleTickets = Array.from(allTickets).filter(t => t.style.display !== "none");

            if (allTickets.length > 0 && visibleTickets.length === 0) {
                const div = document.createElement("div");
                div.className = "c-empty-panel c-search-empty";
                div.textContent = "No matching complaints.";
                panel.appendChild(div);
            }
        });

        updateDashboardCounts();
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
        if (!dateStr) return "Not specified";

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

    function shortenText(text, maxLength) {
        if (!text) return "";
        text = text.trim();
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", function () {
            applyFilters();
        });
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener("click", async function () {
            applyFilters();

            generateReportBtn.disabled = true;
            const originalText = generateReportBtn.textContent;
            generateReportBtn.textContent = "Generating...";

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF("p", "mm", "a4");

                const visibleRows = Array.from(document.querySelectorAll(".c-ticket"))
                    .filter(row => row.style.display !== "none");

                if (visibleRows.length === 0) {
                    alert("No visible complaint records to export.");
                    return;
                }

                const officeFilter = filterOffice?.value || "All Offices";
                const clientFilter = filterClient?.value || "All Client Types";
                const searchValue = search?.value?.trim() || "None";
                const from = filterFromDate?.value || "";
                const to = filterToDate?.value || "";

                const logoBase64 = await loadImageAsBase64("/images/logo.png");

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const marginLeft = 14;
                const marginRight = 14;
                const contentWidth = pageWidth - marginLeft - marginRight;

                function addFooter() {
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.3);
                    doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);

                    doc.setFontSize(8);
                    doc.setTextColor(90, 90, 90);
                    doc.setFont("helvetica", "normal");

                    doc.text(
                        `Generated on ${new Date().toLocaleString()}`,
                        marginLeft,
                        pageHeight - 7
                    );

                    doc.text(
                        "Prepared by ARTA Admin System",
                        pageWidth / 2,
                        pageHeight - 7,
                        { align: "center" }
                    );

                    const pageNumber = doc.getCurrentPageInfo().pageNumber;
                    doc.text(
                        `Page ${pageNumber}`,
                        pageWidth - marginRight,
                        pageHeight - 7,
                        { align: "right" }
                    );
                }

                function addHeader(title, subtitle) {
                    doc.setDrawColor(157, 11, 15);
                    doc.setLineWidth(1.2);
                    doc.line(12, 12, pageWidth - 12, 12);

                    if (logoBase64) {
                        doc.addImage(logoBase64, "PNG", 14, 16, 18, 18);
                    }

                    doc.setTextColor(20, 20, 20);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    doc.text("Lipa City", 36, 23);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.text("Anti-Red Tape Authority", 36, 29);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    doc.text(title, 14, 42);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(90, 90, 90);
                    doc.text(subtitle, 14, 48);
                }

                function drawScopeRow(leftLabel, leftValue, rightLabel, rightValue, y) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.setTextColor(20, 20, 20);
                    doc.text(leftLabel, 18, y);
                    doc.text(rightLabel, 108, y);

                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(70, 70, 70);
                    doc.text(String(leftValue), 42, y);
                    doc.text(String(rightValue), 130, y);
                }

                function getHistoryEntries(row) {
                    const container = row.querySelector(".c-history-data");
                    if (!container) return [];

                    const entries = Array.from(container.querySelectorAll(".c-history-entry"));
                    if (entries.length === 0) return [];

                    return entries.map(entry => {
                        const strong = entry.querySelector("strong");
                        const status = strong ? strong.textContent.trim() : "";
                        const text = (entry.textContent || "").trim();

                        let lines = text
                            .split("\n")
                            .map(x => x.trim())
                            .filter(Boolean);

                        let headerLine = lines[0] || "";
                        let noteLine = lines.slice(1).join(" ").trim();

                        if (!noteLine && headerLine.includes(" - ")) {
                            const parts = headerLine.split(" - ");
                            if (parts.length >= 3) {
                                headerLine = `${parts[0]} - ${parts[1]}`;
                                noteLine = parts.slice(2).join(" - ");
                            }
                        }

                        return {
                            status: status,
                            header: headerLine || "Action Entry",
                            note: noteLine || "No action note."
                        };
                    });
                }

                function getComplaintData(row) {
                    return {
                        trackingId: row.dataset.trackingid || "",
                        dateSubmitted: formatPrettyDate(row.dataset.date || ""),
                        office: row.dataset.office || "",
                        clientType: row.dataset.clienttype || "",
                        reason: row.dataset.reason || "",
                        message: row.dataset.message || "",
                        email: row.dataset.email || "",
                        status: row.dataset.status || "",
                        latestAction: row.dataset.latestaction || "No action yet",
                        isClosed: row.dataset.isclosed === "true" ? "Yes" : "No",
                        resolvedAt: row.dataset.resolvedat || "—",
                        history: getHistoryEntries(row)
                    };
                }

                const complaintData = visibleRows.map(getComplaintData);

                const totalComplaints = complaintData.length;
                const pendingCount = complaintData.filter(x => x.status === "Pending").length;
                const inProgressCount = complaintData.filter(x =>
                    x.status === "In Progress" || x.status === "Overdue" || x.status === "Escalated"
                ).length;
                const overdueCount = complaintData.filter(x => x.status === "Overdue").length;
                const resolvedCount = complaintData.filter(x => x.status === "Resolved").length;

                const officeCountMap = {};
                const reasonCountMap = {};

                complaintData.forEach(item => {
                    const officeKey = item.office || "Unknown";
                    officeCountMap[officeKey] = (officeCountMap[officeKey] || 0) + 1;

                    const reasonParts = (item.reason || "")
                        .split(",")
                        .map(x => x.trim())
                        .filter(Boolean);

                    reasonParts.forEach(r => {
                        reasonCountMap[r] = (reasonCountMap[r] || 0) + 1;
                    });
                });

                const topOffice = Object.keys(officeCountMap).length
                    ? Object.entries(officeCountMap).sort((a, b) => b[1] - a[1])[0][0]
                    : "N/A";

                const topReason = Object.keys(reasonCountMap).length
                    ? Object.entries(reasonCountMap).sort((a, b) => b[1] - a[1])[0][0]
                    : "N/A";

                addHeader(
                    "Complaint Monitoring Report",
                    "Filtered complaint summary and documentation."
                );

                doc.setDrawColor(220, 220, 220);
                doc.setFillColor(248, 249, 251);
                doc.roundedRect(14, 54, pageWidth - 28, 32, 2, 2, "FD");

                drawScopeRow("Office:", officeFilter, "Client Type:", clientFilter, 62);
                drawScopeRow("Date Range:", formatDateRange(from, to), "Search:", searchValue, 69);
                drawScopeRow("Status Scope:", "All Filtered Complaints", "Total Records:", totalComplaints, 76);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(20, 20, 20);
                doc.text("Summary", 14, 96);

                const summaryData = [
                    ["Total Complaints", String(totalComplaints)],
                    ["Pending", String(pendingCount)],
                    ["In Progress", String(inProgressCount)],
                    ["Overdue", String(overdueCount)],
                    ["Resolved", String(resolvedCount)]
                ];

                doc.autoTable({
                    startY: 100,
                    head: [["Category", "Count"]],
                    body: summaryData,
                    theme: "grid",
                    styles: {
                        font: "helvetica",
                        fontSize: 9,
                        cellPadding: 4
                    },
                    headStyles: {
                        fillColor: [157, 11, 15],
                        textColor: [255, 255, 255],
                        fontStyle: "bold"
                    },
                    columnStyles: {
                        0: { cellWidth: 80 },
                        1: { cellWidth: 30, halign: "center" }
                    },
                    margin: { left: 14, right: 14 }
                });

                let summaryEndY = doc.lastAutoTable.finalY + 10;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.setTextColor(20, 20, 20);
                doc.text("Key Observations", 14, summaryEndY);

                const observations = [
                    `Most complaints came from: ${topOffice}`,
                    `Most common complaint reason: ${topReason}`,
                    `${overdueCount} complaint(s) are overdue.`,
                    `${resolvedCount} complaint(s) are resolved in this report scope.`
                ];

                let obsY = summaryEndY + 8;
                observations.forEach(obs => {
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(70, 70, 70);
                    const lines = doc.splitTextToSize(`• ${obs}`, contentWidth - 8);
                    doc.text(lines, 18, obsY);
                    obsY += lines.length * 5 + 2;
                });

                addFooter();

                doc.addPage("a4", "l");
                addHeader(
                    "Complaint Summary Table",
                    "Condensed table of all filtered complaints."
                );

                const tableData = complaintData.map(item => [
                    item.trackingId,
                    item.dateSubmitted,
                    shortenText(item.office, 28),
                    item.status,
                    shortenText(item.latestAction, 42),
                    item.isClosed
                ]);

                doc.autoTable({
                    startY: 58,
                    head: [[
                        "Tracking ID",
                        "Date Submitted",
                        "Office",
                        "Status",
                        "Latest Action",
                        "Case Closed"
                    ]],
                    body: tableData,
                    theme: "grid",
                    styles: {
                        font: "helvetica",
                        fontSize: 8,
                        cellPadding: 3,
                        overflow: "linebreak",
                        valign: "top"
                    },
                    headStyles: {
                        fillColor: [157, 11, 15],
                        textColor: [255, 255, 255],
                        fontStyle: "bold"
                    },
                    alternateRowStyles: {
                        fillColor: [248, 248, 248]
                    },
                    columnStyles: {
                        0: { cellWidth: 34 },
                        1: { cellWidth: 28 },
                        2: { cellWidth: 56 },
                        3: { cellWidth: 26 },
                        4: { cellWidth: 96 },
                        5: { cellWidth: 24, halign: "center" }
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: function () {
                        addFooter();
                    }
                });

                complaintData.forEach((item, index) => {
                    doc.addPage("a4", "p");
                    addHeader(
                        "Detailed Complaint Documentation",
                        `Complaint ${index + 1} of ${complaintData.length}`
                    );

                    let y = 58;

                    function addDetailSectionTitle(title) {
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(11);
                        doc.setTextColor(20, 20, 20);
                        doc.text(title, 14, y);
                        y += 7;
                    }

                    function addDetailRow(label, value, width = 135) {
                        const safeValue = value && String(value).trim() !== "" ? String(value) : "—";

                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(9.5);
                        doc.setTextColor(20, 20, 20);
                        doc.text(label, 16, y);

                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(70, 70, 70);
                        const lines = doc.splitTextToSize(String(safeValue), width);
                        doc.text(lines, 52, y);

                        y += Math.max(6, (lines.length * 5) + 1);
                    }

                    addDetailSectionTitle("Complaint Information");
                    addDetailRow("Tracking ID:", item.trackingId);
                    addDetailRow("Office:", item.office);
                    addDetailRow("Client Type:", item.clientType);
                    addDetailRow("Email:", item.email);
                    addDetailRow("Date Submitted:", item.dateSubmitted);
                    addDetailRow("Current Status:", item.status);
                    addDetailRow("Case Closed:", item.isClosed);
                    addDetailRow("Resolved At:", item.resolvedAt);

                    y += 4;
                    addDetailSectionTitle("Complaint Content");
                    addDetailRow("Reason / Issue:", item.reason, 130);
                    addDetailRow("Message:", item.message, 130);

                    y += 4;
                    addDetailSectionTitle("Action History");

                    if (!item.history || item.history.length === 0) {
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(9.5);
                        doc.setTextColor(90, 90, 90);
                        doc.text("No action history available.", 18, y);
                        y += 8;
                    } else {
                        item.history.forEach((entry, idx) => {
                            const titleLines = doc.splitTextToSize(`${idx + 1}. ${entry.header || entry.status || "Action Entry"}`, 165);
                            const noteLines = doc.splitTextToSize(entry.note || "No action note.", 160);
                            const entryHeight = 8 + (titleLines.length * 4.5) + (noteLines.length * 4.5);

                            if (y + entryHeight > pageHeight - 22) {
                                doc.addPage("a4", "p");
                                addHeader(
                                    "Detailed Complaint Documentation",
                                    `Complaint ${index + 1} of ${complaintData.length} (continued)`
                                );
                                y = 58;
                                addDetailSectionTitle("Action History");
                            }

                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(9.5);
                            doc.setTextColor(30, 30, 30);
                            doc.text(titleLines, 18, y);

                            y += titleLines.length * 4.5 + 1;

                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(80, 80, 80);
                            doc.text(noteLines, 24, y);

                            y += noteLines.length * 4.5 + 4;
                        });
                    }

                    addFooter();
                });

                const filenameDate = new Date().toISOString().slice(0, 10);
                doc.save(`ARTA_Clean_Complaint_Report_${filenameDate}.pdf`);

            } catch (error) {
                console.error(error);
                alert("An error occurred while generating the report.");
            } finally {
                generateReportBtn.disabled = false;
                generateReportBtn.textContent = originalText;
            }
        });
    }
});