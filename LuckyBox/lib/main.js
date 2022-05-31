let { encrypt_token } = Qs.parse(location.search, { ignoreQueryPrefix: true });
if (encrypt_token === undefined) encrypt_token = "";
const apiUrl = "http://192.168.100.18:8080/api/SpinnerLuckyDraw/";
// const apiUrl = "https://ten11kh.com:10010/apizdtenV08/api/SpinnerLuckyDraw/";
// const apiUrl = "https://ten11kh.com:10010/apizdten/api/SpinnerLuckyDraw/";

const spin_wheel_id = 4;


const boxes = document.querySelectorAll(".boxClose");
const pas = document.querySelector("#prizeScreen"); // pas = Prize Annoucement Screen;
const bannerImg = document.querySelector("#bannerImg");
const clouds = document.querySelectorAll(".cloud");
const stageContainers = document.querySelectorAll(".stageContainer");
const stages = document.querySelectorAll(".stage");
const paBtn = document.querySelector("#playAgain");
const prizeBox = document.querySelector("#announceBox");
const loader = document.querySelector("#loader");
const errorScreen = document.querySelector("#errorScreen");
const playScreen = document.querySelector("#playScreen");
const errorLabel = document.querySelector("#errorScreen div:first-child");
let switchImg = 0;
let pickAvailable = 0;

const boxOgPos = [
    {
        top: 69.5,
        left: 22,
    },
    {
        top: 72,
        left: 42,
    },
    {
        top: 74.3,
        left: 62,
    },
    {
        top: 59.5,
        left: 33,
    },
    {
        top: 62,
        left: 53,
    },
    {
        top: 64,
        left: 73,
    },
    {
        top: 49.5,
        left: 44,
    },
    {
        top: 51.5,
        left: 63.5,
    },
    {
        top: 53.5,
        left: 83,
    }
];

if (!encrypt_token.includes("NOT_MEMBER")) {
    axios.get(`${apiUrl}scanLink?encrypt_token=${encrypt_token}&spin_wheel_id=${spin_wheel_id}`).then(({ data }) => {
        // console.log(data);
        if (!data.your_prize || !data.your_prize.length) {
            document.querySelector("#prizeHistory").style.display = "none";
        }
        if (data.message) {
            playScreen.style.display = "none";
            errorScreen.style.display = "block";
            if (data.your_prize.length == 0) errorLabel.innerHTML = "<h4>" + data.message + "</h4>";
            loader.style.display = "none";
            buildPrizeTable(data.your_prize);
            return
        }
        if (data.error) {
            playScreen.style.display = "none";
            errorScreen.style.display = "block";
            if (data.error.error_token) errorLabel.innerHTML = "<h4>" + data.error.error_token + "</h4>";
            if (data.error.error_outlet_id) errorLabel.innerHTML += "<h4>" + data.error.error_outlet_id + "</h4>";
            if (data.error.error_amount_of_invoice) errorLabel.innerHTML += "<h4>" + data.error.error_amount_of_invoice + "</h4>";
            if (data.error.error_spin_wheel_id) errorLabel.innerHTML += "<h4>" + data.error.error_spin_wheel_id + "</h4>";
            loader.style.display = "none";
            return
        }
        if (!data.data.length) {
            playScreen.style.display = "none";
            errorScreen.style.display = "block";
            if (data.your_prize.length == 0) errorLabel.innerHTML = "<h4>Game is not available!</h4>";
            loader.style.display = "none";
            buildPrizeTable(data.your_prize);
            return
        }
        if (data.data.image_ang_pao && data.data.image_ang_pao === "none") {
            playScreen.style.display = "none";
            errorScreen.style.display = "block";
            if (data.your_prize.length == 0) errorLabel.innerHTML = "<h4>Game is not available!</h4>";
            loader.style.display = "none";
            buildPrizeTable(data.your_prize);
            return
        }

        const imgArr = data.data[0].image_ang_pao.split(",");
        // console.log(imgArr);
        setInterval(() => {
            if (switchImg) {
                bannerImg.src = imgArr[0];
                switchImg = 0;
            }
            else {
                bannerImg.src = imgArr[1];
                switchImg = 1;
            }
        }, 1000);
        clouds.forEach((c, i) => {
            c.src = imgArr[3 + i];
        });
        stages.forEach((s, i) => {
            if (!i) s.src = imgArr[7];
            else s.src = imgArr[6];
        });
        boxes.forEach(b => {
            b.src = imgArr[2];
        });
        document.querySelector("#bol").src = imgArr[9];
        document.querySelector("#bl").src = imgArr[8];
        setTimeout(() => {
            stageContainers.forEach((sc, i) => {
                sc.style.animation = `stageIdle 7s ease-in-out infinite ${i}s`;
            })
        }, 2000);
        pickAvailable = data.count_available_time_of_play;

        playScreen.style.display = "block";
        loader.style.display = "none";
        document.addEventListener("click", pickABox);
    }).catch(err => {
        playScreen.style.display = "none";
        errorScreen.style.display = "block";
        errorLabel.innerHTML = "<h4>" + err.message + "</h4>";
        loader.style.display = "none";
        document.querySelector("#prizeHistory").style.display = "none";
    });
} else {
    document.querySelector("#loader").style.display = "none";
    document.querySelector("#nonMemberScreen").style.display = "flex";
    const banner = document.querySelector("#bannerImgNonMember");
    let switchImg = 0;
    setInterval(() => {
        if (switchImg) {
            banner.src = "images/Banner_A.png";
            switchImg = 0;
        }
        else {
            banner.src = "images/Banner_B.png";
            switchImg = 1;
        }
    }, 1000);
    document.querySelector("#shopNow").href = `${window.location.href}&screen=HomeScreen`;
}

