/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables, switches, helper functions
let myCriteria, myNeighbourhood, myMapVis;

function updateAllVisualizations() {
    if (myCriteria) myCriteria.wrangleData();
    if (myNeighbourhood) myNeighbourhood.wrangleData();
    if (myMapVis) myMapVis.wrangleData();
}

function getFilteredNeighbourhoods(neighbourhoods, criteria) {
    const { rentMin, rentMax, safetyMin, enjoyMin } = criteria;

    return neighbourhoods
        .filter(h =>
            h.avg_rent >= rentMin &&
            h.avg_rent <= rentMax &&
            h.safety >= safetyMin &&
            h.enjoyability >= enjoyMin
        )
        .sort((a, b) => scoreNeighbourhood(b) - scoreNeighbourhood(a));
}

// Composite match score — higher is better.
// Weights: safety 40%, enjoyability 40%, affordability 20%
function scoreNeighbourhood(h) {
    const RENT_MIN = 1500, RENT_MAX = 6000;
    const affordability = 1 - (h.avg_rent - RENT_MIN) / (RENT_MAX - RENT_MIN);
    return (
        (h.safety / 100) * 40 +
        (h.enjoyability / 100) * 40 +
        affordability * 20
    );
}

// SF neighbourhood boundaries — official DataSF GeoJSON
const SF_HOODS_URL =
    "../data/SF_Find_Neighborhoods_20260318.geojson";
const NEIGHBOURHOOD_URL = "../data/neighbourhoods.js";

let promises = [
    d3.json(SF_HOODS_URL),
    d3.json(NEIGHBOURHOOD_URL),
];

Promise.all(promises)
    .then(function (data) { initMainPage(data); })
    .catch(function (err) { console.error("Data load failed:", err); });


// initMainPage
function initMainPage(allDataArray) {
    const [sfGeoJSON, rawNeighbourhoods] = allDataArray;

    // join GeoJSON features to criteria data
    const criteriaByName = new Map(rawNeighbourhoods.map(h => [h.name.toLowerCase(), h]));

    // attach criteria to each GeoJSON feature
    sfGeoJSON.features.forEach(feature => {
        const geoName = (feature.properties.name || feature.properties.neighborhood || "").trim();
        const match = criteriaByName.get(geoName.toLowerCase());
        feature.properties = { ...feature.properties, ...match };
    });

    // build lookup structures
    const neighbourhoods = rawNeighbourhoods;
    const rentExtent = d3.extent(neighbourhoods, d => d.avg_rent);
    const safetyExtent = d3.extent(neighbourhoods, d => d.safety);
    const enjoyExtent = d3.extent(neighbourhoods, d => d.enjoyability);

    // package into appData
    const appData = {
        sfGeoJSON,
        neighbourhoods,
        rentExtent,
        safetyExtent,
        enjoyExtent,
    };

    myMapVis = new MapVis("map-container", appData);
    myCriteria = new CriteriaPanel("criteria-container", appData);
    // myNeighbourhood = new NeighbourhoodPanel("results-panel", appData);

    // console.log(`${neighbourhoods.length} neighbourhoods`);
    // console.log(`${sfGeoJSON.features.length} GeoJSON features`);
    // console.log(`Rent range: $${rentExtent[0]}–$${rentExtent[1]}`);
    // console.log(`Safety range: ${safetyExtent[0]}–${safetyExtent[1]}`);
}