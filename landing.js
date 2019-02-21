/* UPDATE */

function initUpdate(){
	mainUpdate();
}	

function mainUpdate(){
	changeText();
	setTimeout(mainUpdate, 3000);
}

var doc_text = document.getElementById('introtext');
var text_state = 0;

function changeText(){
	if(text_state == 0){
		doc_text.innerHTML = '<p class="focus-in-expand">GET SLUGS</p>';
		text_state = 1;
	} else if(text_state == 1){
		doc_text.innerHTML = '<p class="focus-in-expand">HIJACK LAMBO</p>';
		text_state = 2;
	} else if(text_state == 2){
		doc_text.innerHTML = '<p class="focus-in-expand">WIN CRYPTO</p>';
		text_state = 0;
	}
}