
// ===== PRODUCT DATA =====
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1499,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 2999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
    },
    {
        id: 3,
        name: "Travel Backpack",
        price: 999,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
    },
    {
        id: 4,
        name: "Running Shoes",
        price: 1799,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
    },
    {
        id: 5,
        name: "Sunglasses",
        price: 699,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
    },
    {
        id: 6,
        name: "Bluetooth Speaker",
        price: 1299,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
    },
    {
        id: 7,
        name: "Digital Camera",
        price: 4999,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"
    },
    {
        id: 8,
        name: "Water Bottle",
        price: 399,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
    }
];

// ===== HTML ELEMENTS =====
const productsGrid = document.getElementById("productsGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const emptyCart = document.getElementById("emptyCart");
const cartTable = document.getElementById("cartTable");

const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutDialog = document.getElementById("checkoutDialog");
const checkoutSummary = document.getElementById("checkoutSummary");
const closeCheckout = document.getElementById("closeCheckout");

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const noProducts = document.getElementById("noProducts");

// ===== SEARCH AND FILTER STATE =====
let selectedCategory = "All";
let searchText = "";

// ===== CURRENCY FORMAT =====
function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });
}

// ===== LOAD CART FROM LOCAL STORAGE =====
function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("cart") || "{}"
        );

        if (
            !savedCart ||
            typeof savedCart !== "object" ||
            Array.isArray(savedCart)
        ) {
            return {};
        }

        const validCart = {};

        Object.entries(savedCart).forEach(function([id, quantity]) {
            const productExists = products.some(function(product) {
                return product.id === Number(id);
            });

            if (
                productExists &&
                Number.isInteger(quantity) &&
                quantity > 0
            ) {
                validCart[id] = quantity;
            }
        });

        return validCart;

    } catch (error) {
        console.warn("Could not load cart:", error);
        return {};
    }
}

let cart = loadCart();

// ===== SAVE CART =====
function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save cart:", error);
    }
}

// ===== DISPLAY PRODUCTS =====
function displayProducts() {
    productsGrid.replaceChildren();

    const filteredProducts = products.filter(function(product) {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    noProducts.hidden = filteredProducts.length !== 0;

    filteredProducts.forEach(function(product) {
        const card = document.createElement("article");
        card.className = "product-card";


        // Enlarge only searched product cards
        if (searchText.length > 0) {
            card.classList.add("search-highlight");
        }

        // Product image
        const imageBox = document.createElement("div");
        imageBox.className = "product-image";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.addEventListener("error", function() {
            imageBox.textContent = "🛍️";
        }, { once: true });

        imageBox.appendChild(image);

        // Product name
        const name = document.createElement("h3");
        name.textContent = product.name;

        // Category
        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        // Price
        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatMoney(product.price);

        // Add to cart button
        const button = document.createElement("button");
        button.className = "add-btn";
        button.type = "button";
        button.dataset.id = product.id;
        button.textContent = "Add to Cart";

        card.append(
            imageBox,
            name,
            category,
            price,
            button
        );

        productsGrid.appendChild(card);
    });
}


// ===== ADD TO CART =====
function addToCart(id) {
    const product = products.find(function(item) {
        return item.id === Number(id);
    });

    if (!product) return;

    cart[id] = (cart[id] || 0) + 1;

    saveCart();
    renderCart();
}

// ===== CHANGE QUANTITY =====
function changeQuantity(id, amount) {
    if (!cart[id]) return;

    cart[id] += amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveCart();
    renderCart();
}

// ===== REMOVE PRODUCT =====
function removeItem(id) {
    if (!cart[id]) return;

    delete cart[id];

    saveCart();
    renderCart();
}

// ===== CALCULATE TOTAL =====
function calculateTotals() {
    const subtotal = Object.keys(cart).reduce(function(sum, id) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        if (!product) return sum;

        return sum + product.price * cart[id];
    }, 0);

    const delivery =
        subtotal > 0 && subtotal < 500 ? 40 : 0;

    return {
        subtotal: subtotal,
        delivery: delivery,
        total: subtotal + delivery
    };
}

// ===== RENDER CART =====
function renderCart() {
    cartItems.replaceChildren();

    const cartIds = Object.keys(cart);

    const itemCount = cartIds.reduce(function(sum, id) {
        return sum + cart[id];
    }, 0);

    cartCount.textContent = itemCount;

    emptyCart.style.display =
        cartIds.length === 0 ? "block" : "none";

    cartTable.style.display =
        cartIds.length === 0 ? "none" : "table";

    cartIds.forEach(function(id) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        if (!product) return;

        const quantity = cart[id];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;

        const priceCell = document.createElement("td");
        priceCell.textContent = formatMoney(product.price);

        // Quantity controls
        const quantityCell = document.createElement("td");

        const decreaseBtn = document.createElement("button");
        decreaseBtn.className = "quantity-btn";
        decreaseBtn.type = "button";
        decreaseBtn.dataset.action = "decrease";
        decreaseBtn.dataset.id = id;
        decreaseBtn.textContent = "−";
        decreaseBtn.setAttribute("aria-label", "Decrease quantity");

        const quantityText = document.createElement("span");
        quantityText.textContent = " " + quantity + " ";

        const increaseBtn = document.createElement("button");
        increaseBtn.className = "quantity-btn";
        increaseBtn.type = "button";
        increaseBtn.dataset.action = "increase";
        increaseBtn.dataset.id = id;
        increaseBtn.textContent = "+";
        increaseBtn.setAttribute("aria-label", "Increase quantity");

        quantityCell.append(
            decreaseBtn,
            quantityText,
            increaseBtn
        );

        // Product total
        const totalCell = document.createElement("td");
        totalCell.textContent =
            formatMoney(product.price * quantity);

        // Remove button
        const actionCell = document.createElement("td");

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.type = "button";
        removeBtn.dataset.action = "remove";
        removeBtn.dataset.id = id;
        removeBtn.textContent = "Remove";

        actionCell.appendChild(removeBtn);

        row.append(
            nameCell,
            priceCell,
            quantityCell,
            totalCell,
            actionCell
        );

        cartItems.appendChild(row);
    });

    // Update price summary
    const totals = calculateTotals();

    subtotalElement.textContent = formatMoney(totals.subtotal);
    deliveryElement.textContent = formatMoney(totals.delivery);
    totalElement.textContent = formatMoney(totals.total);

    checkoutBtn.disabled = cartIds.length === 0;
}

