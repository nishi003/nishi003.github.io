function getRadarMetrics(neighborhood) {
    if (!neighborhood) return null;

    const RENT_MIN = 1500;
    const RENT_MAX = 6000;

    const affordability = 1 - (neighborhood.avg_rent - RENT_MIN) / (RENT_MAX - RENT_MIN);
    const rentScore = Math.max(0, Math.min(100, affordability * 100));

    return {
        safety: neighborhood.safety ?? 0,
        transit: neighborhood.transit_score ?? 0,
        dining: neighborhood.dining_score ?? 0,
        green: neighborhood.green_space_score ?? 0,
        rent: rentScore,
    };
}

function getMatchColor(score) {
    if (score >= 60) return "#27C840";
    if (score >= 35) return "#FEBC2F";
    return "#FF5F57";
}

function renderNeighborhoodCard(neigborhood, isBestMatch) {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container", "w-full", "h-fit", "flex", "flex-col", "p-[20px]", "rounded-[20px]", "transition-all", "duration-200", "collapsed");
    cardContainer.style.border = "1px solid #565656";

    if (neigborhood) {
        const cardHeader = document.createElement("div");
        cardHeader.classList.add("w-full", "flex", "flex-col", "gap-[4px]");

        const headerRow = document.createElement("div");
        headerRow.classList.add("flex", "flex-row", "justify-between", "items-center", "cursor-pointer");
        headerRow.innerHTML = `
        <p class="text-base text-white font-mulish font-semibold leading-5">${neigborhood.name}</p>
        <svg class="chevron w-[20px] h-[20px] background-white" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
        `;
        headerRow.addEventListener("click", () => {
            cardContainer.classList.toggle("collapsed");
        });

        const matchValue = document.createElement("p");
        matchValue.textContent = `${neigborhood.matchScore}% match`;
        matchValue.classList.add("text-xs", "font-roboto", "font-medium");
        matchValue.style.color = getMatchColor(neigborhood.matchScore);

        cardHeader.append(headerRow);
        cardHeader.append(matchValue);

        const details = document.createElement("div");
        details.classList.add("details", "w-full", "flex", "flex-col", "gap-[12px]");

        const stats = [
            { label: "Average Rent", value: `$${neigborhood.avg_rent?.toLocaleString()} per month` },
            { label: "Safety Score", value: `${neigborhood.safety}/100` },
            { label: "Transit Score", value: `${neigborhood.transit_score}/100` },
            { label: "Dining Score", value: `${neigborhood.dining_score}/100` },
            { label: "Green Space Score", value: `${neigborhood.green_space_score}/100` },
        ];

        stats.forEach(({ label, value }) => {
            const row = document.createElement("div");
            row.classList.add("flex", "flex-col", "gap-[4px]");

            const labelEl = document.createElement("p");
            labelEl.textContent = label;
            labelEl.classList.add("text-xs", "font-bold", "font-mulish", "text-white");

            const valueEl = document.createElement("p");
            valueEl.textContent = value;
            valueEl.classList.add("text-xs", "font-medium", "font-mulish", "text-white");

            row.append(labelEl);
            row.append(valueEl);
            details.append(row);
        });

        cardContainer.append(cardHeader);
        cardContainer.append(details);

    } else {
        if (isBestMatch) {
            const noMatchTitle = document.createElement("p");
            noMatchTitle.textContent = "No match found";
            noMatchTitle.classList.add("text-base", "text-white", "font-roboto", "font-semibold", "leading-5");

            const noMatchText = document.createElement("p");
            noMatchText.textContent = "Unfortunately no neighborhoods in San Francisco seem to be a match. Readjust your preferences and try again."
            noMatchText.classList.add("text-xs", "text-subtitle", "font-mulish", "font-medium", "pt-[12px]");

            cardContainer.append(noMatchTitle);
            cardContainer.append(noMatchText);

        } else {
            const noCompareTitle = document.createElement("p");
            noCompareTitle.textContent = "No neighborhood selected";
            noCompareTitle.classList.add("text-base", "text-white", "font-roboto", "font-semibold", "leading-5");

            const noCompareText = document.createElement("p");
            noCompareText.textContent = "Select a neighborhood to see how it compares to your best fit."
            noCompareText.classList.add("text-xs", "text-subtitle", "font-mulish", "font-medium", "pt-[12px]");

            cardContainer.append(noCompareTitle);
            cardContainer.append(noCompareText);
        }
    }

    return cardContainer;
}

