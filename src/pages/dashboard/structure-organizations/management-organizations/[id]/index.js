import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { get } from "lodash";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: organisation } = useGetPythonQuery({
    key: KEYS.organisation,
    url: `${URLS.organizationalUnits}${id}`,
    params: { is_root: true, limit: 150 },
    enabled: !!id,
  });
  return (
    <DashboardLayout
      headerTitle={`${get(organisation, "data.name")}`}
    ></DashboardLayout>
  );
};

export default Index;
