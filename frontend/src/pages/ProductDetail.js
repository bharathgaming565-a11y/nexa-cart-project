import {useState, useEffect} from 'react';
import formatCurrency from '../utils/formatCurrency';
import { useParams } from 'react-router-dom';
import {toast} from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api/v1', '')
    : '';

function getImageSrc(imagePath) {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_BASE}${imagePath}`;
}

export default function ProductDetail({cartItems, setCartItems}) {
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const {id} = useParams();

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL+'/product/'+id)
        .then(res => res.json())
        .then( res => setProduct(res.product))
    },[id])

    function addToCart() {
        const itemExist = cartItems.find((item) => item.product._id === product._id)
        if (!itemExist) {
            const newItem = {product, qty};
            setCartItems((state) => [...state, newItem]);
            toast.success("Cart Item added succesfully!")
        }
    }

    function increaseQty() {
        if (product.stock === qty) {
            return;
        }
        setQty((state) => state + 1);
    }

    function decreaseQty() {
        if (qty > 1) {
            setQty((state) => state - 1);
        }
    }


    return  product && <div className="container container-fluid">
                <div className="row f-flex justify-content-around">
                    <div className="col-12 col-lg-5 img-fluid" id="product_image">
                        <img src={getImageSrc(product.images[0].image)} alt={product.name} height="500" width="500" />
                    </div>

                    <div className="col-12 col-lg-5 mt-5">
                        <h3>{product.name}</h3>
                        <p id="product_id">Product #{product._id}</p>

                        <hr />

                        <div className="rating-outer" role="img" aria-label={`Rated ${product.ratings} out of 5`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= Math.round(product.ratings) ? 'filled' : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                

                        <hr />

                        <p id="product_price">{formatCurrency(product.price)}</p>
                        <div className="stockCounter d-inline">
                            <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

                            <input type="number" className="form-control count d-inline" value={qty} readOnly />

                            <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                        </div>
                        <button type="button" onClick={addToCart} disabled={product.stock === 0}   id="cart_btn" className="btn btn-primary d-inline ml-4">Add to Cart</button>

                        <hr />

                        <p>Status: <span id="stock_status" className={product.stock > 0 ?'text-success':'text-danger'}>{product.stock > 0  ?'In Stock' : 'Out of Stock'}</span></p>

                        <hr />

                        <h4 className="mt-2">Description:</h4>
                        <p>{product.description}</p>
                        <hr />
                        <p id="product_seller mb-3">Sold by: <strong>{product.seller}</strong></p>
                        
                        <div className="rating w-50"></div>
                                
                    </div>

                </div>
            </div>
}