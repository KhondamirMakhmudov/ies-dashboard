import { Typography } from "@mui/material";
import CountUp from "react-countup";

const StatisticCard = ({ title, quantity, bgColor, icon }) => {
  return (
    <div className={`bg-white flex items-center justify-between  col-span-3`}>
      <div className="">
        <Typography>{title}</Typography>
        <Typography variant="h4">
          <CountUp end={quantity} />
        </Typography>
      </div>

      <div
        className={`${bgColor} w-[60px] h-[60px] rounded-full flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatisticCard;
