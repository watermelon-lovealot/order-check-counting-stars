// =========================================
// CONFIG
// =========================================

const SHEET_URL =
"https://opensheet.elk.sh/1pBV2xM79M2RVzfG-ogPoHqcS3ZZqXGJ1AVEgWqmB8Rs/Sheet1";

let sheetData = [];

const loading = document.getElementById("loading");
const output = document.getElementById("output");

document
.getElementById("searchBtn")
.addEventListener("click", searchUser);

document
.getElementById("username")
.addEventListener("keydown", e=>{
    if(e.key==="Enter") searchUser();
});

document
.getElementById("phone4")
.addEventListener("keydown", e=>{
    if(e.key==="Enter") searchUser();
});

// =========================================
// LOAD DATA
// =========================================

async function loadData(){

    try{

        loading.classList.remove("hidden");

        const response = await fetch(
            SHEET_URL + "?t=" + Date.now()
        );

        sheetData = await response.json();

        sheetData.sort((a,b)=>
            new Date(a.Date)-new Date(b.Date)
        );

    }
    catch(e){

        console.error(e);

    }
    finally{

        loading.classList.add("hidden");

    }

}

loadData();

setInterval(loadData,30000);

// =========================================

function money(v){

    return Number(v)
        .toLocaleString("vi-VN")
        + ".000đ";

}

// =========================================

function normalizeUser(user){

    return user
        .trim()
        .replace(/^@/,"")
        .toLowerCase();

}

// =========================================

function badge(text,cls){

    return `<span class="badge ${cls}">
        ${text}
    </span>`;

}

// =========================================

async function searchUser(){

    if(sheetData.length==0){

        await loadData();

    }

    const username = normalizeUser(

        document
        .getElementById("username")
        .value

    );

    const phone4 =

        document
        .getElementById("phone4")
        .value
        .trim();

    if(username=="" || phone4==""){

        output.innerHTML=

        `
        <div class="summary">

        <h3>

        ⚠️

        Vui lòng nhập

        User Threads

        và

        4 số cuối SĐT.

        </h3>

        </div>
        `;

        return;

    }

    const rows = sheetData.filter(r=>{

        return normalizeUser(r.User)==username

        &&

        String(r["4 số cuối SĐT"]||"")
        .padStart(4,"0")

        ==

        phone4;

    });

    if(rows.length==0){

        output.innerHTML=

        `
        <div class="summary">

        <h3>

        ❌

        Không tìm thấy đơn hàng.

        </h3>

        <p>

        Kiểm tra lại User hoặc
        4 số cuối SĐT.

        </p>

        </div>
        `;

        return;

    }

    render(rows);

}

// =========================================

function render(rows){

    let total=0;

    let paid=0;

    rows.forEach(r=>{

        total+=Number(r["Tổng tiền"]||0);

        paid+=Number(r["Đã chuyển"]||0);

    });

    let status="";

    if(paid>=total){

        status=

        `<span class="ok">
        🟢 Đã thanh toán đủ
        </span>`;

    }

    else if(paid==0){

        status=

        `<span class="bad">
        🔴 Chưa thanh toán
        </span>`;

    }

    else{

        status=

        `<span class="warn">
        🟡 Đã thanh toán một phần
        </span>`;

    }

    let html=`

<div class="summary">

<h2>

👤 @${rows[0].User}

</h2>

<div class="status">

${status}

</div>

<div class="stats">

<div class="stat">

<h3>Tổng tiền</h3>

<p>${money(total)}</p>

</div>

<div class="stat">

<h3>Đã chuyển</h3>

<p>${money(paid)}</p>

</div>

<div class="stat">

<h3>Còn thiếu</h3>

<p>${money(total-paid)}</p>

</div>

</div>

<h2>

📦 Đơn hàng

</h2>

`;

    rows.forEach(r=>{

        let badges="";

        if(r["Đã check out MBS"]=="x")

            badges+=badge(

                "✅ Checkout",

                "checkout"

            );

        if(r["Trạng thái pickup"]=="x")

            badges+=badge(

                "📦 Pickup",

                "pickup"

            );

        if(

            r["Mã vận đơn SPX (nếu có)"]

        )

            badges+=badge(

                "🚚 Đang giao",

                "shipping"

            );

        if(r["Đã hoàn thành"]=="x")

            badges+=badge(

                "🎉 Hoàn thành",

                "done"

            );

        html+=`

<div class="order">

<div class="order-title">

${r.Items}

</div>

<p>

📅

${r.Date}

</p>

<p>

📦

Số lượng:

<b>

${r["Số lượng"]}

</b>

</p>

<p>

💰

Giá:

<b>

${money(r["Tổng tiền"])}

</b>

</p>

<p>

💸

Đã chuyển:

<b>

${money(r["Đã chuyển"])}

</b>

</p>

`;

        if(r["Hình thức giao dịch"]){

            html+=`

<p>

💳

${r["Hình thức giao dịch"]}

</p>

`;

        }

        if(r["Tên người nhận"]){

            html+=`

<p>

👤

${r["Tên người nhận"]}

</p>

`;

        }

        if(r["Địa chỉ ship (nếu ship)"]){

            html+=`

<p>

📍

${r["Địa chỉ ship (nếu ship)"]}

</p>

`;

        }

        if(

            r["Mã vận đơn SPX (nếu có)"]

        ){

            html+=`

<div class="spx">

🚚

SPX:

<b>

${r["Mã vận đơn SPX (nếu có)"]}

</b>

</div>

`;

        }

        html+=`

<div class="badges">

${badges}

</div>

<br>

<a

target="_blank"

href="${r["Link Threads"]}"

>

🔗 Xem bài Threads

</a>

</div>

`;

    });

    html+=`

<div class="footer">

Updated automatically every 30 seconds

</div>

</div>

`;

    output.innerHTML=html;

}
