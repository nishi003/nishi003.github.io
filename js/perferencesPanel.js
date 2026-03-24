const sections = [
    {
        id: "housing",
        title: "Housing",
        criteria: [
            {
                label: "Maximum average rent (per month)",
                tooltip: "Based on average listed rents for 2bed/2bath units in the neighborhood.",
                type: "max",
                min: 0,
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
                tooltip: "Scored 0–100 using local crime statistics. A score of 50+ is considered average.",
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
                tooltip: "Scored 0–100 based on proximity to buses, subways, and rail.",
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
                tooltip: "Scored 0–100 based on the density and variety of restaurants, cafés, and bars.",
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
                tooltip: "Scored 0–100 based on proximity to parks, trails, and recreational areas.",
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

function createTooltip() {
    const tip = document.createElement("div");
    tip.id = "tooltip";
    tip.style.cssText = `
    position: fixed;
    background: white;
    color: black;
    font-size: 12px;
    font-family: 'Mulish', sans-serif;
    font-weight: 500;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    width: 200px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 9999;
  `;
    document.body.appendChild(tip);
    return tip;
}

const tooltip = createTooltip();

function buildPanel(containerId, sections) {
    const container = document.getElementById(containerId);

    // Header
    const header = document.createElement("div");
    header.id = "preferences-header"
    header.classList.add("flex", "flex-col", "gap-[8px]", "w-[300px]")
    header.innerHTML = `
    <p class="text-2xl font-semibold font-roboto text-white leading-7">Neighborhood Preferences</p>
    <p class="text-xs font-medium font-mulish text-subtitle">Refine your criteria to discover neighborhoods<br>tailored to your lifestyle.</p>
    `;
    container.appendChild(header);

    // Categories
    const categories = document.createElement("div");
    categories.id = "preferences-categories"
    categories.classList.add("flex", "flex-col", "overflow-y-auto", "overflow-visible", "w-[300px]");

    sections.forEach((section) => {
        const sec = document.createElement("div");
        sec.classList.add("section", "flex", "flex-col", "py-[16px]", "collapsed");
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

            const icon = labelRow.querySelector(".tooltip-icon");
            icon.addEventListener("mouseenter", () => {
                if (sec.classList.contains("collapsed")) return;
                tooltip.textContent = c.tooltip;
                tooltip.style.opacity = "1";
            });
            icon.addEventListener("mousemove", (e) => {
                if (sec.classList.contains("collapsed")) return;
                tooltip.style.left = e.clientX - 80 + "px";
                tooltip.style.top = e.clientY - tooltip.offsetHeight - 12 + "px";
            });
            icon.addEventListener("mouseleave", () => {
                tooltip.style.opacity = "0";
            });

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

            display.addEventListener("change", () => {
                const raw = parseFloat(display.value.replace(/[^0-9.]/g, ""));
                if (!isNaN(raw)) {
                    currentVal = Math.min(Math.max(raw, c.min), c.max); // clamp to min/max
                    slider.value = currentVal;
                    display.value = c.format(currentVal);
                    updateFill();
                } else {
                    display.value = c.format(currentVal); // revert if invalid
                }
            });

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

function resetToDefaults(section) {
    section.querySelectorAll("input, select, textarea").forEach(el => {
        el.value = el.defaultValue;
    });
}

buildPanel("preferences-panel", sections);