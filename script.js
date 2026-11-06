// Add s=, i=, or t= to the end of this URL
const API_URL = "https://www.omdbapi.com/?apikey=458b6695&";

const POSTER_PLACEHOLDER = `<div class="movie-card__poster-placeholder">Movie Poster<br />Not Available</div>`;

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const moviesGrid = document.getElementById("moviesGrid");
const resultsInfo = document.getElementById("resultsInfo");
const sortSelect = document.getElementById("sortSelect");
const typeSelect = document.getElementById("typeSelect");

let movies = []; // the latest results, so filter and sort don't need a new fetch
let currentSearch = "";

// 1. Pass in the search term > fetch it > convert the response to JS with .json()
async function getMovies(search) {
  currentSearch = search;
  renderLoading();

  try {
    const response = await fetch(`${API_URL}s=${encodeURIComponent(search)}`);
    const data = await response.json();

    movies = data.Search || [];
    renderMovies(data.Error); // data.Error is only set when OMDb finds nothing
  } catch (error) {
    console.error(error);
    movies = [];
    renderMovies("Something went wrong. Please try again.");
  }
}

// 2. Apply the filter and sort dropdowns to the results
function getVisibleMovies() {
  const list = movies.filter(
    (movie) => typeSelect.value === "all" || movie.Type === typeSelect.value
  );

  // parseInt turns a series year like "2008–2013" into 2008
  const year = (movie) => parseInt(movie.Year, 10) || 0;

  if (sortSelect.value === "a-z") list.sort((a, b) => a.Title.localeCompare(b.Title));
  if (sortSelect.value === "z-a") list.sort((a, b) => b.Title.localeCompare(a.Title));
  if (sortSelect.value === "newest") list.sort((a, b) => year(b) - year(a));
  if (sortSelect.value === "oldest") list.sort((a, b) => year(a) - year(b));

  return list;
}

// 3. Turn one movie from the array into HTML
function movieHTML(movie) {
  const poster =
    movie.Poster === "N/A"
      ? POSTER_PLACEHOLDER
      : `<img class="movie-card__img" src="${movie.Poster}" alt="" />`;

  return `
    <div class="movie-card">
      ${poster}
      <h2 class="movie-card__title">${movie.Title}</h2>
      <p class="movie-card__year">${movie.Year} · <span class="movie-card__type">${movie.Type}</span></p>
    </div>
  `;
}

// 4. Set every element of the array to HTML and put it on the page
function renderMovies(emptyMessage = "No results match this filter.") {
  const list = getVisibleMovies();

  resultsInfo.textContent = `Showing: ${currentSearch} (${list.length})`;
  moviesGrid.innerHTML = list.length
    ? list.map(movieHTML).join("")
    : `<p class="movies-grid__message">${emptyMessage}</p>`;
}

function renderLoading() {
  const skeletonCard = `
    <div class="movie-card">
      <div class="movie-card__img--skeleton"></div>
      <div class="movie-card__title--skeleton"></div>
      <div class="movie-card__year--skeleton"></div>
    </div>
  `;

  resultsInfo.textContent = `Searching: ${currentSearch}...`;
  moviesGrid.innerHTML = skeletonCard.repeat(10);
}

// Events
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading
  const search = searchInput.value.trim();
  if (search) getMovies(search);
});

sortSelect.addEventListener("change", () => renderMovies());
typeSelect.addEventListener("change", () => renderMovies());

// Swap in the placeholder if a poster image fails to load.
// Image errors don't bubble, so this listens in the capture phase (the "true").
moviesGrid.addEventListener(
  "error",
  (event) => {
    if (event.target.tagName === "IMG") event.target.outerHTML = POSTER_PLACEHOLDER;
  },
  true
);

// First results when the page opens
getMovies("Marvel");
