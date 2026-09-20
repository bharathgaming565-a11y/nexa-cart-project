import { useSearchParams } from 'react-router-dom';
import './Category.css';

export default function Category() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');

    const categories = [
        { name: 'Home Appliance', value: 'home appliances' },
        { name: 'Computer Products', value: 'Laptops' },
        { name: 'Gaming Products', value: 'Gaming' },
        { name: 'Home Decoration', value: 'Home Decoration' }
    ];

    const handleCategoryClick = (category) => {
        const newParams = new URLSearchParams(searchParams);
        if (selectedCategory === category) {
            newParams.delete('category');
        } else {
            newParams.set('category', category);
        }
        setSearchParams(newParams);
    };

    const handleClearAll = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('category');
        setSearchParams(newParams);
    };

    return (
        <div className="category-sidebar">
            <h3>Categories</h3>
            <div className="category-list">
                {categories.map((cat) => (
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
            {selectedCategory && (
                <button onClick={handleClearAll} className="clear-btn">
                    Clear Filters
                </button>
            )}
        </div>
    );
}
