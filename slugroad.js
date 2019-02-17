var contractAddress="0x6cf592d1687041147a20c6cc1504715864a52752"; //ROPSTEN v1

//-- WEB3 DETECTION --//
var web3;

window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            //web3.eth.sendTransaction({/* ... */});
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        //web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        ////console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});
/* MODAL */

// Get the modals
var snag_modal = document.getElementById("snagmodal");
var start_modal = document.getElementById("startmodal");

// Close modal on game info
function CloseModal() {
	snag_modal.style.display = "none";
	start_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == snag_modal || event.target == start_modal) {
        snag_modal.style.display = "none";
		start_modal.style.display = "none";
    }
}

/* PAST EVENT LOG */

var timeLaunch = 1548516649;
var launchBlock = 7129676;

var startBlock = 0;
var ranLog = false;

function checkBlock(){
	web3.eth.getBlockNumber(function (error, result){
		console.log("block number is " + result);
		startBlock = result - 10000; //~half a day
	});
}

checkBlock();

/* VARIABLES */

var a_timer;
var a_speed;
var a_contractBalance;
var a_round = 0;
var a_roundPot;
var a_slugPot;
var a_thronePot;
var a_driver = "";
var a_driverMileOld = 0;
var a_driverMileNew = 0;
var a_etherDrained = 0;
var a_lastHijack;
var a_maxSlug;
var a_buyCost;
var a_getCost;
var a_playerSlug;
var a_playerBalance;
var a_playerDiv;
var a_playerMile;
var a_trade6000;
var a_mileReward;

var u_updateEvent = false;
var p_keepUpdating = false;

var s_hyperState = 0; //0: no hyperspeed, 1: hyperspeed, 2: round over

var f_buy;

var m_account = "waiting for web3";

var doc_contractBalance = document.getElementById('contractbalance');
var doc_round = document.getElementById('round');
var doc_roundPot = document.getElementById('roundpot');
var doc_hyperState = document.getElementById('hyperstate');
var doc_timer = document.getElementById('timer');
var doc_speed = document.getElementById('speed');
var doc_driver = document.getElementById('driver');
var doc_driverState = document.getElementById('driverstate');
var doc_slugPot = document.getElementById('slugpot');
var doc_thronePot = document.getElementById('thronepot');
var doc_buy200 = document.getElementById('buy200');
var doc_fieldBuySlug = document.getElementById('fieldBuySlug');
var doc_playerSlug = document.getElementById('playerslug');
var doc_playerReward = document.getElementById('playerreward');
var doc_playerMile = document.getElementById('playermile');
var doc_time200 = document.getElementById('time200');
var doc_timeGetSlug = document.getElementById('timeGetSlug');
var doc_trade6000Mile = document.getElementById('trade6000mile');
var doc_mileReward = document.getElementById('milereward');
var doc_maxSlug = document.getElementById('maxslug');
var doc_actionState = document.getElementById('actionstate');

/* UTILITIES */

//Truncates value to 3 decimals
function formatEthValue(_value){
    return parseFloat(parseFloat(_value).toFixed(3));
}

//Truncates value to 6 decimals
function formatEthValue2(_value){
    return parseFloat(parseFloat(_value).toFixed(6));
}

//Truncates ETH address to first 8 numbers, and add etherscan link
function formatEthAdr(adr){
	var _smallAdr = adr.substring(0, 10);
	var _stringLink = '<a href="https://etherscan.io/address/' + adr + '" target="_blank">' + _smallAdr + '</a>';
	return _stringLink;
}

//Adds spaces between integers
function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

//Conversion of Date to hh:mm:ss
var datetext;

function date24() {
	d = new Date();
	datetext = d.toTimeString();
	datetext = datetext.split(' ')[0];
}	

//Get timestamp for log
function dateLog(_blockNumber) {
	d = new Date((timeLaunch + ((_blockNumber - launchBlock) * 16)) * 1000);
	//////console.log(d);
	datetext = d.toTimeString();
	datetext = datetext.split(' ')[0];
}

/* UPDATE */

function initUpdate(){
	mainUpdate();
	fastUpdate();
	veryFastUpdate();
}	

