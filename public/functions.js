export let tipologiaCorrente;

export const hide = (element) => {
    element.classList.remove("visible");
    element.classList.add("hidden");
}

export const show = (element) => {
    element.classList.remove("hidden");
    element.classList.add("visible");
}

export const aggiungiPrenotazione = (datiInput) => {
    let dataInput = datiInput[0].split("-").join("");

    let chiave = tipologiaCorrente + "-" + dataInput + "-" + datiInput[1];


    return [datiInput[2],chiave];

    /*
    return download().then(() => {
        data[chiave] = datiInput[2];
        upload();
        return elaboraDatiTabella();
    })
    */
}

export const controllaPrenotazione = (datiInput) => {
    let checkChiave = tipologiaCorrente + "-" + datiInput[0].split("-").join("") + "-" + datiInput[1];
    Object.keys(data).map((chiave) => {
        if (chiave == checkChiave) {
            alert("Prenotazione gia' occupata")
            return false
        }
    })
    return true;
}

export const elaboraDatiTabella = (data,tipologiaCorrente) => {


    let datiPrenotazione = [];
    //filtra i dati della tabella con solo le prenotazione della tipologia selezionata
    data.forEach((persona) => {
        if (persona.tipologia == tipologiaCorrente){
            datiPrenotazione.push(persona) //[data,orario,nome]
        }
    })

    //setuppa la tabella 5x5 con la colonna a sinistra degli orario pronta
    let datiTabella = [];
    const listOrari = [8,9,10,11,12];
    let orari = listOrari.map((orario) => {
        datiTabella.push([[orario],[""],[""],[""],[""],[""]]);
    })



    datiPrenotazione.map((prenotazione) => {
        for (let i = 0; i < 5;i++){
            let today = new Date();
            today.setDate(today.getDate() + dayOffset);
            let newDay = today;
            newDay.setDate(today.getDate() + i);
            let todayString = newDay.toISOString().slice(0,10).split("-").join("");
            if (prenotazione[0] == todayString){
                datiTabella[orari.indexOf(parseInt(prenotazione.ora)) + 1][i + 1] = [prenotazione.nominativo];
            }
        }
    
    })

    console.log(datiTabella)

    return datiTabella;
}
