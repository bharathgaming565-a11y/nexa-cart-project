import { Link } from 'react-router-dom';
import './ProductCard.css';
import formatCurrency from '../utils/formatCurrency';

const API_BASE = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api/v1', '')
    : '';

export default function ProductCard({ product }) {
    const imgSrc = product.images[0].image.startsWith('http')
        ? product.images[0].image
        : `${API_BASE}${product.images[0].image}`;

    return (
        <div className="product-card">
            <div className="card p-3 rounded">
                <img
                    className="card-img-top mx-auto"
                    src={imgSrc}
                    alt={product.name}
                />
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                        <Link to={'/product/' + product._id}>{product.name}</Link>
                    </h5>
                    <div className="ratings mt-auto" aria-label={`Rated ${product.ratings} out of 5`}>
                        <div className="rating-stars" role="img" aria-label={`Rated ${product.ratings} out of 5`}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const filled = star <= Math.round(product.ratings);
                                return (
                                    <span
                                        key={star}
                                        className={`star ${filled ? 'filled' : ''}`}
                                    >
                                        ★
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <p className="card-text">{formatCurrency(product.price)}</p>
                    <Link to={'/product/' + product._id} id="view_btn" className="btn btn-block">View Details</Link>
                </div>
            </div>
        </div>
    );
}