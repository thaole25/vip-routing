const MAX_TIME = 59;
const el = document.getElementById('world');
const startBtn = document.getElementById('startBtn');
const nextButton = document.getElementById('nextBtn');
const finishButton = document.getElementById('finishBtn');
const timer = document.getElementById('timer');
const task = document.getElementById('task');
const tuteDiv = document.getElementById('tutorial');
const gameCanvas = document.getElementById('gameCanvas');
const firstTaskMap = [fixed1, fixed2, fixed3, fixed4, fixed5, first1, first2, first3, first4, first5];
const secondTaskMap = [fixed1, fixed2, fixed3, fixed4, fixed5, second1, second2, second3, second4, second5];
const thirdTaskMap = [fixed1, fixed2, fixed3, fixed4, fixed5, third1, third2, third3, third4, third5];
const totalMaps = 10;

let participant;
let listenerPressKey;
let timeout;
let gameIndex = 0;
let saveData = []; //uct timestamp - posX - posY - game index - condition - participant 
let condition;
let isTute = false;

function showTask(){
	document.getElementById('startScreen').style.display = 'none';
	condition = document.getElementById('condition').value;
	participant = document.getElementById('inputName').value;
	if (condition == "1"){
		task.innerHTML += "<p>In this task:" +
		"<ul><li>Using the up/down/left/right keyboards to move the car</li>" +
		"<li>You have 1 minute to go home (red house). The blue houses are your neighbours. Ignore the blue houses in this task</li>" +
		"<li>Try to get home as fast as you can</li>" +
		"<li>Click the finish button when you get home</li></ul></p>";
		task.style.display = 'inline';
	}else if (condition == "2"){
		task.innerHTML += "<p>In this task:" +
		"<ul><li>Using the up/down/left/right keyboards to move the car</li>" +
		"<li>You have 1 minute to go home (red house)</li>" +
		"<li>Try to get home as fast as you can</li>" +
		"<li>Click the finish button when you get home</li>" + 
		"<li><b>You are escorting a VIP so you need to make sure to get her home safely. Someone is watching your moves and he wants to attack the VIP. You will attempt to make it difficult for an observer so he will not know where you are going. You may try to </li>" +
			"<ul><li>Use the blue houses as decoys. You may go to the blue house first and then go home</li>" +
			"<li>Go to the red house with an ambiguous path (Be creative)</li>" +
			"<li>Please notice that you can go to red house and blue houses multiple times</li></ul>" + 
		"</b></ul></p>";
		task.style.display = 'inline';
	}else if(condition == "3"){
		task.innerHTML += "<p>In this task:" +
		"<ul><li>Using the up/down/left/right keyboards to move the car</li>" +
		"<li>You have 1 minute to go home (red house)</li>" +
		"<li>Try to get home as fast as you can</li>" +
		"<li>Click the finish button when you get home</li>" + 
		"<li>You are escorting a VIP so you need to make sure to get her home safely. Someone is watching your moves and he wants to attack the VIP. You will attempt to make it difficult for an observer so he will not know where you are going. </li>" +
			"<ul><li>Use the blue houses as decoys. You may go to the blue house first and then go home</li>" +
			"<li>Go to the red house with an ambiguous path (Be creative)</li>" +
			"<li>Please notice that you can go to red house and blue houses multiple times</li></ul>" + 
		"<li><b>Someone is watching your gaze so he knows where you are looking at. He can use your gaze to know that your real destination is the red house." +
		" Your task is to mislead the observer by changing your eye movements. You may try to</li> " +
			"<ul><li>Avoid looking at the red house</li>" +
			"<li>Be creative</li></ul></b></ul></p>";
		task.style.display = 'inline';
	}
}

function tutorial(){
	isTute = true;
	task.style.display = 'none';
	tuteDiv.style.display = 'inline';
	gameCanvas.style.display = 'inline';
	results = drawWorld(tute);
	let goals = results[0];
	let car = results[1];
	listenerPressKey = function listener(event){
		pressKey(tute, goals, car);
	}
	document.addEventListener("keydown", listenerPressKey);
}

function startGame(){
	let now = new Date();
	let timestamp = now.getUTCFullYear() + "-" + (now.getUTCMonth() + 1) + "-" + now.getUTCDate()
				+ " " + now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds() 
				+ "." + now.getUTCMilliseconds();
	isTute = false;
	finishButton.style.display = 'inline-block';
	tuteDiv.style.display = 'none';
	gameCanvas.style.display = 'inline'; 
	let map;
	if (condition == "1"){
		map = firstTaskMap[gameIndex];
	}else if(condition == "2"){
		map = secondTaskMap[gameIndex];
	}else if(condition == "3"){
		map = thirdTaskMap[gameIndex];
	}
	results = drawWorld(map);
	let goals = results[0];
	let car = results[1];
	let seconds = MAX_TIME;
	countDown(seconds);
	saveData.push([timestamp, car.x, car.y, gameIndex, condition, participant]);
	listenerPressKey = function listener(event){
		pressKey(map, goals, car);
	}
	document.addEventListener("keydown", listenerPressKey);
}

