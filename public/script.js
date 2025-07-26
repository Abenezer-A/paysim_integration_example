document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const errorMessageDiv = document.getElementById('error-message');

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.product-card');
            addToCart({
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price)
            });
        });
    });

    function addToCart(item) {
        cart.push(item);
        updateCartUI();
    }

    function updateCartUI() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            checkoutButton.disabled = true;
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `<span>${item.name}</span><strong>$${item.price.toFixed(2)}</strong>`;
                cartItemsContainer.appendChild(itemElement);
            });
            checkoutButton.disabled = false;
        }
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalSpan.textContent = total.toFixed(2);
    }

    checkoutButton.addEventListener('click', async () => {
        checkoutButton.textContent = 'Processing...';
        checkoutButton.disabled = true;
        errorMessageDiv.textContent = '';
        const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

        try {
            // Step 1: Frontend calls our OWN server to securely create the payment
            const response = await fetch('/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    currency: 'USD',
                    customerEmail: 'customer@example.com' // In a real app, you'd get this from a form
                })
            });

            const data = await response.json();

            if (data.redirectUrl) {
                // Step 2: Our server gives us the PaySim redirect URL. We navigate there.
                window.location.href = data.redirectUrl;
            } else {
                throw new Error(data.error || 'Could not initiate payment.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            errorMessageDiv.textContent = `Error: ${error.message}`;
            checkoutButton.textContent = 'Checkout with PaySim';
            checkoutButton.disabled = false;
        }
    });

    updateCartUI();
});