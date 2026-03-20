import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import productReducer from "../features/product/productSlice";
import categoryReducer from "../features/category/categorySlice";
import importOrderReducer from "../features/importOrder/importOrderSlice";
import supplierReducer from "../features/supplier/supplierSlice";
import roleReducer from "../features/role/roleSlice";
import alertReducer from "../features/alert/alertSlice";
import paymentReducer from "../features/payment/paymentSlice";
import orderReducer from "../features/order/orderSlice";
import posCartReducer from "../features/posCart/posCartSlice";
import discountReducer from "../features/discount/discountSlice";
import reportReducer from "../features/report/reportSlice";
import shiftReducer from "../features/shift/shiftSlice";

export default combineReducers({
auth: authReducer,
user: userReducer,
product: productReducer,
category: categoryReducer,
importOrder: importOrderReducer,
supplier: supplierReducer,
role: roleReducer,
alert: alertReducer,
payment: paymentReducer,
order: orderReducer,
posCart: posCartReducer,
discount: discountReducer,
report: reportReducer,
shift: shiftReducer,
});
