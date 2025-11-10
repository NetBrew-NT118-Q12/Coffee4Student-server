import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function OrderStatusChart() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#FDB022", "#4ECDC4", "#95E1D3", "#F38181"],
    labels: ["Pending", "Processing", "Completed", "Cancelled"],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total orders",
              fontSize: "12px",
              fontWeight: 400,
              color: "#6B7280",
              formatter: function () {
                return "131";
              },
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            width: 280,
          },
        },
      },
    ],
  };

  const series = [54, 30, 42, 5];
  const statusData = [
    { name: "Pending", value: 54, percentage: 41.2, color: "#FDB022" },
    { name: "Processing", value: 30, percentage: 22.9, color: "#4ECDC4" },
    { name: "Completed", value: 42, percentage: 32.1, color: "#95E1D3" },
    { name: "Cancelled", value: 5, percentage: 3.8, color: "#F38181" },
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Order Status
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xuất báo cáo
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6">
        {/* Legend - Bên trái */}
        <div className="w-full lg:w-auto lg:flex-1 space-y-3">
          {statusData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between lg:justify-start gap-8"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>

        {/* Chart - Bên phải */}
        <div className="flex justify-center lg:justify-end">
          <Chart options={options} series={series} type="donut" width={300} />
        </div>
      </div>
    </div>
  );
}
