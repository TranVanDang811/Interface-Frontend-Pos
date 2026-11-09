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
  cancelImportOrder,
  deleteImportOrder,
  fetchImportOrderDetails,
  updateReceivedQuantity,
} from "@/features/importOrder/importOrderThunks";
import importOrderAPI from "@/features/importOrder/importOrderAPI";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/dateUtils";
import { fetchSuppliers } from "@/features/supplier/supplierThunks";

export function ImportOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailLoading, setDetailLoading] = useState({});
  const { list, loading, page, totalPages, details } = useSelector(
    (state) => state.importOrder
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const suppliers = useSelector((state) => state.supplier.list);
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

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
        page: newPage,
        size: 5,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        supplierName: supplierName || undefined,
        status: status || undefined,
      })
    );
  };

  const handleConfirm = (order) => {
    const isOverdue = order.overdue;
    const totalReceived = order.totalReceivedQuantity || 0;

    if (isOverdue && totalReceived === 0) {
      if (
        window.confirm(
          `Đơn hàng này đã quá 3 ngày từ ngày đặt (đã qua ${order.daysSinceOrder} ngày).\n` +
          `Nhà cung cấp không giao hàng (SL nhận = 0).\n\n` +
          `Theo quy định, hệ thống sẽ xác nhận hoàn tất đơn với số lượng nhập kho = 0.\n` +
          `Bạn có chắc chắn muốn xác nhận chốt đơn không?`
        )
      ) {
        dispatch(confirmImportOrder(order.id));
      }
      return;
    }

    if (isOverdue && totalReceived < order.totalQuantity) {
      if (
        window.confirm(
          `Đơn hàng này đã quá 3 ngày (đã qua ${order.daysSinceOrder} ngày) và chỉ nhận được một phần (${totalReceived}/${order.totalQuantity}).\n\n` +
          `Theo quy định, phần thiếu coi như NCC không giao. Hệ thống sẽ nhập ${totalReceived} sản phẩm vào kho và chốt hoàn thành đơn.\n` +
          `Bạn có chắc chắn muốn xác nhận?`
        )
      ) {
        dispatch(confirmImportOrder(order.id));
      }
      return;
    }

    if (window.confirm("Xác nhận nhập số lượng thực nhận vào kho và cập nhật tồn kho/giá vốn?")) {
      dispatch(confirmImportOrder(order.id));
    }
  };

  const handleCancel = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy phiếu nhập hàng này không?")) {
      dispatch(cancelImportOrder(id));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hẳn phiếu nháp này khỏi hệ thống?")) {
      dispatch(deleteImportOrder(id));
    }
  };

  const handleExpand = async (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(id);

    if (!details[id] && !detailLoading[id]) {
      setDetailLoading((prev) => ({ ...prev, [id]: true }));
      await dispatch(fetchImportOrderDetails({ orderId: id }));
      setDetailLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const res = await importOrderAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `import-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("Xuất file Excel thất bại: " + (e.message || "Lỗi máy chủ"));
    } finally {
      setExporting(false);
    }
  };

  const getStatusChip = (orderStatus) => {
    const s = (orderStatus || "").toUpperCase();
    switch (s) {
      case "DRAFT":
        return <Chip value="Bản nháp" color="amber" className="w-fit text-xs font-medium" />;
      case "RECEIVING":
        return <Chip value="Đang nhận" color="blue" className="w-fit text-xs font-medium" />;
      case "PARTIALLY_IMPORTED":
        return <Chip value="Nhập 1 phần" color="orange" className="w-fit text-xs font-medium" />;
      case "IMPORTED":
        return <Chip value="Đã nhập kho" color="green" className="w-fit text-xs font-medium" />;
      case "CANCELLED":
        return <Chip value="Đã hủy" color="red" className="w-fit text-xs font-medium" />;
      default:
        return <Chip value={orderStatus} color="gray" className="w-fit text-xs font-medium" />;
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography variant="h6" color="white">
              Quản Lý Nhập Hàng (Import Orders)
            </Typography>
            <Typography variant="small" color="white" className="opacity-80">
              Theo dõi quy trình nhập kho từ nhà cung cấp, kiểm đếm và cập nhật giá vốn
            </Typography>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              color="white"
              onClick={handleExportExcel}
              disabled={exporting}
            >
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </Button>
            <Button
              size="sm"
              color="green"
              onClick={() => navigate("/dashboard/import-orders/create")}
            >
              + Tạo phiếu nhập hàng
            </Button>
          </div>
        </CardHeader>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="flex items-end gap-3 px-6 pb-4 flex-wrap">
          <div className="flex flex-col">
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-medium">
              Từ ngày
            </Typography>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm h-9 focus:outline-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-medium">
              Đến ngày
            </Typography>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm h-9 focus:outline-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-medium">
              Nhà cung cấp
            </Typography>
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="border rounded px-2 py-1 text-sm h-9 min-w-[160px] focus:outline-blue-500"
            >
              <option value="">Tất cả nhà cung cấp</option>
              {suppliers?.map((s) => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <Typography variant="small" className="mb-1 text-blue-gray-600 font-medium">
              Trạng thái
            </Typography>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm h-9 min-w-[150px] focus:outline-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">Bản nháp (Draft)</option>
              <option value="RECEIVING">Đang nhận hàng</option>
              <option value="PARTIALLY_IMPORTED">Nhập một phần</option>
              <option value="IMPORTED">Đã nhập kho</option>
              <option value="CANCELLED">Đã hủy</option>
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
            Lọc
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
            Làm mới
          </Button>
        </div>

        {/* BẢNG DANH SÁCH */}
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Typography>Đang tải danh sách đơn nhập...</Typography>
            </div>
          ) : list?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Typography>Không có đơn nhập hàng nào phù hợp với bộ lọc.</Typography>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[700px] table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    {["Mã đơn", "Nhà cung cấp", "SL Đặt / Đã nhận", "Tổng tiền (VNĐ)", "Ngày tạo", "Trạng thái", "Thao tác"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-500">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {list?.map((order, index) => {
                    const className = `py-3 px-5 ${index === list.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                    const orderDetail = details[order.id];
                    const rawStatus = (order.status || "").toUpperCase();
                    const isImported = rawStatus === "IMPORTED";
                    const isCancelled = rawStatus === "CANCELLED";

                    return (
                      <Fragment key={order.id}>
                        {/* MAIN ROW */}
                        <tr className="hover:bg-gray-50/60 transition">
                          <td className={className}>
                            <button
                              onClick={() => handleExpand(order.id)}
                              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                              title="Bấm để xem chi tiết sản phẩm"
                            >
                              <span>{expandedOrderId === order.id ? "▼" : "▶"}</span>
                              <span>{order.id.substring(0, 8)}...</span>
                            </button>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs font-medium text-gray-800">
                              {order.supplierName}
                            </Typography>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs font-semibold text-gray-700">
                              {order.totalQuantity} / <span className="text-blue-600">{order.totalReceivedQuantity || 0}</span>
                            </Typography>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs font-semibold text-green-600">
                              {order.totalPrice?.toLocaleString()} đ
                            </Typography>
                          </td>

                          <td className={className}>
                            <Typography className="text-xs text-blue-gray-500">
                              {formatDate(order.importDate)}
                            </Typography>
                            {order.overdue && !isImported && !isCancelled && (
                              <span
                                className="inline-block mt-0.5 text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded"
                                title={`Đơn hàng đã quá hạn 3 ngày (${order.daysSinceOrder} ngày kể từ ngày đặt)`}
                              >
                                Quá hạn {order.daysSinceOrder} ngày
                              </span>
                            )}
                          </td>

                          <td className={className}>
                            <div className="flex flex-col gap-1 items-start">
                              {getStatusChip(order.status)}
                              {order.note && (
                                <Typography
                                  className="text-[10px] text-gray-500 italic max-w-[140px] truncate"
                                  title={order.note}
                                >
                                  {order.note}
                                </Typography>
                              )}
                            </div>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-2">
                              {/* Nút Nhập kho: hiển thị khi chưa hoàn tất và chưa bị hủy */}
                              {!isImported && !isCancelled && (
                                <Button
                                  size="sm"
                                  color={order.overdue && (!order.totalReceivedQuantity || order.totalReceivedQuantity === 0) ? "amber" : "green"}
                                  onClick={() => handleConfirm(order)}
                                  className="px-3 py-1 text-xs"
                                  title={
                                    order.overdue && (!order.totalReceivedQuantity || order.totalReceivedQuantity === 0)
                                      ? "Đơn quá hạn 3 ngày - NCC không giao, chốt số lượng nhận = 0"
                                      : "Xác nhận nhập kho"
                                  }
                                >
                                  {order.overdue && (!order.totalReceivedQuantity || order.totalReceivedQuantity === 0)
                                    ? "Chốt quá hạn"
                                    : "Nhập kho"}
                                </Button>
                              )}

                              {/* Nút Hủy đơn: hiển thị khi DRAFT hoặc RECEIVING */}
                              {!isImported && !isCancelled && rawStatus !== "PARTIALLY_IMPORTED" && (
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  color="red"
                                  onClick={() => handleCancel(order.id)}
                                  className="px-3 py-1 text-xs"
                                >
                                  Hủy
                                </Button>
                              )}

                              {/* Nút Xóa: chỉ cho xóa khi đơn ở dạng DRAFT */}
                              {rawStatus === "DRAFT" && (
                                <Button
                                  size="sm"
                                  variant="text"
                                  color="red"
                                  onClick={() => handleDelete(order.id)}
                                  className="px-2 py-1 text-xs"
                                  title="Xóa hẳn đơn nháp"
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* DETAIL ROW */}
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={7} className="bg-blue-50/40 px-6 py-4 border-b">
                              {detailLoading[order.id] ? (
                                <div className="flex items-center gap-2 py-2 text-sm text-blue-500">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                  Đang tải chi tiết sản phẩm...
                                </div>
                              ) : !orderDetail ? null : (
                                <DetailTable
                                  orderId={order.id}
                                  detailPage={orderDetail}
                                  orderStatus={rawStatus}
                                />
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* PHÂN TRANG */}
              <div className="flex items-center justify-end gap-2 mt-6 px-5">
                <Button
                  size="sm"
                  variant="outlined"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Trước
                </Button>

                {[...Array(totalPages).keys()].map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "filled" : "outlined"}
                    onClick={() => handlePageChange(p)}
                  >
                    {p + 1}
                  </Button>
                ))}

                <Button
                  size="sm"
                  variant="outlined"
                  disabled={page + 1 >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Sau
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

function DetailTable({ orderId, detailPage, orderStatus }) {
  const dispatch = useDispatch();
  const isFinalized = orderStatus === "IMPORTED" || orderStatus === "CANCELLED";

  const [localReceived, setLocalReceived] = useState(() => {
    const map = {};
    detailPage.content.forEach((item) => {
      map[item.id] = item.receivedQuantity ?? 0;
    });
    return map;
  });

  const [editValues, setEditValues] = useState({});
  const [savingIds, setSavingIds] = useState(new Set());

  useEffect(() => {
    const map = {};
    detailPage.content.forEach((item) => {
      map[item.id] = item.receivedQuantity ?? 0;
    });
    setLocalReceived(map);
    setEditValues({});
  }, [orderId, detailPage.number]);

  const handleChange = (detailId, value) => {
    setEditValues((prev) => ({ ...prev, [detailId]: value }));
  };

  const handleSave = async (item) => {
    const rawValue = editValues[item.id];
    if (rawValue === undefined) return;

    const newValue = Number(rawValue);
    if (isNaN(newValue) || newValue < 0 || newValue > item.quantity) return;
    if (newValue === localReceived[item.id]) return;

    setLocalReceived((prev) => ({ ...prev, [item.id]: newValue }));
    setSavingIds((prev) => new Set(prev).add(item.id));

    try {
      await dispatch(
        updateReceivedQuantity({ orderId, detailId: item.id, receivedQuantity: newValue })
      ).unwrap();

      setEditValues((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    } catch (e) {
      setLocalReceived((prev) => ({ ...prev, [item.id]: item.receivedQuantity ?? 0 }));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDetailPageChange = (newPage) => {
    dispatch(fetchImportOrderDetails({ orderId, page: newPage + 1 }));
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-3">
        <Typography variant="small" className="font-bold text-gray-800">
          Danh sách mặt hàng kiểm đếm
        </Typography>
        {!isFinalized && (
          <Typography variant="small" className="text-xs text-blue-600 font-medium">
            * Nhập số lượng thực nhận vào ô và click ra ngoài (hoặc nhấn Enter) để lưu
          </Typography>
        )}
      </div>

      <table className="w-full table-auto border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-2.5 text-xs text-left">Sản phẩm</th>
            <th className="p-2.5 text-xs text-right">Giá nhập</th>
            <th className="p-2.5 text-xs text-center">SL Đặt</th>
            <th className="p-2.5 text-xs text-center">Đã vào kho</th>
            <th className="p-2.5 text-xs text-center">SL Thực nhận</th>
            <th className="p-2.5 text-xs text-right">Thành tiền</th>
          </tr>
        </thead>

        <tbody>
          {detailPage.content.map((item) => {
            const isSaving = savingIds.has(item.id);
            const displayValue = editValues[item.id] ?? localReceived[item.id] ?? 0;

            return (
              <tr key={item.id} className="border-t hover:bg-gray-50/50">
                <td className="p-2.5 text-xs font-medium text-gray-900">{item.productName}</td>

                <td className="p-2.5 text-xs text-right text-gray-700 font-medium">
                  {item.importPrice?.toLocaleString()} đ
                </td>

                <td className="p-2.5 text-xs text-center font-bold text-gray-700">{item.quantity}</td>

                <td className="p-2.5 text-xs text-center font-semibold text-green-700">
                  {item.confirmedQuantity || 0}
                </td>

                <td className="p-2.5 text-xs text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      disabled={isFinalized || isSaving}
                      value={displayValue}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      onBlur={() => handleSave(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave(item);
                      }}
                      className={`border rounded px-2 py-1 w-20 text-xs text-center font-bold transition ${
                        isSaving ? "bg-yellow-50 border-yellow-300" : "border-gray-300"
                      } ${isFinalized ? "bg-gray-100 text-gray-500" : "bg-white text-blue-700"}`}
                    />
                    {isSaving && (
                      <span className="text-xs text-blue-500 animate-spin">⏳</span>
                    )}
                  </div>
                </td>

                <td className="p-2.5 text-xs text-right font-bold text-green-600">
                  {(item.lineTotal || (item.importPrice * item.quantity))?.toLocaleString()} đ
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {detailPage.totalPages > 1 && (
        <div className="flex gap-2 mt-3 justify-end">
          {[...Array(detailPage.totalPages).keys()].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === detailPage.number ? "filled" : "outlined"}
              onClick={() => handleDetailPageChange(p)}
              className="px-2 py-1 text-xs"
            >
              {p + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
