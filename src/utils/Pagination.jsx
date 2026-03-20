import { Button } from "@material-tailwind/react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 mt-6 px-5">
      <Button
        size="sm"
        variant="outlined"
        disabled={page === 0}
        onClick={() => onPageChange(page)}
      >
        Prev
      </Button>

      {[...Array(totalPages).keys()].map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "filled" : "outlined"}
          onClick={() => onPageChange(p + 1)}
        >
          {p + 1}
        </Button>
      ))}

      <Button
        size="sm"
        variant="outlined"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 2)}
      >
        Next
      </Button>
    </div>
  );
}