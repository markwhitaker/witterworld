"use strict";

$(function () {
    console.log("ready");

    var map = new jvm.Map({
        map: "world_merc",
        container: $("#map"),
        backgroundColor: "#00000000",
        zoomMin: 0.9,
        focusOn: {
            x: 0.5,
            y: 0.5,
            scale: 0.9
        },
        series: {
            regions: [{
                attribute: "fill"
            }]
        },
        onRegionClick: function (_, countryCode) {
            var film = getFilmDetails(countryCode);
            console.log("Clicked " + countryCode + ": " + film.title);
            showFilmDetails(countryCode);
        }
    });

    var films = {};

    $.getJSON("data/films.json", function (dataArray) {
        dataArray.forEach(film => {
            films[film.countryCode] = film;
        });
        map.series.regions[0].setValues(getCountryColours());
    });

    function getCountryColours() {
        var colours = {};
        for (let region in map.regions) {
            colours[region] = films[region] ? "#00B3DB" : "#555555";
        }
        return colours;
    }

    function getFilmDetails(countryCode) {
        var film = films[countryCode];
        return (film ? film : {
            title: "No title available"
        });
    }

    function showFilmDetails(countryCode) {
        var film = films[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(map.getRegionName(countryCode));
        $('#filmTitle').text(film.title);

        if (film.image) {
            $('#filmImage').prop("src", film.image);
        } else {
            // TODO
        }

        if (film.originalTitle) {
            $('#filmOriginalTitle')
                .text(film.originalTitle)
                .show();
        } else {
            $("#filmOriginalTitle")
                .hide();
        }

        if (film.imdb) {
            $('#imdbLink')
                .prop("href", "https://www.imdb.com/title/" + film.imdb + "/")
                .show();
        } else {
            $('#imdbLink')
                .hide();
        }

        if (film.letterboxd) {
            $('#letterboxdLink')
                .prop("href", "https://letterboxd.com/film/" + film.letterboxd + "/")
                .show();
        } else {
            $('#letterboxdLink')
                .hide()
        }

        if (film.wikipedia) {
            $('#wikipediaLink')
                .prop("href", "https://en.wikipedia.org/wiki/" + film.wikipedia)
                .show();
        } else {
            $('#wikipediaLink')
                .hide();
        }

        if (film.trailer) {
            $('#trailerLink')
                .prop("href", film.trailer)
                .show();
        } else {
            $('#trailerLink')
                .hide();
        }

        $('#filmDetailsModal').modal()
    }
});