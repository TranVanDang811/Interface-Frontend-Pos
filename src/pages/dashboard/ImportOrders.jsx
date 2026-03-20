import {
Card,
CardHeader,
CardBody,
Typography,
Button,
Chip,
} from "@material-tailwind/react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, Fragment } from "react";
import {
fetchImportOrders,
confirmImportOrder,
deleteImportOrder,
fetchImportOrderDetails,
updateReceivedQuantity,
} from "@/features/importOrder/importOrderThunks";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/dateUtils";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";

export function ImportOrders() {
const dispatch = useDispatch();
const navigate = useNavigate();

const [expandedOrderId, setExpandedOrderId] = useState(null);

const { list, loading, page, totalPages, details } = useSelector(
(state) => state.importOrder
);
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [supplierName, setSupplierName] = useState("");
const suppliers = useSelector((state) => state.supplier.list);
const [status, setStatus] = useState("");
useEffect(() => {
  dispatch(
    fetchImportOrders({
      page: 1,
      size: 5,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      supplierName: supplierName || undefined,
      status: status || undefined,
    })
  );
}, [dispatch, fromDate, toDate, supplierName, status]);
useEffect(() => {
  dispatch(fetchSuppliers());
}, [dispatch]);
const handlePageChange = (newPage) => {
  dispatch(
    fetchImportOrders({
      page: newPage + 1,
      size: 5,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      supplierName: supplierName || undefined,
      status: status || undefined,
    })
  );
};

const handleConfirm = (id) => {
if (window.confirm("Xác nhận nhập kho?")) {
dispatch(confirmImportOrder(id));
}
};

const handleDelete = (id) => {
if (window.confirm("Xóa phiếu nhập này?")) {
dispatch(deleteImportOrder(id));
}
};

const handleExpand = (id) => {
if (expandedOrderId === id) {
setExpandedOrderId(null);
return;
}

setExpandedOrderId(id);

if (!details[id]) {
dispatch(fetchImportOrderDetails({ orderId: id }));
}
};

return (
<div className="mt-12 mb-8 flex flex-col gap-6">
    <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex items-center justify-between">
            <Typography variant="h6" color="white">
                Import Orders
            </Typography>

            <Button size="sm" color="green" onClick={()=>
                navigate("/dashboard/import-orders/create")
                }
                >
                + Create Import Order
            </Button>
        </CardHeader>
<div className="flex items-end gap-3 px-6 pb-4 flex-wrap">

  <div className="flex flex-col">
    <Typography variant="small" className="mb-1 text-blue-gray-600">
      From
    </Typography>
    <input
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="border rounded px-2 py-1 text-sm h-9"
    />
  </div>

  <div className="flex flex-col">
    <Typography variant="small" className="mb-1 text-blue-gray-600">
      To
    </Typography>
    <input
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      className="border rounded px-2 py-1 text-sm h-9"
    />
  </div>
<div className="flex flex-col">
  <Typography variant="small" className="mb-1 text-blue-gray-600">
    Supplier
  </Typography>

  <select
    value={supplierName}
    onChange={(e) => setSupplierName(e.target.value)}
    className="border rounded px-2 py-1 text-sm h-9"
  >
    <option value="">All Suppliers</option>

    {suppliers?.map((s) => (
      <option key={s.name} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>
</div>
<div className="flex flex-col">
  <Typography variant="small" className="mb-1 text-blue-gray-600">
    Status
  </Typography>

  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="border rounded px-2 py-1 text-sm h-9"
  >
    <option value="">All Status</option>
    <option value="DRAFT">Draft</option>
    <option value="IMPORTED">Imported</option>
  </select>
</div>
 <Button
  size="sm"
  color="blue"
  className="h-9 px-4"
  onClick={() =>
    dispatch(
      fetchImportOrders({
        page: 1,
        size: 5,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        supplierName: supplierName || undefined,
        status: status || undefined,
      })
    )
  }
>
  Filter
</Button>

<Button
  size="sm"
  variant="outlined"
  className="h-9 px-4"
  onClick={() => {
    setFromDate("");
    setToDate("");
    setSupplierName("");
    setStatus("");

    dispatch(fetchImportOrders({ page: 1, size: 5 }));
  }}
>
  Clear
</Button>

</div>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
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
                            "Code",
                            "Supplier",
                            "Total",
                            "Created Date",
                            "Status",
                            "Action",
                            ].map((el) => (
                            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                <Typography variant="small"
                                    className="text-[11px] font-bold uppercase text-blue-gray-400">
                                    {el}
                                </Typography>
                            </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {list?.map((order, index) => {
                        const className = `py-3 px-5 ${
                        index === list.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                        }`;

                        const orderDetail = details[order.id];
                        const isImported =
                        order.status === "IMPORTED";

                        return (
                        <Fragment key={order.id}>
                            {/* MAIN ROW */}
                            <tr>
                                <td className={className}>
                                    <Typography as="button" onClick={()=>
                                        handleExpand(order.id)
                                        }
                                        className="text-xs font-semibold text-blue-600 hover:underline"
                                        >
                                        {order.id}
                                    </Typography>
                                </td>

                                <td className={className}>
                                    <Typography className="text-xs text-blue-gray-600">
                                        {order.supplierName}
                                    </Typography>
                                </td>

                                <td className={className}>
                                    <Typography className="text-xs font-semibold text-green-600">
                                        {order.totalQuantity?.toLocaleString()}
                                    </Typography>
                                </td>

                                <td className={className}>
                                    <Typography className="text-xs text-blue-gray-500">
                                        {formatDate(order.importDate)}
                                    </Typography>
                                </td>

                                <td className={className}>
                                    <Chip value={order.status} color={ order.status === "draft" ? "orange" : "green"
                                        } className="w-fit text-xs" />
                                </td>

                                <td className={className}>
                                    <div className="flex items-center justify-center">
                                        {!isImported && (
                                        <Button size="sm" onClick={()=> handleConfirm(order.id)}
                                            disabled={order.confirmStatus === "CONFIRMED"}
                                            className={`
                                            flex items-center gap-2 px-4 py-1.5 font-medium transition-all duration-200
                                            ${
                                            order.confirmStatus === "UNCONFIRMED"
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : order.confirmStatus === "CONFIRMED"
                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }
                                            `}
                                            >
                                            {order.confirmStatus === "UNCONFIRMED" && "Xác nhận"}
                                            {order.confirmStatus === "CONFIRMED" && "Đã xác nhận"}
                                        </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>

                            {/* DETAIL ROW */}
                            {expandedOrderId === order.id && (
                            <tr>
                                <td colSpan={6} className="bg-blue-gray-50 px-6 py-4">
                                    {!orderDetail ? (
                                    <Typography>
                                        Loading details...
                                    </Typography>
                                    ) : (
                                    <DetailTable orderId={order.id} detailPage={orderDetail} isImported={isImported} />
                                    )}
                                </td>
                            </tr>
                            )}
                        </Fragment>
                        );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-2 mt-6 px-5">
                    <Button size="sm" variant="outlined" disabled={page===0} onClick={()=>
                        handlePageChange(page - 1)
                        }
                        >
                        Prev
                    </Button>

                    {[...Array(totalPages).keys()].map((p) => (
                    <Button key={p} size="sm" variant={ p===page ? "filled" : "outlined" } onClick={()=>
                        handlePageChange(p)
                        }
                        >
                        {p + 1}
                    </Button>
                    ))}

                    <Button size="sm" variant="outlined" disabled={page + 1>= totalPages}
                        onClick={() =>
                        handlePageChange(page + 1)
                        }
                        >
                        Next
                    </Button>
                </div>
            </>
            )}
        </CardBody>
    </Card>
</div>
);
}

export default ImportOrders;
function DetailTable({ orderId, detailPage, isImported }) {
const dispatch = useDispatch();
const [editValues, setEditValues] = useState({});

const handleChange = (detailId, value) => {
setEditValues((prev) => ({
...prev,
[detailId]: value,
}));
};

const handleSave = (item) => {
const newValue = Number(editValues[item.id]);

if (
isNaN(newValue) ||
newValue < 0 || newValue> item.quantity
    ) {
    return;
    }

    if (newValue === item.receivedQuantity) return;

    dispatch(
    updateReceivedQuantity({
    orderId,
    detailId: item.id,
    receivedQuantity: newValue,
    })
    );

    // clear input cache
    setEditValues((prev) => {
    const copy = { ...prev };
    delete copy[item.id];
    return copy;
    });
    };

    const handleDetailPageChange = (newPage) => {
    dispatch(
    fetchImportOrderDetails({
    orderId,
    page: newPage + 1,
    })
    );
    };

    return (
    <>
        <table className="w-full table-auto border rounded">
            <thead>
                <tr className="bg-blue-gray-100">
                    <th className="p-2 text-xs text-left">Product</th>
                    <th className="p-2 text-xs text-left">Import Price</th>
                    <th className="p-2 text-xs text-left">Ordered</th>
                    <th className="p-2 text-xs text-left">Received</th>
                    <th className="p-2 text-xs text-left">Total</th>
                </tr>
            </thead>

            <tbody>
                {detailPage.content.map((item) => (
                <tr key={item.id} className="border-t">
                    <td className="p-2 text-xs">
                        {item.productName}
                    </td>

                    <td className="p-2 text-xs text-green-600">
                        {item.importPrice?.toLocaleString()}
                    </td>

                    <td className="p-2 text-xs">
                        {item.quantity}
                    </td>

                    <td className="p-2 text-xs">
                        <input type="number" min="0" max={item.quantity} disabled={isImported} value={
                            editValues[item.id] ?? item.receivedQuantity ?? 0 } onChange={(e)=>
                        handleChange(
                        item.id,
                        e.target.value
                        )
                        }
                        onBlur={() => handleSave(item)}
                        className="border rounded px-2 py-1 w-20 text-xs"
                        />
                    </td>

                    <td className="p-2 text-xs font-semibold">
                        {item.totalAmount?.toLocaleString()}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>

        <div className="flex gap-2 mt-3">
            {[...Array(detailPage.totalPages).keys()].map((p) => (
            <Button key={p} size="sm" variant={ p===detailPage.number ? "filled" : "outlined" } onClick={()=>
                handleDetailPageChange(p)
                }
                >
                {p + 1}
            </Button>
            ))}
        </div>
    </>
    );
    }
