document.addEventListener('DOMContentLoaded', function () {

    // ---------------- MODAL (CHOOSE PAGE) ----------------
    const modal = document.getElementById('consentModal');
    const checkbox = document.getElementById('consentCheckbox');
    const agreeBtn = document.getElementById('agreeBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    const surveyLink = document.getElementById("surveyLink");
    const complaintLink = document.getElementById("complaintLink");

    let targetUrl = "";

    function openModal(url) {
        if (!modal) return;
        targetUrl = url;
        modal.style.display = "flex";
        if (checkbox) checkbox.checked = false;
        if (agreeBtn) agreeBtn.disabled = true;
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = "none";
        if (checkbox) checkbox.checked = false;
        if (agreeBtn) agreeBtn.disabled = true;
    }

    if (modal) modal.style.display = "none";

    if (surveyLink) {
        surveyLink.addEventListener("click", function (e) {
            e.preventDefault();
            openModal(this.href);
        });
    }

    // If you want consent ONLY for survey, comment this block out:
    if (complaintLink) {
        complaintLink.addEventListener("click", function (e) {
            e.preventDefault();
            openModal(this.href);
        });
    }

    if (checkbox && agreeBtn) {
        checkbox.addEventListener("change", function () {
            agreeBtn.disabled = !this.checked;
        });
    }

    if (agreeBtn) {
        agreeBtn.addEventListener("click", function () {
            closeModal();
            if (targetUrl) window.location.href = targetUrl;
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }

    // Optional: click outside modal-content closes
    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });
    }

    // ---------------- SURVEY STEPS (SURVEY PAGE) ----------------
    const steps = Array.from(document.querySelectorAll('.survey-step'));
    let currentStep = 0;

    const nextBtns = document.querySelectorAll('.btn-next');
    const backBtns = document.querySelectorAll('.btn-back');
    const submitBtn = document.querySelector('.btn-submit');
    const surveyForm = document.querySelector('#surveyForm'); // recommended id

    function showStep(index) {
        steps.forEach((step, i) => {
            step.style.display = i === index ? 'block' : 'none';
        });
    }

    if (steps.length > 0) {
        showStep(currentStep);

        nextBtns.forEach(btn => btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep = Math.min(currentStep + 1, steps.length - 1);
                showStep(currentStep);
            }
        }));

        backBtns.forEach(btn => btn.addEventListener('click', () => {
            currentStep = Math.max(currentStep - 1, 0);
            showStep(currentStep);
        }));
    }

    function validateStep(stepIndex) {
        const step = steps[stepIndex];
        if (!step) return true;

        const requiredFields = step.querySelectorAll('[required]');
        for (let field of requiredFields) {
            const val = (field.value ?? "").trim();
            if (!val) {
                alert('Please complete all required fields before continuing.');
                field.focus();
                return false;
            }
        }
        return true;
    }

    if (submitBtn && surveyForm) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (steps.length > 0 && !validateStep(currentStep)) return;
            surveyForm.submit();
        });
    }

    // ---------------- STAR RATING (ONE VERSION ONLY) ----------------
    document.querySelectorAll(".star-rating").forEach(rating => {
        const stars = rating.querySelectorAll(".star");
        const hiddenInput = rating.nextElementSibling; // hidden input right after div
        if (!hiddenInput) return;

        stars.forEach((star, index) => {
            star.addEventListener("click", () => {
                hiddenInput.value = index + 1;
                stars.forEach((s, i) => s.classList.toggle("selected", i <= index));
            });
        });
    });

    // ---------------- SINGLE SELECT TAGS (SEX & CLIENT TYPE) ----------------
    function setupSingleSelect(containerId, inputId) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        if (!container || !input) return;

        const tags = container.querySelectorAll(".tag");

        tags.forEach(tag => {
            tag.addEventListener("click", () => {
                if (tag.classList.contains("selected")) {
                    tags.forEach(t => {
                        t.style.display = "inline-block";
                        t.classList.remove("selected");
                    });
                    input.value = "";
                    return;
                }

                tags.forEach(t => {
                    t.style.display = "none";
                    t.classList.remove("selected");
                });

                tag.style.display = "inline-block";
                tag.classList.add("selected");
                input.value = tag.dataset.value;
            });
        });
    }

    setupSingleSelect("sex-tags", "Sex");
    setupSingleSelect("client-tags", "ClientType");

    // ---------------- MULTI SELECT (COMPLAINT TAGS ONLY) ----------------
    const complaintContainer = document.querySelector('.complaint-tag-container');
    const complaintInput = document.getElementById('TagInput');

    if (complaintContainer && complaintInput) {
        const tagButtons = complaintContainer.querySelectorAll('.tag');

        tagButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');

                const selectedTags = Array.from(tagButtons)
                    .filter(t => t.classList.contains('selected'))
                    .map(t => t.dataset.value);

                complaintInput.value = selectedTags.join(', ');
            });
        });
    }

    // ---------------- FORM VALIDATION (ONLY IF A FORM EXISTS) ----------------
    const anyForm = document.querySelector("form");
    if (anyForm) {
        anyForm.addEventListener("submit", function (e) {

            // Only validate these if the fields exist on the page
            const sexEl = document.getElementById("Sex");
            const clientEl = document.getElementById("ClientType");

            if (sexEl && !sexEl.value) {
                alert("Please select Sex");
                e.preventDefault();
                return;
            }

            if (clientEl && !clientEl.value) {
                alert("Please select Client Type");
                e.preventDefault();
                return;
            }

            // Check star ratings only if there are any
            const starInputs = document.querySelectorAll(".star-rating + input[type='hidden']");
            if (starInputs.length > 0) {
                for (const input of starInputs) {
                    if (!input.value) {
                        alert("Please rate all service quality questions");
                        e.preventDefault();
                        return;
                    }
                }
            }
        });
    }

    // ---------------- OFFICE SEARCH (ONLY IF EXISTS) ----------------
    const officeSelect = document.getElementById("officeSelect");
    const officeSearch = document.getElementById("officeSearch");

    if (officeSelect && officeSearch) {
        const originalOptions = Array.from(officeSelect.options);

        officeSearch.addEventListener("keyup", function () {
            const filter = this.value.toLowerCase();
            officeSelect.innerHTML = "";
            originalOptions.forEach(option => {
                if (option.text.toLowerCase().includes(filter)) {
                    officeSelect.appendChild(option);
                }
            });
        });
    }

});