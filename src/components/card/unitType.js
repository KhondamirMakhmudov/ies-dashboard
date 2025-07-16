import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const UnitTypeCard = ({ title, isActive, onClickEdit, onClickDelete }) => {
  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-3 space-y-[20px] col-span-4">
      <div className="flex justify-between">
        <h4 className="text-xl font-semibold">{title}</h4>
        <div className="flex gap-2 items-center">
          <div
            className={`${
              isActive === true ? "bg-[#1FD286]" : "bg-[#F0142F]"
            } w-[10px] h-[10px] rounded-full`}
          ></div>

          <span className={isActive ? "text-green-600" : "text-red-600"}>
            {isActive ? "Активный" : "Неактивный"}
          </span>
        </div>
      </div>

      <div className="flex justify-end items-center gap-2">
        <Button
          onClick={onClickEdit}
          sx={{
            width: "32px",
            height: "32px",
            minWidth: "32px",
            background: "#FFF4C9",
            color: "#FFC700",
          }}
        >
          <EditIcon fontSize="small" />
        </Button>
        <Button
          onClick={onClickDelete}
          sx={{
            width: "32px",
            height: "32px",
            minWidth: "32px",
            background: "#FCD8D3",
            color: "#FF1E00",
          }}
        >
          <DeleteIcon fontSize="small" />
        </Button>
      </div>
    </div>
  );
};

export default UnitTypeCard;
