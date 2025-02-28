const buttonPrecedente = document.getElementById("precedente");
const buttonSuccessivo = document.getElementById("successivo");

import {createButtons,createTable,createForm,createLogin,middleware,pubSub } from "./components.js";
import {elaboraDatiTabella,controllaPrenotazione,aggiungiPrenotazione,hide,show} from "./functions.js"

const buttons = createButtons();
const table = createTable();
const form = createForm();
const login = createLogin();


pubSub.subscribe("tableRender",table.render);
pubSub.subscribe("filtraDati",() => {
    middleware.download().then((newData) => {
        let datiTabella = elaboraDatiTabella(newData,tipologiaCorrente);     //Riceve i dati nuovi della tabella
        table.setData(datiTabella);         //Setta dati nuovi della tabella
        table.render(dayOffset);  
    })
})
pubSub.subscribe("getTipologia",() => {return tipologiaCorrente});

let dayOffset = 0;
let tipologiaCorrente;

table.render(dayOffset)

fetch("./conf.json").then((response) => response.json()).then((confData) => {
    //upload({}).then(console.log);

    tipologiaCorrente = confData.configurazione.tipologie[0];

    buttons.setDatiTipologie(confData.configurazione.tipologie)
    buttons.render();

    middleware.download().then((newData) => {
        let datiTabella = elaboraDatiTabella(newData);
        table.setData(datiTabella);
        table.render(dayOffset);
    })

    form.setLabels([["Data ","date"], ["Ora ","number"], ["Nominativo ","text"]]);
    form.render();

});



/*
setInterval(() => {
    middleware.download().then((newData) => {
        let datiTabella = elaboraDatiTabella(newData);
        table.setData(datiTabella);
        table.render();
    })

},5000);
*/

document.getElementById("buttonLogin").onclick = () => {
    if (login.checkIfIsLogged()) show(document.getElementById("form"));
    else show(document.getElementById("login"));

}

document.getElementById("buttonCancellaLogin").onclick = () => {
    hide(document.getElementById("login"));
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
}

document.getElementById("buttonConfermaLogin").onclick = () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    if (username && password) {
        login.checkLogin(username, password).then((result) => {
            console.log(result);
            if (result === true) {
                login.validateLogin();
                hide(document.getElementById("login"));
                show(document.getElementById("form"));
            } else {
                alert("Credenziali errate");
            }
        }, console.log);
    } else {
      alert("Compila tutti i campi.");
    }
}



buttonPrecedente.onclick = () => {
    dayOffset -= 5;
    middleware.download().then((newData) => {
        datiTabella = elaboraDatiTabella(newData,tipologiaCorrente);
        table.setData(datiTabella);
        table.render();
    })
}

buttonSuccessivo.onclick = () => {
    dayOffset += 5;
    middleware.download().then((newData) => {
        datiTabella = elaboraDatiTabella(newData,tipologiaCorrente);
        table.setData(datiTabella);
        table.render();
    })
}

