document.addEventListener("DOMContentLoaded", async function () {
    const apiKey = '91a44eb93a051d3f21e3d4bf02a1b30f';
    const baseUrl = 'https://api.themoviedb.org/3';
    const searchinp = document.getElementById('searchInput')
    let option = document.getElementById('filter')
    let cast = document.getElementById('cast')
    let filter=document.getElementById('filter')

    const moviesContainer = document.getElementById('moviesContainer');
    const close = document.getElementById('close')
    const modal = document.getElementById('movieDetailsModal');
    const modalContent = document.getElementById('movieDetailsContent');
    const modalimage = document.getElementById("movieModelimage")

    // Fetch TMDb API configuration for image base URL
    const configResponse = await fetch(`${baseUrl}/configuration?api_key=${apiKey}`);
    
    const configData = await configResponse.json();
    // console.log(configData)
    const imageBaseUrl = configData.images.base_url;

    getRandomMovies();
    getFilterlist()



    async function getRandomMovies() {
        let RandomArray = ['malayalam', 'english', 'hindi', 'tamil', 'comedy', 'action', 'drama', 'romantic', 'thriller']
        let randomNo = Math.floor(Math.random() * RandomArray.length)
        console.log(randomNo)
        let random = RandomArray[randomNo]
        console.log(random)
        try {
            const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${random}`);
            const data = await response.json();


            if (data.results) {
                displayMovies(data.results, imageBaseUrl)
            } else {
                alert('No movies found.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    document.getElementById('searchInput').addEventListener("input", async function () {
        getMovies();
        option.value = ''
        cast.value = ''
    });
    async function getMovies() {
        const searchQuery = searchinp.value;
        modal.style.display = 'none'
        console.log(searchQuery)


        if (searchQuery === '') {

            getRandomMovies();
        } else {
            try {
                const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${searchQuery}`);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    displayMovies(data.results, imageBaseUrl);
                } else {
                    displayNoMoviesFound();
                }
            } catch (error) {
                console.error("Error fetching movies:", error);
                displayNoMoviesFound();
            }

        }
    }

    function displayMovies(movies, imageBaseUrl) {

        moviesContainer.innerHTML = '';

        movies.forEach(movie => {

            console.log(movie)
            const movieItem = document.createElement('div');
            movieItem.classList.add('movieCard');
            movieItem.innerHTML = `<img src="${imageBaseUrl}/w500/${movie.poster_path}" alt="${movie.title}">
                                   <h3>${movie.title}</h3>
                                   <p>${movie.release_date}</p>
                                   <h6>${movie.overview}</h6>
                                   <p>Rating: ${movie.vote_average}</p>`;
            movieItem.addEventListener('click', function () {
                showMoreDetails(movie.id)
            })
            moviesContainer.appendChild(movieItem);
        });
    }

    function displayNoMoviesFound() {
        console.log("NO Movies")
        moviesContainer.innerHTML = '<p>No movies found.</p>';
    }



    async function showMoreDetails(movieid) {
        console.log(movieid);
        moviesContainer.innerHTML = '';
        modalContent.innerHTML = '';
        close.style.display = 'block';

        try {
            // Fetch Movie Details
            const movieDetailsResponse = await fetch(`${baseUrl}/movie/${movieid}?api_key=${apiKey}`);
            const movieDetailsData = await movieDetailsResponse.json();
            console.log(movieDetailsData);

            //Fetch Movie Cast Crew
            const response1 = await fetch(`${baseUrl}/movie/${movieid}/credits?api_key=${apiKey}`);
            const data1 = await response1.json()
            console.log(data1)

            //Fetch Movie Trailer
            const trailerResponse = await fetch(`${baseUrl}/movie/${movieid}/videos?api_key=${apiKey}`);
            const trailerData = await trailerResponse.json();
            const trailerKey = trailerData.results.length > 0 ? trailerData.results[0].key : null;
            console.log(trailerData)

            modalimage.innerHTML = `<img src="${imageBaseUrl}/w500/${movieDetailsData.poster_path}" alt="${movieDetailsData.title}">`
            modalContent.innerHTML += `
            <h2>${movieDetailsData.title}</h2>
            <b>Tagline: ${movieDetailsData.tagline}</b> <br> <br>
            <b>Genres:</b> ${getGenres(movieDetailsData.genres)}<br> <br>
            <b>Status: ${movieDetailsData.status}</b>
            <h3>Release Date: ${movieDetailsData.release_date}</h3>
            <b>Original Language:${movieDetailsData.original_language}</b> ,
            <b>Runtime: ${movieDetailsData.runtime} minutes </b> 
            <p>Director: ${getDirector(data1.crew)}</p>
            <b>Cast:</b> <p>${getCast(data1.cast)}</p>
            <b>Overview:</b> <p>${movieDetailsData.overview}</p>
            <p>Rating: ${movieDetailsData.vote_average}</p>
            <p>Production Companies: ${getProductionCompanies(movieDetailsData.production_companies)}</p>
            <b>Trailer: <br></b> ${trailerKey ? `<iframe width="80%" height="400px" src="https://www.youtube.com/embed/${trailerKey}" frameborder="0" allowfullscreen></iframe>` : 'Trailer not available'}

        `;

            modal.style.display = 'flex';
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }


    // Helper functions to format details
    function getDirector(crew) {
        const director = crew.find(member => member.job === 'Director');
        return director ? director.name : 'Not available';
    }

    function getCast(cast) {
        const topCast = cast.slice(0, 5).map(member => " " + member.name + ' as -: ' + member.character + " ");
        return topCast;
    }


    function getProductionCompanies(companies) {
        return companies ? companies.map(company => company.name) : 'Not available';
    }

    function getGenres(genres) {
        return genres.map(genre => genre.name);
    }

    document.getElementById("filter").addEventListener('change', function () {
        console.log(document.getElementById('filter').value)
        getFilterMovie()
        searchinp.value = ''
        cast.value = ''
    })

    async function getFilterlist(){

        console.log("Get Genre Worked")
         // Fetch the list of genres to map names to IDs
         const genresResponse = await fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}`);
         const genresData = await genresResponse.json();
         console.log(genresData)

         const genresResult = genresData.genres
         console.log(genresResult)
         genresResult.forEach(item=>{

            let optionF=document.createElement("option")
            optionF.innerHTML=item.name
            option.appendChild(optionF);
         })

    }
    
    async function getFilterMovie() {
        let genreName = filter.value
        modal.style.display = 'none'
        try {
            // Fetch the list of genres to map names to IDs
            const genresResponse = await fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}`);
            console.log(genresResponse)
            const genresData = await genresResponse.json();
            console.log(genresData)

            const genresResult = genresData.genres

            console.log(genresResult)

            // Find the genre ID for the given genre name
            const genre = genresResult.find(function (gen) {
                return gen.name.toLowerCase() === genreName.toLowerCase()
            });

            if (genre) {
                // Fetch movies by genre ID
                const response = await fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genre.id}`);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    displayMovies(data.results, imageBaseUrl);
                } else {
                    displayNoMoviesFound();
                }
            } else {
                displayNoMoviesFound();
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            displayNoMoviesFound();
        }
    }

    document.getElementById("cast").addEventListener('change', function () {
        console.log(document.getElementById('cast').value)
        getCastmovie()
        searchinp.value = ''
        option.value = ''
    })

    async function getCastmovie() {
        let Castname = document.getElementById('cast').value
        modal.style.display = 'none';
        try {
            // Fetch movies by cast name
            const response = await fetch(`${baseUrl}/search/person?api_key=${apiKey}&query=${Castname}`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Use the first result (assuming it's the correct person) to get the cast ID
                const castId = data.results[0].id;

                // Fetch movies by cast ID
                const moviesResponse = await fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_cast=${castId}`);
                const moviesData = await moviesResponse.json();

                if (moviesData.results && moviesData.results.length > 0) {
                    displayMovies(moviesData.results, imageBaseUrl);
                } else {
                    displayNoMoviesFound();
                }
            } else {
                displayNoMoviesFound();
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            displayNoMoviesFound();
        }

    }


    //Close Button\\


    close.addEventListener("click", function () {
        if (searchinp.value == '' && option.value == '' && cast.value == '') {
            getRandomMovies()

        } else if (searchinp.value == '' && option.value == '') {
            getCastmovie()
        } else if (option.value == '' && cast.value == '') {
            getMovies()
        } else {
            getFilterMovie()
        }
        modal.style.display = 'none';


    })

    // setInterval(getRandomMovies,2000)
// let btn=document.getElementById('btn')

// btn.addEventListener("mouseenter",()=>{
//     console.log('Hello Button')
//     let arr=['left','right','top','bottom']
//     let random=Math.floor(Math.random() * arr.length)
//     console.log(random)
//     let item=arr[random]
//     console.log(item)

//     btn.style.top='5%'
// })


});

