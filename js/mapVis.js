/* * * * * * * * * * * * * *
 *          MapVis          *
 * * * * * * * * * * * * * */

class MapVis {

    constructor(parentElement, appData) {
        this.parentElement = parentElement;
        this.appData = appData;

        // Current filter criteria — updated by wrangleData()
        this.criteria = {
            rentMin: 0,
            rentMax: 99999,
            safetyMin: 0,
            enjoyMin: 0
        };

        // Track which neighbourhood is highlighted from results panel
        this.highlightedId = null;

        // Track which neighbourhood is selected (compared)
        this.selectedId = null;

        if (!document.getElementById("map-tooltip")) {
            const tip = document.createElement("div");
            tip.id = "map-tooltip";
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
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 9999;
                white-space: nowrap;
            `;
            document.body.appendChild(tip);
        }
        this.tooltip = d3.select("#map-tooltip");

        this.initVis();
    }

    showTooltip(event, d) {
        const name = d?.properties?.name || "Unknown neighborhood";

        this.tooltip
            .style("opacity", 1)
            .html(name);

        this.moveTooltip(event);
    }

    moveTooltip(event) {
        const node = this.tooltip.node();
        if (!node) return;

        const rect = node.getBoundingClientRect();
        let x = event.clientX - (rect.width / 2);
        let y = event.clientY - rect.height - 10;

        if (x + rect.width > window.innerWidth - 8) {
            x = event.clientX - rect.width;
        }
        if (y < 8) {
            y = event.clientY;
        }

        this.tooltip
            .style("left", `${x}px`)
            .style("top", `${y}px`);
    }

    hideTooltip() {
        this.tooltip.style("opacity", 0);
    }

    handleMouseEnter(event, d) {
        const id = d.properties.id;
        const isBest = id === this.appData.bestMatch?.id;
        const isSelected = id === this.selectedId;

        if (isSelected) {
            d3.select(event.currentTarget)
                .style("filter", "url(#selected-glow)")
                .style("stroke", "#0088FF")
                .style("stroke-width", "3px")
                .style("fill", "rgba(0, 136, 255, 0.45)")
                .raise();
        } else if (isBest) {
            d3.select(event.currentTarget)
                .style("filter", "url(#best-glow)")
                .style("stroke", "#009951")
                .style("stroke-width", "3px")
                .style("fill", "rgba(0, 153, 81, 0.45)")
                .raise();
        } else {
            d3.select(event.currentTarget).raise()
                .style("filter", "url(#neighbourhood-glow)")
                .style("stroke", "#faf9f6")
                .style("stroke-width", "3px");
        }
    }

    handleMouseLeave(event, d) {
        const id = d.properties.id;
        const isBest = id === this.appData.bestMatch?.id;
        const isSelected = id === this.selectedId;

        if (isSelected) {
            d3.select(event.currentTarget)
                .style("filter", "url(#selected-glow)")
                .style("stroke", "#0088FF")
                .style("stroke-width", "2px")
                .style("fill", "rgba(0, 136, 255, 0.3)");
        } else if (isBest) {
            d3.select(event.currentTarget)
                .style("filter", "url(#best-glow)")
                .style("stroke", "#009951")
                .style("stroke-width", "2px")
                .style("fill", "rgba(0, 153, 81, 0.3)")
                .raise();
        } else {
            d3.select(event.currentTarget)
                .style("filter", null)
                .style("stroke", "var(--border)")
                .style("stroke-width", "1px")
                .lower();
        }
    }

    initVis() {
        let vis = this;

        requestAnimationFrame(() => {
            const container = document.getElementById(vis.parentElement);
            const bounds = container.getBoundingClientRect();
            vis.margin = { top: 20, right: 20, bottom: 40, left: 20 };
            vis.width = bounds.width - vis.margin.left - vis.margin.right;
            vis.height = bounds.height - vis.margin.top - vis.margin.bottom;

            // SVG
            vis.svg = d3.select("#" + vis.parentElement).append("svg")
                .attr("width", bounds.width)
                .attr("height", bounds.height);

            // defs: clip path + subtle glow filters
            const defs = vis.svg.append("defs");

            // Default hover glow (white)
            const glow = defs.append("filter")
                .attr("id", "neighbourhood-glow")
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "160%")
                .attr("height", "160%");
            glow.append("feGaussianBlur")
                .attr("stdDeviation", 3.5)
                .attr("result", "coloredBlur");
            const merge = glow.append("feMerge");
            merge.append("feMergeNode").attr("in", "coloredBlur");
            merge.append("feMergeNode").attr("in", "SourceGraphic");

            // Best match glow (green)
            const bestGlow = defs.append("filter")
                .attr("id", "best-glow")
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "160%")
                .attr("height", "160%");
            bestGlow.append("feGaussianBlur")
                .attr("stdDeviation", 4)
                .attr("result", "coloredBlur");
            const bestMerge = bestGlow.append("feMerge");
            bestMerge.append("feMergeNode").attr("in", "coloredBlur");
            bestMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // Selected glow (blue)
            const selectedGlow = defs.append("filter")
                .attr("id", "selected-glow")
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "160%")
                .attr("height", "160%");
            selectedGlow.append("feGaussianBlur")
                .attr("stdDeviation", 4)
                .attr("result", "coloredBlur");
            const selectedMerge = selectedGlow.append("feMerge");
            selectedMerge.append("feMergeNode").attr("in", "coloredBlur");
            selectedMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // Main group - receives zoom transform
            vis.mapGroup = vis.svg.append("g")
                .attr("class", "map-group")
                .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

            // Projection - fit the SF GeoJSON into the available space
            vis.projection = d3.geoMercator()
                .fitSize([vis.width, vis.height], vis.appData.sfGeoJSON);
            vis.path = d3.geoPath().projection(vis.projection);

            // Draw all neighbourhood polygons
            vis.mapGroup.selectAll(".neighbourhood-path")
                .data(vis.appData.sfGeoJSON.features)
                .join("path")
                .attr("d", vis.path)
                .attr("class", "neighbourhood-path")
                .style("fill", "var(--inside)")
                .style("stroke", "var(--border)")
                .style("stroke-width", "2px")
                .style("stroke-linejoin", "round")
                .style("cursor", "pointer")
                .on("mouseenter", (event, d) => {
                    vis.handleMouseEnter(event, d);
                    vis.showTooltip(event, d);
                })
                .on("mousemove", (event) => vis.moveTooltip(event))
                .on("mouseleave", (event, d) => {
                    vis.handleMouseLeave(event, d);
                    vis.hideTooltip();
                })
                .on("click", (event, d) => vis.handleClick(event, d));

            vis.wrangleData();
        });
    }

    handleClick(event, d) {
        let vis = this;
        const id = d.properties.id;
        if (!id || id === -1) return;

        // Toggle off if clicking the same neighbourhood again
        if (vis.selectedId === id) {
            vis.selectedId = null;
            onNeighborhoodSelected(null);
        } else {
            vis.selectedId = id;
            onNeighborhoodSelected(d.properties);
        }

        vis.updateVis();
    }

    // ── Called whenever filters change ──────────────────────
    wrangleData() {
        let vis = this;

        vis.matchingIds = new Set(
            getFilteredNeighborhoods(vis.appData.neighborhoods, vis.appData.criteria)
                .map(h => h.id)
        );

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const bestId = vis.appData.bestMatch?.id;
        const selectedId = vis.selectedId;

        vis.mapGroup.selectAll(".neighbourhood-path")
            .each(function (d) {
                const props = d.properties;
                const id = props.id;
                const isMatch = vis.matchingIds.has(id);
                const isNoData = id === undefined || id === -1;
                const isHighlit = id === vis.highlightedId;
                const isBest = id === bestId;
                const isSelected = id === selectedId;

                const path = d3.select(this);

                if (isNoData) {
                    path.style("fill", "rgba(255,255,255,0.03)")
                        .style("opacity", 0.4)
                        .style("filter", null);
                } else if (isSelected) {
                    path.style("fill", "rgba(0, 136, 255, 0.3)")
                        .style("opacity", 1)
                        .style("stroke", "#0088FF")
                        .style("stroke-width", "2px")
                        .style("filter", "url(#selected-glow)")
                        .raise();
                } else if (isBest) {
                    path.style("fill", "rgba(0, 153, 81, 0.3)")
                        .style("opacity", 1)
                        .style("stroke", "#009951")
                        .style("stroke-width", "2px")
                        .style("filter", "url(#best-glow)")
                        .raise();
                } else if (isMatch) {
                    path.style("fill", "var(--inside)")
                        .style("opacity", 1)
                        .style("filter", isHighlit ? "url(#neighbourhood-glow)" : null)
                        .style("stroke", isHighlit ? "#ffffff" : "var(--border)")
                        .style("stroke-width", isHighlit ? "3px" : "1px");
                } else {
                    path.style("fill", "rgba(255,255,255,0.04)")
                        .style("opacity", 0.5)
                        .style("filter", null)
                        .style("stroke-width", "1px")
                        .style("stroke", "var(--border)");
                }
            });
    }

    // ── Called from results panel to highlight a neighbourhood
    highlight(neighbourhoodId) {
        let vis = this;
        vis.highlightedId = neighbourhoodId;
        vis.updateVis();

        // Pan to the highlighted neighbourhood if it's in the data
        const feature = vis.appData.sfGeoJSON.features
            .find(f => f.properties.id === neighbourhoodId);

        if (feature) {
            const [[x0, y0], [x1, y1]] = vis.path.bounds(feature);
            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;
            const scale = Math.min(
                8,
                0.9 / Math.max((x1 - x0) / vis.width, (y1 - y0) / vis.height)
            );

            vis.svg.transition().duration(600)
                .call(
                    vis.zoom.transform,
                    d3.zoomIdentity
                        .translate(vis.width / 2, vis.height / 2)
                        .scale(scale)
                        .translate(-cx, -cy)
                );
        }
    }

    // ── Tooltip handlers ────────────────────────────────────
    _onHover(event, d) {
        let vis = this;
        const p = d.properties;

        // Slightly lift matching neighbourhoods on hover
        if (vis.matchingIds.has(p.id)) {
            d3.select(event.currentTarget)
                .style("fill", "rgba(255,255,255,0.75)");
        }

        // Build tooltip content
        const isMatch = vis.matchingIds.has(p.id);
        const hasData = p.id && p.id !== -1;
        const score = hasData ? Math.round(scoreNeighbourhood(p)) : null;

        const rentStr = p.avg_rent > 0
            ? `$${p.avg_rent.toLocaleString()}/mo`
            : "N/A";

        vis.tooltip
            .style("opacity", 1)
            .html(`
                <div style="font-size:13px; font-weight:600; margin-bottom:6px; color:#faf9f6;">
                    ${p.name}
                </div>
                ${hasData ? `
                <div style="display:flex; flex-direction:column; gap:4px; color:rgba(255,255,255,0.6); font-size:11px;">
                    <div style="display:flex; justify-content:space-between; gap:16px;">
                        <span>Avg Rent</span>
                        <span style="color:#faf9f6;">${rentStr}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; gap:16px;">
                        <span>Safety</span>
                        <span style="color:#faf9f6;">${p.safety}/100</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; gap:16px;">
                        <span>Enjoyability</span>
                        <span style="color:#faf9f6;">${p.enjoyability}/100</span>
                    </div>
                    <div style="margin-top:4px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.12);
                                display:flex; justify-content:space-between;">
                        <span>${isMatch ? "✓ Match" : "✗ No match"}</span>
                        ${isMatch ? `<span style="color:#faf9f6;">Score ${score}</span>` : ""}
                    </div>
                </div>` : `
                <div style="color:rgba(255,255,255,0.4); font-size:11px;">No residential data</div>
                `}
            `);

        vis._onMove(event);
    }

    _onMove(event) {
        let vis = this;
        const pad = 14;
        const tw = 190;
        let x = event.clientX + pad;
        let y = event.clientY + pad;

        if (x + tw > window.innerWidth) x = event.clientX - tw - pad;
        if (y + 160 > window.innerHeight) y = event.clientY - 160 - pad;

        vis.tooltip
            .style("left", x + "px")
            .style("top", y + "px");
    }

    _onLeave() {
        let vis = this;

        // Restore fill for all matching paths
        vis.mapGroup.selectAll(".neighbourhood-path")
            .filter(d => vis.matchingIds.has(d.properties.id))
            .style("fill", "var(--inside)");

        vis.tooltip.style("opacity", 0);
    }

    // ── Legend ──────────────────────────────────────────────
    _drawLegend() {
        let vis = this;

        const legend = vis.svg.append("g")
            .attr("class", "map-legend")
            .attr("transform", `translate(${vis.margin.left + 12}, ${vis.margin.top + 12})`);

        const items = [
            { color: "var(--inside)", label: "Matches criteria" },
            { color: "rgba(255,255,255,0.04)", label: "Does not match", stroke: "rgba(255,255,255,0.12)" },
        ];

        items.forEach((item, i) => {
            const row = legend.append("g")
                .attr("transform", `translate(0, ${i * 22})`);

            row.append("rect")
                .attr("width", 14).attr("height", 14)
                .attr("rx", 2)
                .style("fill", item.color)
                .style("stroke", item.stroke || "rgba(255,255,255,0.4)")
                .style("stroke-width", "1px");

            row.append("text")
                .attr("x", 20).attr("y", 7)
                .attr("dominant-baseline", "middle")
                .style("font-size", "10px")
                .style("fill", "rgba(255,255,255,0.5)")
                .style("font-family", "inherit")
                .style("letter-spacing", "0.05em")
                .text(item.label);
        });
    }
}