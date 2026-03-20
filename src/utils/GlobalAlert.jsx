import { Alert } from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { hideAlert } from "@/features/alert/alertSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function GlobalAlert() {
  const dispatch = useDispatch();
  const { open, message, type } = useSelector((state) => state.alert);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] w-96 shadow-lg">
      <Alert
        color={type}
        icon={<InformationCircleIcon className="h-6 w-6" />}
        onClose={() => dispatch(hideAlert())}
      >
        {message}
      </Alert>
    </div>
  );
}