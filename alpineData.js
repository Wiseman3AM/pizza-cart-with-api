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
            unSortedPizzas: [],
            cartTotal: 0.00,
            pizzaId: null,
            paymentAmount: 0.00,
            message: '',
            show: false,
            change: false,
            changeAmount: 0.00,
            darkmode: false,
            enjoy: false,
            cartHistoryArr: [],
            favoritePizza: '',
            leastFavoritePizza: '',
            sometimesPizza: '',
            history: false,
            navOpen : false,


            /* Functions
            ------------------------------------------------------------------------------------------------------------------------------------- */


            // Function to activate dark mode state


            navOpen: false,

            toggleDarkMode() {
                this.darkmode = !this.darkmode;
                document.body.classList.toggle('darkmode', this.darkmode);
                localStorage.setItem('darkmode', this.darkmode);
            },


            // Function to add a username
            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                    this.show = true;
                } else {
                    alert("Username is too short")
                }
                /*                 this.fetchcartHistory()
                                .then(() => this.mostBought()); */
            },

            // Log out function
            logout() {
                if (confirm('Do you want to logout?')) {
                    localStorage['username'] = '';
                    this.username = '';
                    this.cartId = '';
                    localStorage['cartId'] = '';
                    this.show = false;
                }
            },

            // Function to create a cart
            createCart() {

                if (!this.username) {
                    this.cartId = 'No username to create a cart';
                    return;
                };


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

            // Function to retrieve data from cart using cart ID

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartURL);
            },

            mounted() {
                this.favoritePizza = localStorage.getItem('favoritePizza') || null;
            },


            // Function to determine the most bought pizza
            mostBought() {
                let pizzaMap = {};

                this.cartHistoryArr.forEach((pizza) => {
                    if (pizzaMap[pizza.id] === undefined) {
                        pizzaMap[pizza.id] = 1;
                    } else {
                        pizzaMap[pizza.id]++;
                    }
                });

                // Find most popular pizza
                let mostPopularPizzaId = '';
                let maxCount = 0;
                Object.entries(pizzaMap).forEach(([id, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        mostPopularPizzaId = id;
                    }
                });

                // Find least popular pizza (least bought)
                let leastPopularPizzaId = '';
                let minCount = Infinity; // Initialize with a large value
                Object.entries(pizzaMap).forEach(([id, count]) => {
                    if (count < minCount) {
                        minCount = count;
                        leastPopularPizzaId = id;
                    }
                });

                // Find a random pizza that is neither most nor least popular
                const eligiblePizzas = Object.keys(pizzaMap).filter(id => id !== mostPopularPizzaId && id !== leastPopularPizzaId);
                const randomIndex = Math.floor(Math.random() * eligiblePizzas.length);
                const randomPizzaId = eligiblePizzas[randomIndex];

                // Update favorite pizza and local storage
                this.favoritePizza = mostPopularPizzaId;
                this.sometimesPizza = randomPizzaId;
                this.leastFavoritePizza = leastPopularPizzaId;


                localStorage['sometimesPizza'] = this.sometimesPizza;
                localStorage['leastfavoritePizza'] = this.leastFavoritePizza;
                localStorage['favoritePizza'] = this.favoritePizza;

                console.log(`Most Popular Pizza: ${mostPopularPizzaId}`);
                console.log(`Least Popular Pizza: ${leastPopularPizzaId}`);
                console.log(`Random Pizza: ${randomPizzaId}`);
            },





            // Function to retrieve cart history
            fetchcartHistory() {
                const historicalOrdersUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`;

                return axios
                    .get(historicalOrdersUrl)
                    .then((res) => {
                        const carts = res.data;
                        const paidCartPromises = carts
                            .filter(cart => cart.status === 'paid')
                            .map(cart => {
                                const paidCartCode = cart.cart_code;
                                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${paidCartCode}/get`;

                                return axios
                                    .get(getCartURL)
                                    .then((res) => res.data.pizzas);
                            });

                        return Promise.all(paidCartPromises);
                    })

                    .then((cartHistories) => {
                        this.cartHistoryArr = cartHistories.flat(); // Flatten the array of arrays
                        localStorage['cartHistoryArr'] = this.cartHistoryArr;
                        console.log('History', this.cartHistoryArr);
                    })
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

            


            async init() {

                // Store username into local storage
                const storedUsername = localStorage['username'];
                if (storedUsername) {
                    this.username = storedUsername
                };


                const storedHistory = localStorage.getItem('history');

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
                        this.unSortedPizzas = this.pizzas.sort((a, b) => a.price - b.price);

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
                await this.fetchcartHistory();
                this.mostBought();

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
                const element = document.getElementById('message');

                this.pay(this.paymentAmount)
                    .then(result => {
                        if (result.data.status === 'failure') {
                            this.message = result.data.message;
                            element.style.color = 'red';

                            setTimeout(() => this.message = '', 3000);

                        } else {
                            if (this.paymentAmount > this.cartTotal) {
                                this.message = 'Payment received';
                                this.changeAmount = (this.paymentAmount - this.cartTotal).toFixed(2);
                                this.change = true;
                                this.enjoy = true;
                                element.style.color = 'green';


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
                this.fetchcartHistory()
                    .then(() => this.mostBought());
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
