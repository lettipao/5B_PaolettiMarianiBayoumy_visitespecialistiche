import {elaboraDatiTabella,controllaPrenotazione,aggiungiPrenotazione,hide,show} from "./functions.js"

export const createButtons = () => {
    let tipologie;
    const bindingDiv = document.getElementById("buttonsDiv");

    return {
        setDatiTipologie: (newTipologie) => {
            tipologie = newTipologie
        },
        render : () => {
            let line = tipologie.map((tipologia) => {return `<button class="button" id="bottone-${tipologia}"> ${tipologia} </button>`}).join("");
            bindingDiv.innerHTML = line;
            
            document.getElementById(`bottone-${tipologie[0]}`).style.backgroundColor = "gray";
            tipologie.map((tipologia) => {  //cicla per ogni tipologia
                document.getElementById(`bottone-${tipologia}`).onclick = () => {    //quando cliccato un bottone
                    tipologie.map((altriBottoni) => { document.getElementById(`bottone-${altriBottoni}`).style.backgroundColor = "white"}); //tutti gli altri bianchi
                    document.getElementById(`bottone-${tipologia}`).style.backgroundColor = "gray"; //selezionato diventa grigio
                    pubSub.publish("filtraDati");       
                }
            })
        }
    }
}

export const createForm = () =>{
    let labels;
    let element = document.getElementById("form");
    return{
        setLabels: (newLabels) => { 
            labels = newLabels; 
        },
        render: () => { 
            let line = `<div class="login-container">`;
            line += labels.map((line)=>`<input class="input-normali" placeholder="${line[0]}" id="${line[0]}" type="${line[1]}">`).join("");
            line += `<button class="button-cancella" type="button" id="button-annulla"> Annulla </button> <button class="button-conferma" type="button" id="invia"> Prenota </button>`;  
            line += `</div>`;
            element.innerHTML = line;

            document.getElementById("invia").onclick = () => {
                const result = labels.map((name) => {return document.getElementById(name[0]).value});
                let tipologia = pubSub.publish("getTipologia");
                let object = {"data":result[0],"ora":result[1],"nominativo":result[2],"tipologia":tipologia}
                console.log(object)
                middleware.upload(object).then(() => {
                    middleware.download().then((newData) => {
                        datiTabella = elaboraDatiTabella(newData);
                        table.setData(datiTabella);
                        table.render();
                    })
                    
                }); 
            } 
            document.getElementById("button-annulla").onclick = () => {
                labels.forEach((name) => {document.getElementById(name[0]).value = ""});
                hide(document.getElementById("form"))      
            }
        }   
    };
}

export const createTable = () => {
    let tableHeader = [];
    let tableData = [];
    let tableBinding = document.getElementById("tableDiv");
    return {
        setData: (newData) => {
            tableData = newData;
        },
        render: (dayOffset) => {
            const weekDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            let dateTabella = [[""]];
            for (let i = 0; i < 5;i++){
                let today = new Date();
                today.setDate(today.getDate() + dayOffset);
                let newDay = today;
                newDay.setDate(today.getDate() + i);
                let todayStringISO = newDay.toISOString().slice(0,10);
                let index = newDay.getDay();
                if (index > 6) index -= 7;
                let day = weekDay[index];
                dateTabella.push([todayStringISO + `\n` + day]);
            }
            console.log(dateTabella)
            let line = `<table> <tr>`
            line += dateTabella.map((row) => { 
                return "<td>" + row + "</td>"}).join("");
            line+= "</tr>"
            line += tableData.map((row) => { 
                return "<tr> <td>"+row[0]+"</td>" + row.splice(1,5).map((element) => "<td>" + element.data + "</td>").join("") + "</tr>"}).join("");
            line += `</table>`;
            tableBinding.innerHTML = line;

        }
    }
}

export const createMiddleware = () => {
    return {
        upload: (image) => {
            return new Promise((resolve, reject) => {
                fetch("http://localhost:5600/visite/add", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(image)
                })
                    .then((response) => response.json())
                    .then((json) => {
                        resolve(json);
                    })
            })
        },
        download: () => {
            return new Promise((resolve, reject) => {
                fetch("http://localhost:5600/visite")
                    .then((response) => response.json())
                    .then((json) => {
                        resolve(json);       
                    })
            })
        },
        delete: (id) => {
            return new Promise((resolve, reject) => {
                fetch(`http://localhost:5600/delete/${id}`, {
                    method: 'DELETE'                
                })
                    .then((response) => response.json())
                    .then((json) => {
                        resolve(json);
                    })
            })
        }
    }
}
export const middleware = createMiddleware();

const createPubSub = () => {
    const dict = {};
    return {
        subscribe: (eventName, callback) => {
            if (!dict[eventName]) {
                dict[eventName] = [];
            }
            dict[eventName].push(callback);
        },
        publish: (eventName) => {
            console.log(dict[eventName])
            dict[eventName].forEach((callback) => callback());
        }
    }
}
export const pubSub = createPubSub();

export const createLogin = () => {
    let isLogged = false;
    return {
        checkLogin: (username, password) => {
            return new Promise ((resolve,reject) => {
                fetch("./conf.json").then((response) => response.json()).then((confData) => {
                    fetch("https://ws.cipiaceinfo.it/credential/login", {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json",
                        key: confData.loginToken,
                        },
                        body: JSON.stringify({ username, password }),
                    })
                    .then((response) => response.json())
                    .then((result) => {
                        resolve(result.result);
                    })
                    .catch((error) => {
                        console.error("Errore login:", error);
                        alert("Errore");
                        reject (result);
                    });
                })
            });
        },
        validateLogin: () => {
            isLogged = true;
        },
        checkIfIsLogged: () => {
            return isLogged;
        }
    }
  return
}

/*

tableData
tablella 5x5
array, con dentro array, ogni array e' una riga.
[[null,data1,data2,data3,data4,data5],[orario,prenotazione1,prenotazione2...]];

*/