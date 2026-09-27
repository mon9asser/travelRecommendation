// travel_recommendation.js
// Handles fetching recommendation data, keyword search, rendering results, and clearing them.

let travelData = null;

// A small map so we can show a friendly local time for the countries we know about.
const COUNTRY_TIMEZONES = {
  japan: "Asia/Tokyo",
  italy: "Europe/Rome",
  peru: "America/Lima"
};

document.addEventListener("DOMContentLoaded", () => {
  fetchTravelData();

  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  if (clearBtn) clearBtn.addEventListener("click", clearResults);
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    });
  }
});

// Task 6: fetch data from the JSON "API" using the Fetch API method.
function fetchTravelData() {
  fetch("travel_recommendation_api.json")
    .then((response) => response.json())
    .then((data) => {
      travelData = data;
      console.log("Travel data loaded:", data);
    })
    .catch((error) => {
      console.error("Error fetching travel recommendation data:", error);
    });
}

// Task 7 & 9: read the keyword, normalize it, and decide what to show.
function handleSearch() {
  const input = document.getElementById("searchInput");
  const rawKeyword = input ? input.value : "";
  const keyword = rawKeyword.trim().toLowerCase();

  if (!travelData) {
    renderMessage("Still loading recommendations — try again in a moment.");
    return;
  }

  if (!keyword) {
    renderMessage("Type a keyword like \"beach\", \"temple\", or \"country\" to see recommendations.");
    return;
  }

  if (keyword.includes("beach")) {
    renderResults(travelData.beaches, "Beaches for you");
  } else if (keyword.includes("temple")) {
    renderResults(travelData.temples, "Temples for you");
  } else if (keyword.includes("countr")) {
    // Flatten every country's cities into individual result cards.
    const cityResults = [];
    travelData.countries.forEach((country) => {
      country.cities.forEach((city) => {
        cityResults.push({
          name: `${city.name}, ${country.name}`,
          imageUrl: city.imageUrl,
          description: city.description,
          countryName: country.name
        });
      });
    });
    renderResults(cityResults, "Countries for you");
  } else {
    // Also allow searching directly by a known country or city name.
    const matchedCountry = travelData.countries.find(
      (c) => c.name.toLowerCase().includes(keyword)
    );
    if (matchedCountry) {
      const cityResults = matchedCountry.cities.map((city) => ({
        name: `${city.name}, ${matchedCountry.name}`,
        imageUrl: city.imageUrl,
        description: city.description,
        countryName: matchedCountry.name
      }));
      renderResults(cityResults, `${matchedCountry.name} recommendations`);
    } else {
      renderMessage(`No recommendations found for "${rawKeyword}". Try "beach", "temple", or "country".`);
    }
  }
}

// Task 8: build the result cards inside a CSS grid.
function renderResults(items, heading) {
  const grid = document.getElementById("resultsGrid");
  const headingEl = document.getElementById("resultsHeading");
  if (!grid) return;

  grid.innerHTML = "";
  if (headingEl) headingEl.textContent = heading;

  if (!items || items.length === 0) {
    renderMessage("No recommendations found. Try a different keyword.");
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "result-card";

    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.name;

    const body = document.createElement("div");
    body.className = "result-card-body";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const desc = document.createElement("p");
    desc.textContent = item.description;

    body.appendChild(title);
    body.appendChild(desc);

    // Task 10 (optional): show local time when we recognize the country.
    if (item.countryName) {
      const tz = COUNTRY_TIMEZONES[item.countryName.toLowerCase()];
      if (tz) {
        const timeLine = document.createElement("p");
        timeLine.style.fontSize = "0.85rem";
        timeLine.style.color = "#4E7C82";
        timeLine.textContent = `Local time: ${getLocalTime(tz)}`;
        body.appendChild(timeLine);
      }
    }

    const visitBtn = document.createElement("button");
    visitBtn.className = "btn btn-primary";
    visitBtn.textContent = "Book Now";

    body.appendChild(visitBtn);
    card.appendChild(img);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function renderMessage(message) {
  const grid = document.getElementById("resultsGrid");
  const headingEl = document.getElementById("resultsHeading");
  if (!grid) return;
  if (headingEl) headingEl.textContent = "Recommendations";
  grid.innerHTML = `<div class="empty-state">${message}</div>`;
}

// Task 9: clear the search field and the results grid.
function clearResults() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
  const grid = document.getElementById("resultsGrid");
  const headingEl = document.getElementById("resultsHeading");
  if (grid) grid.innerHTML = "";
  if (headingEl) headingEl.textContent = "Recommendations";
}

// Task 10 (optional): current local time for a given IANA time zone.
function getLocalTime(timeZone) {
  const options = { timeZone, hour12: true, hour: "numeric", minute: "numeric" };
  return new Date().toLocaleTimeString("en-US", options);
}
