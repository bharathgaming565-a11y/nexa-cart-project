export default function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₹0.00';
    const num = Number(amount);
    if (Number.isNaN(num)) return amount;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
}
