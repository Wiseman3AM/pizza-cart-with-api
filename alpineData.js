/* Initialize data
------------------------------------------------------------------------------------------------------------------------------------ */

document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => {
        return {
            pizzas: [],
            title: 'Perfect Pizza',
            sortedPizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            sortedCartPizzas: [],
            cartTotal: 0.00,
            pizzaId: null,
            paymentAmount: 0.00,
            message: '',
            show: false,
            change: false,
            changeAmount: 0.00,
            darkmode: false,
            enjoy: false,
            cartHistory : [],


/* Functions
------------------------------------------------------------------------------------------------------------------------------------- */

            toggleDarkMode() {
                this.darkmode = !this.darkmode;
                document.body.classList.toggle('darkmode', this.darkmode);
                localStorage.setItem('darkmode', this.darkmode);
            },


            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                    this.show = true;

                } else {
                    alert("Username is too short")
                }
            },

            logout() {
                if (confirm('Do you want to logout?')) {
                    localStorage['username'] = '';
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    this.show = false;
                }
            },

            createCart() {

                if (!this.username) {
                    this.cartId = 'No username to create a cart'
                    return;
                }


                const cartId = localStorage['cartId']

                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve();
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    return axios.get(createCartURL)
                        .then(result => {
                            this.cartId = result.data.cart_code;
                            localStorage['cartId'] = this.cartId;
                        })
                };
            },

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartURL);
            },

        /*     showOrders() {
                const pastOrders = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`;
                return axios.showPastOrders(pastOrders)
            }, */

            fetchcartHistory(){
                this.cartHistory = JSON.parse(localStorage.getItem('cartHistory') || [])
            console.log(this.cartHistory)
            },


            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },

            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                    "cart_code": this.cartId,
                    "pizza_id": pizzaId
                })

            },

            pay(amount) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay', {
                    "cart_code": this.cartId,
                    amount
                }
                )
            },

            showCartData() {
                this.getCart().then(result => {
                    const cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total.toFixed(2);
                    /* this.cartPizzas = result.data.pizzas */
                });
            },


            init() {
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername
                };


                const storedCart = localStorage['oldCart'];
                if (storedCart) {
                    this.storedCart = ['oldCart']
                };

                // Load dark mode state
                const storedDarkMode = localStorage.getItem('darkmode') === 'true';
                this.darkmode = storedDarkMode;
                document.body.classList.toggle('darkmode', this.darkmode);

                axios
                    .get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
                        this.sortedPizzas = this.pizzas.sort((a, b) => b.price - a.price);
                        this.pizzaId = this.sortedPizzas.id;
                    });

                const cartId = localStorage['cartId'];
                if (!this.cartId) {
                    this.createCart()
                        .then(() => {
                            this.showCartData();
                        })
                        .catch(error => {
                            console.error("Error creating cart:", error);
                        });
                } else {
                    this.cartId = this.cartId;
                    this.showCartData();
                }


                this.show = true;
            },


            addPizzaToCart(pizzaId) {
                /* alert(pizzaId); */
                this
                    .addPizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    })
            },
            removePizzaFromCart(pizzaId) {
                this
                    .removePizza(pizzaId)
                    .then(() => {
                        this.showCartData();
                    })
            },

            payForCart() {
                this.pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status === 'failure') {
                            this.message = result.data.message;
                            
                            setTimeout(() => this.message = '', 3000);
                            alert("Not enough please enter the required amount!");
                        } else {
                            if (this.paymentAmount > this.cartTotal) {
                                this.message = 'Payment received';
                                this.changeAmount = (this.paymentAmount - this.cartTotal).toFixed(2);
                                this.change = true;
                                this.enjoy = true;

                                let localStorageData = JSON.parse(localStorage.getItem('cartHistory')) || [];
                                let cartHistoryArr = [...this.cartPizzas, ...localStorageData];
                                localStorage.setItem('cartHistory', JSON.stringify(cartHistoryArr));
                                this.cartHistory = cartHistoryArr; // Update the cartHistory in Alpine.js component
                                console.log(cartHistoryArr);                          

                            } else {
                                this.message = 'Payment received';
                                this.enjoy = true;
                            }
                            setTimeout(() => {
                                // Clear cart state
                                this.cartPizzas = [];
                                this.cartTotal = 0.00;
                                this.paymentAmount = 0.00;
                                this.changeAmount = 0.00;
                                this.change = false;
                                this.enjoy = false;
            
                                // Clear local storage
                                localStorage['cartId'] = '';
            
                                // Create a new cart
                                this.createCart()
                                    .then(() => {
                                        this.showCartData(); // Refresh cart data
                                    })
                                    .catch(error => {
                                        console.error("Error creating new cart:", error);
                                    });
            
                                this.message = ''; // Clear message after a delay
                            }, 3000);
                        }
                    })
                    .catch(error => {
                        console.error("Error processing payment:", error);
                    });
            }
            

        };
    });
});



/* Nav functions
------------------------------------------------------------------------------------------------------------------------------------- */
/* document.addEventListener('DOMContentLoaded', function() {
    document.querySelector(".toggle").addEventListener("click", function() {
        const navBar = document.querySelector(".navBar");
        const logo = document.querySelector(".logo");
        const icon = this.querySelector("ion-icon");

        if (navBar.style.display === "none") {
            navBar.style.display = "flex";
            logo.style.display = "block";
            icon.setAttribute("name", "menu-outline");
        } else {
            navBar.style.display = "none";
            logo.style.display = "none";
            icon.setAttribute("name", "close-outline");
        }
    });
}); */
