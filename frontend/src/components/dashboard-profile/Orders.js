import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import DoneIcon from "@mui/icons-material/Done";
import { Component } from "react";
import { withCookies } from "react-cookie";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PasswordIcon from "@mui/icons-material/Password";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import PublicIcon from "@mui/icons-material/Public";
function preventDefault(event) {
  event.preventDefault();
}

class Orders extends Component {
  constructor(props) {
    super(props);

    const token = props.cookies.get("user-token");
    const access = props.cookies.get("access");

    if (token && access !== "1") {
      window.location.href = `${process.env.PUBLIC_URL}/access`;
    } else if (!token) {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }

    this.state = {
      user: {
        type: null,
        name: null,
        email: null,
        country: null,
      },
      token: token,
      access: access,
    };
  }

  handleClick = () => {};

  componentDidMount() {
    if (this.state.token) {
      fetch("https://api.flaplet.org/solarflare/user-info/get_info", {
        method: "Get",
        headers: {
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((resp) => resp.json())
        .then((res) => this.setState({ user: res.data }))
        .catch();
    } else {
      window.location.href = "login";
    }
  }

  render() {
    if (this.state.access !== "1" || !this.state.token) {
      return null; // or a spinner/message if you want
    }
    return (
      <React.Fragment>
        <h2 className={"h2"}>Profile</h2>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Stack className={"avatar"} direction="row" spacing={1}>
              <Avatar sx={{ width: 100, height: 100 }} />
            </Stack>
            <Stack className={"space"} direction="row" spacing={1}>
              <Chip
                className="mainchip"
                onClick={this.handleClick}
                icon={<BadgeIcon />}
                label={"Name: " + this.state.user.name}
              />
              {this.state.user.type == "school" ? (
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  icon={<DoneIcon />}
                  label="Type: School"
                />
              ) : this.state.user.type == "organization" ? (
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  icon={<DoneIcon />}
                  label="Type: Organization"
                />
              ) : (
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  icon={<DoneIcon />}
                  label="Type: Personal"
                />
              )}
              <Chip
                className="mainchip"
                onClick={this.handleClick}
                icon={<EmailIcon />}
                label={"Email: " + this.state.user.email}
              />

              {this.state.user.country == "unitedstates" ? (
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  icon={<PublicIcon />}
                  label="Country: United States"
                />
              ) : (
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  icon={<PublicIcon />}
                  label="Country: Canada"
                />
              )}
            </Stack>
            <Stack
              sx={{ pt: 5 }}
              className={"space"}
              direction="row"
              spacing={5}
            >
              <Button
                size="small"
                variant="contained"
                startIcon={<ManageAccountsIcon />}
                color="secondary"
                onClick={(event) => {
                  window.location.href = "/edit-profile";
                }}
              >
                Edit Profile Info
              </Button>
              <Button
                disabled
                size="small"
                variant="contained"
                startIcon={<PasswordIcon />}
                color="error"
                onClick={(event) => {}}
              >
                Change Password
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}
export default withCookies(Orders);
