import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import InfoIcon from '@mui/icons-material/Info';
import {FaBaseballBall} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{"margin": 0}}>
      <Toolbar className="header-container">
        <div className='horizontal-box'>
          <FaBaseballBall className="header-logo" fontSize='inherit'/>
          <Typography variant="h1">
            <span className="header-title">Home Run Data</span>
          </Typography>
        </div>
        <div className='horizontal-box'>
          <a target="_blank" href="https://github.com/lucaspauker/home_run_modeling" className='vertical-box icon'>
            <GitHubIcon sx={{marginRight: 2}} />
          </a>
          <a target="_blank" href="https://twitter.com/lucas_pauker" className='vertical-box icon'>
            <TwitterIcon />
          </a>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

