import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Header from './Header';
import DataForm from './DataForm';
import DataDisplay from './DataDisplay';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, AppBar, Toolbar, Typography, Container } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d652d',
    },
    secondary: {
      main: '#8bc34a',
    },
  },
  typography: {
    h1: {
      fontWeight: 'bold',
      fontSize: 40,
      fontFamily: 'Merriweather Sans',
      letterSpacing: 1,
    },
    h2: {
      fontWeight: 'bold',
      fontSize: 32,
      fontFamily: 'Merriweather Sans',
      letterSpacing: 1,
    },
    h3: {
      fontSize: 24,
      fontFamily: 'Merriweather Sans',
      letterSpacing: 1,
      marginTop: 64,
      marginBottom: 16,
      textDecoration: 'underline',
    },
  },
});

function addDays(x, days) {
  let result = new Date(x);
  result.setDate(result.getDate() + days);
  return result;
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const defaultDate = new Date();
  const [displayedDate, setDisplayedDate] = useState(defaultDate);

  const fetchData = async (date) => {
    console.log("Fetching data for", date);
    setLoading(true);
    try {
      const serverName =  "127.0.0.1:5001"; //"3.23.51.228"
      const response = await axios.get("http://" + serverName + "/get_hr_probs_for_day", {
        params: {
          date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
        }
      });
      setData(response.data);
      setError(null);
    } catch (error) {
      setData(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (date) => {
    setDisplayedDate(date);
    fetchData(date);
  }

  useEffect(() => {
    const fetchDataAndCheckDataLength = async () => {
      await fetchData(displayedDate);
      if (data != null && data.length === 0) {
        onDateChange(addDays(displayedDate, -1));
      }
    };

    fetchDataAndCheckDataLength();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Header />
      <div className="medium-space"/>
      <div className="App">
        <DataForm date={displayedDate} onDateChange={onDateChange} />

        {(displayedDate.getMonth() + 1 < 4 || (displayedDate.getMonth() + 1 == 4 && displayedDate.getDate() <= 20)) &&
          <>
          <div className="small-space"/>
          <Alert variant="filled" className="warning" severity="warning">
            Predictions before ~20 games into the season may be innaccurate since the stats that are used as input to the model are volatile at the beginning of the season.
          </Alert>
          </>}

        <div className="small-space"/>
        <div className="vertical-box">
          {loading && <CircularProgress />}
          {!loading && <DataDisplay data={data} error={error} theme={theme} />}
          {error && <p>{error}</p>}
        </div>
      </div>
      <div className="medium-space"/>
    </ThemeProvider>
  );
}

export default App;

