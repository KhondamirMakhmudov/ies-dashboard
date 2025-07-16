import AccessCustomTimeline from "@/components/charts/AccessTimeLineSchedule";
import { timeLineDummy } from "@/dummy-datas/timeline";

const Index = () => {
  return (
    <div>
      <AccessCustomTimeline schedule={timeLineDummy[0]} />
    </div>
  );
};
export default Index;
