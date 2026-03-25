let myPreferences, myBestNeighborhood, myCurrentNeighborhood, myMapVis;

function updateAllVisualizations() {
    if (myMapVis) myMapVis.wrangleData();
}

function getFilteredNeighborhoods(neighborhoods, criteria) {
    return neighborhoods
        .filter(h =>
            h.avg_rent <= criteria.rentMax &&
            h.safety >= criteria.safetyMin &&
            h.transit_score >= criteria.transitMin &&
            h.dining_score >= criteria.diningMin &&
            h.green_space_score >= criteria.greenMin
        )
        .sort((a, b) => scoreNeighborhood(b, criteria) - scoreNeighborhood(a, criteria));
}
function scoreNeighborhood(h, criteria = { rentMax: 10000, safetyMin: 0, transitMin: 0, diningMin: 0, greenMin: 0 }) {
    if (
        h.avg_rent > criteria.rentMax &&
        h.safety < criteria.safetyMin &&
        h.transit_score < criteria.transitMin &&
        h.dining_score < criteria.diningMin &&
        h.green_space_score < criteria.greenMin
    ) return 0;

    const RENT_MIN = 1500, RENT_MAX = 6000;
    const affordability = 1 - (h.avg_rent - RENT_MIN) / (RENT_MAX - RENT_MIN);
    const rentScore = Math.max(0, Math.min(1, affordability));

    // How far above the user's minimum each score is (0–1), penalizes just meeting the bar
    const safetyMargin = criteria.safetyMin > 0 ? (h.safety - criteria.safetyMin) / (100 - criteria.safetyMin) : h.safety / 100;
    const transitMargin = criteria.transitMin > 0 ? (h.transit_score - criteria.transitMin) / (100 - criteria.transitMin) : h.transit_score / 100;
    const diningMargin = criteria.diningMin > 0 ? (h.dining_score - criteria.diningMin) / (100 - criteria.diningMin) : h.dining_score / 100;
    const greenMargin = criteria.greenMin > 0 ? (h.green_space_score - criteria.greenMin) / (100 - criteria.greenMin) : h.green_space_score / 100;
    const rentMargin = criteria.rentMax < 10000 ? (criteria.rentMax - h.avg_rent) / (criteria.rentMax - RENT_MIN) : rentScore;

    const raw =
        Math.max(0, safetyMargin) * 25 +
        Math.max(0, transitMargin) * 25 +
        Math.max(0, diningMargin) * 25 +
        Math.max(0, greenMargin) * 25 +
        Math.max(0, rentMargin) * 25;

    return (raw / 125) * 100;
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
        ? { ...best, matchScore: Math.round(scoreNeighborhood(best, appData.criteria)) }
        : null;

    // Instantiate visualizations
    myMapVis = new MapVis("map-container", appData);

    // Build panels
    buildPreferencesPanel("preferences-panel", sections);
    buildNeighborhoodsPanel("neighborhoods-panel");

    // Render initial cards
    renderBestMatchCard(appData.bestMatch);
    renderCompareCard(null);
    renderBottomRadar(appData.bestMatch, null);

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
        ? { ...filtered[0], matchScore: Math.round(scoreNeighborhood(filtered[0], activeCriteria)) }
        : null;

    if (myMapVis.appData.comparedNeighborhood) {
        myMapVis.appData.comparedNeighborhood = {
            ...myMapVis.appData.comparedNeighborhood,
            matchScore: Math.round(scoreNeighborhood(myMapVis.appData.comparedNeighborhood, activeCriteria))
        };
        renderCompareCard(myMapVis.appData.comparedNeighborhood);
    }

    updateAllVisualizations();
    renderBestMatchCard(myMapVis.appData.bestMatch);
}

function onNeighborhoodSelected(neighborhood) {
    if (!myMapVis) return;

    myMapVis.appData.comparedNeighborhood = neighborhood
        ? { ...neighborhood, matchScore: Math.round(scoreNeighborhood(neighborhood, myMapVis.appData.criteria)) }
        : null;

    renderCompareCard(myMapVis.appData.comparedNeighborhood);
    updateAllVisualizations();
}
