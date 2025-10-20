import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import usePostQuery from "@/hooks/java/usePostQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const Index = () => {
  // const {
  //   data: jobTrips,
  //   isLoading,
  //   isFetching,
  // } = useGetQuery({
  //   key: KEYS.jobTrips,
  //   url: URLS.jobTrips,
  // });

  // const { mutate: createJobTrip } = usePostQuery({
  //   listKeyId: "create-job-trip",
  // });

  // const submitCreateJobTrip = () => {
  //   createJobTrip({
  //     url: URLS.jobTrips,
  //     attributes: {
  //       employeeUuids: ["550e8400-e29b-41d4-a716-446655440000"],
  //       numOrder: "Приказ №123/2025",
  //       startDate: "2025-10-15",
  //       endDate: "2025-10-30",
  //       entryPointScheduleId: 15,
  //     },
  //   });
  // };
  return <DashboardLayout headerTitle={"Командировки"}></DashboardLayout>;
};

export default Index;
