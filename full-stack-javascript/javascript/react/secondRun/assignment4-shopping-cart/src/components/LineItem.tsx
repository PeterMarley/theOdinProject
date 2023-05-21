import '../styles/LineItem.css';
import CartAdjust from "./CartAdjust";
import React from "react";

const LineItem = ({name, price, quantityInStock, addToCart, removeFromCart}: {
    name: string,
    price: number,
    quantityInStock: number,
    addToCart: (name: string) => void,
    removeFromCart: (name: string) => void
}) => {
    return (
        <div className='LineItem'>
            <div>Name: {name}</div>
            <div className='LineItem__details'>
                <p>Price: £{price}</p>
                <p>Quantity In Stock: {quantityInStock}</p>
            </div>
            <div className='LineItem__controls'>
                <CartAdjust
                    name={name}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                />
                {/*<div className='LineItem__increments'>*/}
                {/*    &nbsp;<p onClick={() => removeFromCart(name)}>-</p>&nbsp;&nbsp;<p*/}
                {/*    onClick={() => addToCart(name)}>+</p>&nbsp;*/}
                {/*</div>*/}
                <div className='LineItem__addAmount'>
                    <input type='text'></input>
                    <button>Add To Cart</button>
                </div>
            </div>
        </div>
    );
};

export default LineItem;