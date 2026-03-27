function extractYouTubeID(url) {
    if (!url) return "";
    
    let regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=|shorts\/)([^#\&\?]*).*/;
    let match = url.match(regExp);
    
    return (match && match[1] && match[1].length === 11) ? match[1] : url.trim(); 
}

function copyCode() {
    const outputCode = document.getElementById('output-code');
    const copyBtn = document.querySelector('.copy-btn');
    
    if(!outputCode.value) {
        alert("Nothing to copy yet!");
        return;
    }

    outputCode.select();
    document.execCommand('copy');
    
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

function setLoading(isLoading, format) {
    const btnHtml = document.getElementById('btnHtml');
    const btnBbcode = document.getElementById('btnBbcode');
    const textHtml = document.getElementById('textHtml');
    const textBbcode = document.getElementById('textBbcode');
    const loaderHtml = document.getElementById('loaderHtml');
    const loaderBbcode = document.getElementById('loaderBbcode');

    if (isLoading) {
        btnHtml.disabled = true;
        btnBbcode.disabled = true;
        if (format === 'html') {
            textHtml.style.display = 'none';
            loaderHtml.style.display = 'block';
        } else {
            textBbcode.style.display = 'none';
            loaderBbcode.style.display = 'block';
        }
    } else {
        btnHtml.disabled = false;
        btnBbcode.disabled = false;
        textHtml.style.display = 'block';
        textBbcode.style.display = 'block';
        loaderHtml.style.display = 'none';
        loaderBbcode.style.display = 'none';
    }
}

async function generateTemplate(format) {
    const apiKey = document.getElementById('apiKey').value.trim();
    const imdbId = document.getElementById('imdbId').value.trim();
    const rawYtInput = document.getElementById('ytInput').value.trim();

    if (!imdbId) {
        alert("Please provide the IMDb ID!");
        return;
    }

    setLoading(true, format);
    const ytId = extractYouTubeID(rawYtInput);

    try {
        const findRes = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`);
        const findData = await findRes.json();
        
        if (!findData.movie_results || findData.movie_results.length === 0) {
            alert("Movie not found! Check IMDb ID."); 
            setLoading(false, format);
            return;
        }

        const tmdbId = findData.movie_results[0].id;
        const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits`);
        const movie = await detailRes.json();

        const title = movie.title;
        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'TBA';
        const releaseDate = movie.release_date || 'N/A';
        const poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        const plot = movie.overview;
        const genres = movie.genres.map(g => g.name).join(", ");
        const topCasts = movie.credits.cast.slice(0, 5);

        let castHtml = '';
        topCasts.forEach(actor => {
            const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/100x150?text=No+Image';
            castHtml += `
                <div style="text-align: center; width: 100px; margin: 10px;">
                    <img src="${actorImg}" style="width: 100px; height: 140px; object-fit: cover; border: 2px solid #333; border-radius: 8px;">
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px; color: #ddd;">${actor.name}</div>
                </div>`;
        });

        const htmlTemplate = `
<div style="max-width: 800px; margin: 0 auto; font-family: sans-serif; background: #121212; color: white; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
    <div style="background: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}') center/cover; position: relative; text-align: center; padding: 40px 0;">
        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);"></div>
        <div style="position: relative; font-size: 30px; font-weight: 900; color: white; margin-bottom: 20px;">${title} <span style="color:#ff003c;">(${year})</span></div>
        <img src="${poster}" style="position: relative; max-width: 200px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.8);">
        <div style="position: relative; margin-top: 20px;">
            <span style="background: #01d277; color: black; padding: 8px 20px; font-weight: bold; border-radius: 20px; font-size: 12px; margin: 0 5px;">TMDB</span>
            <span style="background: #f5c518; color: black; padding: 8px 20px; font-weight: bold; border-radius: 20px; font-size: 12px; margin: 0 5px;">IMDb</span>
        </div>
    </div>
    <div style="padding: 20px; background: #1a1a1a; margin: 20px; border-left: 3px solid #ff003c; border-radius: 5px;">
        <div style="color: #ff003c; font-weight: bold; font-size: 12px; margin-bottom: 10px;">SYNOPSIS</div>
        <div style="color: #ccc; font-style: italic; font-size: 14px; line-height: 1.6;">"${plot}"</div>
    </div>
    <div style="padding: 0 20px; font-size: 13px; color: #aaa;">
        <b>Genre:</b> <span style="color:#fff">${genres}</span><br>
        <b>Release Date:</b> <span style="color:#fff">${releaseDate}</span>
    </div>
    <div style="padding: 20px;">
        <div style="color: #ff003c; font-weight: bold; font-size: 12px; margin-bottom: 10px;">TOP CAST</div>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; background: #0a0a0a; border-radius: 10px; padding: 15px 0;">${castHtml}</div>
    </div>
    <div style="padding: 20px;">
        <div style="color: #ff003c; font-weight: bold; font-size: 12px; margin-bottom: 10px;">OFFICIAL TRAILER</div>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; background: #000;"><iframe src="https://www.youtube.com/embed/${ytId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
    </div>
</div>`;

        let castBbcodeTable = `[table="align: center"]\n[tr]\n`;
        topCasts.forEach(actor => {
            const actorImg = actor.profile_path ? `https://image.tmdb.org/t/p/w138_and_h175_face${actor.profile_path}` : 'https://via.placeholder.com/138x175?text=No+Image';
            castBbcodeTable += `[td="align: center"][img]${actorImg}[/img]\n[b][color=#ffffff][size=2]${actor.name}[/size][/color][/b][/td]\n`;
        });
        castBbcodeTable += `[/tr]\n[/table]`;

        const bbcodeTemplate = `[center][table="width: 800, align: center, class: outer_border"]
[tr]
[td="bgcolor: #000000, align: center"][b][color=#ffffff][size=5]${title} (${year})[/size][/color][/b][/td]
[/tr]
[tr]
[td="bgcolor: #000000, align: center"][img]${poster}[/img][/td]
[/tr]
[tr]
[td="bgcolor: #111111, align: center"][b][url=https://www.themoviedb.org/movie/${tmdbId}][color=#990000]TMDB[/color][/url] | [url=https://www.imdb.com/title/${imdbId}][color=#990000]IMDb[/color][/url] | [url=#][color=#990000]SUBTITLE[/color][/url][/b][/td]
[/tr]
[tr]
[td="bgcolor: #222222"][b][color=#990000]SYNOPSIS[/color][/b]
[color=#cccccc][i]"${plot}"[/i][/color][/td]
[/tr]
[tr]
[td="bgcolor: #333333"]
[table="width: 100%"]
[tr]
[td][b][color=#990000]Genre:[/color][/b] [color=#eeeeee]${genres}[/color][/td]
[td="align: right"][b][color=#990000]Release Date:[/color][/b] [color=#eeeeee]${releaseDate}[/color][/td]
[/tr]
[/table]
[/td]
[/tr]
[tr]
[td="bgcolor: #222222, align: center"][b][color=#ffffff]TOP CAST[/color][/b][/td]
[/tr]
[tr]
[td="bgcolor: #000000, align: center"]
${castBbcodeTable}
[/td]
[/tr]
[tr]
[td="bgcolor: #222222, align: center"][b][color=#ffffff]OFFICIAL TRAILER[/color][/b][/td]
[/tr]
[tr]
[td="bgcolor: #111111, align: center"][yt]${ytId}[/yt][/td]
[/tr]
[/table][/center]`;

        const bbcodePreviewHtml = `
<div style="background: #222; padding: 20px; font-family: sans-serif; border-radius: 8px;">
    <div style="max-width: 800px; margin: 0 auto; border: 2px solid #555; background: #000;">
        <div style="background: #000; text-align: center; padding: 15px; color: #fff; font-size: 24px; font-weight: bold; border-bottom: 1px solid #444;">${title} (${year})</div>
        <div style="text-align: center; padding: 20px;"><img src="${poster}" style="max-width: 250px;"></div>
        <div style="background: #111; text-align: center; padding: 10px; border-bottom: 1px solid #444; border-top: 1px solid #444;">
            <b><span style="color: #990000;">TMDB</span> | <span style="color: #990000;">IMDb</span> | <span style="color: #990000;">SUBTITLE</span></b>
        </div>
        <div style="background: #222; padding: 15px; border-bottom: 1px solid #444;">
            <b style="color: #990000;">SYNOPSIS</b><br>
            <i style="color: #ccc;">"${plot}"</i>
        </div>
        <div style="background: #333; padding: 10px 15px; border-bottom: 1px solid #444; display: flex; justify-content: space-between; font-size: 14px;">
            <div><b style="color: #990000;">Genre:</b> <span style="color: #eee;">${genres}</span></div>
            <div><b style="color: #990000;">Release Date:</b> <span style="color: #eee;">${releaseDate}</span></div>
        </div>
        <div style="background: #222; text-align: center; padding: 10px; color: #fff; font-weight: bold; border-bottom: 1px solid #444;">TOP CAST</div>
        <div style="background: #000; padding: 20px;">
            <table style="margin: 0 auto; border-spacing: 10px;">
                <tr>
                    ${topCasts.map(a => `<td style="text-align: center; vertical-align: top;"><img src="${a.profile_path ? `https://image.tmdb.org/t/p/w138_and_h175_face${a.profile_path}` : 'https://via.placeholder.com/138x175?text=No+Image'}" style="width: 138px;"><br><b style="color: #fff; font-size: 12px; display: block; margin-top: 5px;">${a.name}</b></td>`).join('')}
                </tr>
            </table>
        </div>
        <div style="background: #222; text-align: center; padding: 10px; color: #fff; font-weight: bold; border-bottom: 1px solid #444; border-top: 1px solid #444;">OFFICIAL TRAILER</div>
        <div style="background: #111; text-align: center; padding: 30px; color: #666;">
            <div style="border: 1px dashed #555; display: inline-block; padding: 20px;">[ YouTube Video Player ]</div>
        </div>
    </div>
</div>`;

        if (format === 'html') {
            document.getElementById('visual-preview').innerHTML = htmlTemplate;
            document.getElementById('output-code').value = htmlTemplate;
        } else {
            document.getElementById('visual-preview').innerHTML = bbcodePreviewHtml;
            document.getElementById('output-code').value = bbcodeTemplate;
        }

    } catch (error) {
        console.error(error);
        alert("Error fetching data.");
    } finally {
        setLoading(false, format);
    }
}
