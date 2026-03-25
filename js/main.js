let myPreferences, myBestNeighborhood, myCurrentNeighborhood, myMapVis;

function updateAllVisualizations() {
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
        if (match) feature.properties = { ...feature.properties, ...match };
    });

    const neighborhoods = rawNeighborhoods;

    const appData = {
        sfGeoJSON,
        neighborhoods,
        criteria: {
            rentMax: 10000,
            safetyMin: 0,
            transitMin: 0,
            diningMin: 0,
            greenMin: 0,
        },
        bestMatch: null,
        comparedNeighborhood: null,
    };

    // Compute initial best match
    const best = neighborhoods.reduce((b, n) =>
        (!b || scoreNeighborhood(n) > scoreNeighborhood(b)) ? n : b, null);
    appData.bestMatch = best
        ? { ...best, matchScore: Math.round(scoreNeighborhood(best)) }
        : null;

    // Instantiate visualizations
    myMapVis = new MapVis("map-container", appData);

    // Build panels
    buildPreferencesPanel("preferences-panel", sections);
    buildNeighborhoodsPanel("neighborhoods-panel");

    // Render initial cards
    renderBestMatchCard(appData.bestMatch);
    renderCompareCard(null);

    // Wire up UNSELECT button
    document.getElementById("unselect-button").addEventListener("click", () => {
        onNeighborhoodSelected(null);
    });
}

function onCriteriaChanged(activeCriteria) {
    if (!myMapVis) return;

    myMapVis.appData.criteria = activeCriteria;

    const filtered = getFilteredNeighborhoods(
        myMapVis.appData.neighborhoods,
        activeCriteria
    );

    myMapVis.appData.bestMatch = filtered[0]
        ? { ...filtered[0], matchScore: Math.round(scoreNeighborhood(filtered[0])) }
        : null;

    updateAllVisualizations();
    renderBestMatchCard(myMapVis.appData.bestMatch);
}

function onNeighborhoodSelected(neighborhood) {
    if (!myMapVis) return;

    myMapVis.appData.comparedNeighborhood = neighborhood
        ? { ...neighborhood, matchScore: Math.round(scoreNeighborhood(neighborhood)) }
        : null;

    renderCompareCard(myMapVis.appData.comparedNeighborhood);
    updateAllVisualizations();
}
