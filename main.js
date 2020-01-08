const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
    // reset the badge count when app is opeaned
    app.setBadgeCount(0);
});

// Receive the message from the chat plugin
ipcMain.on('electron-notification', (event, arg) => {

    console.log(arg, "Args");

    let notification = arg;
    let birthdayNotification = [];
    let aniversaryNotification = [];

    // Check if the app is minimized and increment the badge count
    if (mainWindow.isMinimized()) {
        app.setBadgeCount(notification.length);
    }

    notification.forEach(element => {
        try {
            element = JSON.parse(element);
        } catch (error) {
            // Do Nothing
        }
        if (element.title == 'aniversary')
            aniversaryNotification.push(element);
        else if (element.title == 'birthday')
            birthdayNotification.push(element);
    });

    if (birthdayNotification.length > 0) {
        console.log(birthdayNotification[0].body.from.name)
        let body;
        if (birthdayNotification.length == 1) {
            body = `${birthdayNotification[0].body.from.name} has birthday today`;
        } else if (birthdayNotification.length == 2) {
            body = `${birthdayNotification[0].body.from.name} and ${birthdayNotification[1].body.from.name} have birthday today`;
        } else {
            body = `${birthdayNotification[0].body.from.name} , ${birthdayNotification[1].body.from.name} and ${birthdayNotification.length - 2} others have birthday today`;
        }

        let options = {
            body: body
        }
        event.reply('birthday-notification', options);
    }

    if (aniversaryNotification.length > 0) {
        let body;
        if (aniversaryNotification.length == 1) {
            body = `${aniversaryNotification[0].body.from.name} has aniversary today`;
        } else if (aniversaryNotification.length == 2) {
            body = `${aniversaryNotification[0].body.from.name} and ${aniversaryNotification[1].body.from.name} have aniversary today`;
        } else {
            body = `${aniversaryNotification[0].body.from.name} , ${aniversaryNotification[1].body.from.name} and ${aniversaryNotification.length - 2} others have aniversary today`;
        }

        let options = {
            body: body
        }

        setTimeout(() => {
            event.reply('aniversary-notification', options);
        }, 5000)
    }
});

// Open the app if user clicks the notification
ipcMain.on('open-app', (event, arg) => {
    console.log('inside open-app');
    mainWindow.show();
    app.setBadgeCount(0);
});

