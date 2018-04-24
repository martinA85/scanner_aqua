const {app, BrowserWindow} = require('electron');
    const path = require('path');
    const url = require('url');

    function createWindow(){

        win = new BrowserWindow({
            width: 800,
            height:600,
            icon: 'res/img/icon.png',
            maximized: true,
            frame: true
        });

        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol:'file:',
            slashes:true,
            
        }));

        win.webContents.openDevTools()
    }

    app.on('ready', createWindow)