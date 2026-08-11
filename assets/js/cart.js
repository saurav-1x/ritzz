const CART_KEY = "ritzz-cart";

function readCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `Rs. ${value}`;
}

function getCartQuantity(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount(cart) {
  const totalQuantity = getCartQuantity(cart);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(totalQuantity);
  });
}

function buildCheckoutLink(cart) {
  const orderLines = cart.map((item) => `${item.name} x${item.quantity} - Rs. ${item.price * item.quantity}`);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const body = [
    "Hello Ritzz,",
    "",
    "I want to place this order:",
    ...orderLines,
    "",
    `Total: Rs. ${subtotal}`,
  ].join("\n");

  return `mailto:hello@ritzzclothing.com?subject=Ritzz%20Order&body=${encodeURIComponent(body)}`;
}

function renderCart(cart) {
  const itemsRoot = document.querySelector("[data-cart-items]");
  const countNode = document.querySelector("[data-cart-items-count]");
  const subtotalNode = document.querySelector("[data-cart-subtotal]");
  const shippingNode = document.querySelector("[data-cart-shipping]");
  const totalNode = document.querySelector("[data-cart-total]");
  const checkoutLink = document.querySelector("[data-checkout-link]");

  updateCartCount(cart);

  if (!itemsRoot || !countNode || !subtotalNode || !shippingNode || !totalNode || !checkoutLink) {
    return;
  }

  const totalQuantity = getCartQuantity(cart);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  countNode.textContent = String(totalQuantity);
  subtotalNode.textContent = formatPrice(subtotal);
  shippingNode.textContent = subtotal > 0 ? "Free" : "Free";
  totalNode.textContent = formatPrice(total);
  checkoutLink.href = subtotal > 0 ? buildCheckoutLink(cart) : "mailto:hello@ritzzclothing.com";
  checkoutLink.textContent = subtotal > 0 ? "Proceed to Checkout" : "Checkout on WhatsApp/Email";
  checkoutLink.setAttribute("aria-disabled", subtotal > 0 ? "false" : "true");

  if (cart.length === 0) {
    itemsRoot.innerHTML = '<p class="cart-empty">Your cart is empty. Add a product to see it here.</p>';
    return;
  }

  itemsRoot.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-main">
            <strong>${item.name}</strong>
            <span class="cart-item-meta">Sizes ${item.size}</span>
            <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
          <div class="cart-qty" aria-label="Quantity controls">
            <button type="button" data-cart-decrease="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-increase="${item.id}">+</button>
          </div>
          <button class="cart-remove" type="button" data-cart-remove="${item.id}">Remove</button>
        </div>
      `
    )
    .join("");
}

function addToCart(product) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  writeCart(cart);
  renderCart(cart);
  window.location.hash = "cart-panel";
}

function updateQuantity(productId, delta) {
  const cart = readCart()
    .map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  writeCart(cart);
  renderCart(cart);
}

function removeItem(productId) {
  const cart = readCart().filter((item) => item.id !== productId);
  writeCart(cart);
  renderCart(cart);
}

function clearCart() {
  writeCart([]);
  renderCart([]);
}

function setupAddToCart() {
  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart({
        id: button.getAttribute("data-product-id"),
        name: button.getAttribute("data-product-name"),
        price: Number(button.getAttribute("data-product-price")),
        size: button.getAttribute("data-product-size"),
      });
    });
  });
}

function setupCartPanelActions() {
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.hasAttribute("data-cart-increase")) {
      updateQuantity(target.getAttribute("data-cart-increase"), 1);
    }

    if (target.hasAttribute("data-cart-decrease")) {
      updateQuantity(target.getAttribute("data-cart-decrease"), -1);
    }

    if (target.hasAttribute("data-cart-remove")) {
      removeItem(target.getAttribute("data-cart-remove"));
    }

    if (target.hasAttribute("data-clear-cart")) {
      clearCart();
    }
  });
}

const currentCart = readCart();
updateCartCount(currentCart);
renderCart(currentCart);
setupAddToCart();
setupCartPanelActions();
