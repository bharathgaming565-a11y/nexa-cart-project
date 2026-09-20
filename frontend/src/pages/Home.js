import {Fragment, useEffect, useState} from 'react'
import ProductCard from '../components/ProductCard'
import { useSearchParams } from 'react-router-dom';
import './Home.css'

export default function Home() {
    const [products, setProducts] = useState([]);
    const [searchParams] = useSearchParams()

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL+'/products?'+searchParams)
        .then(res => res.json())
        .then( res => setProducts(res.products))
    },[searchParams])

    return <Fragment>
        <div className="home-container">
            <h1 id="products_heading">Latest Products</h1>

            <section id="products" className="products-section">
                <div className="products-grid">
                    {products && products.length > 0 ? (
                        products.map(product => <ProductCard key={product._id} product={product} />)
                    ) : (
                        <div className="no-products">
                            <p>No products found. Try a different category or search term.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    </Fragment>
}