/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

let myPreferences, myBestNeighborhood, myCurrentNeighborhood, myMapVis;

function updateAllVisualizations() {
    if (myPreferences) myPreferences.wrangleData();
    if (myBestNeighborhood) myBestNeighborhood.wrangleData();
    if (myCurrentNeighborhood) myCurrentNeighborhood.wrangleData();
    if (myMapVis) myMapVis.wrangleData();
}

function getFilteredNeighborhoods(neighborhoods, criteria) {
    const { rentMax, safetyMin, transitMin, diningMin, greenMin } = criteria;
    return neighborhoods
        .filter(h =>
            h.avg_rent <= rentMax &&
            h.safety >= safetyMin &&
            h.transit_score >= transitMin &&
            h.dining_score >= diningMin &&
            h.green_space_score >= greenMin
        )
        .sort((a, b) => scoreNeighborhood(b) - scoreNeighborhood(a));
}

function scoreNeighborhood(h) {
    const RENT_MIN = 1500, RENT_MAX = 6000;

    const affordability = 1 - (h.avg_rent - RENT_MIN) / (RENT_MAX - RENT_MIN);
    const rentScore = Math.max(0, Math.min(1, affordability));

    return (
        (h.safety / 100) * 20 +
        (h.transit_score / 100) * 20 +
        (h.dining_score / 100) * 20 +
        (h.green_space_score / 100) * 20 +
        rentScore * 25
    );
}

// SF neighborhood boundaries — official DataSF GeoJSON
const SF_HOODS_URL = "../data/SF_Find_Neighborhoods_20260318.geojson";
const NEIGHBORHOOD_URL = "../data/neighborhoods.js";

Promise.all([d3.json(SF_HOODS_URL), d3.json(NEIGHBORHOOD_URL)])
    .then(data => initMainPage(data))
    .catch(err => console.error("Data load failed:", err));

function initMainPage(allDataArray) {
    const [sfGeoJSON, rawNeighborhoods] = allDataArray;

    // Join GeoJSON features to criteria data
    const criteriaByName = new Map(rawNeighborhoods.map(h => [h.name.toLowerCase(), h]));
    sfGeoJSON.features.forEach(feature => {
        const geoName = (feature.properties.name || feature.properties.neighborhood || "").trim();
        const match = criteriaByName.get(geoName.toLowerCase());
        feature.properties = { ...feature.properties, ...match };
    });

    const neighborhoods = rawNeighborhoods;
    const rentExtent = d3.extent(neighborhoods, d => d.avg_rent);
    const safetyExtent = d3.extent(neighborhoods, d => d.safety);
    const transitExtent = d3.extent(neighborhoods, d => d.transit_score);
    const diningExtent = d3.extent(neighborhoods, d => d.dining_score);
    const greenExtent = d3.extent(neighborhoods, d => d.green_space_score);

    // Compute initial best match
    const bestMatch = neighborhoods.reduce((best, n) => {
        const s = scoreNeighborhood(n);
        return (!best || s > scoreNeighborhood(best)) ? n : best;
    }, null);
    console.log(bestMatch);

    // Shared app data
    const appData = {
        sfGeoJSON,
        neighborhoods,
        rentExtent,
        safetyExtent,
        transitExtent,
        diningExtent,
        greenExtent,

        // State owned by main.js
        bestMatch: { ...bestMatch, matchScore: Math.round(scoreNeighborhood(bestMatch)) },
        comparedNeighborhood: null,

        // Callbacks fired by NeighborhoodPanel — main.js reacts here
        onReset() {
            // Reset preferences panel sliders to defaults
            if (myPreferences) myPreferences.resetToDefaults();

            // Recompute best match from full unfiltered list
            const best = neighborhoods.reduce((b, n) =>
                (!b || scoreNeighborhood(n) > scoreNeighborhood(b)) ? n : b, null);
            appData.bestMatch = best
                ? { ...best, matchScore: Math.round(scoreNeighborhood(best)) }
                : null;
            appData.comparedNeighborhood = null;

            updateAllVisualizations();
        },

        onCompare(neighborhood) {
            appData.comparedNeighborhood = neighborhood;
            // Map can highlight the compared neighborhood if desired
            if (myMapVis) myMapVis.wrangleData();
        },
    };

    // ── Instantiate visualizations ──────────────────────────────────────────
    myMapVis = new MapVis("map-container", appData);
    myCriteria = new CriteriaPanel("criteria-container", appData);
    myNeighborhood = new NeighborhoodPanel("results-panel", appData);
}


/**
 * Call this from CriteriaPanel whenever a slider changes.
 * Recomputes bestMatch from the currently filtered set and propagates.
 *
 * @param {object} activeCriteria  — { rentMin, rentMax, safetyMin, enjoyMin, … }
 */
function onCriteriaChanged(activeCriteria) {
    if (!myNeighborhood) return;

    const filtered = getFilteredNeighborhoods(
        myNeighborhood.appData.neighborhoods,
        activeCriteria
    );

    const best = filtered[0] || null;
    myNeighborhood.appData.bestMatch = best
        ? { ...best, matchScore: Math.round(scoreNeighborhood(best)) }
        : null;

    updateAllVisualizations();
}