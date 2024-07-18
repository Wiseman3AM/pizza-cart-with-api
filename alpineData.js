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
            showPopUp: true,
            
/* Functions
------------------------------------------------------------------------------------------------------------------------------------- */

            login() {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();

                } else {
                    alert("Username is too short")
                }
            },

            logout(){
                if (confirm('Do you want to logout?')){
                localStorage['username'] = '';
                this.username = '';
                this.cartId = '';
                localStorage['cartId'] = '';
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
                        return Promis.resolve();
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
                    if (storedUsername){
                    this.username = storedUsername
                    }
                    axios
                        .get('https://pizza-api.projectcodex.net/api/pizzas')
                        .then(result => {
                            this.pizzas = result.data.pizzas;
                            this.sortedPizzas = this.pizzas.sort((a, b) => b.price - a.price);
                            this.pizzaId = this.sortedPizzas.id;
                            /*  console.log(this.pizzaId)
                             console.log(this.sortedPizzas); */
                        });

                    if (!this.cartId) {
                        this.createCart()
                            .then(() => {
                                this.showCartData();
                            })
                    };

                    this.showCartData();
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
                    /*  alert("Pay now : " +  this.paymentAmount) */
                    this
                        .pay(this.paymentAmount)
                        .then(result => {
                            if (result.data.status == 'failure') {
                                this.message = result.data.message;
                                setTimeout(() => this.message = '', 3000);
                            } else {
                                this.message = 'Payment recieved';
                                setTimeout(() => {
                                    this.cartPizzas = [];
                                    this.message = '';
                                    this.cartTotal = 0.00;
                                    this.cartId = '';
                                    this.createCart();
                                    this.paymentAmount = 0.00;
                                    localStorage['cartId'] = '';
                                }, 3000);
                            }
                        })
                }

            };
        });
});
