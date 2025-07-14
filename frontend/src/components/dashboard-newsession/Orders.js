import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  Backdrop,
  CircularProgress,
  Slider,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey, orange } from "@mui/material/colors";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";

const theme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily: "'Assistant', sans-serif",
  },
  palette: {
    primary: { main: grey[900] },
    secondary: { main: orange[400] },
  },
});

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
      token,
      access,
      open: false,
      captchaResult: "",
      isRequired: false,
      datasets: [],
      fn_datasets: [],
      augmented_datasets: [],
      data_type: null,
      selected_model: "",
      submitted: false,
      fieldErrors: {
        project_name: false,
        data: false,
        ml_model: false,
      },
      backendError: "",
      experiment: {
        project_name: "",
        description: "",
        data: null,
        data_id: null,
        dataset: null,
        train_split: 80,
        task: "supervised",
        learning_type: "classification",
        ml_model: "",

        // GRU-specific
        learning_rate: 0.01,
        optimization: "adam",
        num_layers: 2,
        dropout_rate: 0.3,
        batch_size: 64,
        hidden_size: 64,
        epochs: 8,

        // SVM-specific
        kernel: "rbf",
        regularization_strength: 1.0,

        // Node2Vec-specific
        dimensions: 32,
        walk_length: 10,
        num_walks: 20,
        window_size: 10,
        batch_word: 128,
        penalty: "l2",
        solver: "lbfgs",
        max_iter: 20,
      },
    };
  }

  componentDidMount() {
    if (!this.state.token) {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
      return;
    }

    fetch("https://api.flaplet.org/solarflare/dataset/get_info", {
      method: "GET",
      headers: { Authorization: `Token ${this.state.token}` },
    })
      .then((resp) => resp.json())
      .then((res) => {
        this.setState({ datasets: res.data });

        fetch("https://api.flaplet.org/solarflare/fn-dataset/get_info", {
          method: "GET",
          headers: { Authorization: `Token ${this.state.token}` },
        })
          .then((resp) => resp.json())
          .then((res) => {
            this.setState({ fn_datasets: res.data });

            fetch(
              "https://api.flaplet.org/solarflare/augmented-dataset/get_info",
              {
                method: "GET",
                headers: { Authorization: `Token ${this.state.token}` },
              }
            )
              .then((resp) => resp.json())
              .then((res) => this.setState({ augmented_datasets: res.data }));
          });
      });
  }

  handleRecaptcha = (value) => {
    fetch("https://api.flaplet.org/recaptcha/", {
      method: "POST",
      body: JSON.stringify({ captcha_value: value }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ captchaResult: data.captcha.success });
      });
  };
  handleChange = (event) => {
    const { name, value } = event.target;
    let experiment = { ...this.state.experiment };

    if (name === "Name") {
      experiment.project_name = value;
    } else if (name === "Description") {
      experiment.description = value;
    } else if (name === "Split") {
      experiment.train_split = value;
    } else if (name === "Data") {
      if (value === "") {
        experiment.data = null;
        experiment.data_id = null;
        experiment.dataset = null;
        experiment.ml_model = "";
        this.setState({ data_type: null, experiment });
      } else {
        const id = value.split("-")[0];
        const datasetType = value.split("-")[1];
        experiment.data = value;
        experiment.data_id = id;
        experiment.dataset = datasetType;
        experiment.ml_model = "";
        const data_type = datasetType === "fn_dataset" ? "fn" : "mvts";
        this.setState({ data_type, experiment });
      }
    } else if (name === "ml_model") {
      experiment.ml_model = value;
    } else {
      experiment[name] = value;
    }

    this.setState({ experiment });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const { project_name, data, ml_model } = this.state.experiment;

    const fieldErrors = {
      project_name: !project_name,
      data: !data,
      ml_model: !ml_model,
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);

    this.setState({ fieldErrors, submitted: true, backendError: "" });

    if (hasErrors) return;

    // Prepare request payload
    const exp = this.state.experiment;
    const payload = {
      project_name: exp.project_name,
      description: exp.description,
      task: exp.task,
      learning_type: exp.learning_type,
      ml_model: exp.ml_model,
      dataset: exp.dataset,
      data_id: exp.data_id,

      // Optional hyperparameters
      learning_rate: exp.learning_rate,
      optimization: exp.optimization,
      num_layers: exp.num_layers,
      dropout_rate: exp.dropout_rate,
      batch_size: exp.batch_size,
      hidden_size: exp.hidden_size,
      epochs: exp.epochs,
      train_split: exp.train_split,
      kernel: exp.kernel,
      regularization_strength: exp.regularization_strength,
      dimensions: exp.dimensions,
      walk_length: exp.walk_length,
      num_walks: exp.num_walks,
      window_size: exp.window_size,
      batch_word: exp.batch_word,
      penalty: exp.penalty,
      solver: exp.solver,
      max_iter: exp.max_iter,
    };

    this.setState({ open: true });

    fetch("https://api.flaplet.org/solarflare/project/set_project/", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.state.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message === "success") {
          window.location.href = `${process.env.PUBLIC_URL}/ml-sessions`;
        } else {
          this.setState({
            backendError: res.error || "Something went wrong.",
            open: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          backendError: "Server error. Please try again.",
          open: false,
        });
      });
  };

  render() {
    if (!this.state.token || this.state.access !== "1") return null;

    const { experiment, datasets, augmented_datasets, fn_datasets } =
      this.state;
    const model = experiment.ml_model;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <h2 className="h2">New ML Session</h2>
          <Box
            sx={{
              marginTop: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              component="form"
              onSubmit={this.handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                className="space"
                name="Name"
                fullWidth
                required
                label="Session Name"
                value={experiment.project_name}
                onChange={this.handleChange}
              />
              <TextField
                className="space"
                name="Description"
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={experiment.description}
                onChange={this.handleChange}
              />

              <Typography className="section" variant="h6">
                Dataset and Model
              </Typography>
              <FormControl required className="space" fullWidth>
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={experiment.data}
                  name="Data"
                  onChange={this.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem key={row.id} value={row.id + "-dataset"}>
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={row.id}
                        disabled
                        value={row.id + "-dataset"}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                  {augmented_datasets.length > 0 && <Divider />}
                  {augmented_datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem
                        key={row.id}
                        value={row.id + "-augmented_dataset"}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={row.id}
                        disabled
                        value={row.id + "-augmented_dataset"}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                  {fn_datasets.length > 0 && <Divider />}
                  {fn_datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem key={row.id} value={row.id + "-fn_dataset"}>
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={row.id}
                        disabled
                        value={row.id + "-fn_dataset"}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>Select a dataset to continue</FormHelperText>
              </FormControl>

              <FormControl required className="space" fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={experiment.ml_model}
                  name="ml_model"
                  onChange={this.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>

                  {this.state.data_type === "mvts" && (
                    <MenuItem value="gru">GRU (on MVTS)</MenuItem>
                  )}
                  {this.state.data_type === "mvts" && (
                    <MenuItem value="svm">
                      SVM (on Statistical Features)
                    </MenuItem>
                  )}
                  {this.state.data_type === "fn" && (
                    <MenuItem value="node2vec">
                      Node2Vec + Logistic Regression (on Graph)
                    </MenuItem>
                  )}
                </Select>

                <FormHelperText>
                  {this.state.data_type === null
                    ? "Please select a dataset first"
                    : "Select a model"}
                </FormHelperText>
              </FormControl>

              <Slider
                className="space"
                name="Split"
                value={experiment.train_split}
                onChange={this.handleChange}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={50}
                max={90}
                sx={{ mb: 0 }}
              />
              <FormHelperText sx={{ mb: 1, mt: -1 }}>
                Train/Test Split (%)
              </FormHelperText>

              {this.state.submitted &&
                Object.values(this.state.fieldErrors).some(Boolean) && (
                  <FormHelperText error sx={{ mt: 2 }}>
                    Please fill out all required fields!
                  </FormHelperText>
                )}

              {model === "gru" && (
                <>
                  <Typography className="section" variant="h6">
                    GRU Settings
                  </Typography>

                  <Slider
                    className="space"
                    name="learning_rate"
                    value={experiment.learning_rate}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={0.001}
                    min={0.001}
                    max={0.1}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 2, mt: -1 }}>
                    Learning Rate
                  </FormHelperText>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Optimization</InputLabel>
                    <Select
                      name="optimization"
                      value={experiment.optimization}
                      onChange={this.handleChange}
                    >
                      <MenuItem value="adam">Adam</MenuItem>
                      <MenuItem value="sgd">SGD</MenuItem>
                    </Select>
                    <FormHelperText sx={{ mb: 1, mt: 0 }}>
                      Optimizer
                    </FormHelperText>
                  </FormControl>

                  <Slider
                    className="space"
                    name="num_layers"
                    value={experiment.num_layers}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={6}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 1, mt: -1 }}>
                    Number of GRU Layers
                  </FormHelperText>

                  <Slider
                    className="space"
                    name="dropout_rate"
                    value={experiment.dropout_rate}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={0.05}
                    min={0}
                    max={0.5}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 2, mt: -1 }}>
                    Dropout Rate
                  </FormHelperText>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Batch Size</InputLabel>
                    <Select
                      name="batch_size"
                      value={experiment.batch_size}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      {[16, 32, 64].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Hidden Size</InputLabel>
                    <Select
                      name="hidden_size"
                      value={experiment.hidden_size}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      {[8, 16, 32, 64, 128].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Slider
                    className="space"
                    name="epochs"
                    value={experiment.epochs}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={1}
                    min={4}
                    max={12}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 3, mt: -1 }}>Epochs</FormHelperText>
                </>
              )}

              {model === "svm" && (
                <>
                  <Typography className="section" variant="h6">
                    SVM Settings
                  </Typography>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Kernel</InputLabel>
                    <Select
                      name="kernel"
                      value={experiment.kernel}
                      onChange={this.handleChange}
                      sx={{ mb: 0 }}
                    >
                      <MenuItem value="linear">Linear</MenuItem>
                      <MenuItem value="rbf">RBF</MenuItem>
                      <MenuItem value="poly">Polynomial</MenuItem>
                      <MenuItem value="sigmoid">Sigmoid</MenuItem>
                    </Select>
                    <FormHelperText sx={{ mb: 1 }}>SVM Kernel</FormHelperText>
                  </FormControl>

                  <TextField
                    className="space"
                    name="regularization_strength"
                    fullWidth
                    type="number"
                    label="Regularization Strength"
                    value={experiment.regularization_strength}
                    onChange={this.handleChange}
                    inputProps={{ min: 0.01, max: 10, step: 0.01 }}
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              {model === "node2vec" && (
                <>
                  <Typography className="section" variant="h6">
                    Node2Vec Settings
                  </Typography>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Embedding Dimensions</InputLabel>
                    <Select
                      name="dimensions"
                      value={experiment.dimensions}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      {[8, 16, 32, 64].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Slider
                    className="space"
                    name="walk_length"
                    value={experiment.walk_length}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={1}
                    min={5}
                    max={20}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 1, mt: -1 }}>
                    Walk Length
                  </FormHelperText>

                  <Slider
                    className="space"
                    name="window_size"
                    value={experiment.window_size}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={1}
                    min={10}
                    max={20}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 1, mt: -1 }}>
                    Window Size
                  </FormHelperText>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Batch Word</InputLabel>
                    <Select
                      name="batch_word"
                      value={experiment.batch_word}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      {[16, 32, 64, 128].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Penalty</InputLabel>
                    <Select
                      name="penalty"
                      value={experiment.penalty}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      <MenuItem value="l1">L1</MenuItem>
                      <MenuItem value="l2">L2</MenuItem>
                      <MenuItem value="none">None</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Solver</InputLabel>
                    <Select
                      name="solver"
                      value={experiment.solver}
                      onChange={this.handleChange}
                      sx={{ mb: 1 }}
                    >
                      <MenuItem value="lbfgs">L-BFGS</MenuItem>
                      <MenuItem value="liblinear">LibLinear</MenuItem>
                      <MenuItem value="sag">SAG</MenuItem>
                      <MenuItem value="saga">SAGA</MenuItem>
                    </Select>
                  </FormControl>

                  <Slider
                    className="space"
                    name="max_iter"
                    value={experiment.max_iter}
                    onChange={this.handleChange}
                    valueLabelDisplay="auto"
                    step={1}
                    min={10}
                    max={50}
                    sx={{ mb: 0 }}
                  />
                  <FormHelperText sx={{ mb: 3, mt: -1 }}>
                    Max Iterations
                  </FormHelperText>
                </>
              )}
              <ReCAPTCHA
                className="space"
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={this.handleRecaptcha}
              />

              {this.state.backendError && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {this.state.backendError}
                </FormHelperText>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!this.state.captchaResult}
              >
                Create New ML Session
              </Button>

              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={this.state.open}
                onClick={this.handleClose}
              >
                <label>
                  Please wait. You will be redirected to the sessions page
                  automatically.
                </label>
                <CircularProgress color="inherit" />
              </Backdrop>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}

export default withCookies(Orders);
