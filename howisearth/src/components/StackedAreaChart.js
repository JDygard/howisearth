import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import React from 'react';
// European countries
// Request: "http://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/nama_10_gdp?geo=EU28&precision=1&na_item=B1GQ&unit=CP_MEUR&time=2010&time=2011"
// Query: "en/nama_10_gdp?geo=EU28&precision=1&na_item=B1GQ&unit=CP_MEUR&time=2010&time=2011"
// USA/States: EIA website, go figure that shit out :P
const data = [{ name: 'Page A', uv: 400, pv: 2400, amt: 2400 }, { name: 'Page B', uv: 200, pv: 2400, amt: 1100 }];

const RenderChart = props => {
    return (
        <LineChart width={600} height={300} data={data}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
        </LineChart>
    );
}

export default RenderChart;