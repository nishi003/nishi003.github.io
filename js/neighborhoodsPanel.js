function buildPanel(containerId) {
    const container = document.getElementById(containerId);

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
        "hover:scale-110",
        "cursor-pointer",
    );

    bestTitleWrap.append(bestTitle);
    bestTitleWrap.append(resetButton);

    const bestSubtitleWrap = document.createElement("p");
    bestSubtitleWrap.textContent = "Based on the criteria given, this is your best neighborhood fit in San Francisco.";
    bestSubtitleWrap.classList.add("text-xs", "font-medium", "font-mulish", "text-subtitle");

    bestHeader.append(bestTitleWrap);
    bestHeader.append(bestSubtitleWrap);

    bestSection.append(bestHeader);

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

    const unselectButton = document.createElement("button");
    unselectButton.id = "unselect-button";
    unselectButton.textContent = "UNSELECT";
    unselectButton.classList.add(
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
        "hover:scale-110",
        "cursor-pointer",
    );

    compareTitleWrap.append(compareTitle);
    compareTitleWrap.append(unselectButton);

    const compareSubtitleWrap = document.createElement("p");
    compareSubtitleWrap.textContent = "Compare a neighborhood with your best fit.";
    compareSubtitleWrap.classList.add("text-xs", "font-medium", "font-mulish", "text-subtitle");

    compareHeader.append(compareTitleWrap);
    compareHeader.append(compareSubtitleWrap);

    compareSection.append(compareHeader);

    container.append(bestSection);
    container.append(compareSection);
}

buildPanel("neighborhoods-panel");