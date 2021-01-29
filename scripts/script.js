let searchInput = document.querySelector(".input-field");
const apiID = "5e3dbd6c8b6daa7d65c465f176bf3fe1";
const trendingURL = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiID}`;
const upcomingURL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiID}`;
let genresObject;

let getGenres = () => {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiID}`)
    .then((response) => response.json())
    .then((data) => {
      genresObject = data;
    });
};

getGenres();

$(".logo").on("click", function () {
  $(".sidebar").removeClass("sidebar-open");
  $(".burger-menu").removeClass("burger-menu-clicked");
  sessionStorage.setItem("search-input", "");
  $(".movies-categories-wrapper").html("");
});

$(".burger-menu").on("click", function () {
  if ($(".burger-menu").hasClass("burger-menu-clicked")) {
    $(".burger-menu").removeClass("burger-menu-clicked");
    $(".sidebar").removeClass("sidebar-open");
  } else {
    $(".burger-menu").addClass("burger-menu-clicked");
    $(".sidebar").addClass("sidebar-open");
  }
});

$(".link-trending").on("click", function () {
  categoryClicked(trendingURL, "trending", 20);
});

$(".link-upcoming").on("click", function () {
  categoryClicked(upcomingURL, "upcoming", 20);
});

$(".link-genre").on("click", function () {
  let genreIdInput = 0;
  let genreInput = this.innerHTML;

  if (genreInput.indexOf(" ") !== -1) {
    genreInput = genreInput.replace(/ /g, "-");
  }

  for (i = 0; i < genresObject.genres.length; i++) {
    if (this.innerHTML.toUpperCase() == genresObject.genres[i].name.toUpperCase()) {
      genreIdInput = genresObject.genres[i].id;
    }
  }
  let genreURL = `https://api.themoviedb.org/3/discover/movie?api_key=${apiID}&with_genres=${genreIdInput}`;
  categoryClicked(genreURL, genreInput, 0);
});

function categoryClicked(categoryURL, category, dataQuantity) {
  $(".movies-categories-wrapper").html("");
  $(".sidebar").removeClass("sidebar-open");
  $(".burger-menu").removeClass("burger-menu-clicked");
  displayMovieData(categoryURL, category, dataQuantity);
}

$(".button-submit-overlay").on("click", function () {
  $(".button-submit-overlay").addClass("display-none");
  $(".text-input").addClass("input-field-open");
  $(".logo").addClass("invisible");
});

$(".button-submit-search").on("click", function () {
  if (searchInput.value != "") {
    let searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${apiID}&language=en-US&query=${searchInput.value}&page=1&include_adult=false`;
    categoryClicked(searchURL, searchInput.value, 0);
    searchInput.value = "";

    $(".button-submit-overlay").removeClass("display-none");
    $(".text-input").removeClass("input-field-open");
    $(".logo").removeClass("invisible");
  }
});

function displayMovieData(dataURL, categoryTitle, dataQuantity) {
  fetch(dataURL)
    .then((response) => response.json())
    .then((data) => {
      if (data.results.length > 0) {
        $(".movies-categories-wrapper").append(`<div class="movies-category movies-category-${categoryTitle}">
        <h1 class="movies-header movies-header-${categoryTitle}"> ${categoryTitle.toUpperCase()} MOVIES</h1>
        <div class="movies-container movies-container-${categoryTitle}"></div>
        </div>`);

        if (data.results.length < dataQuantity || dataQuantity == 0) {
          dataQuantity = data.results.length;
        }

        for (i = 0; i < dataQuantity; i++) {
          $(`.movies-container-${categoryTitle}`).append(`<div href="movie.html" class="movie movie-${categoryTitle}${i}"></div>`);
          if (data.results[i].original_title != null) {
            $(`.movie-${categoryTitle}${i}`).append(`<div class="title">${data.results[i].original_title}</div>`);
          } else {
            $(`.movie-${categoryTitle}${i}`).append(`<div class="title">${data.results[i].name}</div>`);
          }

          const movie = document.querySelector(`.movie-${categoryTitle}${i}`);
          movie.dataset.movienumber = data.results[i].id;
          movieImageDisplay(data, i, categoryTitle);
        }
      }

      movieClicked();
    });
}

let movieClicked = () => {
  $(".movie").on("click", function () {
    $(".movies-categories-wrapper").html("");
    $(".movies-categories-wrapper").append(`<div class="movie-container-selected">
            <div class="movie-poster movie-poster-selected"></div>
            <div class="movie-info"></div>
          </div>`);

    let movieId = this.getAttribute("data-movienumber");

    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiID}`)
      .then((response) => response.json())
      .then((data) => {
        $(".movie-info").append(`<div class="movie-title movie-title-selected">${data.original_title.toUpperCase()}</div>`);

        if (data.overview != null) {
          $(".movie-info").append(`<div class="movie-plot">${data.overview}</div>`);
        }

        if (data.vote_average != null) {
          $(".movie-info").append(
            `<div class="movie-rating movie-rating-selected"><span class="white-text">Rating:</span>${data.vote_average}</div>`
          );
        }

        if (data.genres.length > 0) {
          $(".movie-info").append(`<div class="movie-genre-list movie-genre-list-selected"><span class="white-text">Genre:</span> </div>`);
          for (i = 0; i < data.genres.length; i++) {
            for (a = 0; a < genresObject.genres.length; a++) {
              if (data.genres[i].id == genresObject.genres[a].id) {
                $(".movie-genre-list").append(`<div class="movie-genre movie-genre-selected">${genresObject.genres[a].name}</div>`);
                if (i != data.genres.length - 1) {
                  $(".movie-genre-list").append(`,`);
                } else {
                  $(".movie-genre-list").append(`.`);
                }
              }
            }
          }
        }

        if (data.release_date) {
          $(".movie-info").append(
            `<div class="movie-release movie-release-selected"><span class="white-text">Release date: </span>${data.release_date}</div>`
          );
        }

        if (data.poster_path != null) {
          let poster = data.poster_path;
          let moviePoster = new Image();
          moviePoster.src = `https://image.tmdb.org/t/p/w500${poster}`;
          $(".movie-poster-selected").css("background-image", `url(https://image.tmdb.org/t/p/w500${poster})`);
        } else $(".movie-poster-selected").append("NO MOVIE POSTER");

        if (data.imdb_id != null) {
          $(".movie-info").append(`<a href="https://www.imdb.com/title/${data.imdb_id}" class="button button-imdb">VIEW ON IMDB</a>`);
        }
      });

    let similarMoviesURL = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiID}&language=en-US&page=1`;
    displayMovieData(similarMoviesURL, "similar", 10);
  });
};

let movieImageDisplay = (data, arrayIndex, categoryTitle) => {
  $(`.movie-${categoryTitle}${arrayIndex}`).append(
    `<div class="movie-poster-container"><div class="movie-poster movie-poster-${categoryTitle}${arrayIndex}"></div></div>`
  );
  let poster = data.results[arrayIndex].poster_path;
  if (poster != null) {
    let moviePoster = new Image();
    moviePoster.src = `https://image.tmdb.org/t/p/w500${poster}`;
    $(`.movie-poster-${categoryTitle}${arrayIndex}`).css("background-image", `url(https://image.tmdb.org/t/p/w500${poster})`);
  } else {
    $(`.movie-poster-${categoryTitle}${arrayIndex}`).append("NO MOVIE POSTER");
  }
};
