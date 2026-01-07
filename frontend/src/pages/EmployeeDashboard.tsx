import { Box, Button, Container, Typography, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearEmployee } from "../store/employeeAuthSlice";
import { useLogoutEmployeeMutation } from "../services/employeeAuthApi";
import type { RootState } from "../store/store";

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutEmployee] = useLogoutEmployeeMutation();

  const { employee, isEmployeeAuthenticated } = useSelector(
    (state: RootState) => state.employeeAuth
  );

  // Guard
  if (!isEmployeeAuthenticated || !employee) {
    sessionStorage.setItem("employeeRedirectPath", "/employee/dashboard");
    navigate("/employee/login", { replace: true });
    return null;
  }

  const handleLogout = async () => {
    try {
      await logoutEmployee().unwrap();
    } finally {
      dispatch(clearEmployee());
      navigate("/employee/login", { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "90vh",
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/main.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="md">
        <Card sx={{ border: "1px solid #333" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="secondary"
              sx={{ mb: 2, textShadow: "0px 0px 12px #00e5ff" }}
            >
              Employee Dashboard
            </Typography>

            <Typography sx={{ mb: 1 }}>
              Employee ID: <strong>{employee.employeeId}</strong>
            </Typography>

            <Typography sx={{ mb: 3 }}>
              Role(s): <strong>{employee.roles.join(", ")}</strong>
            </Typography>

            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
