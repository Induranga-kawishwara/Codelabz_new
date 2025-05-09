import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { Link, useLocation } from "react-router-dom";
import validator from "validator";
import Divider from "../../../globalComponents/Divider";
import { clearAuthError, signIn } from "../../../store/actions";
import SmButtons from "../smButton/smButtons";
import ViewAlerts from "./ViewAlerts";
import useStyles from "./styles";
import PropTypes from "prop-types";

const Login = ({
  loginButton = "blue",
  background = "white",
  loginText = "Welcome Back"
}) => {
  const firebase = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [emailValidateError, setEmailValidateError] = useState(false);
  const [emailValidateErrorMessage, setEmailValidateErrorMessage] =
    useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidateError, setPasswordValidateError] = useState(false);
  const [passwordValidateErrorMessage, setPasswordValidateErrorMessage] =
    useState("");

  const errorProp = useSelector(({ auth }) => auth.profile.error);
  const loadingProp = useSelector(({ auth }) => auth.profile.loading);
  const dispatch = useDispatch();
  const location = useLocation();
  const [signupMessage, setSignupMessage] = useState("");

  useEffect(() => {
    // Update signupMessage when the location state changes
    setSignupMessage(location.state?.successMessage || "");
  }, [location.state]);

  useEffect(() => setError(errorProp), [errorProp]);
  useEffect(() => setLoading(loadingProp), [loadingProp]);

  useEffect(
    () => () => {
      clearAuthError()(dispatch);
    },
    [dispatch]
  );

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = event => event.preventDefault();

  const onChangeEmail = event => setEmail(event.target.value);
  const onChangePassword = event => setPassword(event.target.value);

  const validateEmail = () => {
    if (validator.isEmpty(email)) {
      setEmailValidateError(true);
      setEmailValidateErrorMessage("Please Enter your Email!");
      return false;
    }
    if (!validator.isEmail(email)) {
      setEmailValidateError(true);
      setEmailValidateErrorMessage("Please enter an valid email!");
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (validator.isEmpty(password)) {
      setPasswordValidateError(true);
      setPasswordValidateErrorMessage("Please enter your password!");
      return false;
    }
    return true;
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError("");
    if (validateEmail() & validatePassword()) {
      await signIn({ email: email, password: password })(firebase, dispatch);
    }
  };

  const onFocusEmail = () => {
    setEmailValidateError(false);
    setEmailValidateErrorMessage("");
  };

  const onFocusPassword = () => {
    setPasswordValidateError(false);
    setPasswordValidateErrorMessage("");
  };

  const handleMouseEnter = e => {
    e.target.style.color = "royalblue";
  };
  const handleMouseLeave = e => {
    e.target.style.color = "#03AAFA";
  };

  return (
    <Card
      raised
      className={`${classes.card}   `}
      style={{ background: background }}
      data-testId="login"
    >
      <CardContent>
        <Typography
          variant="h4"
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          {loginText}
        </Typography>
        <ViewAlerts
          error={error}
          email={email}
          successMessage={signupMessage}
        />
        <div>
          <TextField
            error={emailValidateError}
            label="Email"
            autoFocus
            variant="outlined"
            placeholder="mail@codelabz.com"
            value={email}
            onChange={onChangeEmail}
            helperText={emailValidateError ? emailValidateErrorMessage : null}
            fullWidth
            autoComplete="email"
            required
            onFocus={onFocusEmail}
            className="email"
            style={{ marginBottom: "15px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            helperText={
              passwordValidateError ? passwordValidateErrorMessage : null
            }
            className="password"
            error={passwordValidateError}
            fullWidth
            required
            value={password}
            onFocus={onFocusPassword}
            onChange={onChangePassword}
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            style={{ marginBottom: "15px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Grid container alignItems="center" justify="space-between">
            <Grid>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox name="remember" color="primary" />}
                  label="Remember me"
                />
              </FormGroup>
            </Grid>
            <Grid
              style={{ fontFamily: "Arial, sans-serif", fontSize: "1.5vh" }}
            >
              <Link
                data-testId="forgotPassoword"
                to="/forgotpassword"
                className="login-form-forgot"
                style={{ float: "right" }}
              >
                Forgot password
              </Link>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onSubmit}
            disabled={loading}
            data-testId="loginButton"
            className="loginButton"
            style={{
              color: "white",
              borderRadius: "30px",
              margin: "auto",
              padding: "10px"
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </div>
        <Divider>or</Divider>
        <SmButtons />
        <Grid container justify="center" alignItems="center" className="mt-24">
          <Grid item={true} sm={12} className="center">
            New to <span className="brand-font text-bold">CodeLabz</span>?{" "}
            <Link to={"/signup"}>
              <span
                style={{ color: "#03AAFA" }}
                onMouseEnter={e => {
                  handleMouseEnter(e);
                }}
                onMouseLeave={e => {
                  handleMouseLeave(e);
                }}
              >
                Create an account
              </span>
            </Link>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Login.propTypes = {
  loginButton: PropTypes.string,
  background: PropTypes.string,
  loginText: PropTypes.string
};

export default Login;
