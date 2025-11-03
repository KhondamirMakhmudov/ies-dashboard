import { Button } from "@mui/material";

const PrimaryButton = ({
  children,
  onClick,
  variant,
  backgroundColor = "#4182F9",
  color = "white",
  type,
  disabled,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        textTransform: "initial",
        fontFamily: "DM Sans, sans-serif",
        backgroundColor: backgroundColor,
        boxShadow: "none",
        color: color,
        display: "flex",
        gap: "4px",
        fontSize: "14px",
        borderRadius: "8px",
        paddingY: "8px",
        paddingX: "20px",
      }}
      variant={variant}
      type={type}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
