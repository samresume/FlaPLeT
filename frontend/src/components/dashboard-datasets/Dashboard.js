import React, { Component } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Orders from "./Orders";
import { withCookies } from "react-cookie";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ListItemText from "@mui/material/ListItemText";
import LogoutIcon from "@mui/icons-material/Logout";
import ScienceIcon from "@mui/icons-material/Science";
import AddIcon from "@mui/icons-material/Add";
import DataArrayIcon from "@mui/icons-material/DataArray";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import logo from "../../logo.png";
import { grey, orange, red } from "@mui/material/colors";
import BugReportIcon from "@mui/icons-material/BugReport";
import FeedbackIcon from "@mui/icons-material/Feedback";
import MailIcon from "@mui/icons-material/Mail";
import FolderOpenTwoToneIcon from "@mui/icons-material/FolderOpenTwoTone";
import FolderSpecialTwoToneIcon from "@mui/icons-material/FolderSpecialTwoTone";
import DatasetTwoToneIcon from "@mui/icons-material/DatasetTwoTone";
import LightbulbTwoToneIcon from "@mui/icons-material/LightbulbTwoTone";
import AccountCircleTwoToneIcon from "@mui/icons-material/AccountCircleTwoTone";
import BugReportTwoToneIcon from "@mui/icons-material/BugReportTwoTone";
import FeedbackTwoToneIcon from "@mui/icons-material/FeedbackTwoTone";
import MeetingRoomTwoToneIcon from "@mui/icons-material/MeetingRoomTwoTone";
import MailTwoToneIcon from "@mui/icons-material/MailTwoTone";
import EastIcon from "@mui/icons-material/East";
import { Breadcrumbs } from "@mui/material";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const font = "'Assistant', sans-serif";

const theme = createTheme({
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 12,
    fontFamily: font,
  },
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: orange[400],
    },
  },
});

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const breadcrumbs = [
  <Typography
    sx={{ display: "flex", alignItems: "center" }}
    underline="hover"
    key="1"
    color="inherit"
    href="/dashboard"
  >
    <DashboardTwoToneIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    Dashboard
  </Typography>,
  <Typography
    sx={{ display: "flex", alignItems: "center", color: orange[400] }}
    key="2"
  >
    <FolderOpenTwoToneIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    Datasets
  </Typography>,
];

class DatasetDashboard extends Component {
  state = {
    open: true,
    token: this.props.cookies.get("user-token"),
    access: this.props.cookies.get("access"),
    anchorEl: null,
  };

  handleClickMenu = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };
  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  toggleDrawer = () => {
    this.setState({ open: !this.state.open });
  };

  componentDidMount() {
    if (this.state.token && this.state.access !== "1") {
      window.location.href = `${process.env.PUBLIC_URL}/access`;
    } else if (!this.state.token) {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }
  }

  render() {
    if (this.state.access !== "1" || !this.state.token) {
      return null; // or a spinner/message if you want
    }
    return (
      <ThemeProvider theme={theme}>
        {this.state.token ? (
          <Box sx={{ display: "flex", bgcolor: "#000000" }}>
            <CssBaseline />
            <AppBar position="absolute" open={this.state.open}>
              <Toolbar
                sx={{
                  pr: "24px", // keep right padding when drawer closed
                }}
              >
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={this.toggleDrawer}
                  sx={{
                    marginRight: "36px",
                    ...(this.state.open && { display: "none" }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="close drawer"
                  onClick={this.toggleDrawer}
                  sx={{
                    marginRight: "36px",
                    ...(!this.state.open && { display: "none" }),
                  }}
                >
                  <MenuOpenIcon />
                </IconButton>
                <Breadcrumbs
                  sx={{ color: "#ffffff" }}
                  separator={<EastIcon fontSize="small" />}
                  aria-label="breadcrumb"
                >
                  {breadcrumbs}
                </Breadcrumbs>
                <IconButton
                  sx={{
                    position: "absolute",
                    right: 15,
                    justifyContent: "end",
                  }}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  size="large"
                  color="inherit"
                  onClick={this.handleClickMenu}
                >
                  <Badge badgeContent={0} color="error">
                    <AccountCircleIcon />
                  </Badge>
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={this.state.anchorEl}
                  open={Boolean(this.state.anchorEl)}
                  onClose={this.handleCloseMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1,
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/profile`;
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircleTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/messages`;
                    }}
                  >
                    <ListItemIcon>
                      <MailTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Messages</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/feedback`;
                    }}
                  >
                    <ListItemIcon>
                      <FeedbackTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Feedback</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/bug-report`;
                    }}
                  >
                    <ListItemIcon>
                      <BugReportTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Bug Report</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(event) => {
                      this.props.cookies.remove("user-token");
                      window.location.href = `${process.env.PUBLIC_URL}/login`;
                    }}
                  >
                    <ListItemIcon>
                      <MeetingRoomTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Log Out</ListItemText>
                  </MenuItem>
                </Menu>
              </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={this.state.open}>
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  px: [1],
                }}
              >
                <Link to="/">
                  <img className="logo-top" src={logo}></img>
                </Link>
              </Toolbar>
              <Divider sx={{ mt: 3, mb: 1 }} variant="middle" />

              <List component="nav">
                {/* mainListItems */}
                <React.Fragment>
                  <ListItemButton
                    sx={{ m: 1.5, borderRadius: 1, mt: 2 }}
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/dashboard`;
                    }}
                  >
                    <ListItemIcon>
                      <DashboardTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </React.Fragment>

                <Divider sx={{ my: 3 }} variant="middle" />

                <React.Fragment>
                  <ListItemButton
                    sx={{ m: 1.5, borderRadius: 1, mt: 2 }}
                    selected={true}
                  >
                    <ListItemIcon>
                      <FolderOpenTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Uploaded Datasets" />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ m: 1.5, borderRadius: 1, mt: 2 }}
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/data-augmentation`;
                    }}
                  >
                    <ListItemIcon>
                      <FolderSpecialTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Data Augmentation" />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ m: 1.5, borderRadius: 1, mt: 2 }}
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/graph-generation`;
                    }}
                  >
                    <ListItemIcon>
                      <DatasetTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Graph Generation" />
                  </ListItemButton>
                  <ListItemButton
                    sx={{ m: 1.5, borderRadius: 1, mt: 2 }}
                    onClick={(event) => {
                      window.location.href = `${process.env.PUBLIC_URL}/ml-sessions`;
                    }}
                  >
                    <ListItemIcon>
                      <LightbulbTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Machine Learning" />
                  </ListItemButton>
                </React.Fragment>
                {/* mainListItems */}
                <Divider sx={{ my: 3 }} variant="middle" />
                {/* secondaryListItems */}

                {/* secondaryListItems */}
              </List>
            </Drawer>
            <Box
              component="main"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "#f8f8f8"
                    : theme.palette.grey[900],
                flexGrow: 1,
                height: "100vh",
                overflow: "auto",
              }}
              className="div"
            >
              <Toolbar />
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                  {/* Recent Orders */}

                  <Orders />
                </Grid>
              </Container>
            </Box>
          </Box>
        ) : (
          <div></div>
        )}
      </ThemeProvider>
    );
  }
}

export default withCookies(DatasetDashboard);