function mainUpdate(){
	updateEthAccount();
	updateContractBalance();
	updateRound();
	updateSlugPot();
	updateRoundPot();
	updateThronePot();
	updateSpeed();
	updateDriver();
	updateDriverMileOld();
	updateDriverMileNew();
	if(s_hyperState > 0){
		updateEtherDrained();
	}
	updateBuySlugCost();
	updateGetSlugCost();
	updatePlayerSlug();
	updatePlayerMile();
	updatePlayerBalance();
	updatePlayerDiv();
	updateTrade6000Reward();
	updateMileReward();
	updateMaxSlug();
	updateTimer();
	updateLog();
	updateText();
	setTimeout(mainUpdate, 4000);
}

function fastUpdate(){
	updateLocalTimer();
	updateFieldBuy();
	setTimeout(fastUpdate, 123);
}

//Updates all text from web3 calls

function updateText(){
	doc_contractBalance.innerHTML = a_contractBalance;
	doc_round.innerHTML = a_round;	
	doc_roundPot.innerHTML = a_roundPot;
	doc_slugPot.innerHTML = a_slugPot;
	doc_thronePot.innerHTML = a_thronePot;	
	doc_buy200.innerHTML = parseFloat(a_buyCost * 200).toFixed(4);
	doc_playerSlug.innerHTML = a_playerSlug;
	doc_playerReward.innerHTML = a_playerBalance + a_playerDiv;
	doc_playerMile.innerHTML = a_playerMile;
	doc_time200.innerHTML = parseFloat(a_getCost * 200).toFixed(4);
	doc_trade6000Mile.innerHTML = a_trade6000;
	doc_mileReward.innerHTML = a_mileReward;
	doc_maxSlug.innerHTML = a_maxSlug;
	doc_timeGetSlug.innerHTML = parseInt((a_playerDiv + a_playerBalance) / (a_getCost));
	
	if(a_driver == m_account){
		doc_driver.innerHTML = 'YOU';
	} else {
		doc_driver.innerHTML = formatEthAdr(a_driver);
	}
	
	if(s_hyperState == 0){
		if(a_driver == m_account){
			doc_driverState.innerHTML = ' hold the wheel!<br> Distance driven: ' + parseInt(a_driverMileOld + a_driverMileNew) + ' miles';
			doc_actionState.innerHTML = '<h4>KEEP GOING!</h4>';
		} else {
			doc_driverState.innerHTML = ' holds the wheel!<br> Distance driven: ' + parseInt(a_driverMileOld + a_driverMileNew) + ' miles';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="webThrowSlug()">THROW SLUGS</button>';
		}
		doc_hyperState.innerHTML = 'Entering Hyperspeed in:';
		doc_speed.innerHTML = a_speed;	
	} else if (s_hyperState == 1) {
		if(a_driver == m_account){
			doc_driverState.innerHTML = ' drain the pot!<br> Ether drained: ' + parseInt(a_driverMileOld + a_driverMileNew) + ' ETH';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="webJumpOut()">JUMP OUT</button>';
		} else {
			doc_driverState.innerHTML = ' drains the pot!<br> Ether drained: ' + parseInt(a_driverMileOld + a_driverMileNew) + ' ETH';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="webThrowSlug()">THROW SLUGS</button>';
		}
		doc_hyperState.innerHTML = 'HYPERSPEED! Time Jump in:';
		doc_speed.innerHTML = a_speed;
	} else if (s_hyperState == 2) {
		doc_driverState.innerHTML = ' WON THE POT!<br> Press "Time Jump" to start a new race';
		doc_hyperState.innerHTML = 'TIME JUMP READY!';
		doc_speed.innerHTML = 'Infinity';
		doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="webTimeJump()">TIME JUMP</button>';
	}
}

//Changes u_updateLog to true, manual choice in case event watching fails
function startLogging(){
	u_updateEvent = true;
}

//Update log every few seconds if player chose to
function updateLog(){
	if(u_updateEvent == true || p_keepUpdating == true){
		runLog();
	}
}
		
/* WEB3 CALLS */

//Current ETH address in use
function updateEthAccount(){
	m_account = web3.eth.accounts[0];
}

