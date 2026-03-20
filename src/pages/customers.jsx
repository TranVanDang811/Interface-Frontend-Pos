import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, searchUsers } from "@/features/user/userThunks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { formatDate } from "@/utils/dateUtils";
import Pagination from "@/utils/Pagination";

export function Customers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");

  const { list, loading, page, totalPages } = useSelector(
    (state) => state.user
  );

  // load lần đầu
  useEffect(() => {
    dispatch(fetchUsers({ page: 1, size: 5, role: "CUSTOMER" }));
  }, [dispatch]);

  // pagination
  const handlePageChange = (newPage) => {
    if (keyword.trim()) {
      dispatch(
        searchUsers({
          keyword: keyword.trim(),
          page: newPage,
          size: 5,
          role: "CUSTOMER",
        })
      );
    } else {
      dispatch(fetchUsers({ page: newPage, size: 5, role: "CUSTOMER" }));
    }
  };

  // search
  const handleSearch = () => {
    const key = keyword.trim();

    if (!key) {
      dispatch(fetchUsers({ page: 1, size: 5, role: "CUSTOMER" }));
      return;
    }

    dispatch(
      searchUsers({
        keyword: key,
        page: 1,
        size: 5,
        role: "CUSTOMER",
      })
    );
  };

  // clear search
  const handleClearSearch = () => {
    setKeyword("");
    dispatch(fetchUsers({ page: 1, size: 5, role: "CUSTOMER" }));
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>

        {/* HEADER */}
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Customers History
          </Typography>

          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search customer..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white
                placeholder:text-white/60
                border border-white/20
                focus:outline-none focus:ring-2 focus:ring-white/40
                transition"
              />

              {keyword && (
                <XMarkIcon
                  onClick={handleClearSearch}
                  className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2
                  cursor-pointer text-white/60 hover:text-red-400 transition"
                />
              )}
            </div>

          </div>
        </CardHeader>

        {/* TABLE */}
        <CardBody className="px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-6 text-center">
              <Typography>Loading...</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      "Customer",
                      "Role",
                      "Status",
                      "Points",
                      "Membership",
                      "Created",
                      "Updated",
                      "",
                    ].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {list
                    ?.filter((user) =>
                      user.roles?.some((role) => role.name === "CUSTOMER")
                    )
                    .map((user, key) => {
                      const className = `py-3 px-5 ${
                        key === list.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={user.id}>
                          <td className={className}>
                            <div>
                              <p className="text-sm font-semibold text-blue-gray-700">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-blue-gray-500">
                                {user.phone}
                              </p>
                            </div>
                          </td>

                          <td className={className}>
                            <p className="text-xs font-semibold text-blue-gray-600">
                              CUSTOMER
                            </p>
                          </td>

                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                user.status === "active"
                                  ? "green"
                                  : "blue-gray"
                              }
                              value={user.status}
                              className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              value={
                                user.customerProfile?.loyaltyPoints || 0
                              }
                              color="amber"
                              variant="gradient"
                              className="py-0.5 px-3 text-xs font-bold w-fit"
                            />
                          </td>

                          <td className={className}>
                            <p className="text-xs text-blue-gray-600">
                              {user.customerProfile?.membershipLevel}
                            </p>
                          </td>

                          <td className={className}>
                            <p className="text-xs text-blue-gray-600">
                              {formatDate(user.createdAt)}
                            </p>
                          </td>

                          <td className={className}>
                            <p className="text-xs text-blue-gray-600">
                              {formatDate(user.updatedAt)}
                            </p>
                          </td>

                          <td className={className}>
                            <p
                              onClick={() =>
                                navigate(`/dashboard/customers-history/${user.id}`)
                              }
                              className="text-xs font-semibold text-blue-gray-600 cursor-pointer hover:text-blue-800"
                            >
                              View
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

               {/* ================= Pagination ================= */}
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Customers;