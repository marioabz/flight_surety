
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let flights = ["FNTH-1002", "FBTM-8461", "FSTM-7059"];


let statusCodeProb = [0,20,20,20,0,20,20,20,20,0];
(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    });
    

})();

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function display(title, description, results) {

    let _flights = [...Array(3)].map((_, i) => {
        return {
            time : new Date((new Date()).getTime() + getRandomInt(10)*9000000).toLocaleString(),
            airline : flights[getRandomInt(flights.length)],
            code : getRandomInt(7)*10,
            registered : getRandomInt(2) === 1
        }
    })

    console.log(_flights);

    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })

    let flightsDisplayer = DOM.elid("flights-displayer");
    flights.map(flight => {
        flightsDisplayer.appendChild(DOM.div(flight));
    })

    displayDiv.append(section);

}







