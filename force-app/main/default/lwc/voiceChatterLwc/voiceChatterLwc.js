import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class VoiceChatterLwc extends LightningElement {

    isInProgres = false;  
    _recognition;
    _currentNode;

    CHATTER_TOOLBAR_CLASS= 'slds-rich-text-editor__toolbar slds-shrink-none slds-rich-text-editor__toolbar_bottom';
    LWC_NAME= 'voiceChatterLwc'; // this name is rendered in the UI and will be helpful for hiding this utility.

    connectedCallback() {
        //listen for key press events 
        document.addEventListener('keypress', this.listenForKeyPressEvts.bind(this));
        let utility = document.querySelector('div[data-target-selection-name = "'+this.LWC_NAME+'"]');
        if(utility){
                utility.className = 'slds-hide';
                //if this is the only component in utiliy bar , then hide the entire utility bar.
                if(document.querySelectorAll('li.slds-utility-bar__item')){
                    if(document.querySelectorAll('li.slds-utility-bar__item').length == 1){
                        document.querySelector('.slds-utility-bar_container').className = 'slds-hide';
                    }
                }
        }

        //https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
        window.SpeechRecognition =  window.webkitSpeechRecognition || window.SpeechRecognition;
        if ("SpeechRecognition" in window) {
            this._recognition = new webkitSpeechRecognition() || new SpeechRecognition();
            this._recognition.lang = 'en-US';
            this._recognition.onend = () => {
                if (this.isInProgres) {
                    this._recognition.start();
                }
            };
            this._recognition.addEventListener("result", this.handleResult.bind(this));
        } else {
             //Notify user if the browser does not support SpeechRecognition feature
              const event = new ShowToastEvent({
                title: 'NOT_SUPPORTED',
                message: 'Sorry. Voice to Text for Chatter is not supported in this Window',
                variant: 'error',
                mode: 'dismissable'
              })
              this.dispatchEvent(event);
        }
    }

    //Extract the text results and add it to the Chatter.
    handleResult(event) {
        var msg = event.results[0][0].transcript;
        let innerText = this._currentNode.innerText.replaceAll(/\s/g, "");
        msg = this.capitalize(msg);
        if (!innerText) {
            this._currentNode.innerText = msg;
        }
        else{
            this._currentNode.innerText += " " + msg;
        }
    }

    listenForKeyPressEvts(event) {
        
        //Validate the user key press action and ensure CTRL AND s pressed together
        if (event.ctrlKey && event.key == 's') {
            let chatterToolBar = document.getElementsByClassName(this.CHATTER_TOOLBAR_CLASS);
            if (chatterToolBar) {
                for (var item of chatterToolBar) {
                    let isButtonPresent = false;
                    for (var child of item.childNodes) {
                        if (child.innerText == "Speak Now !!") {
                            isButtonPresent = true;
                        }
                    }
                    if (isButtonPresent){  //Avoid duplicate buttons
                        continue;
                    }

                    //Create button and add it to the existing icons in toolbar of Chatter publisher 
                    let speakBtn = document.createElement("button");
                    speakBtn.innerText = "Speak Now !!";
                    speakBtn.value = "speak";
                    speakBtn.className = "slds-button slds-button_brand";
                    speakBtn.onclick = (e) => {
                        if (e.target.innerText == "Speak Now !!") {
                            this.startSpeech(e);
                        } else {
                            this.stopSpeech(e);
                        }
                    };
                    item.appendChild(speakBtn);
                }
            }
        }
    }

    startSpeech(event) {
        this.isInProgres = true;
        this._recognition.start();
        let parent = event.target.parentNode;
        this._currentNode = parent.parentNode.childNodes[0].childNodes[0];
        event.target.className = "slds-button slds-button_destructive";
        event.target.innerText = "Stop Speaking !!";
    }
    stopSpeech(event) {
        this.isInProgres = false;
        this._recognition.stop();
        event.target.className = "slds-button slds-button_brand";
        event.target.innerText = "Speak Now !!";
    }

    capitalize(e) {
        return e.replace(/\S/, function (m) {
          return m.toUpperCase();
        });
    }


}