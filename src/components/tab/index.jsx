import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

const EmployeeDetailsTabs = () => {
  const [value, setValue] = useState(0);
  const [gender, setGender] = useState("Мужской");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ boxShadow: "none", background: "white" }}>
      <Box sx={{ bgcolor: "white", borderRadius: 2, p: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Общее" />
          <Tab label="Рабочая информация" />
          <Tab label="Файлы" />
        </Tabs>

        {/* Общее */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата рождения" value="15.02.1897" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Пол" value="Мужской" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Гражданство" value="Узбекистан" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Место рождения" value="Ташкент" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                value="Ташкент, ул. Карасу-1"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Рабочая информация */}
        <TabPanel value={value} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата рождения" value="15.02.1897" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Пол" value="Мужской" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Гражданство" value="Узбекистан" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Место рождения" value="Ташкент" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                value="Ташкент, ул. Карасу-1"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Файлы */}
        <TabPanel value={value} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Дата рождения" value="15.02.1897" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Пол" value="Мужской" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Гражданство" value="Узбекистан" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Место рождения" value="Ташкент" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                value="Ташкент, ул. Карасу-1"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default EmployeeDetailsTabs;