function renderRadarChart(container, bestMatch, comparedNeighborhood) {
    container.innerHTML = "";

    const width = 300;
    const height = 250;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = 106;
    const levels = 5;

    const axes = [
        { key: "safety", label: "Safety", angle: -Math.PI / 2 },
        { key: "transit", label: "Transit", angle: 0 },
        { key: "dining", label: "Dining", angle: Math.PI / 2 },
        { key: "green", label: "Green", angle: Math.PI },
    ];

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto");

    const g = svg.append("g");

    function pointFor(axis, value) {
        const r = (value / 100) * maxRadius;
        return [
            cx + Math.cos(axis.angle) * r,
            cy + Math.sin(axis.angle) * r
        ];
    }

    function polygonPoints(radius) {
        return axes.map(axis => {
            const x = cx + Math.cos(axis.angle) * radius;
            const y = cy + Math.sin(axis.angle) * radius;
            return `${x},${y}`;
        }).join(" ");
    }

    // grid
    for (let i = 1; i <= levels; i++) {
        const r = (i / levels) * maxRadius;
        g.append("polygon")
            .attr("points", polygonPoints(r))
            .attr("fill", "none")
            .attr("stroke", "#565656")
            .attr("stroke-width", 1);
    }

    // axis labels
    axes.forEach(axis => {
        const labelRadius = maxRadius + 8;
        let x = cx + Math.cos(axis.angle) * labelRadius;
        let y = cy + Math.sin(axis.angle) * labelRadius;

        let anchor = "middle";
        if (axis.key === "transit") {
            anchor = "start";
        }
        if (axis.key === "green") {
            anchor = "end";
        }
        if (axis.key === "safety") {
            y -= 4;
        }
        if (axis.key === "dining") {
            y += 4;
        }

        g.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("font-family", "Mulish, sans-serif")
            .attr("font-weight", 500)
            .attr("text-anchor", anchor)
            .attr("dominant-baseline", "middle")
            .text(axis.label);
    });

    function drawShape(metrics, fill, stroke) {
        if (!metrics) return;

        const points = axes.map(axis => pointFor(axis, metrics[axis.key])).join(" ");

        g.append("polygon")
            .attr("points", points)
            .attr("fill", fill)
            .attr("fill-opacity", 0.65)
            .attr("stroke", stroke)
            .attr("stroke-width", 1.5);
    }

    const bestMetrics = getRadarMetrics(bestMatch);
    const compareMetrics = getRadarMetrics(comparedNeighborhood);

    drawShape(bestMetrics, "rgba(0, 153, 81, 0.7)", "#00A55A");
    drawShape(compareMetrics, "rgba(0, 136, 255, 0.7)", "#0088FF");
}

