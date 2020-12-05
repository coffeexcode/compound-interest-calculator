import React from "react";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from '@material-ui/core/Grid';
import { calculate } from "../../../scripts/calculator";
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CanvasJSReact from '../../../lib/canvasjs/canvasjs.react';
import CurrencyFormat from 'react-currency-format';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default class GraphResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.chart = React.createRef();
    this.toggleDataSeries = this.toggleDataSeries.bind(this);

    this.data = [];
  }

  /*
  Input format: 
    [{
      depositNum: i,
      deposit: options.regularDepositAmount,
      periodNum: currentPeriod,
      periodDeposit: 0,
      periodInterest: 0,
      totalInterest: 0,
      totalInvested: i * options.regularDepositAmount,
      currentValue: 0
    }]

  Output format:
  [{

  }]

  */
  mapDataToChartFormat(data, name, color, interestRate, useBaseOnly = false) {
    let currentDate = new Date(Date.now());

    var chartPoints = data.map(({ currentValue, totalInvested }, index) => {
      return {
        x: new Date(currentDate.getUTCFullYear() + (index + 1), currentDate.getUTCMonth()),
        y: useBaseOnly ? Number(totalInvested) + this.props.options.initialInvestment : Number(currentValue)
      }
    });

    // Insert a base point value
    chartPoints.unshift({
      x: currentDate,
      y: this.props.options.initialInvestment
    });

    return {
      type: "area",
      name: name,
      interestRate: interestRate,
      color: color,
      showInLegend: true,
      xValueFormatString: "YYYY",
      dataPoints: [...chartPoints]
    };
  }

  // Takes the year end values and maps to chart data format
  buildChartData() {
    if (this.props.data.length < 1) {
      return;
    }

    var userInvestmentWithInterest = this.mapDataToChartFormat(this.props.data, "With Interest", '#0065A2', this.props.options.interestRate);
    var userInvestmentWithoutInterest = this.mapDataToChartFormat(this.props.data, "Without Interest", '#75a5e3', 0, true);

    var additionalData = this.props.comparisons.filter(({ checked }) => checked).map(({ name, annualReturn, color }) => {
      var newData = calculate({
        ...this.props.options,
        interestRate: annualReturn
      }).filter(point => point.isYearEnd);

      return this.mapDataToChartFormat(newData, name, color, annualReturn);
    });

    var data = [userInvestmentWithInterest, userInvestmentWithoutInterest];

    if (additionalData.length > 0) {
      data = [...data, ...additionalData];
    }

    // Sort data by maximum value to be first
    data.sort((el1, el2) => {
      if (el1.dataPoints[el1.dataPoints.length - 1].y < el2.dataPoints[el2.dataPoints.length - 1].y) {
        return 1;
      } else if (el1.dataPoints[el1.dataPoints.length - 1].y > el2.dataPoints[el2.dataPoints.length - 1].y) {
        return -1;
      } else return 0;
    });

    let max = 0;

    data.forEach((chartData) => {
      // Check for max value
      if (chartData.dataPoints[chartData.dataPoints.length - 1].y > max) {
        max = chartData.dataPoints[chartData.dataPoints.length - 1].y;
      }
    });

    return {
      theme: "light2",
      animationEnabled: true,
      animationDuration: 2000,
      exportEnabled: false,
      zoomEnabled: true,
      zoomType: "x",
      title: {
        text: "Investment Growth"
      },
      subtitles: [{
        text: this.getSubtitle()
      }],
      axisX: {
        //minimum: new Date(firstDate.getUTCFullYear(), firstDate.getUTCMonth() - 1),
        //maximum: new Date(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDay() + 7)
      },
      axisY: {
        title: "Value ($)",
        maximum: (max * 1.05)
      },
      toolTip: {
        shared: true
      },
      legend: {
        verticalAlign: "bottom",
        horizontalAlign: "center",
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
        maxWidth: 800,
        itemWrap: true,
        fontSize: 16,
      },
      data: data
    };
  }

  getSubtitle() {
    var always = "My Investment";

    var additionals = [always, ...this.props.comparisons.filter(({ checked }) => checked).map(({ name }) => name)];

    if (additionals.length > 1) {
      return additionals.join(" VS. ");
    } else return always;
  }

  toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    }
    else {
      e.dataSeries.visible = true;
    }

    this.chart.render();
  }

  render() {
    return (
      <div className="result-panel">
        <Grid container spacing={2} className="comparison-panel">
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className="flex-center fullwidth-control">
              <FormLabel component="legend" className="fullwidth-control center">Compare to</FormLabel>
              <div className="panel-options">
                {this.props.comparisons.map(
                  ({ name }, index) => {
                    return <FormGroup key={index} className="panel-option">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.props.comparisons[index].checked}
                            onChange={(e) => {
                              this.props.updateComparisons(e, index);
                            }}
                            name={name}
                          />
                        }
                        label={name}
                      />
                    </FormGroup>
                  }
                )}
              </div>

            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper>
              <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell> Name (% Annual Return) </TableCell>
                      <TableCell> Final Value </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {true && this.props.data.length > 1 &&
                      this.buildChartData().data.map((dataset) => {
                        return {
                          name: dataset.name,
                          interestRate: dataset.interestRate,
                          lastValue: dataset.dataPoints[dataset.dataPoints.length - 1]
                        }
                      }).map((dataset) => {
                        return (
                          <TableRow>
                            <TableCell> {dataset.name} ({dataset.interestRate}%) </TableCell>
                            <TableCell> <CurrencyFormat value={+dataset.lastValue.y.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> </TableCell>
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
        <div className="graph">
          <CanvasJSChart key={this.getSubtitle() + this.props.data.toString()} options={this.buildChartData()} onRef={ref => this.chart = ref} />
        </div>
      </div>
    );
  }
}