// ===== PRODUCT EVENT DELEGATION =====
productsGrid.addEventListener("click", function(event) {
    const button = event.target.closest(".add-btn");

    if (!button) return;

    addToCart(button.dataset.id);
});

// ===== CART EVENT DELEGATION =====
cartItems.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "increase") {
        changeQuantity(id, 1);
    } else if (action === "decrease") {
        changeQuantity(id, -1);
    } else if (action === "remove") {
        removeItem(id);
    }
});

// ===== SEARCH PRODUCTS =====
searchInput.addEventListener("input", function() {
    searchText = searchInput.value.trim().toLowerCase();
    displayProducts();
});

// ===== CATEGORY FILTER =====
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        selectedCategory = button.dataset.category;

        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        displayProducts();
    });
});

// ===== CHECKOUT PREVIEW =====
function showCheckout() {
    if (Object.keys(cart).length === 0) return;

    checkoutSummary.replaceChildren();

    Object.keys(cart).forEach(function(id) {
        const product = products.find(function(item) {
            return item.id === Number(id);
        });

        if (!product) return;

        const line = document.createElement("p");

        line.textContent =
            product.name +
            " × " + cart[id] +
            " — " +
            formatMoney(product.price * cart[id]);

        checkoutSummary.appendChild(line);
    });

    const totals = calculateTotals();

    const divider = document.createElement("hr");

    const subtotalLine = document.createElement("p");
    subtotalLine.textContent =
        "Subtotal: " + formatMoney(totals.subtotal);

    const deliveryLine = document.createElement("p");
    deliveryLine.textContent =
        "Delivery: " + formatMoney(totals.delivery);

    const grandTotal = document.createElement("h3");
    grandTotal.style.color = "#67e8f9";
    grandTotal.style.marginTop = "15px";
    grandTotal.textContent =
        "Grand Total: " + formatMoney(totals.total);

    checkoutSummary.append(
        divider,
        subtotalLine,
        deliveryLine,
        grandTotal
    );

    checkoutDialog.showModal();
}

// ===== CHECKOUT EVENTS =====
checkoutBtn.addEventListener("click", showCheckout);

closeCheckout.addEventListener("click", function() {
    checkoutDialog.close();
});

checkoutDialog.addEventListener("click", function(event) {
    if (event.target === checkoutDialog) {
        checkoutDialog.close();
    }
});

// ===== INITIALIZE =====
displayProducts();
renderCart();
