import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useState, useEffect, useContext } from 'react';
import { SocketContext } from './context/socket';
import React from 'react';
// European countries
// Request: "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/nama_10_gdp?geo=EU28&precision=1&na_item=B1GQ&unit=CP_MEUR&time=2010&time=2011"
// Query: "en/nama_10_gdp?geo=EU28&precision=1&na_item=B1GQ&unit=CP_MEUR&time=2010&time=2011"
// USA/States: EIA website, go figure that shit out :P

const chartData = [
    {
      "time": "1990",
      "value": 8.8,
      "status": null
    },
    {
      "time": "1991",
      "value": 8.5,
      "status": null
    },
    {
      "time": "1992",
      "value": 8.3,
      "status": null
    },
    {
      "time": "1993",
      "value": 8.2,
      "status": null
    },
    {
      "time": "1994",
      "value": 8.2,
      "status": null
    },
    {
      "time": "1995",
      "value": 8.5,
      "status": null
    },
    {
      "time": "1996",
      "value": 9.2,
      "status": null
    },
    {
      "time": "1997",
      "value": 8.1,
      "status": null
    },
    {
      "time": "1998",
      "value": 8.2,
      "status": null
    },
    {
      "time": "1999",
      "value": 7.7,
      "status": null
    },
    {
      "time": "2000",
      "value": 8.1,
      "status": null
    },
    {
      "time": "2001",
      "value": 8.2,
      "status": null
    },
    {
      "time": "2002",
      "value": 9,
      "status": null
    },
    {
      "time": "2003",
      "value": 10.8,
      "status": null
    },
    {
      "time": "2004",
      "value": 10.2,
      "status": null
    },
    {
      "time": "2005",
      "value": 10.1,
      "status": null
    },
    {
      "time": "2006",
      "value": 10.5,
      "status": null
    },
    {
      "time": "2007",
      "value": 10.1,
      "status": null
    },
    {
      "time": "2008",
      "value": 10.2,
      "status": null
    },
    {
      "time": "2009",
      "value": 9.5,
      "status": null
    },
    {
      "time": "2010",
      "value": 9.9,
      "status": null
    },
    {
      "time": "2011",
      "value": 9.5,
      "status": null
    },
    {
      "time": "2012",
      "value": 9.2,
      "status": null
    },
    {
      "time": "2013",
      "value": 9.3,
      "status": null
    },
    {
      "time": "2014",
      "value": 8.9,
      "status": null
    },
    {
      "time": "2015",
      "value": 9.1,
      "status": null
    },
    {
      "time": "2016",
      "value": 9.1,
      "status": null
    },
    {
      "time": "2017",
      "value": 9.2,
      "status": null
    },
    {
      "time": "2018",
      "value": 8.8,
      "status": null
    },
    {
      "time": "2019",
      "value": 9,
      "status": null
    },
    {
      "time": "2020",
      "value": 8.2,
      "status": null
    }
  ]

const RenderChart = props => {
    const socket = useContext(SocketContext);

    return (
        <LineChart width={1000} height={500} data={props.chartData[0]}>
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="time" />
            <YAxis />
        </LineChart>
    );
}

export default RenderChart;