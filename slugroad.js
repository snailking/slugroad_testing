var contractAddress="0x5d73fc88197397988d12d09ba8142d8ebd59172f"; //ROPSTEN v1

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
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
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

var twoDaysBlock = 0;
var ranLog = false;

function checkBlock(){
	web3.eth.getBlockNumber(function (error, result){
		twoDaysBlock = result - 12000;
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
var a_driverMile = 0;
var a_etherDrained = 0;
var a_lastHijack;
var a_maxSlug;
var a_buyCost;
var a_getCost;
var a_playerSlug;
var a_playerBalance;
var a_playerMile;
var a_tradeMile;

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
var doc_playerBalance = document.getElementById('playerbalance');
var doc_playerMile = document.getElementById('playermile');
var doc_time200 = document.getElementById('time200');
var doc_timeGetSlug = document.getElementById('timeGetSlug');
var doc_trade6000Mile = document.getElementById('trade6000mile');
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
	//console.log(d);
	datetext = d.toTimeString();
	datetext = datetext.split(' ')[0];
}

/* UPDATE */

function initUpdate(){
	mainUpdate();
	fastUpdate();
}	

function mainUpdate(){
	updateEthAccount();
	updateContractBalance();
	updateRound();
	updateSlugPot();
	updateRoundPot();
	updateThronePot();
	updateDriver();
	updateDriverMile();
	updateTimer();
	updateText();
	setTimeout(mainUpdate, 4000);
}

function fastUpdate(){
	updateLocalTimer();
	setTimeout(fastUpdate, 1000);
}

//Updates all text from web3 calls

function updateText(){
	doc_contractBalance.innerHTML = a_contractBalance;
	doc_round.innerHTML = a_round;	
	doc_roundPot.innerHTML = a_roundPot;
	doc_slugPot.innerHTML = a_slugPot;
	doc_thronePot.innerHTML = a_thronePot;	
	doc_buy200.innerHTML = a_buyCost * 200;
	doc_playerSlug.innerHTML = a_playerSlug;
	doc_playerBalance.innerHTML = a_playerBalance;
	doc_playerMile.innerHTML = a_playerMile;
	doc_time200.innerHTML = a_getCost * 200;
	doc_trade6000Mile.innerHTML = a_tradeMile;
	doc_maxSlug.innerHTML = a_maxSlug;
	
	if(a_driver == m_account){
		doc_driver.innerHTML = 'YOU';
	} else {
		doc_driver.innerHTML = formatEthAdr(a_driver);
	}
	
	if(s_hyperState == 0){
		if(a_driver == m_account){
			doc_driverState.innerHTML = ' hold the wheel!<br> Distance driven: ' + a_driverMile + ' miles';
			doc_actionState.innerHTML = 'KEEP GOING!';
		} else {
			doc_driverState.innerHTML = ' holds the wheel!<br> Distance driven: ' + a_driverMile + ' miles';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="">THROW SLUGS</button>';
		}
		doc_hyperState.innerHTML = 'Entering Hyperspeed in:';
		doc_speed.innerHTML = a_speed;	
	} else if (s_hyperState == 1) {
		if(a_driver == m_account){
			doc_driverState.innerHTML = ' drain the pot!<br> Ether drained: ' + a_etherDrained + ' ETH';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="">JUMP OUT</button>';
		} else {
			doc_driverState.innerHTML = ' drains the pot!<br> Ether drained: ' + a_etherDrained + ' ETH';
			doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="">THROW SLUGS</button>';
		}
		doc_hyperState.innerHTML = 'HYPERSPEED! Time Jump in:';
		doc_speed.innerHTML = a_speed;
	} else if (s_hyperState == 2) {
		doc_driverState.innerHTML = ' WON THE POT!<br> Press "Time Jump" to start a new race';
		doc_hyperState.innerHTML = 'TIME JUMP READY!';
		doc_speed.innerHTML = 'Infinity';
		doc_actionState.innerHTML = '<button type="button" class="btn btn-lg btn-info" onclick="">TIME JUMP</button>';
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
	}
}

//Local timer update
function updateLocalTimer(){
	var _blocktime = Math.round((new Date()).getTime() / 1000); //current blocktime should be Unix timestamp
	var _timer = a_timer - _blocktime;
		
	if(_timer < 0){ //if under 0, the round is over
		s_hyperState = 2;
		doc_timer.innerHTML = 'The race is over!';
	} else if(_timer <= 3600){ //if under 1 hour, we're in hyperspeed
		s_hyperState = 1;
	} else {
		s_hyperState = 0;
		_timer = _timer - 3600; //remove 1 hour, as we show the time before hyperspeed
	}
		
	if(s_hyperState < 2){
		var _hours = Math.floor(_timer / 3600);
		if(_hours < 10) { _hours = "0" + _hours }
		var _minutes = Math.floor((_timer % 3600) / 60);
		if(_minutes < 10) { _minutes = "0" + _minutes }
		var _seconds = parseFloat((_timer % 3600) % 60).toFixed(0);
		if(_seconds < 10) { _seconds = "0" + _seconds }
			
		doc_timer.innerHTML = _hours + ":" + _minutes + ":" + _seconds;
	}
}

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

//Current driver
function updateDriver(){
	driver(function(result) {
		a_driver = "0x" + result.substring(26, 66);
	});
}

//Current driver miles
function updateDriverMile(){
	GetMile(a_driver, function(result) {
		a_driverMile = result;
	});
}
		
//Current player balance
function updatePlayerBalance(){
	GetBalance(m_account, function(result) {
		a_playerBalance = formatEthValue(web3.fromWei(result,'ether'));		
	});
}

//Current player slug
function updatePlayerSlug(){
	GetSlug(m_account, function(result) {
		a_playerSlug = result;		
	});
}

//Current player mile
function updatePlayerMile(){
	GetMile(m_account, function(result) {
		a_playerMile = result;
	});
}


//Change snail owner text
function changeSnailOwnerText(_id){
	if(a_snailOwner[_id] == m_account){
		doc_snailOwner[_id].innerHTML = "YOU!";
	} else {
		doc_snailOwner[_id].innerHTML = formatEthAdr(a_snailOwner[_id]);
	}
}

//Update snail cost
function updateSnailCost(_id){
	a_snailCost[_id] = (a_snailLevel[_id] + 1) * 0.01;
}

//Change text
function changeText(_id, _doc, _a){
	_doc[_id].innerHTML = _a[_id];
}

//Check lord cost
function checkLordCost(_id){
	ComputeLordCost(_id, function(result) {
		a_lordCost[_id] = formatEthValue(web3.fromWei(result,'ether'));
	});
}

//Check lord owner
function checkLordOwner(_id){
	GetLordOwner(_id, function(result) {
		a_lordOwner[_id] = "0x" + result.substring(26, 66);
	});
}

//Change lord owner text
function changeLordOwnerText(_id){
	if(a_lordOwner[_id] == m_account){
		doc_lordOwner[_id].innerHTML = "YOU!";
	} else {
		doc_lordOwner[_id].innerHTML = formatEthAdr(a_lordOwner[_id]);
	}
}

/* WEB3 TRANSACTIONS */

//Begin Round
function webBeginRound(){
	BeginRound(function(){
	});
}

//Grab snail
function webGrabSnail(_id){
	var weitospend = web3.toWei(a_snailCost[_id],'ether');
	GrabSnail(_id, weitospend, function(){
	});
}

//Snag eggs
function webSnagEgg(_id){
	var weitospend = web3.toWei(a_snagCost,'ether');
	SnagEgg(_id, weitospend, function(){
	});
}

//Claim lord
function webClaimLord(_id){
	var weitospend = web3.toWei(a_lordCost[_id],'ether');
	ClaimLord(_id, weitospend, function(){
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


abiDefinition=[{"constant": true,"inputs": [],"name": "lastHijack","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "SLUG_COST_FLOOR","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetMile","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "round","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "TradeMile","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "MILE_REQ","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "RACE_TIMER_START","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "MAX_SPEED","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "TimeTravel","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "slugNest","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "THROW_SLUG_REQ","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "ThrowSlug","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "roundPot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetBalance","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "WinRace","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "SNAILTHRONE","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "TOKEN_MAX_BUY","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "mile","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "playerBalance","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "slugPot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_ether","type": "uint256"},{"name": "_isBuy","type": "bool"}],"name": "ComputeBuy","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "gameStarted","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "driver","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "ComputeDiv","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "maxSlug","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_player","type": "address"}],"name": "GetNest","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_time","type": "uint256"}],"name": "ComputeSpeed","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "timer","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "HYPERSPEED_LENGTH","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "claimedDiv","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_mile","type": "uint256"}],"name": "ComputeMileReward","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "MIN_SPEED","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "DRIVER_TIMER_BOOST","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "WithdrawBalance","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "thronePot","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "StartRace","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": true,"inputs": [],"name": "DIV_SLUG_COST","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "ACCEL_FACTOR","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "BuySlug","outputs": [],"payable": true,"stateMutability": "payable","type": "function"},{"constant": true,"inputs": [],"name": "divPerSlug","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "ComputeMileDriven","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "ComputeHyperReward","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_isBuy","type": "bool"}],"name": "ComputeSlugCost","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "JumpOut","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "hyperSpeed","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "starter","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"inputs": [],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"payable": true,"stateMutability": "payable","type": "fallback"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "WithdrewBalance","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "slug","type": "uint256"}],"name": "BoughtSlug","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "slug","type": "uint256"}],"name": "TimeTraveled","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"},{"indexed": false,"name": "mile","type": "uint256"}],"name": "TradedMile","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "BecameDriver","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "TookWheel","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"}],"name": "ThrewSlug","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "JumpedOut","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": true,"name": "round","type": "uint256"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "WonRace","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": true,"name": "round","type": "uint256"}],"name": "NewRound","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "round","type": "uint256"}],"name": "BeganRound","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "PaidThrone","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "player","type": "address"},{"indexed": false,"name": "eth","type": "uint256"}],"name": "BoostedPot","type": "event"}]

var contractAbi = web3.eth.contract(abiDefinition);
var myContract = contractAbi.at(contractAddress);

function lastHijack(callback){

    var outputData = myContract.lastHijack.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('lastHijack ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function SLUG_COST_FLOOR(callback){
    
    
    var outputData = myContract.SLUG_COST_FLOOR.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('SLUG_COST_FLOOR ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function GetMile(_player,callback){
    
    
    var outputData = myContract.GetMile.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('GetMile ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function round(callback){
    
    
    var outputData = myContract.round.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('round ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function TradeMile(callback){
    
    
    var outputData = myContract.TradeMile.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('TradeMile ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function MILE_REQ(callback){
    
    
    var outputData = myContract.MILE_REQ.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('MILE_REQ ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function RACE_TIMER_START(callback){
    
    
    var outputData = myContract.RACE_TIMER_START.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('RACE_TIMER_START ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function MAX_SPEED(callback){
    
    
    var outputData = myContract.MAX_SPEED.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('MAX_SPEED ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function TimeTravel(callback){
    
    
    var outputData = myContract.TimeTravel.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('TimeTravel ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function slugNest(callback){
    
    
    var outputData = myContract.slugNest.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('slugNest ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function THROW_SLUG_REQ(callback){
    
    
    var outputData = myContract.THROW_SLUG_REQ.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('THROW_SLUG_REQ ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ThrowSlug(callback){
    
    
    var outputData = myContract.ThrowSlug.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ThrowSlug ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function roundPot(callback){
    
    
    var outputData = myContract.roundPot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('roundPot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function GetBalance(_player,callback){
    
    
    var outputData = myContract.GetBalance.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('GetBalance ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function WinRace(callback){
    
    
    var outputData = myContract.WinRace.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('WinRace ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function SNAILTHRONE(callback){
    
    
    var outputData = myContract.SNAILTHRONE.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('SNAILTHRONE ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function TOKEN_MAX_BUY(callback){
    
    
    var outputData = myContract.TOKEN_MAX_BUY.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('TOKEN_MAX_BUY ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function mile(callback){
    
    
    var outputData = myContract.mile.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('mile ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function playerBalance(callback){
    
    
    var outputData = myContract.playerBalance.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('playerBalance ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function slugPot(callback){
    
    
    var outputData = myContract.slugPot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('slugPot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeBuy(_ether,_isBuy,callback){
    
    
    var outputData = myContract.ComputeBuy.getData(_ether,_isBuy);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeBuy ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function gameStarted(callback){
    
    
    var outputData = myContract.gameStarted.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('gameStarted ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function driver(callback){
    
    
    var outputData = myContract.driver.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('driver ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeDiv(_player,callback){
    
    
    var outputData = myContract.ComputeDiv.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeDiv ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function maxSlug(callback){
    
    
    var outputData = myContract.maxSlug.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('maxSlug ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function GetNest(_player,callback){
    
    
    var outputData = myContract.GetNest.getData(_player);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('GetNest ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeSpeed(_time,callback){
    
    
    var outputData = myContract.ComputeSpeed.getData(_time);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeSpeed ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function timer(callback){
    
    
    var outputData = myContract.timer.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('timer ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function HYPERSPEED_LENGTH(callback){
    
    
    var outputData = myContract.HYPERSPEED_LENGTH.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('HYPERSPEED_LENGTH ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function claimedDiv(callback){
    
    
    var outputData = myContract.claimedDiv.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('claimedDiv ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeMileReward(_mile,callback){
    
    
    var outputData = myContract.ComputeMileReward.getData(_mile);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeMileReward ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function MIN_SPEED(callback){
    
    
    var outputData = myContract.MIN_SPEED.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('MIN_SPEED ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function DRIVER_TIMER_BOOST(callback){
    
    
    var outputData = myContract.DRIVER_TIMER_BOOST.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('DRIVER_TIMER_BOOST ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function WithdrawBalance(callback){
    
    
    var outputData = myContract.WithdrawBalance.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('WithdrawBalance ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function thronePot(callback){
    
    
    var outputData = myContract.thronePot.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('thronePot ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function StartRace(eth,callback){
    
    
    var outputData = myContract.StartRace.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData,value: eth},
    function(error,result){
        if(!error){
            console.log('StartRace ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function DIV_SLUG_COST(callback){
    
    
    var outputData = myContract.DIV_SLUG_COST.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('DIV_SLUG_COST ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ACCEL_FACTOR(callback){
    
    
    var outputData = myContract.ACCEL_FACTOR.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ACCEL_FACTOR ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function BuySlug(eth,callback){
    
    
    var outputData = myContract.BuySlug.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData,value: eth},
    function(error,result){
        if(!error){
            console.log('BuySlug ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function divPerSlug(callback){
    
    
    var outputData = myContract.divPerSlug.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('divPerSlug ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeMileDriven(callback){
    
    
    var outputData = myContract.ComputeMileDriven.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeMileDriven ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeHyperReward(callback){
    
    
    var outputData = myContract.ComputeHyperReward.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeHyperReward ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function ComputeSlugCost(_isBuy,callback){
    
    
    var outputData = myContract.ComputeSlugCost.getData(_isBuy);
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('ComputeSlugCost ',web3.toDecimal(result));
            callback(web3.toDecimal(result))
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function JumpOut(callback){
    
    
    var outputData = myContract.JumpOut.getData();
    var endstr=web3.eth.sendTransaction({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('JumpOut ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function hyperSpeed(callback){
    
    
    var outputData = myContract.hyperSpeed.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('hyperSpeed ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
        }
    });
}


function starter(callback){
    
    
    var outputData = myContract.starter.getData();
    var endstr=web3.eth.call({to:contractAddress, from:null, data: outputData},
    function(error,result){
        if(!error){
            console.log('starter ',result);
            callback(result)
        }
        else{
            console.log('transaction failed with ',error.message)
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
	if(ranLog == false && twoDaysBlock > 0){
		ranLog = true;
		myContract.allEvents({ fromBlock: twoDaysBlock, toBlock: 'latest' }).get(function(error, result){
			if(!error){
				//console.log(result);
				var i = 0;				
				for(i = 0; i < result.length; i++){
					if(checkHash(storetxhash, result[i].transactionHash) != 0) {
						dateLog(result[i].blockNumber);
						if(result[i].event == "WonRound"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " WON ROUND " + result[i].args.round + "! Their reward: " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH.";
							//wipeLeaderboard();
						} else if(result[i].event == "StartedRound"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] Round " + result[i].args.round + " starts!";
						} else if(result[i].event == "GrabbedSnail"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " grabs " + idSnailToName(web3.toDecimal(result[i].args.snail)) + " for " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH, and gets " + result[i].args.egg + " eggs.";
							e_challenger.address = result[i].args.player;
							e_challenger.egg =  parseInt(result[i].args.playeregg);
							computeLeaderboard();
						} else if(result[i].event == "SnaggedEgg"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " snags " + result[i].args.egg + " eggs from his snail " + idSnailToName(web3.toDecimal(result[i].args.snail)) + ".";
							e_challenger.address = result[i].args.player;
							e_challenger.egg =  parseInt(result[i].args.playeregg);
							computeLeaderboard();
						} else if(result[i].event == "ClaimedLord"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " claims the lord " + idLordToName(web3.toDecimal(result[i].args.lord)) + "! For their " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH, they get " + result[i].args.egg + " eggs.";
							e_challenger.address = result[i].args.player;
							e_challenger.egg =  parseInt(result[i].args.playeregg);
							computeLeaderboard();
						} else if(result[i].event == "WithdrewBalance"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " withdrew " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH to their wallet.";
						} else if(result[i].event == "PaidThrone"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " paid tribute to the SnailThrone! " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH has been sent.";
						} else if(result[i].event == "BoostedPot"){
							eventlogdoc.innerHTML += "<br>[~" + datetext + "] " + formatEthAdr(result[i].args.player) + " makes a generous " + formatEthValue2(web3.fromWei(result[i].args.eth,'ether')) + " ETH donation to the gods.";
						}
					logboxscroll.scrollTop = logboxscroll.scrollHeight;
					}
				}
			}
			else{
				//console.log("problem!");
			}
		});
	}
}

var startedroundEvent = myContract.StartedRound();

startedroundEvent.watch(function(error, result){
    if(!error){
		//console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] Round " + result.args.round + " starts!";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var grabbedsnailEvent = myContract.GrabbedSnail();

grabbedsnailEvent.watch(function(error, result){
    if(!error){
		//console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " grabs " + idSnailToName(web3.toDecimal(result.args.snail)) + " for " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH, and gets " + result.args.egg + " eggs.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
			e_challenger.address = result.args.player;
			e_challenger.egg =  parseInt(result.args.playeregg);
			computeLeaderboard();
		}
	}
});

var snaggedeggEvent = myContract.SnaggedEgg();

snaggedeggEvent.watch(function(error, result){
    if(!error){
		//console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " snags " + result.args.egg + " eggs from his snail " + idSnailToName(web3.toDecimal(result.args.snail)) + ".";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
			e_challenger.address = result.args.player;
			e_challenger.egg =  parseInt(result.args.playeregg);
			computeLeaderboard();
		}
	}
});

var claimedlordEvent = myContract.ClaimedLord();

claimedlordEvent.watch(function(error, result){
	if(!error){
		////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " claims the lord " + idLordToName(web3.toDecimal(result.args.lord)) + "! For their " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH, they get " + result.args.egg + " eggs.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
			e_challenger.address = result.args.player;
			e_challenger.egg =  parseInt(result.args.playeregg);
			computeLeaderboard();
		}
	}
});

var wonroundEvent = myContract.WonRound();

wonroundEvent.watch(function(error, result){
    if(!error){
		////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " WON ROUND " + result.args.round + "! Their reward: " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});



var withdrewbalanceEvent = myContract.WithdrewBalance();

withdrewbalanceEvent.watch(function(error, result){
    if(!error){
		////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " withdrew " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH to their wallet.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

var paidthroneEvent = myContract.PaidThrone();

paidthroneEvent.watch(function(error, result){
    if(!error){
		////////////console.log(result);
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
		////////////console.log(result);
		if(checkHash(storetxhash, result.transactionHash) != 0) {
			date24();
			eventlogdoc.innerHTML += "<br>[" + datetext + "] " + formatEthAdr(result.args.player) + " makes a generous " + formatEthValue2(web3.fromWei(result.args.eth,'ether')) + " ETH donation to the JackPot.";
			logboxscroll.scrollTop = logboxscroll.scrollHeight;
		}
	}
});

/*
const filter = { fromBlock: launchBlock, toBlock: 'latest'}; // filter for your address
const events = myContract.allEvents(filter); // get all events
//console.log(events);
*/
