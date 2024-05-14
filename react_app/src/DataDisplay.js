import React, { useState } from 'react';
import { Typography, Box, Paper, TableSortLabel, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, TextField } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import "./DataDisplay.css"

function CustomStatsTooltip({ dictionary }) {
  if (typeof dictionary === 'undefined') {
    return (
      <InfoIcon color="disabled"/>
    );
  }

  const formattedContent = Object.entries(dictionary).map(([key, value], index) => {
    const formattedValue = typeof value === 'number' ? parseFloat(value).toFixed(3) : value;

    return (
      <React.Fragment key={index}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{key}:</span>&nbsp;
          <span style={{ fontSize: '16px' }}>{formattedValue}</span>
        </div>
        <br />
      </React.Fragment>
    );
  });

  return (
    <Tooltip title={<div>{formattedContent}</div>}>
      <IconButton>
        <InfoIcon sx={{color:"gray"}}/>
      </IconButton>
    </Tooltip>
  );
}

function CustomOddsTooltip({ odds, update_time, game_time }) {
  if (typeof odds === 'undefined') {
    return (
      <InfoIcon color="disabled"/>
    );
  }

  // Format odds data for display
  const formattedContent = Object.entries(odds).map(([site, oddsData], index) => {
    const over = oddsData.over ? `${oddsData.over}` : '---';
    const under = oddsData.under ? `${oddsData.under}` : '---';
    return (
      <React.Fragment key={index}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{site}:</span>&nbsp;
          <span style={{ fontSize: '16px' }}>{over}/{under}</span>
        </div>
        <br />
      </React.Fragment>
    );
  });

  return (
    <Tooltip title={
      <div>
        {formattedContent}
          <div className="horizontal-box">
            <span style={{ fontSize: '12px' }}>Game at {(new Date(game_time)).toLocaleTimeString()}</span><br/>
          </div>
          <div className="horizontal-box">
            <span style={{ fontSize: '12px' }}>Updated at {(new Date(update_time)).toLocaleTimeString()}</span><br/><br/>
          </div>
      </div>}>
      <IconButton>
        <InfoIcon sx={{color:"gray"}}/>
      </IconButton>
    </Tooltip>
  );
}

function DataDisplay({ data, error, theme }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Updated default rows per page to 10
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrderBy(property);
    setOrder(isAscending ? 'desc' : 'asc');
  };

  if (!data) {
    return null; // Render nothing if data is null or undefined
  }

  // Filter data based on search term
  const filteredData = data.filter(item =>
    item["Player"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = filteredData.slice().sort((a, b) => {
    const aValue = orderBy ? a[orderBy] : null;
    const bValue = orderBy ? b[orderBy] : null;
    if (order === 'asc') {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  const getBestOdds = (oddsObj, fairOdds) => {
    let bestOver = {value: null, site: null};
    let bestUnder = {value: null, site: null};

    for (let site in oddsObj) {
      if (oddsObj.hasOwnProperty(site)) {
        let over = oddsObj[site].over;
        let under = oddsObj[site].under;

        if (over && (!bestOver.value || parseFloat(over) > parseFloat(bestOver.value))) {
          bestOver.value = over;
          bestOver.site = site;
        }

        if (under && (!bestUnder.value || parseFloat(under) > parseFloat(bestUnder.value))) {
          bestUnder.value = under;
          bestUnder.site = site;
        }
      }
    }
    if (fairOdds < bestOver.value) {
      return <span><mark>{bestOver.value}</mark>/{bestUnder.value}</span>
    } else if (-1 * fairOdds < bestUnder.value) {
      return <span>{bestOver.value}/<mark>{bestUnder.value}</mark></span>
    } else {
      return `${bestOver.value}/${bestUnder.value}`;
    }
}


  const emptyRows = Math.max(0, rowsPerPage - Math.min(rowsPerPage, sortedData.length - page * rowsPerPage));
  const columnOrder = ["Player", "Team", "Opposing Pitcher", "Model HR probability", "Model HR odds", "Did hit HR"];

  const createStatsString = (dictionary) => {
    let result = '';
    for (const key in dictionary) {
      if (Object.hasOwnProperty.call(dictionary, key)) {
        result += `${key}: ${dictionary[key]}\n`;
      }
    }
    return result;
  }

  return (
    <Paper elevation={0} sx={{border: `2px solid ${theme.palette.secondary.main}`}}>
      {error && <p>{error}</p>}
      {data.length > 0 && <Box sx={{"marginLeft": "16px", "marginRight": "16px"}}>
        <TextField
          label="Search by player name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      </Box>}
      {data.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columnOrder.map((key) => (
                  <TableCell key={key}>
                    <TableSortLabel
                      active={orderBy === key}
                      direction={orderBy === key ? order : 'asc'}
                      onClick={() => handleRequestSort(key)}
                    >
                      <b>{key}</b>
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>
                  <b>Best odds</b>
                </TableCell>
                <TableCell>
                  <b>Stats before game</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                <TableRow key={index}>
                  {columnOrder.map((key) => (
                    item[key] ? <TableCell key={key}>{item[key]}</TableCell> : <TableCell key={key}>---</TableCell>
                  ))}
                  <TableCell key="odds_data" align="center">
                    {Object.keys(item.odds_data).length === 0 ?
                      "---"
                      :
                      <>
                      {getBestOdds(item.odds_data.data, item["Home run odds"])}
                      <CustomOddsTooltip odds={item.odds_data.data} update_time={item.odds_data.update_time} game_time={item.odds_data.game_time} />
                      </>
                    }
                  </TableCell>
                  <TableCell key="stats" align="center">
                    <CustomStatsTooltip dictionary={item.stats} />
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columnOrder.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <div className="space-around">
          <p>No data available :(</p>
        </div>
      )}
    </Paper>
  );
}

export default DataDisplay;

