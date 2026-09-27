import { useSearchParams } from 'react-router-dom';
import './CategoriesDropdown.css';

export default function CategoriesDropdown() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');

    const categories = [
        { name: 'Home Appliance', value: 'home appliances' },
        { name: 'Computer Products', value: 'Laptops' },
        { name: 'Gaming Products', value: 'Gaming' },
        { name: 'Home Decoration', value: 'Home Decoration' },
         { name: 'Dress ', value: 'Dress' },
          { name: 'sports product', value: 'sports product' }
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

    return (
        <div className="categories-dropdown">
            <button className="categories-btn">Categories</button>
            <div className="dropdown-menu">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        className={`dropdown-item ${selectedCategory === cat.value ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(cat.value)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
