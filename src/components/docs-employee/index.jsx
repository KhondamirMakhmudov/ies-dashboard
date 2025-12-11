import { useState, useEffect } from "react";

const DocsOfEmployee = ({ employeeId }) => {
  const [params, setParams] = useState({
    owner_id: employeeId, // prop orqali kelgan id
    is_active: true,
    limit: 10,
    offset: 0,
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);

      const query = new URLSearchParams(params).toString();

      const response = await fetch(
        `http://10.20.6.60:8088/file-service/?${query}`
      );

      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!params.owner_id) return;
    fetchData();
  }, [params]); // state o'zgarsa – fetch bo'ladi

  return (
    <div>
      {loading && <p>Loading...</p>}

      <button
        className="px-3 py-1 bg-blue-500 text-white rounded"
        onClick={() =>
          setParams((prev) => ({ ...prev, offset: prev.offset + 10 }))
        }
      >
        Load More
      </button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DocsOfEmployee;
