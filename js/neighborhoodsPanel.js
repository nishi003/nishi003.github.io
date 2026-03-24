function buildPanel(containerId) {
    const container = document.getElementById(containerId);
    // Best neighborhood section
    const bestSection = document.createElement("div");
    bestSection.id = "best-neighborhood";
    bestSection.classList.add("w-[300px]", "h-fit", "flex", "flex-col", "gap-[16px]");

    const bestHeader = document.createElement("div");
    bestHeader.classList.add("w-full", "h-fit", "flex", "flex-col", "gap-[12px]");

    const titleWrap = document.createElement("div");
    titleWrap.classList.add("w-full", "h-fit", "flex", "flex-row", "justify-between");

    const bestTitle = document.createElement("p");
    bestTitle.textContent = "Best Match";
    bestTitle.classList.add("text-2xl", "font-semibold", "font-roboto", "text-white", "leading-7");

    const resetButton = document.createElement("button");
    resetButton.id = "reset-button";
    resetButton.textContent = "RESET";
    resetButton.classList.add(
        "px-[12px]",
        "py-[8px]",
        "rounded-[10px]",
        "border",
        "border-[#C8C8C8]",
        "text-xs",
        "font-bold",
        "font-mulish",
        "text-white",
        "bg-transparent",
    );

    titleWrap.append(bestTitle);
    titleWrap.append(resetButton);

    const subtitleWrap = document.createElement("p");
    subtitleWrap.textContent = "Based on the criteria given, this is your best neighborhood fit in San Francisco.";
    subtitleWrap.classList.add("text-xs", "font-medium", "font-mulish", "text-subtitle");

    bestHeader.append(titleWrap);
    bestHeader.append(subtitleWrap);

    bestSection.append(bestHeader);

    container.append(bestSection);
}

buildPanel("neighborhoods-panel");