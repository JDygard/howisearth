# How is Earth?
## Intro
I looked around for a climate-oriented statistics website that lets one easily compare the performance of different countries and regions in combatting climate change, and found nothing. I decided I wanted to fix this.

# Design
There will be three phases to rolling out this website.

1. **Prototype**: An intermediate project allowing a user to interact with and compare data from EU area countries via EuroSTAT. 
2. **Full release**: Data comparisons populated with information from as many countries as possible, along with a full array of climate-related statistics with unique chart views.
3. **Polished release**: Gives the user the option of a guided tour of information related to a specific country.

This design document will be written with all three phases in mind.

## Surface
### Phase 1, 2, 3
This is website about delivering information concisely and permitting the user to draw their own conclusions, so we have decided on a one-page approach. A neutral background, minimalistic navigation and footers will all draw focus to the colorful chart centerpiece.

## Skeleton
### Phase 1, 2
While there are only 31 countries at this point, selection design will be oriented around having reasonable space for all countries and data types when implemented in Phase 2. **Contextual modals** will be used to present selections to the user. **Countries** will be grouped by region and alphabetically within regions. **Data** to be presented on the chart will be grouped by compatibility.

#### Data points
Some initial hard data points are:

    Population growth
        Actual population (demo_pjan)
        Projected population (proj_19np)
    Per capita income (nama_10_pc, filter to current prices: euro)
    GDP (nama_10_gdp)
    Forest growth
        Timber area (for_area)
        Timber Volume (for_vol)
    Air emissions
        Net GHG emissions (sdg_13_10)
        GHG emissions by sector (env_ac_aigg_q)
        Air pollutants by source sector (env_air_emis)
    Biodiversity
    Waste
        Generation of waste by category (env_wasgen)
    Environmental Protection
    Energy Production by type, by output, and by emissions subtotals
        Renewable electricity production capacity (nrg_inf_epcrw)
        Renewable electricity share in percent of total (nrg_ind_ren)
        Production of electricity by fuel type (nrg_bal_peh)
            (Lots of filters)
    Environmental Sector (This represents new renewable energy output, costs of climate change mitigation, etc.)

**Ratios**: These soft data points would be ratios of statistics that could be compared side-by-side other countries. For instance, per-capita income / climate change mitigation investment. This could even be expanded into a tool which lets the user select their own statistics to slot over/under the ratio.

**Indicators**: These will be bars that indicate specific moments in time (vertical) or specific amounts (like a single Blue Origin launch in co2 emitted, or the amount of ppm co2 in the atmosphere associated with a +1.5c global average temperature)

### Phase 3
The only difference in Phase 3 is that the "guided" version of the data will be superficially separate from the raw data chart. Design must await implementation on that front.

## Structure
### Frontend: ReactJS
The plan is that this site will exist without a traditional navbar, being one-page. So we will implement this with two primary component trees: One concerning the footer, and one with the content itself. Content.js will contain reusable modal button components and a ReactCharts chart representing data. A standalone module containing the socket connection will be used.

### Backend: Node.JS and Sockets.io
Node.js will be used in the backend to:
1. Serve the website
2. Keep the database updated through various APIs
3. Communicate with the React app through WebSockets.

## Scope
### Phase 1
1. Present an interactive, informative chart with easily understood data
2. Present some information and reference links related to the data and the developers in the footer.
3. Keep a database of data to feed to the user
4. Maintain the freshness of the data efficiently

*Optional "reach goals"*

5. Provide a series of "Context information" that appears when relevant data is on the graph. I.e. when Sweden has stats on the graph, have a maximizable, dismissable information snippet prepared to describe why the graph might look like it does.

### Phase 2
Increase the breadth of the available data as much as possible by including:

1. More hard data points
2. More countries

*Optional "reach goals"*

3. Important dates of relevance to climate change as an overlay
4. Our own coefficient stats, like "Cost of climate impact efforts" / "Total reduction of co2 output" to provide additional, optional context.


### Phase 3
1. Implement a sort of "Guided Tour" that lets users intuitively see visualizations of the data they came to the site for.

## Strategy

As a site owner I want...
1. To improve the public's ability to hold their governments accountable
2. To impress someone enough to give me a job while the USA nosedives into a cataclysmic financial downturn in the midst of a surprise Cold War-style proxy war, despite my total lack of professional experience.
2. Maybe serve ads?

As a site user I would want to...
1. Easily explore presented information
2. Adjust displayed timelines, 
3. Adjust displayed data
4. Adjust displayed countries