//Current ETH balance in contract
function updateContractBalance(){
	web3.eth.getBalance(contractAddress, function(error, result) {
		if(!error) {
			a_contractBalance = formatEthValue(web3.fromWei(result, 'ether')); 
		}
	});
}

//Current game round
function updateRound(){
	round(function(result) {
		a_round = result;
	});
}

//Timer, check if we're in hyperspeed
function updateTimer(){
	timer(function(result){
		a_timer = result;
	});
}

//Local timer update
function updateLocalTimer(){
	var _blocktime = (new Date()).getTime(); //current "blocktime" in milliseconds
	var _timer = a_timer * 1000 - _blocktime;
		
	if(_timer < 0){ //if under 0, the round is over
		s_hyperState = 2;
		doc_timer.innerHTML = 'TIMEJUMP READY!';
	} else if(_timer <= 3600000){ //if under 1 hour, we're in hyperspeed
		s_hyperState = 1;
	} else {
		s_hyperState = 0;
		_timer = _timer - 3600000; //remove 1 hour, as we show the time before hyperspeed
	}
	
	if(_timer < 0 && _timer > -60000){ //for a minute after we hit 0, wait for blockchain confirmation
		doc_timer.innerHTML = 'On the edge of timejump...';
	}
		
	if(s_hyperState < 2){
		var _hours = Math.floor(_timer / 3600000);
		if(_hours < 10) { _hours = "0" + _hours }
		var _minutes = Math.floor((_timer % 3600000) / 60);
		if(_minutes < 10) { _minutes = "0" + _minutes }
		var _seconds = Math.floor(((_timer % 3600000) % 60) / 60);
		if(_seconds < 10) { _seconds = "0" + _seconds }
		var _milliseconds = parseInt(((_timer % 3600000) % 60) % 60);
		if(_milliseconds < 100) { _milliseconds = "0" + _milliseconds }
		if(_milliseconds < 10) { _milliseconds = "00" + _milliseconds }
		
		doc_timer.innerHTML = _hours + ":" + _minutes + ":" + _seconds + "." + _milliseconds;
	}
}

//Local speed update
function updateLocalSpeed(){}

//Current slug pot
function updateSlugPot(){
	slugPot(function(result) {
		a_slugPot = formatEthValue(web3.fromWei(result,'ether'));
	});
}

//Current roundpot
function updateRoundPot(){
	roundPot(function(result) {
		a_roundPot = formatEthValue(web3.fromWei(result,'ether'));
	});
}

//Current throne pot
function updateThronePot(){
	thronePot(function(result) {
		a_thronePot = formatEthValue(web3.fromWei(result,'ether'));
	});
}

//Current speed
function updateSpeed(){
	var _blocktime = Math.round((new Date()).getTime() / 1000); //current blocktime should be Unix timestamp
	ComputeSpeed(_blocktime, function(result) {
		a_speed = result;
	});
}

//Current driver
function updateDriver(){
	driver(function(result) {
		a_driver = "0x" + result.substring(26, 66);
	});
}

//Current driver miles
function updateDriverMileOld(){
	GetMile(a_driver, function(result) {
		a_driverMileOld = result;
	});
}

function updateDriverMileNew(){
	ComputeMileDriven(function(result) {
		a_driverMileNew = result;
	});
}

//Current ether drained
function updateEtherDrained(){
	ComputeHyperReward(function(result) {
		a_etherDrained = formatEthValue2(web3.fromWei(result,'ether'));
	});
}
		
//Current player balance
function updatePlayerBalance(){
	GetBalance(m_account, function(result) {
		a_playerBalance = formatEthValue(web3.fromWei(result,'ether'));		
	});
}

//Current player divs
function updatePlayerDiv(){
	ComputeDiv(m_account, function(result) {
		a_playerDiv = formatEthValue(web3.fromWei(result,'ether'));		
	});
}

//Current player slug
function updatePlayerSlug(){
	GetNest(m_account, function(result) {
		a_playerSlug = result;		
	});
}

//Current player mile
function updatePlayerMile(){
	if(m_account != a_driver){
		GetMile(m_account, function(result) {
			a_playerMile = result;
		});
	} else {
		a_playerMile = parseInt(a_driverMileOld + a_driverMileNew);
	}
}

