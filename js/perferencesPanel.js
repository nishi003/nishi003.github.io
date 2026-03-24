const sections = [
    {
        id: "housing",
        title: "Housing",
        criteria: [
            {
                label: "Maximum average rent (per month)",
                tooltip: "Average monthly rent across all unit types in the neighbourhood",
                type: "max",
                min: 500,
                max: 10000,
                step: 100,
                defaultVal: 10000,
                format: (v) => `$${Number(v).toLocaleString()}`,
            },
        ],
    },
    {
        id: "safety",
        title: "Safety",
        criteria: [
            {
                label: "Minimum safety score",
                tooltip: "Composite safety score based on crime data (0–100)",
                type: "min",
                min: 0,
                max: 100,
                step: 1,
                defaultVal: 0,
                format: (v) => `${v}`,
            },
        ],
    },
    {
        id: "transportation",
        title: "Transportation",
        criteria: [
            {
                label: "Minimum transit score",
                tooltip: "Access to public transit options (0–100)",
                type: "min",
                min: 0,
                max: 100,
                step: 1,
                defaultVal: 0,
                format: (v) => `${v}`,
            },
        ],
    },
    {
        id: "food",
        title: "Food & Dining",
        criteria: [
            {
                label: "Minimum dining score",
                tooltip: "Density and quality of restaurants and cafés (0–100)",
                type: "min",
                min: 0,
                max: 100,
                step: 1,
                defaultVal: 0,
                format: (v) => `${v}`,
            },
        ],
    },
    {
        id: "parks",
        title: "Parks & Outdoor",
        criteria: [
            {
                label: "Minimum green space score",
                tooltip: "Proximity and access to parks and outdoor areas (0–100)",
                type: "min",
                min: 0,
                max: 100,
                step: 1,
                defaultVal: 0,
                format: (v) => `${v}`,
            },
        ],
    },
];

function buildPanel(containerId, sections) {
    const container = document.getElementById(containerId);

    const panel = document.createElement("div");
    panel.className = "preferences-panel";

    // Header
    const header = document.createElement("div");
    header.id = "preferences-header"
    header.classList.add("flex", "flex-col", "gap-2", "w-[300px]")
    header.innerHTML = `
    <p class="text-2xl font-semibold font-roboto text-white">Neighborhood Preferences</p>
    <p class="text-xs font-medium font-mulish text-subtitle">Refine your criteria to discover neighborhoods<br>tailored to your lifestyle.</p>
    `;
    panel.appendChild(header);

    // Categories
    const categories = document.createElement("div");
    categories.id = "preferences-categories"
    categories.classList.add("flex", "flex-col");

    sections.forEach((section) => {
        const sec = document.createElement("div");
        sec.classList.add("section", "flex", "flex-row", "px-4")
        sec.className = "section";
        sec.dataset.id = section.id;

        // Header row
        const headerRow = document.createElement("div");
        headerRow.classList.add("section-header", "flex", "flex-row", "justify-between");
        headerRow.innerHTML = `
        <p class="section-title text-base font-semibold font-mulish text-white">${section.title}</p>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
        `;

        headerRow.addEventListener("click", () => {
            sec.classList.toggle("collapsed");
        });

        // Body
        const body = document.createElement("div");
        body.className = "section-body";

        section.criteria.forEach((c) => {
            let currentVal = c.defaultVal;

            // Label + tooltip
            const labelRow = document.createElement("div");
            labelRow.className = "criteria-label";
            labelRow.style.paddingTop = "12px";
            labelRow.innerHTML = `
            <p class="text-sm font-medium font-mulish text-subtitle">${c.label}</p>
            <p class="tooltip-icon" data-tip="${c.tooltip}">?</p>
            `;

            // Slider
            const sliderRow = document.createElement("div");
            sliderRow.className = "slider-row";

            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = c.min;
            slider.max = c.max;
            slider.step = c.step;
            slider.value = currentVal;

            function updateFill() {
                const pct = ((slider.value - c.min) / (c.max - c.min)) * 100;
                slider.style.background = `linear-gradient(to right, #fff ${pct}%, #333 ${pct}%)`;
            }
            updateFill();

            // Bound label + display input
            const bounded = document.createElement("div");
            bounded.classList.add("bounded", "w-[146px]");

            const boundLabel = document.createElement("div");
            boundLabel.className = "range-bound-label";
            boundLabel.textContent = c.type === "max" ? "Max" : "Min";

            const display = document.createElement("input");
            display.type = "text";
            display.classList.add("value-input", "w-full");
            display.value = c.format(currentVal);

            bounded.append(boundLabel);
            bounded.append(display);

            slider.addEventListener("input", () => {
                currentVal = slider.value;
                display.value = c.format(currentVal);
                updateFill();
            });

            sliderRow.appendChild(slider);
            body.appendChild(labelRow);
            body.appendChild(sliderRow);
            body.appendChild(bounded);
        });

        sec.appendChild(headerRow);
        sec.appendChild(body);
        categories.appendChild(sec);
    });

    panel.appendChild(categories);
    container.appendChild(panel);
}

buildPanel("preferences-panel", sections);