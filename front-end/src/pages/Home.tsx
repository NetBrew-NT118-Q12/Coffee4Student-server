import EcommerceMetrics from "../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../components/ecommerce/MonthlySalesChart";
import OrderStatusChart from "../components/ecommerce/OrderStatusChart";
import TopSellingProducts from "../components/ecommerce/TopSellingProducts";
import RecentOrders from "../components/ecommerce/RecentOrders";
import PageMeta from "../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Coffee4Student Dashboard | Quản lý quán cà phê"
        description="Trang quản lý tổng quan cho Coffee4Student"
      />
      <div className="space-y-4 md:space-y-6">
        {/* 3 Card Metrics - 1 hàng */}
        <div>
          <EcommerceMetrics />
        </div>

        {/* Biểu đồ Donut (Trạng thái đơn hàng) + Bảng Top 5 món bán chạy - 1 hàng */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 md:gap-6">
          <div className="lg:col-span-3">
            <OrderStatusChart />
          </div>
          <div className="lg:col-span-2">
            <TopSellingProducts />
          </div>
        </div>

        {/* Biểu đồ Monthly Sales - 1 hàng */}
        <div>
          <MonthlySalesChart />
        </div>

        {/* Bảng đơn hàng gần đây - 1 hàng */}
        <div>
          <RecentOrders />
        </div>
      </div>
    </>
  );
}