//Current max slug
function updateMaxSlug(){
	maxSlug(function(result) {
		a_maxSlug = result;
	});
}

//Current cost for buying slugs
function updateBuySlugCost(){
	ComputeSlugCost(true, function(result) {
		a_buyCost =	formatEthValue2(web3.fromWei(result,'ether'));
	});
}

//Current cost for getting slugs through time
function updateGetSlugCost(){
	ComputeSlugCost(false, function(result) {
		a_getCost =	formatEthValue2(web3.fromWei(result,'ether'));
	});
}

//Current reward for trading 6000 miles
function updateTrade6000Reward(){
	ComputeMileReward(1, function(result) {
		a_trade6000 = formatEthValue2(web3.fromWei(result,'ether'));
	});
}

//Current reward for trading player miles
function updateMileReward(){
	ComputeMileReward(parseInt(a_playerMile / 6000), function(result) {
		a_mileReward = formatEthValue2(web3.fromWei(result,'ether'));
	});
}

/* LOCAL FIELD INPUT */

//Player input on buy
function updateFieldBuy(){
	f_buy = document.getElementById('fieldBuy').value;
	if(f_buy > 1){
		f_buy = 1;
	}
	doc_fieldBuySlug.innerHTML = parseInt(f_buy / a_buyCost);
}

/* WEB3 TRANSACTIONS */

//Buy Slug
function webBuySlug(){
	var weitospend = web3.toWei(f_buy,'ether');
	BuySlug(weitospend, function(){
	});
}

//Throw Slug
function webThrowSlug(){
	ThrowSlug(function(){
	});
}

//Skip Time
function webSkipAhead(){
	SkipAhead(function(){
	});
}

//Trade Mile
function webTradeMile(){
	TradeMile(function(){
	});
}

//Jump Out
function webJumpOut(){
	JumpOut(function(){
	});
}

//Time Jump
function webTimeJump(){
	TimeJump(function(){
	});
}

//Withdraw balance
function webWithdrawBalance(){
	WithdrawBalance(function(){
	});
}

//Pay Throne
function webPayThrone(){
	PayThrone(function(){
	});
}


/* CONTRACT ABI */

abiDefinition=[{"constant": true,"inputs": [],"name": "lastHijack","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "SLUG_COST_FLOOR","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetMile","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "round","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "TradeMile","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "MILE_REQ","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "RACE_TIMER_START","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "MAX_SPEED","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "slugNest","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "THROW_SLUG_REQ","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "ThrowSlug","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "roundPot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetBalance","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "SNAILTHRONE","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "TOKEN_MAX_BUY","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "mile","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "playerBalance","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "slugPot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_ether","type": "uint256"},{"name": "_isBuy","type": "bool"}],"name": "ComputeBuy","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "gameStarted","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "driver","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "ComputeDiv","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "maxSlug","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetNest","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_time","type": "uint256"}],"name": "ComputeSpeed","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "timer","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "HYPERSPEED_LENGTH","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "claimedDiv","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_reqMul","type": "uint256"}],"name": "ComputeMileReward","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "MIN_SPEED","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "DRIVER_TIMER_BOOST","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "WithdrawBalance","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [],"name": "SkipAhead","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "thronePot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "StartRace","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": true,"inputs": [],"name": "DIV_SLUG_COST","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "ACCEL_FACTOR","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "BuySlug","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": true,"inputs": [],"name": "divPerSlug","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "ComputeMileDriven","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "TimeJump","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "ComputeHyperReward","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_isBuy","type": "bool"}],"name": "ComputeSlugCost","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "JumpOut","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "hyperSpeed","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "starter","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"inputs": [],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"payable": true,"stateMutability": "payable","type": "fallback"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "WithdrewBalance","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "slug","type": "uint256"}],"name": "BoughtSlug","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "slug","type": "uint256"}],"name": "SkippedAhead","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "mile","type": "uint256"}],"name": "TradedMile","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "BecameDriver","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "TookWheel","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "ThrewSlug","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "JumpedOut","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": true,"name": "round","type": "uint256"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "TimeJumped","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": true,"name": "round","type": "uint256"}],"name": "NewRound","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "round","type": "uint256"}],"name": "BeganRound","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "PaidThrone","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "BoostedPot","type": "event"}]

