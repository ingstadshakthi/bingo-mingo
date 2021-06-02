import React, { useContext, useState, useEffect } from "react";
import { GlobalState } from "../../../GlobalState";
import axios from "axios";
// import PaypalButton from "./PaypalButton";
import StrikeCheckout from "react-stripe-checkout";

function Cart() {
  const state = useContext(GlobalState);
  const [cart, setCart] = state.userAPI.cart;
  const [token] = state.token;
  const [total, setTotal] = useState(0);
  var pay;

  useEffect(() => {
    const getTotal = () => {
      const total = cart.reduce((prev, item) => {
        return prev + item.price * item.quantity;
      }, 0);

      setTotal(total);
    };

    getTotal();
  }, [cart]);

  const addToCart = async (cart) => {
    await axios.patch(
      "/user/addcart",
      { cart },
      {
        headers: { Authorization: token },
      }
    );
  };

  const increment = (id) => {
    cart.forEach((item) => {
      if (item._id === id) {
        item.quantity += 1;
      }
    });

    setCart([...cart]);
    addToCart(cart);
  };

  const decrement = (id) => {
    cart.forEach((item) => {
      if (item._id === id) {
        item.quantity === 1 ? (item.quantity = 1) : (item.quantity -= 1);
      }
    });

    setCart([...cart]);
    addToCart(cart);
  };

  const removeProduct = (id) => {
    if (window.confirm("Do you want to delete this product?")) {
      cart.forEach((item, index) => {
        if (item._id === id) {
          cart.splice(index, 1);
        }
      });

      setCart([...cart]);
      addToCart(cart);
    }
  };
  function handleToken(token, addresses) {
    const address = addresses;

    const { card } = token;
    const { id } = card;
    pay = id;

    tranSuccess(pay, address);
  }
  const tranSuccess = async (paymentID, address) => {
    // const { paymentID, address } = payment;

    await axios.post(
      "/api/payment",
      { cart, paymentID, address },
      {
        headers: { Authorization: token },
      }
    );

    setCart([]);
    addToCart([]);
    alert("You have successfully placed an order.");
  };

  if (cart.length === 0)
    return (
      <h2 style={{ textAlign: "center", fontSize: "3rem" }}>Cart Empty</h2>
    );

  return (
    <div>
      {cart.map((product) => (
        <div className="detail cart" key={product._id}>
          <img src={product.images.url} alt="" />

          <div className="box-detail">
            <h2>{product.title}</h2>

            <h3>₹ {product.price * product.quantity}</h3>
            <p>{product.description}</p>
            <p>{product.content}</p>

            <div className="amount">
              <button onClick={() => decrement(product._id)}> - </button>
              <span>{product.quantity}</span>
              <button onClick={() => increment(product._id)}> + </button>
            </div>

            <div className="delete" onClick={() => removeProduct(product._id)}>
              X
            </div>
          </div>
        </div>
      ))}

      <div className="total">
        <h3>Total: ₹ {total}</h3>

        <StrikeCheckout
          stripeKey="pk_test_51IxWAoSHvNQOQTE1Kzr8Nh4pkbFiFc7D6aYOUs1zn3XnmJ3wKTm893LAk4abdna4Ke5gH7ou5TXll1Mn9h0x6AFb001nA59rE6"
          token={handleToken}
          shippingAddress
          amount={total * 100}
          currency="INR"
        />

        {/* <PaypalButton total={total} tranSuccess={tranSuccess} /> */}
      </div>
    </div>
  );
}

export default Cart;
