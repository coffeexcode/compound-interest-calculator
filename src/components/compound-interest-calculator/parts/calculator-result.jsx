import React from 'react';
import { Tabs, Tab, Box, Typography, Grid } from '@material-ui/core';
import GraphResult from './graph-result';
import TableResult from './table-result';
import CurrencyFormat from 'react-currency-format';

class CalculatorResult extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tab: 0,
            comparisons: [
                {
                    id: "spy",
                    name: "S&P 500 (SPY)",
                    annualReturn: 9,
                    checked: false,
                    color: '#3BAFDA'
                },
                {
                    id: "qqq",
                    name: "Nasdaq 100 (QQQ)",
                    annualReturn: 14,
                    checked: false,
                    color: '#4FC1E9'
                },
                {
                    id: "dija",
                    name: "DOW Jones Industrial Average (DIJA)",
                    annualReturn: 8.5,
                    checked: false,
                    color: '#AC92EC',
                },
                {
                    id: "bank",
                    name: "Average Bank Account (Chequing)",
                    annualReturn: 0.1,
                    checked: false,
                    color: '#D770AD',
                },
                {
                    id: "hisa",
                    name: "Average High-Interest Savings Account",
                    annualReturn: 1.25,
                    checked: false,
                    color: '#EC87CO',
                },
            ],
            filters: {
                skipEmptyRows: true,
                compress: false,
                hideIdNumbers: true
            }
        };

        this.updateComparisons.bind(this);
    }

    updateComparisons(event, index) {
        let newComparisons = this.state.comparisons;
        newComparisons[index].checked = event.target.checked;

        this.setState({ ...this.state, comparisons: newComparisons });
    }

    updateFilters(event, name) {
        let newFilters = {};

        if (name === "skipEmptyRows") {
            newFilters = { ...this.state.filters, skipEmptyRows: event.target.checked };
        } else if (name === "compress") {
            newFilters = { ...this.state.filters, compress: event.target.checked };
        } else if (name === "hideIdNumbers") {
            newFilters = { ...this.state.filters, hideIdNumbers: event.target.checked };
        } else return;

        this.setState({ ...this.state, filters: newFilters });
    }

    getTotalValue() {
        if (this.props.data.length > 0)
            return this.props.data[this.props.data.length - 1].currentValue;
        else return 0;
    }

    getTotalInterest() {
        if (this.props.data.length > 0)
            return this.props.data[this.props.data.length - 1].totalInterest;
        else return 0;
    }

    render() {
        return (
            <div hidden={this.props.hidden}>
                <div className="results-component">
                    <Grid container spacing={2} className="results-description">
                        <Grid item xs={6} sm={4} className="results-summary-grid-item">
                            <span className="summary-line"> Total Value of Your Investment </span>
                            <Typography variant="h5"> <CurrencyFormat value={+this.getTotalValue().toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4} className="results-summary-grid-item">
                            <span className="summary-line"> Total Interest Earned </span>
                            <Typography variant="h5"> <CurrencyFormat value={+this.getTotalInterest().toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> </Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} className="results-description">
                        <Grid item xs={12} sm={8}>
                            <span>
                                Your initial investment of <CurrencyFormat className="investment-highlight" value={+this.props.options.initialInvestment?.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />{" "}
                                plus your <span className="investment-highlight">{this.props.options.regularDepositInterval}</span>{" "}
                                investment of <CurrencyFormat className="investment-highlight" value={+this.props.options.regularDepositAmount?.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />{" "}
                                at an annualized interest rate of <span className="investment-highlight">{this.props.options.interestRate + '%'}</span>{" "}
                                will be worth <CurrencyFormat className="investment-highlight" value={+this.getTotalValue()?.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />{" "}
                                after <span className="investment-highlight">{this.props.options.timeframe}</span>{" "}
                                years when compounded <span className="investment-highlight">{this.props.options.compoundInterval}</span>.
                            </span>
                        </Grid>

                    </Grid>
                    <Tabs value={this.state.tab} onChange={(e, newValue) => this.setState({ ...this.state, tab: Number(newValue) })} centered
                        indicatorColor="primary" textColor="primary">
                        <Tab label="Graphs" className="tab-button" />
                        <Tab label="Table" />
                    </Tabs>
                    <TabPanel value={this.state.tab} index={0}>
                        <GraphResult comparisons={this.state.comparisons} updateComparisons={this.updateComparisons.bind(this)} data={this.props.data.filter(point => point.isYearEnd)} options={this.props.options} />
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={1}>
                        <TableResult filters={this.state.filters} updateFilters={this.updateFilters.bind(this)} data={this.props.data} options={this.props.options} />
                    </TabPanel>
                </div>
            </div>
        );
    }
}

class TabPanel extends React.Component {

    render() {
        const { children, value, index, ...other } = this.props;

        return (
            <div role="tabpanel" hidden={value !== index} id={`result-tabpanel-${index}`} {...other}>
                {value === index &&
                    <Box>
                        {children}
                    </Box>
                }
            </div>
        )
    }
}

export default CalculatorResult;