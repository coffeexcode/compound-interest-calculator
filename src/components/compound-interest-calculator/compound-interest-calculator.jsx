import React from "react";
import { Container, Divider } from '@material-ui/core';
import "../../styles/compound-interest-calculator.css";
import CalculatorForm from "./parts/calculator-form";
import CalculatorResult from './parts/calculator-result';
import { calculate } from '../../scripts/calculator';

class CompoundInterestCalculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {},
      data: [],
      hidden: true,
    };
  }

  handleFormSubmit(formValues) {
    const convertedFormValues = {
      ...formValues,
      initialInvestment: Number(formValues.initialInvestment),
      regularDepositAmount: Number(formValues.regularDepositAmount),
      interestRate: Number(formValues.interestRate),
    
    };

    var data = calculate(convertedFormValues);

    this.setState({...this.state, formValues: convertedFormValues, data: data, hidden: false});
  }

  render() {

    return (
      <div id="compound-interest-calculator">
        <div className="calculator-header">
        </div>
        <Container fixed maxWidth="lg">
          <CalculatorForm handleFormSubmit={this.handleFormSubmit.bind(this)}/>
          <Divider />
          <CalculatorResult options={this.state.formValues} data={this.state.data} hidden={this.state.hidden}/>
        </Container>
      </div>
    );
  }
}

export default CompoundInterestCalculator;