function pickABox(e) {
    boxes.forEach((b, i) => {
        const { left, right, top, bottom } = b.getBoundingClientRect();
        if (left <= e.clientX && e.clientX <= right && top <= e.clientY && e.clientY <= bottom) {
            loader.style.display = "flex";
            axios.get(`${apiUrl}randomWinner?encrypt_token=${encrypt_token}&spin_wheel_id=${spin_wheel_id}`).then(({ data }) => {
                // console.log(data);
                if (data.message) {
                    pas.style.display = "block";
                    pas.innerHTML = `<h1 class="out_of_stock">${data.message}</h1>`
                    paBtn.style.display = "inline-block";
                    paBtn.innerHTML = "Reload";
                    paBtn.addEventListener("click", reload);
                    loader.style.display = "none";
                    return;
                }
                b.style.display = "none";
                document.removeEventListener("click", pickABox);
                pas.style.display = "block";
                if (data.prize_label.includes("$")) document.querySelector("#prizeLabel").innerHTML = data.prize_label.length < 5 ? `${data.prize_label.replace("$", "")}<sup id="dollar">$</sup>` : data.prize_label;
                else document.querySelector("#prizeLabel").innerHTML = data.prize_label.includes("%") && data.prize_label.length < 5 ? `${data.prize_label.replace("%", "")}<span id="present">%</span>` : data.prize_label;
                if (data.prize_label.length > 5) document.querySelector("#prizeLabel").style.fontSize = "30px";
                prizeBox.style = `--og-top-pos: ${boxOgPos[i].top}%; --og-left-pos: ${boxOgPos[i].left}%;`;
                setTimeout(() => {
                    paBtn.innerHTML = `pick x${pickAvailable - 1}`;
                    if (pickAvailable - 1 == 0) paBtn.innerHTML = "view prize";
                    paBtn.style.display = "inline-block";
                    paBtn.addEventListener("click", reload);
                    document.querySelector("#wow").style.display = "block";
                }, 1500);
                loader.style.display = "none";
            }).catch(err => {
                playScreen.style.display = "none";
                errorScreen.style.display = "block";
                errorLabel.innerHTML = "<h4>" + err.message + "</h4>";
                loader.style.display = "none";
            })
        }
    })
}

function reload() {
    location.reload();
};

function buildPrizeTable(prizeHistory = []) {
    // console.log(166, prizeHistory);
    loader.style.display = "flex";
    document.querySelector("#prizeHistory h4").innerHTML = "Claim it Now!";
    const historyList = document.querySelector("#historyList");
    prizeHistory.forEach(ph => {
        historyList.innerHTML += `<li>
                                        <div>
                                        <h4>${ph.prize_label}</h4>
                                        ${ph.voucher_code ? '<div><h4 style="font-weight: 100;">Voucher Code: ' + ph.voucher_code + '</h4>' : ''}
                                        ${ph.expired_date_format ? '<p style="font-size: 10px">Valid until: ' + ph.expired_date_format + ' </p> </div>' : ''}
                                        </div>
                                        <img src="images/Qr_Code_Scan_Icon.png" onClick="revealQrCode(${ph.voucher_code || ""})">
                                </li>`

    });
    document.querySelector("main").style.overflow = "hidden auto";
    loader.style.display = "none";
}

function revealQrCode(code = "") {
    loader.style.display = "flex";
    document.querySelector("#qrCode").src = `https://chart.googleapis.com/chart?cht=qr&chl=${code}&chs=300x300&chld=L|0`
    axios.get(`https://chart.googleapis.com/chart?cht=qr&chl=${code}&chs=300x300&chld=L|0`).then(res => {
        document.querySelector("#qrCodeRevealer").classList.add("visible");
        loader.style.display = "none";
    });
}

document.querySelector("#qrCodeRevealer").addEventListener("click", function (e) {
    e.stopPropagation();
    this.classList.toggle("closing");
    setTimeout(() => {
        this.classList.toggle("visible");
        this.classList.toggle("closing");
    }, 300);
});

document.querySelector("#qrCode").addEventListener("click", (e) => {
    e.stopPropagation();
})
