import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { IconButton } from "@mui/material";
import { categories } from "@/dummy-datas/categories";
import {
  Button,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import SearchInput from "@/components/search";

const backgroundColors = [
  "#2B6CB0", // blue-700
  "#2F855A", // green-700
  "#805AD5", // purple-700
  "#B83280", // pink-700
  "#D69E2E", // yellow-600
  "#C05621", // orange-700
];

const Index = () => {
  const [tab, setTab] = useState("list");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSearch = (query) => {
    console.log("Qidirilmoqda:", query);
  };
  return (
    <DashboardLayout headerTitle={"Kategoriyalar"}>
      <div className="bg-white mx-[160px] p-[12px] my-[50px] rounded-md">
        <div className="grid grid-cols-12 gap-[12px]">
          <div className="col-span-12 flex justify-end items-center gap-2">
            <SearchInput onSearch={handleSearch} />
            <IconButton
              sx={{ background: tab === "list" && "#E5ECF6" }}
              onClick={() => setTab("list")}
            >
              <ChecklistIcon />
            </IconButton>

            <IconButton
              sx={{ background: tab === "card" && "#E5ECF6" }}
              onClick={() => setTab("card")}
            >
              <ViewAgendaIcon />
            </IconButton>
          </div>

          <div className="col-span-12">
            {tab === "list" ? (
              <List sx={{ fontFamily: "DM Sans, sans-serif" }}>
                {categories.map((cat, index) => {
                  const bg = backgroundColors[index % backgroundColors.length];

                  return (
                    <ListItem
                      key={index}
                      sx={{
                        fontFamily: "DM Sans, sans-serif",

                        mb: "10px",
                        display: "flex",
                        gap: "20px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      button
                      selected={selectedIndex === index}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <ListItemIcon
                        sx={{
                          color: "#A0AEC0",
                          backgroundColor: bg,
                          display: "flex",
                          justifyContent: "center",
                          width: "55px",
                          height: "55px",
                          borderRadius: "100%",
                          alignItems: "center",
                          color: "#FFFFFF",
                        }}
                      >
                        {cat.icon}
                      </ListItemIcon>
                      <Typography variant="body1" sx={{ fontSize: "22px" }}>
                        {cat.title}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <div className="grid grid-cols-12 gap-[12px]">
                {categories.map((cat, index) => {
                  const bg = backgroundColors[index % backgroundColors.length];
                  return (
                    <div className="col-span-2" key={index}>
                      <div className="hover:shadow-md transition-all duration-200 border border-gray-300 rounded-md h-[160px] cursor-pointer">
                        <CardContent className="flex flex-col items-center justify-center text-center py-6">
                          <IconButton
                            className="text-4xl text-blue-600 mb-2 flex-1"
                            sx={{
                              color: "#A0AEC0",
                              backgroundColor: bg,
                              display: "flex",
                              justifyContent: "center",
                              width: "60px",
                              height: "60px",
                              borderRadius: "100%",
                              alignItems: "center",
                              color: "#FFFFFF",
                              marginBottom: "20px",
                            }}
                          >
                            {cat.icon}
                          </IconButton>
                          <Typography variant="h6">{cat.title}</Typography>
                        </CardContent>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
