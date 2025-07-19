"use strict";

$(function () {
    const MAP_BACKGROUND_COLOUR = "#F0F0F0";
    const INACTIVE_MAP_COLOUR = "#555555";
    const ACTIVE_MAP_COLOURS = [
        "#00C4F0",
        "#00BCE5",
        "#00B3DB",
        "#00ABD1",
        "#00A3C7"
    ];

    let _map;
    let _films = {};
    let _filmsSortedByCountry = [];
    let _filmsSortedByTitle = [];
    let _currentTimelineIndex = 11; // Default to showing all films (last checkpoint)
    
    // Timeline checkpoints based on Git history analysis
    const _timelineCheckpoints = [
        { count: 2, countries: ["CH", "IS"] },
        { count: 3, countries: ["CH", "IS", "RO"] },
        { count: 6, countries: ["CH", "IS", "RO", "IT", "PL", "IQ"] },
        { count: 7, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT"] },
        { count: 10, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT"] },
        { count: 16, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG"] },
        { count: 21, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG", "AU", "BM", "CN", "DE", "MX"] },
        { count: 27, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG", "AU", "BM", "CN", "DE", "MX", "AR", "CZ", "JM", "NG", "NO", "GB-WLS"] },
        { count: 30, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG", "AU", "BM", "CN", "DE", "MX", "AR", "CZ", "JM", "NG", "NO", "GB-WLS", "KP", "BT", "FI"] },
        { count: 34, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG", "AU", "BM", "CN", "DE", "MX", "AR", "CZ", "JM", "NG", "NO", "GB-WLS", "KP", "BT", "FI", "PT", "MN", "LB", "ZA"] },
        { count: 46, countries: ["CH", "IS", "RO", "IT", "PL", "IQ", "MT", "DK", "TR", "AT", "AS", "CA", "GB-SCT", "SE", "VE", "PG", "AU", "BM", "CN", "DE", "MX", "AR", "CZ", "JM", "NG", "NO", "GB-WLS", "KP", "BT", "FI", "PT", "MN", "LB", "ZA", "HU", "GE", "GT", "IE", "ES", "GR", "CL", "NL", "TW", "IN"] },
        { count: 52, countries: null } // null means show all films
    ];

    initialiseEventHandlers();

    loadData(() => {
        initialiseCount();
        initialiseTimeline();
        initialiseMap();
        initialiseCountriesList();
        initialiseFilmsList();
    });

    //-----------------------------------------------------------

    function initialiseEventHandlers() {
        $("a").prop("target", "_blank");

        $("#btnShowMap").click(() => showMap());
        $("#btnShowListCountries").click(() => showListCountries());
        $("#btnShowListFilms").click(() => showListFilms());
        $("#btnShowAbout").click(() => showAbout());

        $('#filmCountryFlag').on({
            error: function () {
                $(this).hide();
            },
            load: function () {
                $(this).show();
            }
        });
    }

    function loadData(onLoaded) {
        _filmsSortedByCountry = [];
        _filmsSortedByTitle = [];
        _films = {};

        $.getJSON("data/films.json", filmsArray => {
            filmsArray.forEach(film => {
                film.colour = getRandomActiveMapColour();
                _films[film.countryCode] = film;
            });
            _filmsSortedByCountry = filmsArray.sort((a, b) =>
                (a.country < b.country) ? -1 : (a.country > b.country) ? 1 : 0);
            _filmsSortedByTitle = filmsArray.slice().sort((a, b) => {
                let aTitle = a.title.sortable();
                let bTitle = b.title.sortable();
                return (aTitle < bTitle) ? -1 : (aTitle > bTitle) ? 1 : 0;
            });

            onLoaded();
        });
    }

    function initialiseMap() {
        _map = new jvm.Map({
            map: "world_merc",
            container: $("#map"),
            backgroundColor: MAP_BACKGROUND_COLOUR,
            zoomMin: 0.9,
            focusOn: {
                x: 0.5,
                y: 0.5,
                scale: 0.95
            },
            series: {
                regions: [{
                    attribute: "fill"
                }]
            },
            onRegionClick: (_, countryCode) => showFilmDetails(countryCode),
            onRegionTipShow: (_, tip, code) => {
                const filteredFilms = getFilteredFilmsObject();
                let film = filteredFilms[code];
                if (film) {
                    tip.text(`${film.country}: ${film.title} (${film.year})`);
                }
            }
        });

        // Set map colours
        _map.series.regions[0].setValues(getMapColours());
    }

    function uninitialiseMap() {
        if (_map) {
            _map.remove();
            _map = undefined;
        }
    }

    function initialiseCountriesList() {
        const filteredFilms = getFilteredFilms();
        const sortedByCountry = filteredFilms.sort((a, b) =>
            (a.country < b.country) ? -1 : (a.country > b.country) ? 1 : 0);
        
        initialiseList(
            "#listCountries",
            sortedByCountry,
            film => film.country,
            film => `${film.title} (${film.year})`);
    }

    function initialiseFilmsList() {
        const filteredFilms = getFilteredFilms();
        const sortedByTitle = filteredFilms.sort((a, b) => {
            let aTitle = a.title.sortable();
            let bTitle = b.title.sortable();
            return (aTitle < bTitle) ? -1 : (aTitle > bTitle) ? 1 : 0;
        });
        
        initialiseList(
            "#listFilms",
            sortedByTitle,
            film => `${film.title} (${film.year})`,
            film => film.country);
    }

    function initialiseList(elementId, array, textFunction, tipFunction) {
        $(elementId).empty();

        array.forEach(film => {
            $("<span></span>")
                .addClass("listFilm")
                .prop({
                    title: tipFunction(film),
                    style: `background-color: ${film.colour}`
                })
                .text(textFunction(film))
                .click(() => showFilmDetails(film.countryCode))
                .prepend(
                    $("<img/>").prop({
                        src: flagUrl(film),
                        alt: flagAltText(film)
                    })
                )
                .appendTo(elementId);
        });
    }

    function initialiseCount() {
        const filteredFilms = getFilteredFilms();
        $("#filmCount").text(filteredFilms.length);
    }

    function showMap() {
        selectButton("#btnShowMap");
        selectSection("#sectionMap");
        initialiseMap();
    }

    function showListCountries() {
        selectButton("#btnShowListCountries");
        selectSection("#sectionListCountries");
        uninitialiseMap();
    }

    function showListFilms() {
        selectButton("#btnShowListFilms");
        selectSection("#sectionListFilms");
        uninitialiseMap();
    }

    function showAbout() {
        selectButton("#btnShowAbout");
        selectSection("#sectionAbout")
        uninitialiseMap();
    }

    function selectButton(selector) {
        $(selector)
            .addClass("selected")
            .siblings()
            .removeClass("selected");
    }

    function selectSection(selector) {
        $(selector)
            .show()
            .siblings()
            .hide();
    }

    function getMapColours() {
        const filteredFilms = getFilteredFilmsObject();
        let colours = {};
        for (let region in _map.regions) {
            colours[region] = filteredFilms[region]
                ? filteredFilms[region].colour
                : INACTIVE_MAP_COLOUR;
        }
        return colours;
    }

    function getRandomActiveMapColour() {
        let index = Math.floor(Math.random() * ACTIVE_MAP_COLOURS.length);
        return ACTIVE_MAP_COLOURS[index];
    }

    function showFilmDetails(countryCode) {
        const filteredFilms = getFilteredFilmsObject();
        let film = filteredFilms[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(film.country);
        $("#filmTitle").text(film.title);
        $("#filmYear").text(film.year);
        $("#filmCountryFlag")
            .prop({
                src: flagUrl(film),
                alt: flagAltText(film)
            });

        $("#filmImageContainer")
            .toggleClass("defaultImage", !film.image);
        $("#filmImage")
            .prop({
                src: film.image,
                alt: `Film poster for ${film.title} (${film.year})`
            })
            .toggle(!!film.image);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(!!film.originalTitle);

        $("#imdbLink").toggle(!!film.imdb).prop({href: `https://www.imdb.com/title/${film.imdb}/`});
        $("#letterboxdLink").toggle(!!film.letterboxd).prop({href: `https://letterboxd.com/film/${film.letterboxd}/`});
        $("#rottenTomatoesLink").toggle(!!film.rottenTomatoes).prop({href: `https://www.rottentomatoes.com/m/${film.rottenTomatoes}`});
        $("#wikipediaLink").toggle(!!film.wikipedia).prop({href: `https://en.wikipedia.org/wiki/${film.wikipedia}`});
        $("#justwatchLink").toggle(!!film.justwatch).prop({href: `https://www.justwatch.com/uk/movie/${film.justwatch}`});
        $("#trailerLink").toggle(!!film.trailer).prop({href: `https://youtu.be/${film.trailer}`});
        $("#reviewLink").toggle(!!film.review).prop({href: `https://youtu.be/${film.review}`});
        $("#filmReviewer").text(film.reviewer);
        $("#filmDetailsModal").modal();
    }

    function flagUrl(film) {
        return `https://flagcdn.com/${film.countryCode.toLowerCase()}.svg`;
    }

    function flagAltText(film) {
        return `National flag of ${film.country}`;
    }

    String.prototype.sortable = function () {
        return this.replace(/^(A|The) /, "");
    }

    function initialiseTimeline() {
        const $track = $("#timelineTrack");
        const $dots = $("#timelineDots");
        const $handle = $("#timelineHandle");
        const $progress = $("#timelineProgress");

        // Create dots for each checkpoint
        $dots.empty();
        _timelineCheckpoints.forEach((checkpoint, index) => {
            const $dot = $("<div></div>")
                .addClass("timeline-dot")
                .attr("data-index", index)
                .css("left", `${(index / (_timelineCheckpoints.length - 1)) * 100}%`)
                .click(() => updateTimelinePosition(index));
            $dots.append($dot);
        });

        // Initialize handle position
        updateTimelinePosition(_currentTimelineIndex);

        // Enhanced dragging functionality
        let isDragging = false;
        
        function getPositionFromEvent(e) {
            const trackRect = $track[0].getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            return Math.max(0, Math.min(1, (clientX - trackRect.left) / trackRect.width));
        }
        
        function updateFromPosition(relativeX) {
            const newIndex = Math.round(relativeX * (_timelineCheckpoints.length - 1));
            if (newIndex !== _currentTimelineIndex) {
                updateTimelinePosition(newIndex);
            }
        }
        
        // Handle dragging - only from the handle
        $handle.on("mousedown", (e) => {
            isDragging = true;
            $handle.addClass("dragging");
            e.preventDefault();
        });
        
        // Handle dragging - touch events (mobile support)
        $handle.on("touchstart", (e) => {
            isDragging = true;
            $handle.addClass("dragging");
            e.preventDefault();
        });
        
        // Track clicking to jump to position (not dragging)
        $track.on("click", (e) => {
            if (!isDragging) {
                const relativeX = getPositionFromEvent(e);
                updateFromPosition(relativeX);
            }
        });
        
        // Mouse move events
        $(document).on("mousemove", (e) => {
            if (!isDragging) return;
            const relativeX = getPositionFromEvent(e);
            updateFromPosition(relativeX);
        });
        
        // Touch move events
        $(document).on("touchmove", (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const relativeX = getPositionFromEvent(e);
            updateFromPosition(relativeX);
        });
        
        // Mouse and touch end events
        $(document).on("mouseup touchend", () => {
            if (isDragging) {
                isDragging = false;
                $handle.removeClass("dragging");
            }
        });
    }

    function updateTimelinePosition(index) {
        _currentTimelineIndex = index;
        const percentage = (index / (_timelineCheckpoints.length - 1)) * 100;
        
        $("#timelineHandle").css("left", `${percentage}%`);
        $("#timelineProgress").css("width", `${percentage}%`);
        
        // Update dots
        $(".timeline-dot").removeClass("active");
        $(`.timeline-dot[data-index="${index}"]`).addClass("active");
        
        // Update country count
        const checkpoint = _timelineCheckpoints[index];
        $("#timelineCountryCount").text(checkpoint.count);
        
        // Refresh all views
        refreshViewsForTimeline();
    }

    function refreshViewsForTimeline() {
        initialiseCount();
        
        if (_map) {
            uninitialiseMap();
            initialiseMap();
        }
        
        initialiseCountriesList();
        initialiseFilmsList();
    }

    function getFilteredFilms() {
        const checkpoint = _timelineCheckpoints[_currentTimelineIndex];
        
        if (!checkpoint.countries) {
            // Show all films
            return Object.values(_films);
        }
        
        // Filter films based on allowed countries for this checkpoint
        return Object.values(_films).filter(film => 
            checkpoint.countries.includes(film.countryCode)
        );
    }

    function getFilteredFilmsObject() {
        const checkpoint = _timelineCheckpoints[_currentTimelineIndex];
        
        if (!checkpoint.countries) {
            // Show all films
            return _films;
        }
        
        // Create filtered films object
        const filtered = {};
        checkpoint.countries.forEach(countryCode => {
            if (_films[countryCode]) {
                filtered[countryCode] = _films[countryCode];
            }
        });
        return filtered;
    }
});
