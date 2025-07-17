import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const OrganizationalCard = ({ icon, title }) => {
  return (
    <div className="p-4 col-span-12 border-b border-b-gray-300 bg-white hover:bg-gray-100 transition-all duration-200 cursor-pointer flex justify-between items-center">
      <div className="flex gap-5 items-center">
        {icon}
        <h4 className="text-xl font-semibold">{title}</h4>
      </div>

      <div className="flex">
        <KeyboardArrowDownIcon />
      </div>
    </div>
  );
};

export default OrganizationalCard;
