import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Alert 
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setEmployee } from "../store/employeeAuthSlice";
import { useStartEmployeeSessionMutation, useLazyGetEmployeeMeQuery } from "../services/employeeAuthApi";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [startSession, { isLoading }] = useStartEmployeeSessionMutation();
  const [getMe] = useLazyGetEmployeeMeQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await startSession({ email, password }).unwrap();
      const me = await getMe().unwrap();
      dispatch(setEmployee(me));
      const redirectTo = sessionStorage.getItem("employeeRedirectPath") || "/employee/dashboard";
      sessionStorage.removeItem("employeeRedirectPath");
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const status = err?.status;
      if (status === 401) setErrorMsg("Invalid email/password or inactive employee.");
      else if (status === 403) setErrorMsg("Forbidden. Missing CSRF token or insufficient permissions.");
      else setErrorMsg("Login failed. Check server connection and try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url("https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/main.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ border: "1px solid #333" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              color="secondary"
              sx={{ mb: 2, textAlign: "center", textShadow: "0px 0px 12px #00e5ff" }}
            >
              Employee Portal
            </Typography>

            <Typography sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
              Authorized staff access only
            </Typography>

            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button type="submit" variant="contained" size="large" disabled={!email || !password || isLoading}>
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
