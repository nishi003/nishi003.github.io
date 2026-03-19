class CriteriaPanel {
    constructor(parentElement, appData) {
        this.parentElement = parentElement;
        this.appData = appData;

        this.criteria = {
            rentMin: appData.rentExtent[0],
            rentMax: appData.rentExtent[1],
            safetyMin: 0,
            enjoyMin: 0
        };

        this.initVis();
    }

    updateRentRangeUI() {
        let vis = this;

        const min = vis.appData.rentExtent[0];
        const max = vis.appData.rentExtent[1];
        const minVal = vis.criteria.rentMin;
        const maxVal = vis.criteria.rentMax;

        const minPct = ((minVal - min) / (max - min)) * 100;
        const maxPct = ((maxVal - min) / (max - min)) * 100;

        d3.select("#rent-range-value")
            .text(`$${minVal.toLocaleString()} – $${maxVal.toLocaleString()}`);

        d3.select("#rent-range-fill")
            .style("left", `${minPct}%`)
            .style("width", `${maxPct - minPct}%`);
    }

    initVis() {
        let vis = this;

        const container = d3.select("#" + vis.parentElement);
        if (container.empty()) {
            console.error(`CriteriaPanel: container #${vis.parentElement} not found`);
            return;
        }

        container.html("");

        const panel = container.append("div")
            .attr("class", "criteria-panel");

        panel.append("h2")
            .text("Find your match");


        // RENT RANGE
        const rentGroup = panel.append("div").attr("class", "criteria-group");

        rentGroup.append("label")
            .text("Rent");

        const rentValue = rentGroup.append("div")
            .attr("id", "rent-range-value")
            .text(`$${vis.criteria.rentMin} – $${vis.criteria.rentMax}`);

        const rentSliderWrap = rentGroup.append("div")
            .attr("class", "dual-slider");

        rentSliderWrap.append("div")
            .attr("class", "dual-slider-track");

        rentSliderWrap.append("div")
            .attr("class", "dual-slider-range")
            .attr("id", "rent-range-fill");

        rentSliderWrap.append("input")
            .attr("type", "range")
            .attr("id", "rent-min-slider")
            .attr("class", "dual-range dual-range-min")
            .attr("min", vis.appData.rentExtent[0])
            .attr("max", vis.appData.rentExtent[1])
            .attr("step", 50)
            .attr("value", vis.criteria.rentMin)
            .on("input", function () {
                vis.criteria.rentMin = +this.value;

                if (vis.criteria.rentMin > vis.criteria.rentMax) {
                    vis.criteria.rentMin = vis.criteria.rentMax;
                    d3.select(this).property("value", vis.criteria.rentMin);
                }

                vis.updateRentRangeUI();
                vis.syncCriteria();
            });

        rentSliderWrap.append("input")
            .attr("type", "range")
            .attr("id", "rent-max-slider")
            .attr("class", "dual-range dual-range-max")
            .attr("min", vis.appData.rentExtent[0])
            .attr("max", vis.appData.rentExtent[1])
            .attr("step", 50)
            .attr("value", vis.criteria.rentMax)
            .on("input", function () {
                vis.criteria.rentMax = +this.value;

                if (vis.criteria.rentMax < vis.criteria.rentMin) {
                    vis.criteria.rentMax = vis.criteria.rentMin;
                    d3.select(this).property("value", vis.criteria.rentMax);
                }

                vis.updateRentRangeUI();
                vis.syncCriteria();
            });

        vis.updateRentRangeUI();

        // SAFETY MIN
        const safetyGroup = panel.append("div").attr("class", "criteria-group");
        safetyGroup.append("label")
            .attr("for", "safety-min-slider")
            .text("Minimum Safety");

        safetyGroup.append("div")
            .attr("id", "safety-min-value")
            .text(vis.criteria.safetyMin);

        safetyGroup.append("input")
            .attr("type", "range")
            .attr("id", "safety-min-slider")
            .attr("min", 0)
            .attr("max", 100)
            .attr("step", 1)
            .attr("value", vis.criteria.safetyMin)
            .on("input", function () {
                vis.criteria.safetyMin = +this.value;
                d3.select("#safety-min-value").text(vis.criteria.safetyMin);
                vis.syncCriteria();
            });

        // ENJOYABILITY MIN
        const enjoyGroup = panel.append("div").attr("class", "criteria-group");
        enjoyGroup.append("label")
            .attr("for", "enjoy-min-slider")
            .text("Minimum Enjoyability");

        enjoyGroup.append("div")
            .attr("id", "enjoy-min-value")
            .text(vis.criteria.enjoyMin);

        enjoyGroup.append("input")
            .attr("type", "range")
            .attr("id", "enjoy-min-slider")
            .attr("min", 0)
            .attr("max", 100)
            .attr("step", 1)
            .attr("value", vis.criteria.enjoyMin)
            .on("input", function () {
                vis.criteria.enjoyMin = +this.value;
                d3.select("#enjoy-min-value").text(vis.criteria.enjoyMin);
                vis.syncCriteria();
            });
    }

    syncCriteria() {
        window.currentCriteria = { ...this.criteria };

        myMapVis.criteria = { ...this.criteria };

        if (myNeighbourhood) {
            myNeighbourhood.criteria = { ...this.criteria };
        }

        updateAllVisualizations();
    }

    wrangleData() {
        // optional, if panel itself needs rerender later
    }
}