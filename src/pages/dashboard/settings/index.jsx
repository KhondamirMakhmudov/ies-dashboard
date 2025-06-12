import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const Index = () => {
  const users = [
    {
      id: 1,
      name: "Ali",
      role: "HR",
      email: "ali@example.com",
      registeredAt: "2024-01-15",
      status: "active",
      avatar: "/images/profile-default.jpg",
      lastLogin: "2025-05-20 14:30",
    },

    {
      id: 2,
      name: "Vali",
      role: "Руководитель",
      email: "vali@example.com",
      registeredAt: "2024-01-15",
      status: "active",
      avatar: "/images/profile-default.jpg",
      lastLogin: "2025-05-20 14:30",
    },

    {
      id: 3,
      name: "G'ani",
      role: "Админ",
      email: "gani@example.com",
      registeredAt: "2024-01-15",
      status: "active",
      avatar: "/images/profile-default.jpg",
      lastLogin: "2025-05-20 14:30",
    },
    // boshqa userlar ham shu formatda qo‘shiladi
  ];
  return (
    <DashboardLayout headerTitle={"Права доступа"}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Права доступа</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border border-gray-300"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">Rol:</span>{" "}
                <span className="text-blue-600">{user.role}</span>
              </p>

              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">
                  Ro'yxatdan o'tgan:
                </span>{" "}
                {user.registeredAt}
              </p>

              <p className="text-sm mb-1">
                <span className="font-medium text-gray-700">
                  Oxirgi kirish:
                </span>{" "}
                {user.lastLogin}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status === "active" ? "Faol" : "Bloklangan"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
