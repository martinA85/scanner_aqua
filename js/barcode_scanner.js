var Odoo = require('odoo-xmlrpc');

window.onload = init;

function init(){

    barcode="";
    document.addEventListener("keydown", keydown)
    //Creating object odoo for connection to our odoo instance
    odoo = new Odoo({
        url: "localhost",
        port: 8069,
        db: 'sport_aqua',
        username: 'admin',
        password: 'admin'
      });
    render_div = document.getElementById("card_information");
}

//function executed on keypress
function keydown(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code==13)// Enter key hit
        {
            scan_card(barcode);
            barcode="";
        }
        else if(code==9)// Tab key hit
        {
        }
        else
        {
            barcode=barcode+String.fromCharCode(code);
        }
}

//Function that connect to our odoo instance with xml_rpc and execute scan_card function on card model
function scan_card(code_barre){
    //Init the connection
    odoo.connect(function(err){
        //if error, we log the error
        if(err){
            return console.log(err);
        }

        //param array (used for search query) : in our case the barcode
        var inParams = [];
        inParams.push([['barcode', '=', code_barre.toString()]]);
        //global param array for the query (contain inParam)
        var params = [];
        params.push(inParams);
        //Executing first request : looking for our card with the right barcode
        odoo.execute_kw('sport.sport_card', 'search', params, function (err, value) {
            if (err) { return console.log(err); }
            //if card exist
            if(value.length > 0){
                var inParams = [];
                inParams.push(value); //ids
                var params = [];
                params.push(inParams);
                //second request : used to get our card object
                odoo.execute_kw('sport.sport_card', 'read', params, function (err2, value2) {
                    if (err2) { return console.log(err2); }
                    //card object
                    card = value2[0];
                    //third request : executing scan_card function on our card object
                    odoo.execute_kw('sport.sport_card', 'scan_card', params, function(err3, value3){
                        if (err2) { return console.log(err2); }
                        render_scan(card ,value3)
                    });
                });
            //no card found
            }else{
                msg = "Code barre non reconnus"
                set_alert(msg, "error");
            }
        });

    });
}
//function that render alert
function set_alert(string, type){
    alert_div = document.getElementById("alert_div");

    if(type == "error"){
        alert_div.classList.add("alert-danger");
        alert_div.classList.remove("alert-success");
        alert_div.innerHTML = string;
        document.getElementById("fail_sound").volume = 0.5;
        //document.getElementById("fail_sound").play();
    }else if(type == "succes"){
        console.log("success");
        alert_div.classList.add("alert-success");
        alert_div.classList.remove("alert-danger");
        alert_div.innerHTML = string;
        document.getElementById("success_sound").volume = 0.5;
        //document.getElementById("success_sound").play();
    }
}

//function that render card information
function render_scan(card, message){
    render_div.getElementsByClassName("user")[0].innerHTML = card.client_id[1];
    render_div.getElementsByClassName("barcode")[0].innerHTML = card.barcode;
    if(message == "presence valider"){
        type = "succes";
    }else if(message == "plus de session"){
        type = "error";
    }else if(message == "aucune session proche"){
        type = "error";
    }
    set_alert(message, type);

}



