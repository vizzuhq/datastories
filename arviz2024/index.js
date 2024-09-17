import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@latest/dist/vizzu.min.js';
import { VideoCapture } from 'https://cdn.jsdelivr.net/npm/@vizzu/video-capture@0.5.0/dist/mjs/index.min.js';

let dates = []

async function getCsvConsent() {
	const url = "water-levels.csv";
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		return await response.text();
	} catch (error) {
		console.error(error.message);
	}
}

function dataFilter(record) {
	return record[3] === 'Duna'
}

function days(year, month, day) {
    const monthNames = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JúN', 'JúL', 'AUG', 'SZE', 'OKT', 'NOV', 'DEC' ];
    const startDate = new Date(2002, 0, 1);
    const targetDate = new Date(year, monthNames.indexOf(month), day);
    const differenceInMs = targetDate.getTime() - startDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);
    return Math.floor(differenceInDays);
}

function csvToData(csvContent) {
	const lines = csvContent.split('\n');
	const header = lines[0].split(';');
	header.push('time');
	const series = header.map(key => ({
		name: key,
		type: key === 'Level' ? 'measure' : 'dimension',
		values: []
	}));
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(';');
		if (dataFilter(values) === false) {
			continue;
		}
		if (parseInt(values[0]) < 2023) {
			continue;
		}
		const daysIndex = days(parseInt(values[0]), values[1], parseInt(values[2]));
		dates[daysIndex] = `${values[0]} ${values[1]} ${''/*values[2]*/}`;
		values.push(daysIndex);
		for (let j = 0; j < values.length; j++) {
			const value = j === 6 ? parseInt(values[j]) : String(values[j]);
			series[j].values.push(value);
		}
	}

	const avgLevelsByStations = series[6].values.reduce((acc, level, index) => {
		const station = series[5].values[index];
		if (!acc[station]) {
			acc[station] = { sum: 0, count: 0 };
		}
		if (Number.isInteger(level)) {
			acc[station].sum += level;
			acc[station].count++;	
		}
		return acc;
	}, {});

	console.log(avgLevelsByStations);
	for (let i = 0; i < series[6].values.length; i++) {
		const station = series[5].values[i];
		const avgLevel = avgLevelsByStations[station].sum / avgLevelsByStations[station].count;
		series[6].values[i] -= avgLevel;
	}

	return { series };
}

const csvContent = await getCsvConsent();

const data = csvToData(csvContent);

let chart = new Vizzu("myVizzu", { data });

await chart.initializing;

chart.feature(new VideoCapture(), true)

chart.feature.videoCapture.start()

for (let time = 0; time <= dates.length; time++) {
	if (dates[time] === undefined) {
		continue;
	}
	await chart.animate({
		config: {
			y: { set: 'Level', range: { min: '-400', max: '600' } }, 
			x: 'Station name',	
			geometry: 'area',
			title: 'Danube Water Levels',
			subtitle: dates[time],
		},
		data: {
			filter: record => record.time == time
		},
	}, {duration: 0.1});
}

const output = await chart.feature.videoCapture.stop()
window.open(output.getObjectURL())
