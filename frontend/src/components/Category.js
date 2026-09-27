import { useSearchParams } from 'react-router-dom';
import './Category.css';

const CATEGORIES = [
    { name: 'Home Appliances', value: 'Home Appliances' },
    { name: 'Computer Products', value: 'Computer Products' },
    { name: 'Gaming Products', value: 'Gaming Products' },
    { name: 'Home Decoration', value: 'Home Decoration' },
    { name: 'Dress', value: 'Dress' },
    { name: 'Sports Product', value: 'Sports Product' }
];

export default function Category() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');

    const handleCategoryClick = (category) => {
        const newParams = new URLSearchParams(searchParams);

        if (!category || selectedCategory === category) {
            newParams.delete('category');
        } else {
            newParams.set('category', category);
        }

        setSearchParams(newParams);
    };

    return (
        <div className="category-sidebar">
            <h3>Categories</h3>
            <div className="category-list">
                <div className="category-item">
                    <input
                        type="checkbox"
                        id="all-categories"
                        checked={!selectedCategory}
                        onChange={() => handleCategoryClick('')}
                    />
                    <label htmlFor="all-categories">All Categories</label>
                </div>

                {CATEGORIES.map((cat) => (
                    <div key={cat.value} className="category-item">
                        <input
                            type="checkbox"
                            id={cat.value}
                            checked={selectedCategory === cat.value}
                            onChange={() => handleCategoryClick(cat.value)}
                        />
                        <label htmlFor={cat.value}>{cat.name}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}
