import React from 'react';
import { withStyles, Typography, Grid, TextField, FormControl, Select, MenuItem, Button, Slider, InputAdornment, Tooltip, IconButton, OutlinedInput, Zoom } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import { StringUtils } from '../../../scripts/utils';

const sliderMarks = [
    {
        value: 1,
        label: "1 Year",
    },
    {
        value: 60,
        label: "60 Years",
    },
];

const intervalOptions = [
    "daily",
    "weekly",
    "bi-weekly",
    "monthly",
    "quarterly",
    "semi-annually",
    "yearly",
];

const helpText = {
    initialInvestment: 'The initial amount of money you have to invest on day 0',
    regularDeposits: 'The amount of money you plan to deposit and the frequency at which you will deposit it at',
    interestRate: 'The expected annual rate of return on your investment',
    compoundInterval: 'The interval on which your investment will compound. For example, monthly compounding means your investment will earn interest 12 times per year',
    timeframe: 'The length of time you will leave the investment to grow'
}

class CalculatorForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            initialInvestment: 0,
            regularDepositAmount: 0,
            regularDepositInterval: 'monthly',
            interestRate: 3,
            compoundInterval: 'monthly',
            timeframe: 30
        }
    }

    handleBlur = () => {
        if (this.state.timeline < 0) {
            this.setState({ timeline: 0 });
        } else if (this.state.timeline > 60) {
            this.setState({ timeline: 60 });
        }
    };

    handleSubmit(event) {
        event.preventDefault();

        this.props.handleFormSubmit(this.state);
    }

    render() {
        return (
            <form
                autoComplete="off"
                noValidate
                onSubmit={this.handleSubmit.bind(this)}
            >
                <div className="form-section">
                    <Typography variant="h5" className="form-section-header">
                        Initial Investment
                        <LightTooltip  title={helpText.initialInvestment} TransitionComponent={Zoom} leaveDelay={100} placement="right-start">
                            <HelpIcon className="help-icon"/>
                        </LightTooltip>
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs md={4}>
                            <FormControl fullWidth variant="outlined">
                                <OutlinedInput
                                    id="outlined-adornment-initial"
                                    value={this.state.initialInvestment}
                                    onChange={(e) =>
                                        this.setState({ ...this.state, initialInvestment: e.target.value })
                                    }
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}

                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
                <div className="form-section">
                    <Typography variant="h5" className="form-section-header">
                        Regular Deposits
                        <LightTooltip  title={helpText.regularDeposits} TransitionComponent={Zoom} leaveDelay={100} placement="right-start">
                            <HelpIcon className="help-icon"/>
                        </LightTooltip>
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth variant="outlined">
                                <OutlinedInput
                                    id="outlined-adornment-regular"
                                    value={this.state.regularDepositAmount}
                                    onChange={(e) => this.setState({ ...this.state, regularDepositAmount: e.target.value })}
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}

                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl variant="outlined" className="fullwidth-control">
                                <Select
                                    value={this.state.regularDepositInterval}
                                    onChange={(e) => this.setState({ ...this.state, regularDepositInterval: e.target.value })}
                                >
                                    {intervalOptions.map((option, index) => {
                                        return (
                                            <MenuItem key={index} value={option}>
                                                {StringUtils.toTitleCase(option)}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
                <div className="form-section">
                    <Typography variant="h5" className="form-section-header">
                        Interest Rate
                        <LightTooltip  title={helpText.interestRate} TransitionComponent={Zoom} leaveDelay={100} placement="right-start">
                            <HelpIcon className="help-icon"/>
                        </LightTooltip>
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs md={4}>
                            <FormControl fullWidth variant="outlined">
                                <OutlinedInput
                                    id="outlined-adornment-initial"
                                    value={this.state.interestRate}
                                    onChange={(e) => this.setState({ ...this.state, interestRate: e.target.value })}
                                    endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
                <div className="form-section">
                    <Typography variant="h5" className="form-section-header">
                        Compounding Period
                        <LightTooltip  title={helpText.compoundInterval} TransitionComponent={Zoom} leaveDelay={100} placement="right-start">
                            <HelpIcon className="help-icon"/>
                        </LightTooltip>
              </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs md={4}>
                            <FormControl variant="outlined" className="fullwidth-control">
                                <Select
                                    value={this.state.compoundInterval}
                                    onChange={(e) => this.setState({ compoundInterval: e.target.value })}
                                >
                                    {intervalOptions.map((period, index) => {
                                        return (
                                            <MenuItem key={index} value={period}>
                                                {StringUtils.toTitleCase(period)}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
                <div className="form-section">
                    <Typography variant="h5" className="form-section-header">
                        Years to Grow
                        <LightTooltip  title={helpText.timeframe} TransitionComponent={Zoom} leaveDelay={100} placement="right-start">
                            <HelpIcon className="help-icon"/>
                        </LightTooltip>
              </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={4} sm={3} md={2}>
                            <TextField
                                className="fullwidth-control"
                                variant="outlined"
                                value={this.state.timeframe}
                                onChange={(e) => this.setState({ ...this.state, timeframe: Number(e.target.value) })}
                                onBlur={this.handleBlur}
                            />
                        </Grid>
                        <Grid item xs={6} sm={7} md={9} className="slider">
                            <Slider
                                valueLabelDisplay="auto"
                                value={
                                    typeof this.state.timeframe === "number"
                                        ? this.state.timeframe
                                        : 0
                                }
                                onChange={(event, newValue) =>
                                    this.setState({ ...this.state, timeframe: Number(newValue) })
                                }
                                aria-labelledby="input-slider"
                                marks={sliderMarks}
                                step={1}
                                min={1}
                                max={60}
                            />
                        </Grid>
                    </Grid>
                </div>
                <div className="form-section">
                    <Grid spacing={2}>
                        <Grid item xs={4} md={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                className="fullwidth-control big-button"
                                size="large"
                            >
                                Calculate
                  </Button>
                        </Grid>
                    </Grid>
                </div>
            </form>
        )
    }
}

const LightTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
 }))(Tooltip);

export default CalculatorForm;