function drawWorld(map){
	let goals = [];
	let car;
	el.innerHTML = '';
	for(let y = 0; y < map.length ; y = y + 1) {
		for(let x = 0; x < map[y].length ; x = x + 1) {		
			if (map[y][x] === 1) {
				el.innerHTML += "<div class='wall'></div>";
			}
			else if (map[y][x] === 2) {
				el.innerHTML += "<div class='blue'></div>";
				goals.push({"x": x, "y": y, "type": 2});
			}
			else if (map[y][x] === 3) {
				el.innerHTML += "<div class='ground'></div>";
			}
			else if (map[y][x] === 4) {
				el.innerHTML += "<div class='red'></div>";
				goals.push({"x": x, "y": y, "type": 4});
			}
			else if (map[y][x] === 5) {
				el.innerHTML += "<div class='car'></div>";
				car = {"x": x, "y": y};
				
			}
		}
		el.innerHTML += "<br>";
	}
	return [goals, car];
}

function countDown(seconds){
	timer.innerHTML = seconds;
	timeout = setTimeout("countDown("+(seconds-1)+")", 1000);
	if (seconds < 0){
		finish();
	}
}

function pressKey(map, goals, car){
	let numberGoals = goals.length;
	let i;
	let now = new Date();
	let timestamp = now.getUTCFullYear() + "-" + (now.getUTCMonth() + 1) + "-" + now.getUTCDate()
					+ " " + now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds() 
					+ "." + now.getUTCMilliseconds();
	if (event.keyCode === 37){ // car MOVE LEFT
		if (map[car.y][car.x-1] !== 1){
			for (i = 0; i < numberGoals; i++){
				if (car.y == goals[i].y && car.x == goals[i].x){
					map[car.y][car.x] = goals[i].type;
					break;
				}
			}

			if (i == numberGoals){
				map[car.y][car.x] = 3;
			}
			car.x = car.x - 1;
		}
	}else if (event.keyCode === 38){ // car MOVE UP
		if ( map[car.y-1][car.x] !== 1){
			for (i = 0; i < numberGoals; i++){
				if (car.y == goals[i].y && car.x == goals[i].x){
					map[car.y][car.x] = goals[i].type;
					break;
				}
			}
			if (i == numberGoals){
				map[car.y][car.x] = 3;
			}
			car.y = car.y - 1;
		}
	}
	else if (event.keyCode === 39){ // car MOVE RIGHT
		if ( map[car.y][car.x+1] !== 1){
			for (i = 0; i < numberGoals; i++){
				if (car.y == goals[i].y && car.x == goals[i].x){
					map[car.y][car.x] = goals[i].type;
					break;
				}
			}
			if (i == numberGoals){
				map[car.y][car.x] = 3;
			}
			car.x = car.x + 1;
		}
	}
	else if (event.keyCode === 40){ // car MOVE DOWN
		if ( map[car.y+1][car.x] !== 1){
			for (i = 0; i < numberGoals; i++){
				if (car.y == goals[i].y && car.x == goals[i].x){
					map[car.y][car.x] = goals[i].type;
					break;
				}
			}
			if (i == numberGoals){
				map[car.y][car.x] = 3;
			}
			car.y = car.y + 1;
		}
	}
	saveData.push([timestamp, car.x, car.y, gameIndex, condition, participant]);
	map[car.y][car.x] = 5;
	drawWorld(map);
}

function finish(){
	clearTimeout(timeout);
	timer.innerHTML = '';
	document.removeEventListener("keydown", listenerPressKey);
	finishButton.style.display = 'none';
	if (isTute){
		startBtn.style.display = 'inline-block';
		saveData = [];
	}else{
		nextButton.style.display = 'inline-block';
	}
}

function saveToCSV(fileName, saveData) {
	let csvContent = "";
	for (let i = 0; i < saveData.length; i++){
		let row = saveData[i].join(",");
		csvContent += row + "\r\n";
	}
	let blobObj = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	if (window.navigator.msSaveBlob){
		window.navigator.msSaveBlob(blobObj, fileName);
	}else{
		let link = document.createElement("a");
		let url = URL.createObjectURL(blobObj);
		link.setAttribute("href", url);
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

function nextGame() {
	gameIndex += 1;
	if (gameIndex >= totalMaps){
		alert('Congrats! You have done this round');
		nextButton.style.display = 'none';
		let downloadedFile = participant + "-" + condition + ".csv";
		saveToCSV(downloadedFile, saveData);
	}else{
		nextButton.style.display = 'none';
		// Change to next map 
		startGame();
	}
}