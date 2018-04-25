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
    alert_div = document.getElementById("out_message").parentElement;
    out_icon = document.getElementById("out_icon");
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
                        console.log(card);
                        render_scan(card ,value3);
                    });
                });
            //no card found
            }else{
                msg = "Code barre non reconnus"
                reset_screen();
                document.getElementById("card_barcode").innerHTML = code_barre.toString();
                set_alert(msg, "error");
            }
        });

    });
}
//function that render alert
function set_alert(string, type){
    alert_div = document.getElementById("out_message").parentElement;
    out_icon = document.getElementById("out_icon");

    if(type == "error"){
        //output message in alert div        
        alert_div.classList.remove("alert-success");
        alert_div.classList.remove("alert-info");
        alert_div.classList.add("alert-danger");

        //output icon in out_icon
        out_icon.src = "res/img/wrong.png";
        out_icon.parentElement.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        console.log(out_icon.parentElement.style.backgroundColor);

        document.getElementById("fail_sound").volume = 0.5;
        //document.getElementById("fail_sound").play();
    }else if(type == "succes"){
        
        //output message in alert div        
        alert_div.classList.remove("alert-danger");
        alert_div.classList.remove("alert-info");
        alert_div.classList.add("alert-success");

        //output icon in out_icon
        out_icon.src = "res/img/valid.png";
        out_icon.parentElement.style.backgroundColor = "rgba(30, 255, 0, 0.199)";
        console.log(out_icon.parentElement.style.backgroundColor);
        
        document.getElementById("success_sound").volume = 0.5;
        //document.getElementById("success_sound").play();
    }
    document.getElementById("out_message").innerHTML = string;
    setTimeout(reset_screen, 60000);
}

//function that render card information
function render_scan(card, message){
    string = "";
    //change type according to message
    //0 = valid
    if(message == "0"){
        type = "succes";
        card.credit_count = card.credit_count - 1; 

        string = "Présence validée";
    //2 = no credit on card
    }else if(message == "2"){
        type = "error";

        string = "Plus de credit sur la carte";
    //3 = no session soon
    }else if(message == "3"){
        type = "error";

        string = "Pas d'inscription à une séance proche";
    //1 = already valid
    }else if(message == "1"){
        type="error";

        string = "Présence déjà validée";
    }
    //updating card information
    document.getElementById("owner").innerHTML = card.client_id[1];
    document.getElementById("card_barcode").innerHTML = card.barcode;
    document.getElementById("card_credit").innerHTML = card.credit_count;
    set_alert(string, type);

}


//function that reset screen to original state
function reset_screen(){

    //reset card information
    document.getElementById("owner").innerHTML = "";
    document.getElementById("card_barcode").innerHTML = "";
    document.getElementById("card_credit").innerHTML = "";

    //reset out_img
    out_icon.parentElement.style.backgroundColor = "rgba(85, 144, 199, 0.199)";
    out_icon.src = "res/img/scan.png";

    //reset message
    document.getElementById("out_message").innerHTML = "Scannez votre carte";

    //reset alert div
    alert_div.classList.remove("alert-danger");
    alert_div.classList.remove("alert-success");
    alert_div.classList.add("alert-info");

}



