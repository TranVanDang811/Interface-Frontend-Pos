import {
Card,
CardHeader,
CardBody,
Typography,
Chip,
Button,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { changeUserStatus, deleteUser, fetchUsers, searchUsers } from "@/features/user/userThunks";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Pagination from "@/utils/Pagination";

export function Users() {
const dispatch = useDispatch();
const navigate = useNavigate();
const { user } = useSelector((state) => state.auth);
const [keyword, setKeyword] = useState("");
const isAdminOrManager =
user?.roles?.some((role) => role.name === "ADMIN");
const { list, loading, page, totalPages } = useSelector(
(state) => state.user
);

// load lần đầu
useEffect(() => {
  dispatch(fetchUsers({
    page: 1,
    size: 5,
    roles: ["EMPLOYEE", "MANAGER"]
  }));
}, [dispatch]);

// pagination
const handlePageChange = (newPage) => {
if (keyword.trim()) {
dispatch(
searchUsers({
keyword: keyword.trim(),
page: newPage,
size: 5,
role: "EMPLOYEE",
})
);
} else {
dispatch(fetchUsers({ page: newPage, size: 5, roles: ["EMPLOYEE", "MANAGER"] }));
}
};

// search
const handleSearch = () => {
const key = keyword.trim();

if (!key) {
dispatch(fetchUsers({ page: 1, size: 5,  roles: ["EMPLOYEE", "MANAGER"] }));
return;
}

dispatch(
searchUsers({
keyword: key,
page: 1,
size: 5,
})
);
};

// clear search
const handleClearSearch = () => {
setKeyword("");
dispatch(fetchUsers({ page: 1, size: 5,  roles: ["EMPLOYEE", "MANAGER"] }));
};
const handleDeleteUser = (id) => {
if (!window.confirm("Are you sure you want to delete this user?")) return;

dispatch(deleteUser(id));
};

const handleChangeStatus = (id, currentStatus) => {
  const newStatus = currentStatus === "active" ? "INACTIVE" : "ACTIVE";

if (!window.confirm(`Change status to ${newStatus}?`)) return;

dispatch(changeUserStatus({ id, status: newStatus }));
console.log("current:", currentStatus);
};
return (
<div className="mt-12 mb-8 flex flex-col gap-12">
    <Card>
        {/* HEADER */}
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
            <Typography variant="h6" color="white">
                Staff Management
            </Typography>

            <div className="flex items-center gap-4">

                {/* SEARCH */}
                <div className="relative w-72">
                    <input type="text" placeholder="Search username..." value={keyword} onChange={(e)=>
                    setKeyword(e.target.value)}
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
                    <XMarkIcon onClick={handleClearSearch}
                        className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2
                  cursor-pointer text-white/60 hover:text-red-400 transition" />
                    )}
                </div>

                {isAdminOrManager && (
                <Button size="sm" color="green" onClick={()=> navigate("/dashboard/users/create")}
                    >
                    + Add User
                </Button>
                )}
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
                            {["Username", "Role", "Status", "Created At", ""].map(
                            (el) => (
                            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                <Typography variant="small"
                                    className="text-[11px] font-bold uppercase text-blue-gray-400">
                                    {el}
                                </Typography>
                            </th>
                            )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {list
                        ?.filter((user) => user.roles?.[0]?.name !== "CUSTOMER")
                        .map((user, key) => {
                        const className = `py-3 px-5 ${
                        key === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                        return (
                        <tr key={user.id}>
                            <td className={className}>
                                <p className="text-sm font-semibold text-blue-gray-700">
                                    {user.username}
                                </p>
                            </td>

                            <td className={className}>
                                <p className="text-xs font-semibold text-blue-gray-600">
                                    {user.roles?.[0]?.name}
                                </p>
                            </td>

                            <td className={className}>
                                <Chip variant="gradient" color={user.status === "active" ? "green" : "blue-gray" }
                                    value={user.status === "active" ? "Active" : "Inactive"}
                                    className="py-0.5 px-2 text-[11px] font-medium w-fit cursor-pointer" onClick={()=>
                                    handleChangeStatus(user.id, user.status)}
                                    />
                            </td>

                            <td className={className}>
                                <p className="text-xs text-blue-gray-600">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </td>

                            <td className={className}>
                                <div className="flex gap-3">

                                    <p onClick={()=> navigate(`/dashboard/users/${user.id}`)}
                                        className="text-xs font-semibold text-blue-gray-600 cursor-pointer hover:text-blue-800"
                                        >
                                        View
                                    </p>

                                    {isAdminOrManager && (
                                    <TrashIcon onClick={()=> handleDeleteUser(user.id)}
                                        className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                                        />
                                        )}

                                </div>
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

export default Users;
