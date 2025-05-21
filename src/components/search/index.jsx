import { useState } from "react";
import { InputBase, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchInput({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <Paper
      component="form"
      sx={{
        boxShadow: "none",
        marginRight: "20px",
        borderRadius: "8px",
        fontFamily: "DM Sans, sans-serif",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="flex items-center w-full max-w-md p-1 border border-gray-300 rounded-md shadow-sm"
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Qidirish..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputProps={{ "aria-label": "qidirish" }}
      />
      <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

export default SearchInput;
