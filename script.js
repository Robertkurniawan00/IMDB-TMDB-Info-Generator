function extractYouTubeID(url) {
    let regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    let match = url.match(regex);
    return (match && match[1]) ? match[1] : url.trim(); 
}

// Function to handle the Copy to Clipboard feature
function copyCode() {
    const outputCode = document.getElementById('output-code');
    const copyBtn = document.querySelector('.copy-btn');
    
    if(!outputCode.value) {
        alert("Nothing to copy yet!");
        return;
    }

    outputCode.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = "✅ Copied!";
    copyBtn.style.background = "#01d277";
    copyBtn.style.color = "#000";
    copyBtn.style.borderColor = "#01d277";
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = "#2a2a35";
        copyBtn.style.color = "#fff";
        copyBtn.style.borderColor = "#444";
    }, 2000);
}

// UI State handler
function setLoading(isLoading) {
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const loader = document.getElementById('loader');
    
    if (isLoading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'block';
        btn.style.opacity = '0.7';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        loader.style.display = 'none';
        btn.style.opacity = '1';
    }
}

async function generateTemplate() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const imdbId = document.getElementById('imdbId').value.trim();
    const rawYtInput = document.getElementById('ytInput').value.trim();

    if (!imdbId) {
        alert("Please provide the IMDb ID!");
        return;
    }

    setLoading(true); // Start loading animation

    const ytId = extractYouTubeID(rawYtInput);

    try {
        const findRes = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`);
        const findData = await findRes.json();
        
        if (!findData.movie_results || findData.movie_results.length === 0) {
            alert("Movie not found on TMDB! Please check the IMDb ID."); 
            setLoading(false);
            return;
        }
        const tmdbId = findData.movie_results[0].id;

        const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits`);
        const movie = await detailRes.json();

        const title = movie.title;
        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'TBA';
        const releaseDate = movie.release_date;
        const poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        const plot = movie.overview;
        const genres = movie.genres.map(g => g.name).join(", ");
        
        let castHtml = '';
        const topCasts = movie.credits.cast.slice(0, 5);
        topCasts.forEach(actor => {
            const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/100x150?text=No+Image';
            castHtml += `
                <div style="text-align: center; width: 100px; margin: 10px;">
                    <img src="${actorImg}" alt="${actor.name}" style="width: 100px; height: 140px; object-fit: cover; border: 2px solid #333; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px; color: #ddd;">${actor.name}</div>
                </div>
            `;
        });

        // I updated the inline styles of the generated template to look sleeker too
        const htmlTemplate = `
<div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #121212; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.7);">
    
    <div style="background: linear-gradient(180deg, #1a0b12 0%, #000 100%); color: white; text-align: center; padding: 30px 20px; font-size: 34px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(255,0,60,0.4); border-bottom: 2px solid #ff003c;">
        ${title} <span style="color: #ff003c;">(${year})</span>
    </div>

    <div style="background: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}') center/cover; position: relative; text-align: center; padding: 40px 0;">
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);"></div>
        <img src="${poster}" alt="${title}" style="position: relative; max-width: 250px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,0,60,0.3); border: 1px solid rgba(255,255,255,0.1);">
    </div>

    <div style="text-align: center; margin: -20px 0 20px 0; position: relative; z-index: 10;">
        <a href="https://www.themoviedb.org/movie/${tmdbId}" target="_blank" style="background: #01d277; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 25px; margin: 0 8px; font-size: 13px; box-shadow: 0 4px 15px rgba(1, 210, 119, 0.4);">TMDB</a>
        <a href="https://www.imdb.com/title/${imdbId}" target="_blank" style="background: #f5c518; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 25px; margin: 0 8px; font-size: 13px; box-shadow: 0 4px 15px rgba(245, 197, 24, 0.4);">IMDb</a>
        <a href="#" style="background: #ff003c; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 25px; margin: 0 8px; font-size: 13px; box-shadow: 0 4px 15px rgba(255, 0, 60, 0.4);">SUBTITLE</a>
    </div>

    <div style="background: #1a1a1a; border-left: 4px solid #ff003c; margin: 25px; border-radius: 6px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
        <div style="padding: 20px; border-bottom: 1px solid #2a2a2a;">
            <div style="font-weight: bold; color: #ff003c; font-size: 12px; letter-spacing: 1.5px; margin-bottom: 10px; text-transform: uppercase;">Synopsis</div>
            <div style="font-size: 15px; line-height: 1.7; color: #ccc; font-style: italic;">"${plot}"</div>
        </div>
        <div style="padding: 20px; display: flex; justify-content: space-between; font-size: 13px; color: white;">
            <div style="width: 48%;">
                <div style="font-weight: bold; color: #777; text-transform: uppercase; letter-spacing: 1px;">Genre</div>
                <div style="margin-top: 5px; color: #eee; font-weight: 500;">${genres}</div>
            </div>
            <div style="width: 48%; text-align: right;">
                <div style="font-weight: bold; color: #777; text-transform: uppercase; letter-spacing: 1px;">Release Date</div>
                <div style="margin-top: 5px; color: #eee; font-weight: 500;">${releaseDate}</div>
            </div>
        </div>
    </div>

    <div style="margin: 25px;">
        <div style="text-align: left; font-weight: bold; padding: 0 0 10px 5px; font-size: 14px; color: #ff003c; text-transform: uppercase; border-bottom: 1px solid #2a2a2a; letter-spacing: 1.5px;">Top Cast</div>
        <div style="display: flex; justify-content: center; padding: 25px 0; flex-wrap: wrap; background: #0a0a0a; border-radius: 8px; margin-top: 15px; border: 1px solid #1a1a1a;">${castHtml}</div>
    </div>

    <div style="background: #000; padding: 30px; border-top: 1px solid #222;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 20px; color: #ff003c; font-size: 15px; letter-spacing: 3px; text-transform: uppercase;">Official Trailer</div>
        <div style="background: #111; padding: 15px; text-align: center; color: #f5c518; font-size: 18px; font-weight: bold; letter-spacing: 3px; border: 1px dashed #333; border-radius: 6px;">[yt]${ytId}[/yt]</div>
    </div>
</div>`;

        // Reset display box styles so it looks clean
        const previewBox = document.getElementById('visual-preview');
        previewBox.style.padding = "0";
        previewBox.style.border = "none";
        previewBox.style.background = "transparent";

        previewBox.innerHTML = htmlTemplate;
        document.getElementById('output-code').value = htmlTemplate;

    } catch (error) {
        console.error(error);
        alert("An error occurred. Please check your IMDb ID or connection.");
    } finally {
        setLoading(false); // Stop loading animation
    }
}
