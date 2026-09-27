import { useSearchParams } from 'react-router-dom';
import './CategoriesDropdown.css';

const CATEGORIES = [
    { name: 'Home Appliances', value: 'Home Appliances' },
    { name: 'Computer Products', value: 'Computer Products' },
    { name: 'Gaming Products', value: 'Gaming Products' },
    { name: 'Home Decoration', value: 'Home Decoration' },
    { name: 'Dress', value: 'Dress' },
    { name: 'Sports Product', value: 'Sports Product' }
];

export default function CategoriesDropdown() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');

    const handleCategoryClick = (category) => {
        const newParams = new URLSearchParams(searchParams);

        if (!category) {
            newParams.delete('category');
        } else if (selectedCategory === category) {
            newParams.delete('category');
        } else {
            newParams.set('category', category);
        }

        setSearchParams(newParams);
    };

    return (
        <div className="categories-dropdown">
            <button className="categories-btn" type="button">
                Categories
            </button>

            <div className="dropdown-menu">
                <button
                    type="button"
                    className={`dropdown-item ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('')}
                >
                    All Categories
                </button>

                {CATEGORIES.map((cat) => (
                    <button
                        type="button"
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
