document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = {
        laptops: document.querySelector('#laptops .products'),
        phones: document.querySelector('#phones .products'),
        tablets: document.querySelector('#tablets .products'),
        accessories: document.querySelector('#accessories .products')
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    const orderForm = document.getElementById('order-form');
    const orderList = document.getElementById('order-list'); // Новый элемент для списка заказов

    // Функция для добавления товара в корзину
    function addToCart(category, id) {
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                const product = products[category].find(item => item.id == id);
                cart.push(product);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
    }

    // Функция для обновления корзины на странице
    function updateCart() {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            let totalPrice = 0;
            cart.forEach((item, index) => {
                const cartItem = document.createElement('li');
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    ${item.name} - ${item.price} руб.
                    <button class="remove-item" data-index="${index}">Удалить</button>
                `;
                cartItemsContainer.appendChild(cartItem);
                totalPrice += item.price;
            });
            totalPriceElement.textContent = `Итого: ${totalPrice} руб.`;
            addRemoveEventListeners();
            if (cart.length === 0) {
                orderForm.style.display = 'none';
            } else {
                orderForm.style.display = 'block';
            }
        }
    }

    // Функция для добавления обработчиков событий на кнопки удаления из корзины
    function addRemoveEventListeners() {
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });
    }

    for (const category in productsContainer) {
        if (productsContainer[category]) {
            fetch('products.json')
                .then(response => response.json())
                .then(products => {
                    products[category].forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('product');
                        productElement.innerHTML = `
                            <img src="${product.image}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p>${product.price} руб.</p>
                            <button data-category="${category}" data-id="${product.id}">Добавить в корзину</button>
                        `;
                        productsContainer[category].appendChild(productElement);
                    });
                    addEventListeners();
                });
        }
    }

    function addEventListeners() {
        document.querySelectorAll('.product button').forEach(button => {
            button.addEventListener('click', (event) => {
                const category = event.target.getAttribute('data-category');
                const id = event.target.getAttribute('data-id');
                addToCart(category, id);
            });
        });
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const order = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                items: cart
            };
            saveOrdersToDB(order);
        });
    }

    function saveOrdersToDB(order) {
        fetch('/save-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Заказ успешно сохранен в базе данных.');
                    localStorage.removeItem('cart');
                    cart = [];
                    updateCart();
                } else {
                    console.error('Ошибка при сохранении заказа.');
                }
            })
            .catch(error => {
                console.error('Ошибка при сохранении заказа:', error);
            });
    }

    function loadOrders() {
        fetch('/orders')
            .then(response => response.json())
            .then(orders => {
                orderList.innerHTML = ''; // Очищаем список заказов перед загрузкой новых
                orders.forEach(order => {
                    const orderItem = document.createElement('li');
                    orderItem.innerHTML = `
                        <h3>Заказ №${order._id}</h3>
                        <p>Имя: ${order.name}</p>
                        <p>Телефон: ${order.phone}</p>
                        <p>Адрес: ${order.address}</p>
                        <h4>Товары:</h4>
                        <ul>
                            ${order.items.map(item => `<li>${item.name} - ${item.price} руб.</li>`).join('')}
                        </ul>
                    `;
                    orderList.appendChild(orderItem);
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке заказов:', error);
            });
    }

    if (orderList) {
        loadOrders();
    }

    updateCart();
});
