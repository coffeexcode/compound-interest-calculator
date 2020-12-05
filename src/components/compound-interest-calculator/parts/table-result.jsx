import React from 'react';
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import CurrencyFormat from 'react-currency-format';

const columns = [
    { id: 'depositNum', label: 'Deposit #', minWidth: 70, format: 'number' },
    { id: 'deposit', label: 'Deposit', minWidth: 100, format: 'currency' },
    { id: 'periodNum', label: 'Period #', minWidth: 70, format: 'number' },
    { id: 'periodDeposit', label: 'Period Deposit', minWidth: 120, format: 'currency' },
    { id: 'periodInterest', label: 'Period Interest', minWidth: 100, format: 'currency' },
    { id: 'totalInterest', label: 'Total Interest', minWidth: 100, format: 'currency' },
    { id: 'totalInvested', label: 'Total Invested', minWidth: 100, format: 'currency' },
    { id: 'currentValue', label: 'Current Value', minWidth: 100, format: 'currency' }
]

class TableResult extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 12
        };
    }

    handleChangePage = (event, newPage) => {
        this.setState({ ...this.state, page: newPage });
    };

    handleChangeRowsPerPage = (event) => {
        this.setState({ ...this.state, page: 0, rowsPerPage: Number(event.target.value) });
    };

    useFilters(point) {
        if (this.props.filters.skipEmptyRows) {
            if (point.periodNum === -1 || point.depositNum === -1) {
                return false;
            }
        }

        if (this.props.filters.compress) {
            return point.isYearEnd;
        }

        return true;
    }

    getPeriodName() {
        switch (this.props.options.compoundInterval) {
            case "daily": return "Day";
            case "weekly": return "Week"
            case "bi-weekly": return "Bi-week";
            case "monthly": return "Month";
            case "quarterly": return "Quarter";
            case "semi-annually": return "Semi-annual";
            case "yearly": return "Year";
            default: return "";
        };
    }

    renderTableCell(column, value) {
        let innerCell;

        if (column?.format === 'currency') {
            innerCell = <CurrencyFormat value={value.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
        } else innerCell = <span>{value}</span>

        return (
            <TableCell key={column.id} align={column.align}>
                {innerCell}                                                     
            </TableCell>
        )
    }

    render() {
        return (
            <div className="result-panel">
                <div className="panel-options-container">
                    <FormControl component="fieldset" className="flex-center fullwidth-control">
                        <FormLabel component="legend" className="fullwidth-control center">Table Options</FormLabel>
                        <div className="table-options">
                            <FormGroup className="panel-option">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.props.filters.skipEmptyRows}
                                            onChange={(e) => {
                                                this.props.updateFilters(e, "skipEmptyRows");
                                                this.setState({ ...this.state, page: 0 });
                                            }}
                                            name="skipEmptyRows"
                                        />
                                    }
                                    label="Skip Empty Rows"
                                />
                            </FormGroup>
                            <FormGroup className="panel-option">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.props.filters.compress}
                                            onChange={(e) => {
                                                this.props.updateFilters(e, "compress");
                                                this.setState({ ...this.state, page: 0 });
                                            }}
                                            name="compress"
                                        />
                                    }
                                    label="Show Only Year End Values"
                                />
                            </FormGroup>
                            <FormGroup className="panel-option">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.props.filters.hideIdNumbers}
                                            onChange={(e) => {
                                                this.props.updateFilters(e, "hideIdNumbers");
                                            }}
                                            name="hideIdNumbers"
                                        />
                                    }
                                    label="Hide Deposit / Period #"
                                />
                            </FormGroup>
                        </div>
                    </FormControl>
                </div>
                <div className="table">
                    <Paper>
                        <TableContainer>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => {
                                            if (this.props.filters.hideIdNumbers && (column.id === "depositNum" || column.id === "periodNum")) {
                                                return <React.Fragment />;
                                            }
                                            
                                            return <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.id === "periodNum" ? this.getPeriodName() : column.label}
                                            </TableCell>
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.props.data.filter(point =>
                                        this.useFilters(point)
                                    ).slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage).map((row) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                                {columns.map((column) => {
                                                    if (this.props.filters.hideIdNumbers && (column.id === "depositNum" || column.id === "periodNum")) {
                                                        return <React.Fragment />
                                                    }
                                                    
                                                    return this.renderTableCell(column, row[column.id]);
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[12, 36, 60]}
                            component="div"
                            count={this.props.data.filter(point => this.useFilters(point)).length}
                            rowsPerPage={this.state.rowsPerPage}
                            page={this.state.page}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        />
                    </Paper>
                </div>
            </div>
        )
    }
}

export default TableResult;