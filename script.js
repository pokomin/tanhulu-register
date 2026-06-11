let total = 0;
let cart = {};
let ticketNo =
Number(localStorage.getItem("ticketNo"))
|| 1;
let salesChart = null;

let stock = JSON.parse(localStorage.getItem("stock")) || {
    "いちご":20,
    "みかん":20,
    "ぶどう":20
};

function addItem(name, price) {

    total += price;

    document.getElementById("total").textContent = total;

    if(cart[name]) {
        cart[name].count++;
    } else {
        cart[name] = {
            count: 1,
            price: price
        };
    }

    updateCart();
}

function updateCart() {

    const cartList =
        document.getElementById("cart");

    cartList.innerHTML = "";

    for(let item in cart) {

        const li =
            document.createElement("li");

        li.textContent =
            `${item} × ${cart[item].count}`;

            const deleteBtn =
            document.createElement("button");
            
            deleteBtn.textContent = "−";

            deleteBtn.onclick = function(){
                cart[item].count--;
                 total -= cart[item].price;
                 if(cart[item].count <= 0){
                    delete cart[item];
                }
                document.getElementById("total")
                .textContent = total;
    
                document.getElementById("change")
                .textContent = 0;

                updateCart();
            };
            li.appendChild(deleteBtn);
        cartList.appendChild(li);
    }
}

function calculateChange() {

    const payment =
        Number(
            document.getElementById("payment").value
        );

    const change =
        payment - total;

    document.getElementById("change")
        .textContent = change;
}

function updateStock() {

    const stockList =
    document.getElementById("stockList");

    stockList.innerHTML = "";

    for(let item in stock){

        const li =
        document.createElement("li");

        li.textContent =
        `${item}: ${stock[item]}個`;

        stockList.appendChild(li);
    }
}

//在庫リセット
function resetStock(){

    if(!confirm("在庫更新しても大丈夫ですか？\n")){
        return; // 「キャンセル」を押したらここで処理をストップする
    }

    stock["いちご"] =
    Number(
        document.getElementById(
            "stockStrawberry"
        ).value
    );

    stock["みかん"] =
    Number(
        document.getElementById(
            "stockOrange"
        ).value
    );

    stock["ぶどう"] =
    Number(
        document.getElementById(
            "stockGrape"
        ).value
    );

    localStorage.setItem(
        "stock",
        JSON.stringify(stock)
    );

    updateStock();

    alert("在庫更新！");
}

//受付番号リセット
function resetTicketNo(){
    
    if(!confirm("受付番号をリセットしますか？\n1番から開始します")){
        return; // 「キャンセル」を押したらここで処理をストップする
    }

    ticketNo = 1;

    localStorage.setItem(
        "ticketNo",
        ticketNo
    );

    alert("受付番号をリセットしました");
}

//テンキー
function addNumber(num){

    let payment =
        document.getElementById("payment");

    payment.value += num;
}

function clearPayment(){

    document.getElementById("payment")
        .value = "";
}

function backspace(){

    let payment =
        document.getElementById("payment");

    payment.value =
        payment.value.slice(0,-1);
}

//預かり金時短
function addMoney(amount){

    let payment =
        document.getElementById("payment");

    payment.value =
        Number(payment.value || 0) + amount;
}

function completeSale(){
//預かり金
const payment =
Number(document.getElementById("payment").value);

if(payment < total){
    alert("預かり金が足りません");
    return;
}

//0円
if(total === 0){
    alert("商品が選択されていません");
    return;
}


//番号札システム
let ticket = null;

const needTicket =
document.getElementById("needTicket").checked;

if(needTicket){
    ticket = ticketNo;
    ticketNo++;
    localStorage.setItem(
        "ticketNo",
        ticketNo
    );
}
if(ticket !== null){

    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];

    orders.push({
        ticket: ticket,
        items: JSON.parse(
            JSON.stringify(cart)
        )
    });

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );
}

//売上読み込み
let sales =
JSON.parse(
localStorage.getItem("sales")
) || [];  

//売上個数
sales.push({
    date:new Date().toLocaleDateString(),
    strawberry: cart["いちご"]?.count || 0,
    orange: cart["みかん"]?.count || 0,
    grape: cart["ぶどう"]?.count || 0,
    total: total
});

//保存
localStorage.setItem(
    "sales",
    JSON.stringify(sales)
);

//在庫減少
for(let item in cart){

    stock[item] -=
        cart[item].count;
}

//在庫保存
localStorage.setItem(
    "stock",
    JSON.stringify(stock)
);

//リセット
total = 0;
cart = {};

//画面表示
document.getElementById("total")
.textContent = 0;

document.getElementById("change")
.textContent = 0;

document.getElementById("payment")
.value = 0;

updateCart();
updateStock();

alert("会計完了！");



//番号札発券
if(ticket !== null){

    document.getElementById("ticket")
    .textContent =
    "受付番号 " + ticket;

}else{

    document.getElementById("ticket")
    .textContent =
    "番号札なし";
}
document.getElementById("needTicket")
.checked = false;

renderChart();
updateStock();
updateOrderList();
}

//受付中リスト
function updateOrderList(){

    const orderList =
        document.getElementById("orderList");

    orderList.innerHTML = "";

    let orders =
        JSON.parse(
            localStorage.getItem("orders")
        ) || [];

    for(let order of orders){

        const li =
            document.createElement("li");

        let text =
            order.ticket + "番 : ";

        for(let item in order.items){

            text +=
                item +
                "×" +
                order.items[item].count +
                " ";
        }
    

        li.textContent = text;

        const completeBtn =
        document.createElement("button");
        completeBtn.textContent = "完了";

        completeBtn.onclick = function(){
            let orders =
            JSON.parse(
                localStorage.getItem("orders")
            ) || [];
            orders = orders.filter(
                o => o.ticket !== order.ticket
            );
            localStorage.setItem(
                "orders",
                JSON.stringify(orders)
            );
            updateOrderList();
        };

li.appendChild(completeBtn);
orderList.appendChild(li);
    }
}

//売上表示
function renderChart(){

    if(salesChart){
        salesChart.destroy();
    }

    let sales =
        JSON.parse(localStorage.getItem("sales")) || [];

    let strawberry = 0;
    let orange = 0;
    let grape = 0;
    let totalSales = 0;

    sales.forEach(s => {
        strawberry += s.strawberry || 0;
        orange += s.orange || 0;
        grape += s.grape || 0;
        totalSales += s.total || 0;
    });

    document.getElementById("totalSales")
        .textContent = totalSales + "円";

    salesChart = new Chart(
        document.getElementById("salesChart"),
        {
            type: "bar",
            data: {
                labels: [
                    "いちご",
                    "みかん",
                    "ぶどう"
                ],
                datasets: [{
                    label: "販売数",
                    data: [
                        strawberry,
                        orange,
                        grape
                    ],
                 backgroundColor: [
                    "#ff4d6d",
                    "#ff9f1c",
                    "#7cb518"
                ],
                borderColor: [
                    "#d90429",
                    "#e85d04",
                    "#5a189a"
                ],
                borderWidth: 2
                }]
            }
        }
    );
}

//売上リセット
function resetSales(){

    if(!confirm("売上をリセットしますか？")){
        return;
    }

    localStorage.removeItem("sales");

    renderChart();

    alert("売上をリセットしました");
}

renderChart();
updateStock();
updateOrderList();




