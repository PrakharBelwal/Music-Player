let port = 5500;
let currentSong = new Audio();
let songList;
let currentFolder;
let currentSongIndex;
let menu = document.querySelector(".left");
let hamburger = document.querySelector(".hamburger");
let volumeIcon = document.querySelector(".volume-icon");
let volumeBar = document.querySelector(".volume-bar");
let seekBar = document.querySelector(".seek");
let close = document.querySelector(".close");
let card;

async function getSongList(file) {
    currentFolder = file;
    let a = await fetch(
        `http://localhost:${port}/${currentFolder}/`
    );
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let songHref = div.getElementsByTagName("a");
    songList = [];
    for (let index = 0; index < songHref.length; index++) {
        const element = songHref[index];
        if (element.href.endsWith(".mp3")) {
            songList.push(element.href);
        }
    }
    let songCard = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];

    songCard.innerHTML = "";
    currentSong.src = "";

    for (const song of songList) {
        let decodedSong = decodeURIComponent(
            song.split(`/${currentFolder}/`)[1]
        );
        let clean = decodedSong.split(/[\(_]/)[0].trim();
        songCard.innerHTML =
            songCard.innerHTML +
            `<li class="flex-box item-center rounded p-1" data-url = "${song}">
                            <div class="side-songList left-side flex-box item-center">
                                <img class="img-invert" src="img/music.svg" alt="">
                                <div class="song-info">
                                    <div>${clean}</div>
                                </div>
                            </div>
                            <div class="side-songList right-side flex-box item-center">
                                <div class="play-text">Play Now</div>
                                <img src="img/play.svg" alt="">
                            </div>
                        </li>`;
    }

    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", () => {
            menu.style.left = "-100%";
            hamburger.style.display = "inline";
            close.style.display = "none";
            playMusic(
                e.dataset.url,
                e.querySelector(".song-info").getElementsByTagName("div")[0]
                    .innerHTML
            );
        });
    });

    playMusic(
        songList[0],
        decodeURIComponent(songList[0].split(`/${currentFolder}/`)[1])
            .split(/[\(_]/)[0]
            .trim(),
        false
    );
}

async function insertCard(folder, title, description) {
    return `<div class="img-wrapper">
                <div class="play">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000" stroke-width="1.5" fill="#000"
                        stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="song-file/${folder}/cover.jpg" alt="">
            </div>
            <h2>${title}</h2>
            <p>${description}</p>`;
}

async function displayCard() {
    const a = await fetch(
        `http://localhost:${port}/song-file/`
    );
    const response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    Array.from(anchor).forEach(async (e) => {
        if (e.href.includes("/song-file/")) {
            let folder = e.href.split("/song-file/")[1];
            const a = await fetch(
                `http://localhost:${port}/song-file/${folder}/info.json`
            );
            const response = await a.json();
            let insertDiv = document.createElement("div");
            insertDiv.innerHTML = await insertCard(
                folder,
                response.title,
                response.description
            );
            insertDiv.classList.add("card", "rounded");
            document
                .querySelector(".card-container")
                .insertAdjacentElement("afterbegin", insertDiv);

            insertDiv.addEventListener("click", async () => {
                await getSongList(`song-file/${folder}`);
            });
        }
    });
}

function autoNext() {
    currentSongIndex = songList.indexOf(currentSong.src);
    if (currentSongIndex < songList.length - 1) {
        document.querySelector(".seekd").style.width = "0px";
        playMusic(
            songList[currentSongIndex + 1],
            decodeURIComponent(
                songList[currentSongIndex + 1].split(`/${currentFolder}/`)[1]
            )
                .split(/[\(_]/)[0]
                .trim()
        );
    } else{
        play.src = "img/play.svg";
    }
}

function playMusic(url, title, toPlay = true) {
    currentSong.src = url;
    if (toPlay) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".current-song-title").innerHTML = title.replace(
        ".mp3",
        ""
    );
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(
            ".current-song-time"
        ).innerHTML = `${secToMinAndSec(
            currentSong.currentTime
        )}/${secToMinAndSec(currentSong.duration)}`;
    });
}

function TwoDigit(time) {
    if (time > 10) {
        return String(time);
    } else {
        return String(time).padStart(2, "0");
    }
}

function secToMinAndSec(time) {
    if (isNaN(time)) {
        return null;
    } else {
        let min = Math.floor(time / 60);
        let sec = Math.floor(time % 60);
        return `${TwoDigit(min)}:${TwoDigit(sec)}`;
    }
}

function timeUpdate() {
    document.querySelector(".current-song-time").innerHTML = `${secToMinAndSec(
        currentSong.currentTime
    )}/${secToMinAndSec(currentSong.duration)}`;
    document.querySelector(".seekd").style.width =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    console.log(
        Math.floor(currentSong.currentTime),
        Math.floor(currentSong.duration)
    );
    if (
        Math.ceil(currentSong.currentTime) == Math.floor(currentSong.duration)
    ) {
        autoNext();
        console.log(currentSong.currentTime, currentSong.duration);
    }
}

async function main() {
    await getSongList("song-file/seedhe-maut");

    await displayCard();

    currentSongIndex = songList.indexOf(currentSong.src);

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    let last = 0;

    currentSong.addEventListener("timeupdate", () => {
        const now = performance.now();
        if (now - last < 100) return;
        last = now;
        timeUpdate();
    });

    seekBar.addEventListener("click", (e) => {
        seekBarRect = seekBar.getBoundingClientRect();
        myOffsetX = e.clientX - seekBarRect.left;
        document.querySelector(".seekd").style.width = myOffsetX + "px";
        currentSong.currentTime =
            (myOffsetX / seekBarRect.width) * currentSong.duration;
    });

    hamburger.addEventListener("click", () => {
        menu.style.left = "0";
        menu.display = "inline";
        close.style.display = "inline";
        menu.style.transitionDuration = "0.5s";
        hamburger.style.display = "none";
        menuToggle = false;
    });

    close.addEventListener("click", () => {
        menu.style.left = "-100%";
        menu.display = "none";
        close.style.display = "none";
        menu.style.transitionDuration = "0.9s";
        hamburger.style.display = "inline";
        menuToggle = true;
    });

    next.addEventListener("click", () => {
        document.querySelector(".seekd").style.width = "0px";
        currentSongIndex = songList.indexOf(currentSong.src);
        if (currentSongIndex < songList.length - 1) {
            playMusic(
                songList[currentSongIndex + 1],
                decodeURIComponent(
                    songList[currentSongIndex + 1].split(
                        `/${currentFolder}/`
                    )[1]
                )
                    .split(/[\(_]/)[0]
                    .trim()
            );
        }
    });

    previous.addEventListener("click", () => {
        document.querySelector(".seekd").style.width = "0px";
        currentSongIndex = songList.indexOf(currentSong.src);
        if (currentSongIndex > 0) {
            playMusic(
                songList[currentSongIndex - 1],
                decodeURIComponent(
                    songList[currentSongIndex - 1].split(
                        `/${currentFolder}/`
                    )[1]
                )
                    .split(/[\(_]/)[0]
                    .trim()
            );
        }
    });

    volumeIcon.addEventListener("click", () => {
        volumeBar.classList.toggle("show");
    });
    volumeBar.addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    card = document.querySelectorAll(".card");

    Array.from(card).forEach((e) => {
        e.addEventListener("click", async (card) => {
            await getSongList(`song-file/${card.currentTarget.dataset.folder}`);
        });
    });
}
main();
