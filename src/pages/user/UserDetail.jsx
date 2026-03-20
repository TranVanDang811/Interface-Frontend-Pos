import {
  Card,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserById } from "@/features/user/userThunks";

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedUser, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [id, dispatch]);

  if (loading || !selectedUser)
    return (
      <div className="p-10 text-center">
        <Typography variant="h6">Loading user data...</Typography>
      </div>
    );

  const isCustomer = selectedUser.roles?.some(
    (r) => r.name === "CUSTOMER"
  );

  return (
    <div className="mt-12 mb-8 flex justify-center px-4">
      <Card className="w-full max-w-4xl shadow-xl rounded-2xl">
        <CardBody className="p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Typography variant="h4" className="font-bold">
                {selectedUser.fullName}
              </Typography>
              <Typography variant="small" className="text-blue-gray-500">
                User ID: {selectedUser.id}
              </Typography>
            </div>

            <Chip
              value={selectedUser.roles?.[0]?.name}
              color="blue"
              className="px-3 py-1 text-sm"
            />
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {!isCustomer && (
              <>
                <InfoItem label="Username" value={selectedUser.username} />
                <InfoItem label="Email" value={selectedUser.email} />
              </>
            )}

            <InfoItem
              label="Status"
              value={
                <Chip
                  value={selectedUser.status}
                  color={
                    selectedUser.status === "active"
                      ? "green"
                      : "blue-gray"
                  }
                  className="w-fit"
                />
              }
            />

            <InfoItem
              label="Created At"
              value={new Date(selectedUser.createdAt).toLocaleString()}
            />

            <InfoItem
              label="Updated At"
              value={new Date(selectedUser.updatedAt).toLocaleString()}
            />

            {isCustomer && (
              <>
                <InfoItem
                  label="Loyalty Points"
                  value={
                    <Chip
                      value={selectedUser.customerProfile?.loyaltyPoints || 0}
                      color="amber"
                      variant="gradient"
                      className="w-fit"
                    />
                  }
                />

                <InfoItem
                  label="Membership Level"
                  value={selectedUser.customerProfile?.membershipLevel || "NONE"}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-10">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>

            <Button
              color="blue"
              onClick={() => navigate(`/users/${selectedUser.id}/edit`)}
            >
              Edit User
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* Reusable Component */
function InfoItem({ label, value }) {
  return (
    <div className="bg-blue-gray-50 p-4 rounded-xl">
      <Typography
        variant="small"
        className="text-blue-gray-500 mb-1"
      >
        {label}
      </Typography>
      <div className="text-sm font-medium text-blue-gray-800">
        {value}
      </div>
    </div>
  );
}