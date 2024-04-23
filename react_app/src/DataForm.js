import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import './DataForm.css';

function addDays(x, days) {
  let result = new Date(x);
  result.setDate(result.getDate() + days);
  return result;
}

function DataForm({ date, onDateChange }) {
  const incrementDate = () => {
    onDateChange(addDays(date, 1));
  };

  const decrementDate = () => {
    onDateChange(addDays(date, -1));
  };

  return (
    <div className="horizontal-box">
      <Button onClick={decrementDate}>Previous Day</Button>
      <div className="date-picker">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={dayjs(date)}
            onChange={onDateChange}
            renderInput={(params) => <input {...params.inputProps} />}
          />
        </LocalizationProvider>
      </div>
      <Button onClick={incrementDate}>Next Day</Button>
    </div>
  );
}

export default DataForm;

