import { Box, Chip, Container, Typography, Card, CardContent, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function EmployeeDashboard() {
  const { employee } = useSelector((s: RootState) => s.employeeAuth);

  if (!employee) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5">Not authenticated.</Typography>
      </Container>
    );
  }

  const isAdmin = employee.roles.includes("ROLE_ADMIN");

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "primary.main" }}>
        Employee Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ border: "1px solid #333" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>

              <Typography>Email: {employee.email}</Typography>
              <Typography>Employee ID: {employee.employeeId}</Typography>
              <Typography>Status: {employee.isActive ? "Active" : "Inactive"}</Typography>

              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                {employee.roles.map((r) => (
                  <Chip key={r} label={r.replace("ROLE_", "")} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ border: "1px solid #333" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin Actions
                </Typography>
                <Typography color="text.secondary">
                  Manage employees, rooms, and reservations.
                </Typography>
                {/* Buttons go here later */}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
