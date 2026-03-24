const sections = [
    {
        id: "housing",
        title: "Housing",
        criteria: [
            {
                label: "Maximum average rent (per month)",
                tooltip: "Average monthly rent across 2 bedroom 2 bathroom units in the neighbourhood",
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

    // Header
    const header = document.createElement("div");
    header.id = "preferences-header"
    header.classList.add("flex", "flex-col", "gap-[12px]", "w-[300px]")
    header.innerHTML = `
    <p class="text-2xl font-semibold font-roboto text-white leading-7">Neighborhood Preferences</p>
    <p class="text-xs font-medium font-mulish text-subtitle">Refine your criteria to discover neighborhoods<br>tailored to your lifestyle.</p>
    `;
    container.appendChild(header);

    // Categories
    const categories = document.createElement("div");
    categories.id = "preferences-categories"
    categories.classList.add("flex", "flex-col", "overflow-y-auto", "overflow-x-hidden", "w-[300px]");

    sections.forEach((section) => {
        const sec = document.createElement("div");
        sec.classList.add("section", "flex", "flex-col", "py-[16px]");
        sec.style.borderTop = "1px solid #2a2a2a";
        sec.dataset.id = section.id;

        // Header row
        const headerRow = document.createElement("div");
        headerRow.classList.add("section-header", "flex", "flex-row", "justify-between", "cursor-pointer");
        headerRow.innerHTML = `
        <p class="section-title text-base font-semibold font-mulish text-white leading-5">${section.title}</p>
        <svg class="chevron w-[20px] h-[20px] background-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
        `;
        headerRow.addEventListener("click", () => {
            sec.classList.toggle("collapsed");
        });

        // Body
        const body = document.createElement("div");
        body.classList.add("section-body", "flex", "flex-col", "gap-[6px]");

        section.criteria.forEach((c) => {
            let currentVal = c.defaultVal;

            // Label + tooltip
            const labelRow = document.createElement("div");
            labelRow.classList.add("criteria-label", "h-[20px]", "flex", "items-center", "gap-[4px]");
            labelRow.innerHTML = `
            <p class="text-xs font-medium font-mulish text-subtitle">${c.label}</p>
            <i class="uil uil-info-circle text-[18px] text-subtitle cursor-help tooltip-icon" data-tip="${c.tooltip}"></i>
            `;

            // Slider
            const sliderRow = document.createElement("div");
            sliderRow.classList.add("slider-row", "flex", "items-center");

            const slider = document.createElement("input");
            slider.classList.add("range", "h-[8px]", "w-full", "bg-black", "rounded-full");
            slider.type = "range";
            slider.min = c.min;
            slider.max = c.max;
            slider.step = c.step;
            slider.value = currentVal;

            function updateFill() {
                const pct = ((slider.value - c.min) / (c.max - c.min)) * 100;
                if (c.type === "max") {
                    slider.style.background = `linear-gradient(to right, #ffffff ${pct}%, #333333 ${pct}%)`;
                } else {
                    slider.style.background = `linear-gradient(to right, #333333 ${pct}%, #ffffff ${pct}%)`;
                }
            }
            updateFill();

            // Bound label + display input
            const bounded = document.createElement("div");
            bounded.classList.add("bounded", "w-[146px]", "flex", "flex-col", "gap-[4px]");

            const boundLabel = document.createElement("div");
            boundLabel.classList.add("range-bound-label", "text-xs", "font-medium", "font-mulish", "text-subtitle");
            boundLabel.textContent = c.type === "max" ? "Max" : "Min";

            const display = document.createElement("input");
            display.type = "text";
            display.classList.add("value-input", "w-full", "bg-white", "text-xs", "text-black", "font-mulish", "font-medium", "border", "border-solid", "border-[#0b0b0b]", "outline-none");
            display.style.border = "1px solid #0b0b0b";
            display.style.borderRadius = "8px";
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

    container.appendChild(categories);
}

buildPanel("preferences-panel", sections);