var contractAbi = web3.eth.contract(abiDefinition);
var myContract = contractAbi.at(contractAddress);

function lastHijack(callback){

    var outputData = myContract.lastHijack.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('lastHijack ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function SLUG_COST_FLOOR(callback){
    
    
    var outputData = myContract.SLUG_COST_FLOOR.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('SLUG_COST_FLOOR ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function GetMile(_player,callback){
    
    
    var outputData = myContract.GetMile.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('GetMile ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function round(callback){
    
    
    var outputData = myContract.round.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('round ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function TradeMile(callback){
    
    
    var outputData = myContract.TradeMile.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('TradeMile ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function MILE_REQ(callback){
    
    
    var outputData = myContract.MILE_REQ.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('MILE_REQ ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function RACE_TIMER_START(callback){
    
    
    var outputData = myContract.RACE_TIMER_START.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('RACE_TIMER_START ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function MAX_SPEED(callback){
    
    
    var outputData = myContract.MAX_SPEED.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('MAX_SPEED ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function slugNest(callback){
    
    
    var outputData = myContract.slugNest.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('slugNest ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function THROW_SLUG_REQ(callback){
    
    
    var outputData = myContract.THROW_SLUG_REQ.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('THROW_SLUG_REQ ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ThrowSlug(callback){
    
    
    var outputData = myContract.ThrowSlug.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ThrowSlug ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function roundPot(callback){
    
    
    var outputData = myContract.roundPot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('roundPot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function GetBalance(_player,callback){
    
    
    var outputData = myContract.GetBalance.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('GetBalance ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function SNAILTHRONE(callback){
    
    
    var outputData = myContract.SNAILTHRONE.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('SNAILTHRONE ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function TOKEN_MAX_BUY(callback){
    
    
    var outputData = myContract.TOKEN_MAX_BUY.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('TOKEN_MAX_BUY ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function mile(callback){
    
    
    var outputData = myContract.mile.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('mile ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function playerBalance(callback){
    
    
    var outputData = myContract.playerBalance.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('playerBalance ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function slugPot(callback){
    
    
    var outputData = myContract.slugPot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('slugPot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeBuy(_ether,_isBuy,callback){
    
    
    var outputData = myContract.ComputeBuy.getData(_ether,_isBuy);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeBuy ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function gameStarted(callback){
    
    
    var outputData = myContract.gameStarted.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('gameStarted ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function driver(callback){
    
    
    var outputData = myContract.driver.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('driver ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeDiv(_player,callback){
    
    
    var outputData = myContract.ComputeDiv.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeDiv ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function maxSlug(callback){
    
    
    var outputData = myContract.maxSlug.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('maxSlug ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function GetNest(_player,callback){
    
    
    var outputData = myContract.GetNest.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('GetNest ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeSpeed(_time,callback){
    
    
    var outputData = myContract.ComputeSpeed.getData(_time);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeSpeed ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function timer(callback){
    
    
    var outputData = myContract.timer.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('timer ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function HYPERSPEED_LENGTH(callback){
    
    
    var outputData = myContract.HYPERSPEED_LENGTH.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('HYPERSPEED_LENGTH ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function claimedDiv(callback){
    
    
    var outputData = myContract.claimedDiv.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('claimedDiv ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeMileReward(_reqMul,callback){
    
    
    var outputData = myContract.ComputeMileReward.getData(_reqMul);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeMileReward ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function MIN_SPEED(callback){
    
    
    var outputData = myContract.MIN_SPEED.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('MIN_SPEED ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function DRIVER_TIMER_BOOST(callback){
    
    
    var outputData = myContract.DRIVER_TIMER_BOOST.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('DRIVER_TIMER_BOOST ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function WithdrawBalance(callback){
    
    
    var outputData = myContract.WithdrawBalance.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('WithdrawBalance ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function SkipAhead(callback){
    
    
    var outputData = myContract.SkipAhead.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('SkipAhead ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function thronePot(callback){
    
    
    var outputData = myContract.thronePot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('thronePot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function StartRace(eth,callback){
    
    
    var outputData = myContract.StartRace.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData,value: eth},
    function(error,result){
        if(!error){
            //console.log('StartRace ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function DIV_SLUG_COST(callback){
    
    
    var outputData = myContract.DIV_SLUG_COST.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('DIV_SLUG_COST ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ACCEL_FACTOR(callback){
    
    
    var outputData = myContract.ACCEL_FACTOR.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ACCEL_FACTOR ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function BuySlug(eth,callback){
    
    
    var outputData = myContract.BuySlug.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData,value: eth},
    function(error,result){
        if(!error){
            //console.log('BuySlug ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function divPerSlug(callback){
    
    
    var outputData = myContract.divPerSlug.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('divPerSlug ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeMileDriven(callback){
    
    
    var outputData = myContract.ComputeMileDriven.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeMileDriven ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function TimeJump(callback){
    
    
    var outputData = myContract.TimeJump.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('TimeJump ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeHyperReward(callback){
    
    
    var outputData = myContract.ComputeHyperReward.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeHyperReward ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeSlugCost(_isBuy,callback){
    
    
    var outputData = myContract.ComputeSlugCost.getData(_isBuy);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('ComputeSlugCost ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function JumpOut(callback){
    
    
    var outputData = myContract.JumpOut.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('JumpOut ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function hyperSpeed(callback){
    
    
    var outputData = myContract.hyperSpeed.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('hyperSpeed ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}


function starter(callback){
    
    
    var outputData = myContract.starter.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            //console.log('starter ',result);
            callback(result)
        }
        else{
            //console.log('transaction failed with ',error.message)
        }
    });
}

/* EVENT WATCH */

//Store transaction hash for each event, and check before executing result, as web3 events fire twice
var storetxhash = [];

//Check equivalency
function checkHash(txarray, txhash) {
	var i = 0;
	do {
		if(txarray[i] == txhash) {
			return 0;
		}
		i++;
	}
	while(i < txarray.length);
	//Add new tx hash
	txarray.push(txhash);
	//Remove first tx hash if there's more than 16 hashes saved
	if(txarray.length > 16) {
		txarray.shift();
	}
}

//Compute Leaderboard

function computeLeaderboard() {
	var lowest = d_leaderboard[0].egg;
	var position = 0; 
	
	//Check lowest leader
	var i = 0;
	for(i = 0; i < 5; i++) {
		if(d_leaderboard[i].egg < lowest) {
			lowest = d_leaderboard[i].egg;
			position = i;
		}
	}
	
	//Check if new player is already on leaderboard, then check if new player can replace lowest
	var notLeader = true;
	for(k = 0; k < 5; k++) {
		if(e_challenger.address == d_leaderboard[k].address) {
			d_leaderboard[k].address = e_challenger.address;
			d_leaderboard[k].egg = e_challenger.egg;
			notLeader = false;
		}
	}

	var newEntry = false;
	if(notLeader == true && e_challenger.egg > lowest) {
		d_leaderboard[position].address = e_challenger.address;
		d_leaderboard[position].egg = e_challenger.egg;
		newEntry = true;
	}
}

// Wipe Leaderboard (run this after a "won round" event on Round end

function wipeLeaderboard(){
	for(i = 0; i < 5; i++) {
		d_leaderboard[i].address = "0x0000000022223333444455556666777788889999";
		d_leaderboard[i].egg = 0;
	}
}

/* EVENTS */

var logboxscroll = document.getElementById('logboxscroll');
var eventlogdoc = document.getElementById("eventlog");

var e_challenger = { address: "", egg: 0 };

function runLog(){
	ranLog = true;
	myContract.allEvents({ fromBlock: startBlock, toBlock: 'latest' }).get(function(error, result){
		if(!error){
			//console.log(result);
			var i = 0;
			if(result.length > 0){ //check if we have events, if not stop the loop
				p_keepUpdating = true;
				for(i = 0; i < 40; i++){ //loop through only 40 events at most
					if(i < result.length){ //make sure there's enough events
						if(checkHash(storetxhash, result[i].transactionHash) != 0) {
							startBlock = result[i].blockNumber; //store the last blocknumber to start next loop
							dateLog(result[i].blockNumber);
							if(result[i].event == "WithdrewBalance"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result[i].args.player) + " withdrew " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH to their wallet.";								
							} else if(result[i].event == "BoughtSlug"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " bought " + result.args.slug + " slugs for " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH.";		
							} else if(result[i].event == "SkippedAhead"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " skipped in time, and got " + result.args.slug + " slugs for " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH!";
							} else if(result[i].event == "TradedMile"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " traded " + parseInt((result.args.mile) * 6000) + " miles. Their reward: " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH.";			
							} else if(result[i].event == "BecameDriver"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " became the driver. Onwards to hyperspeed!";
							} else if(result[i].event == "TookWheel"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " took the wheel! They're next in line to win " + a_roundPot + " ETH.";
							} else if(result[i].event == "ThrewSlug"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " threw slugs at the windshield! The car swerves...";
							} else if(result[i].event == "JumpedOut"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " jumped out of the car, snatching " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH on their way out!";
							} else if(result[i].event == "TimeJumped"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] TIME JUMP! Loop " + parseInt(result.args.round - 1) + " is over. " + formatEthAdr(result.args.player) + " drove the car to the future and won " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH. Loop " + result.args.round + " starts!";							
							} else if(result[i].event == "NewRound"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] TIME PARADOX! Loop " + parseInt(result.args.round - 1) + " ends without a driver in car. Begin Loop " + result.args.round + "...";								
							} else if(result[i].event == "PaidThrone"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " paid tribute to the SnailThrone! " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH has been sent.";										
							} else if(result[i].event == "BoostedPot"){
								eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result[i].args.player) + " makes a generous " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH donation to the SlugPot.";
							}
							logboxscroll.scrollTop = logboxscroll.scrollHeight;
						}
					}	
				}
			} else {
				p_keepUpdating = false;
			}
		}
		else{
			////console.log("problem!");
		}
	});
}

/* Events */

var withdrewbalanceEvent = myContract.WithdrewBalance();
withdrewbalanceEvent.watch(function(error, result){
    if(!error){
		////////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " withdrew " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH to their wallet.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var boughtslugEvent = myContract.BoughtSlug();
boughtslugEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " bought " + result.args.slug + " slugs for " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});	

var skippedaheadEvent = myContract.SkippedAhead();
skippedaheadEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " skipped in time, and got " + result.args.slug + " slugs for " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH!";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});	

var tradedmileEvent = myContract.TradedMile();
tradedmileEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " traded " + parseInt((result.args.mile) * 6000) + " miles. Their reward: " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});	

var becamedriverEvent = myContract.BecameDriver();
becamedriverEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " became the driver. Onwards to hyperspeed!";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var tookwheelEvent = myContract.TookWheel();
tookwheelEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " took the wheel! They're next in line to win " + a_roundPot + " ETH.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var threwslugEvent = myContract.ThrewSlug();
tookwheelEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " threw slugs at the windshield! The car swerves...";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var jumpedoutEvent = myContract.JumpedOut();
jumpedoutEvent.watch(function(error, result){
    if(!error){
		//////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " jumped out of the car, snatching " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH on their way out!";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});					

var timejumpedEvent = myContract.TimeJumped();
timejumpedEvent.watch(function(error, result){
    if(!error){
		////////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] TIME JUMP! Loop " + parseInt(result.args.round - 1) + " is over. " + formatEthAdr(result.args.player) + " drove the car to the future and won " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH. Loop " + result.args.round + " starts!";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var newroundEvent = myContract.NewRound();
newroundEvent.watch(function(error, result){
    if(!error){
		////////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] TIME PARADOX! Loop " + parseInt(result.args.round - 1) + " ends without a driver in car. Begin Loop " + result.args.round + "...";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var paidthroneEvent = myContract.PaidThrone();
paidthroneEvent.watch(function(error, result){
    if(!error){
		////////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " paid tribute to the SnailThrone! " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH has been sent.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var boostedpotEvent = myContract.BoostedPot();
boostedpotEvent.watch(function(error, result){
    if(!error){
		////////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " makes a generous " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH donation to the SlugPot.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

/*
const filter = { fromBlock: launchBlock, toBlock: 'latest'}; // filter for your address
const events = myContract.allEvents(filter); // get all events
//////console.log(events);
*/
