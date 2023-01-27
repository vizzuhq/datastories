//import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@latest/dist/vizzu.min.js';
import Vizzu from 'https://vizzu-lib-main.storage.googleapis.com/lib/vizzu.js';

let data = { series: [], records: [] };

let typesPalette = "#A0CDEBFF #60C0E6FF #1DA1F3FF";
let toolsPalette = "#597696FF #ED2828FF #26EC87FF #29B9BFFF";
let trumpPalette = "#E9161FFF #DD7D79FF #D7AFA5FF #E3BCA0FF #FBC87BFF";

data.records = await d3.csv("trump_2020_05 - trump_2020_05.csv");

data.series = Object.keys(data.records[0]).slice(0,11).map(name => ({ 
	name: name,
	type: (name == 'tweetvalue' || name == 'retweet count') ? 'measure' : 'dimension'
}));

let config = {
	align: 'center',
	split: 'false',
	category: 'Tweet type',
	measure: 'tweetvalue',
	coordSystem: 'cartesian',
	geometry: 'area',
	filter: null,
	y: ()=>[config.measure, config.category],
	x: ()=>['year','month'],
	colorPalette: typesPalette
};

for (let i = 0; i < data.records.length; i++)
	data.records[i] = Object.values(data.records[i]).slice(0,11);

let chart = new Vizzu('vizzuCanvas', { data });

function update()
{
	chart.animate({
		data: { filter: config.filter },
		config: {
			channels: {
				y: config.y(),
				x: config.x(),
				color: config.category
			},
			geometry: config.geometry,
			align: config.align,
			split: config.split,
			coordSystem: config.coordSystem
		},
		style: {
			plot: {
				marker: {
					colorPalette: config.colorPalette
				}
			}
		}
	}, 
	{ regroupStrategy: 'drilldown' });
}

let splitInput = document.getElementById("split");
splitInput.addEventListener("input", event => {
	switch(splitInput.value)
	{
		case 'Stack':
			config.align = 'center';
			config.split = false;
			break;

		case 'Percent':
			config.align = 'stretch';
			config.split = false;
			break;

		case 'Split':
			config.align = 'none';
			config.split = true;
			break;
	}
	update();
});

let categoryInput = document.getElementById("categories");
categoryInput.addEventListener("input", event => {
	switch(categoryInput.value)
	{
		case 'Types':
			config.category = 'Tweet type';
			config.colorPalette = typesPalette;
			break;

		case 'Tools':
			config.category = 'Tool category';
			config.colorPalette = toolsPalette;
			break;
			
		case 'Trump':
			config.category = 'DidTTI result';
			config.colorPalette = trumpPalette;
			break;
	}
	update();
});

let tweetsInput = document.getElementById("tweets");
tweetsInput.addEventListener("input", event => {
	switch(tweetsInput.value)
	{
		case 'Tweets':
			config.measure = 'tweetvalue';
			break;
			
		case 'Shared':
			config.measure = 'retweet count';
			break;
	}
	update();
});


let axisInput = document.getElementById("axis");
axisInput.addEventListener("input", event => {
	switch(axisInput.value)
	{
		case 'Timeline':
			config.y = ()=>[config.measure, config.category];
			config.x = ()=>['year','month'];
			config.coordSystem = 'cartesian';
			config.geometry = 'area';
			config.align = 'center';
			break;
			
		case 'Total':
			config.x = ()=>config.measure;
			config.y = ()=>config.category;
			config.coordSystem = 'cartesian';
			config.geometry = 'rectangle';
			config.align = 'none';
			break;

		case 'TOTD':
			config.y = ()=>[config.measure, config.category];
			config.x = ()=>['AM/PM','hour 12'];
			config.coordSystem = 'polar';
			config.geometry = 'area';
			config.align = 'max';
			break;
		}
	update();
});

let periodInput = document.getElementById("period");
periodInput.addEventListener("input", event => {
	switch(periodInput.value)
	{
		case 'All periods':
			config.filter = null;
			break;
			
		case 'Newbie':
			config.filter = record => record['Simpl. periods of pres.'] == 'New to Twitter';
			break;

		case 'Businessman':
			config.filter = record => record['Simpl. periods of pres.'] == 'Businessman';
			break;

		case 'Nominee':
			config.filter = record => record['Simpl. periods of pres.'] == 'Nominee';
			break;

		case 'President':
			config.filter = record => record['Simpl. periods of pres.'] == 'President';
			break;
	}
	update();
});

update();

