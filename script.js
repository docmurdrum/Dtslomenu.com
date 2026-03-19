<meta name='viewport' content='width=device-width, initial-scale=1'/><script>const products = [
    { name: "Mini water", size: "8oz", price: 0.99 },
    { name: "Waterloo", size: "12oz", price: 1.49 },
    { name: "Mini soda", size: "8oz", price: 1.99 },
    { name: "Milk", size: "16oz", price: 1.99 },
    { name: "Coffee", size: "12oz", price: 2.99 },
    { name: "Redbull", size: "8.4oz", price: 3.99 },
    { name: "Protein drink", size: "14oz", price: 2.99 },
    { name: "Coconut water", size: "11oz", price: 2.99 },
    { name: "Mints or gum", size: "1 pack", price: 2.99 },
    { name: "Welches fruit snacks", size: "2.25oz", price: 0.99 },
    { name: "Pistachios", size: "1.5oz", price: 1.99 },
    { name: "Chips", size: "1 bag", price: 1.99 },
    { name: "A dozen oreos", size: "12 count", price: 2.99 },
    { name: "Liquid IV", size: "1 stick", price: 2.99 },
    { name: "Rose", size: "1 stem", price: 3.99 },
    { name: "Charger", size: "1 unit", price: 9.99 }
];

let cart = {};

// This tells the browser: "Wait until the page is ready!"
window.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('product-grid');
    
    // Check if the grid exists before trying to fill it
    if (grid) {
        products.forEach(p => {
            grid.innerHTML += `
                <div class="card">
                    <h3>${p.name}</h3>
                    <p>${p.size}</p>
                    <p class="price">$${p.price.toFixed(2)}</p>
                    <input type="number" id="qty-${p.name}" value="1" min="1" style="width: 50px">
                    <button onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button>
                </div>
            `;
        });
    } else {
        console.error("Could not find the 'product-grid' element!");
    }
});


function addToCart(name, price) {
    const qty = parseInt(document.getElementById(`qty-${name}`).value);
    cart[name] = (cart[name] || 0) + qty;
    updateCartUI();
}

function updateCartUI() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    document.getElementById('cart-count').innerText = count;
}

function toggleCheckout() {
    const store = document.getElementById('store-page');
    const checkout = document.getElementById('checkout-page');
    if (store.style.display === "none") {
        store.style.display = "block";
        checkout.style.display = "none";
    } else {
        store.style.display = "none";
        checkout.style.display = "block";
        renderSummary();
    }
}

function renderSummary() {
    let html = "<ul>";
    let total = 0;
    for (let item in cart) {
        const p = products.find(x => x.name === item);
        html += `<li>${item} x ${cart[item]} - $${(p.price * cart[item]).toFixed(2)}</li>`;
        total += p.price * cart[item];
    }
    html += `</ul><strong>Total: $${total.toFixed(2)}</strong>`;
    document.getElementById('order-summary').innerHTML = html;
}

function submitOrder() {
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const userPhone = document.getElementById('phone').value;

    if (!fname || !lname || !userPhone) return alert("Please fill all fields");

    navigator.geolocation.getCurrentPosition((pos) => {
        const loc = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        let orderDetails = `Order for ${fname} ${lname}. Phone: ${userPhone}. Items: `;
        for (let item in cart) { orderDetails += `${item}(${cart[item]}) `; }
        orderDetails += `Location: ${loc}`;

        // Opens SMS app with the details
        window.location.href = `sms:+18052506655?&body=${encodeURIComponent(orderDetails)}`;
    }, () => {
        alert("Please enable GPS to send your order.");
    });
}
</script>
