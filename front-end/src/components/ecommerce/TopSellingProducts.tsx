export default function TopSellingProducts() {
  const products = [
    { name: "Caramel macchiato đá", price: "59,000 VND", sales: 240 },
    { name: "Cappuccino nóng", price: "59,000 VND", sales: 210 },
    { name: "Espresso đá", price: "59,000 VND", sales: 180 },
    { name: "Caramel macchiato đá", price: "59,000 VND", sales: 150 },
    { name: "Latte nóng", price: "59,000 VND", sales: 100 },
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-6">
        Top Selling Product
      </h3>
      
      <div className="flex-1 space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >
            <div className="text-2xl shrink-0">☕</div>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-sm text-gray-900 dark:text-white/90 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {product.price}
              </p>
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white/90 shrink-0">
              {product.sales}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}