function buildNeighborhoodsPanel(containerId) {
    const container = document.getElementById(containerId);

    const shell = document.createElement("div");
    shell.classList.add("flex", "flex-col", "flex-1", "min-h-0", "p-[28px]", "overflow-hidden");

    const scrollWrapper = document.createElement("div");
    scrollWrapper.id = "scroll-wrapper"
    scrollWrapper.classList.add("flex", "flex-col", "gap-[24px]", "overflow-y-auto", "flex-1", "min-h-0");

    // Best neighborhood section
    const bestSection = document.createElement("div");
    bestSection.id = "best-neighborhood";
    bestSection.classList.add("w-[300px]", "h-fit", "flex", "flex-col", "gap-[16px]");

    const bestHeader = document.createElement("div");
    bestHeader.classList.add("w-full", "h-fit", "flex", "flex-col", "gap-[12px]");

    const bestTitleWrap = document.createElement("div");
    bestTitleWrap.classList.add("w-full", "h-fit", "flex", "flex-row", "justify-between", "items-center");

    const bestTitle = document.createElement("p");
    bestTitle.textContent = "Best Match";
    bestTitle.classList.add("text-2xl", "font-semibold", "font-roboto", "text-white", "leading-6");

    const resetButton = document.createElement("button");
    resetButton.id = "reset-button";
    resetButton.textContent = "RESET";
    resetButton.classList.add(
        "px-[12px]",
        "py-[7px]",
        "rounded-[10px]",
        "border",
        "border-panel",
        "text-xs",
        "font-semibold",
        "font-mulish",
        "text-white",
        "bg-[#171717]",
        "transition-all",
        "duration-200",
        "hover:bg-white",
        "hover:font-bold",
        "hover:border-[#C8C8C8]",
        "cursor-pointer",
    );

    resetButton.addEventListener("click", () => {
        sections.forEach((section) => {
            const sec = document.querySelector(`[data-id="${section.id}"]`);
            if (!sec) return;
            const slider = sec.querySelector(".range");
            const display = sec.querySelector(".value-input");
            if (!slider || !display) return;

            const c = section.criteria[0];
            slider.value = c.defaultVal;
            display.value = c.format(c.defaultVal);

            const pct = ((c.defaultVal - c.min) / (c.max - c.min)) * 100;
            if (c.type === "max") {
                slider.style.background = `linear-gradient(to right, #ffffff ${pct}%, #333333 ${pct}%)`;
            } else {
                slider.style.background = `linear-gradient(to right, #333333 ${pct}%, #ffffff ${pct}%)`;
            }
        });

        onCriteriaChanged({
            rentMax: 10000,
            safetyMin: 0,
            transitMin: 0,
            diningMin: 0,
            greenMin: 0,
        });

        onNeighborhoodSelected(null);

        if (myMapVis) {
            myMapVis.selectedId = null;
            myMapVis.updateVis();
        }
    });

    bestTitleWrap.append(bestTitle);
    bestTitleWrap.append(resetButton);

    const bestSubtitleWrap = document.createElement("p");
    bestSubtitleWrap.textContent = "Based on the criteria given, this is your best neighborhood fit in San Francisco.";
    bestSubtitleWrap.classList.add("text-xs", "font-medium", "font-mulish", "text-subtitle");

    bestHeader.append(bestTitleWrap);
    bestHeader.append(bestSubtitleWrap);

    // Best neighborhood card
    bestSection.append(bestHeader);

    let bestCardEl = renderNeighborhoodCard(null, true);
    bestSection.append(bestCardEl);

    window.renderBestMatchCard = function (match) {
        const newCard = renderNeighborhoodCard(match, true);
        bestSection.replaceChild(newCard, bestCardEl);
        bestCardEl = newCard;

        window.renderBottomRadar(match, myMapVis?.appData?.comparedNeighborhood ?? null);
    };

    // Comparison section
    const compareSection = document.createElement("div");
    compareSection.id = "compare-neighborhood";
    compareSection.classList.add("w-[300px]", "h-fit", "flex", "flex-col", "gap-[16px]");

    const compareHeader = document.createElement("div");
    compareHeader.classList.add("w-full", "h-fit", "flex", "flex-col", "gap-[12px]");

    const compareTitleWrap = document.createElement("div");
    compareTitleWrap.classList.add("w-full", "h-fit", "flex", "flex-row", "justify-between", "items-center");

    const compareTitle = document.createElement("p");
    compareTitle.textContent = "Compare";
    compareTitle.classList.add("text-2xl", "font-semibold", "font-roboto", "text-white", "leading-6");

    compareTitleWrap.append(compareTitle);

    const compareSubtitleWrap = document.createElement("p");
    compareSubtitleWrap.textContent = "Compare a neighborhood with your best fit.";
    compareSubtitleWrap.classList.add("text-xs", "font-medium", "font-mulish", "text-subtitle");

    compareHeader.append(compareTitleWrap);
    compareHeader.append(compareSubtitleWrap);

    // Compare Neighborhood Card
    compareSection.append(compareHeader);

    let compareCardEl = renderNeighborhoodCard(null, false);
    compareSection.append(compareCardEl);

    window.renderCompareCard = function (neighborhood) {
        const newCard = renderNeighborhoodCard(neighborhood, false);
        compareSection.replaceChild(newCard, compareCardEl);
        compareCardEl = newCard;

        window.renderBottomRadar(myMapVis?.appData?.bestMatch ?? null, neighborhood);
    };

    // Radar Chart Section
    const radarSection = document.createElement("div");
    radarSection.id = "radar-section";
    radarSection.classList.add(
        "w-[300px]",
        "h-fit",
        "flex",
        "flex-col",
        "items-center",
        "justify-center"
    );

    const radarContainer = document.createElement("div");
    radarContainer.id = "radar-chart";
    radarContainer.classList.add("w-full", "flex", "justify-center");

    radarSection.append(radarContainer);

    // Add every section
    scrollWrapper.append(bestSection);
    scrollWrapper.append(compareSection);
    scrollWrapper.append(radarSection);

    shell.append(scrollWrapper);
    container.append(shell);

    window.renderBottomRadar = function (bestMatch, comparedNeighborhood) {
        renderRadarChart(radarContainer, bestMatch, comparedNeighborhood);
    };
}
