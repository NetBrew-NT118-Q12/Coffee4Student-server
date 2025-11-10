import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { usersData } from "../assets/data/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const Users = () => {
  const [currentPage, _setCurrentPage] = useState(1);

  return (
    <>
      <PageMeta
        title="Người dùng | Coffee4Student"
        description="Quản lý người dùng"
      />
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Users
          </h1>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
          <div className="max-w-full overflow-x-auto">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    Người dùng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    SĐT
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-center text-theme-sm dark:text-gray-400"
                    children={undefined}
                  ></TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {usersData.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <TableCell className="py-4 font-normal text-gray-900 text-theme-sm dark:text-white/90">
                      {user.name}
                    </TableCell>
                    <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                      {user.phone}
                    </TableCell>
                    <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <button className="px-4 py-1.5 text-sm font-normal text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                        Disable
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full"
            style={{ backgroundColor: "#452302" }}
          >
            {currentPage}
          </button>

          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 rounded-lg">
            2
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Users;
