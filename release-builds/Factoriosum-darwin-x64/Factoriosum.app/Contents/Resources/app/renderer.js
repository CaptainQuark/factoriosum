// Unused for now, but kept as knowledge ref.
var fileWatcher = require("chokidar");

// We're in renderer-process, so 'remote' has to be used
// as accessor for the dialog.
const { dialog } = require("electron").remote;
var fs = require("fs"); // Load the File System to execute our common tasks (CRUD)

/*
 *
 * Some global references.
 *
 */

const openDialogButton = document.getElementById("upload-save-button");
const readPathButton = document.getElementById("get-path-button");
const saveFromCloudButton = document.getElementById("update-local-save-button");
const saveToCloudButton = document.getElementById("upload-save-to-cloud-button");

const placeholder = "Enter your name";

/*
  *
  * Functions.
  *
  */

window.onfocus = function() {
  console.log("focus");
  //focusTitlebars(true);
};

window.onblur = function() {
  console.log("blur");
  //focusTitlebars(false);
};

window.onresize = function() {
  console.log("onresize");
  //updateContentStyle();
};

window.onload = function() {
  const { remote } = require("electron");
  const { BrowserWindow } = remote;
  const win = BrowserWindow.getFocusedWindow();

  checkEdits();
  toggleButtonAvailability();

  openDialogButton.onclick = showOpenDialog;
  readPathButton.onclick = showPathAlert;
  saveFromCloudButton.onclick = readSaveFromCloud;
  saveToCloudButton.onclick = uploadSaveToCloud;
};

const showPathAlert = () => {
  alert("Path: " + readPath());
};

const readLocalKey = () => localStorage.getItem("active-key");

const readPath = () => {
  const path = localStorage.getItem("save-path");
  console.log(path);

  return path;
};

const readFile = (fromPath = readPath(), onSuccess = null) => {
  // Asynchronous read
  fs.readFile(fromPath, function(err, data) {
    if (err) {
      console.error(err);
      return false;
    }

    console.log("Asynchronous read: " + data.toString());
    onSuccess && onSuccess(data);

    return data;
  });
};

const showOpenDialog = () => {
  dialog.showOpenDialog(
    {
      properties: ["openFile"]
    },
    function(path) {
      if (path) {
        // Start to watch the selected path
        console.log(path);
        localStorage.setItem("save-path", path);
        toggleButtonAvailability();
      } else {
        console.log("No path selected");
      }
    }
  );
};

const readSaveFromCloud = () => {
  const snap = firebase
    .database()
    .ref("saves")
    .limitToLast(1)
    .once("value")
    .then(function(snapshot) {
      const snap = snapshot.val();

      if (Object.keys(snap).keys().length > 1) {
        alert("Ambigous data rerieval from cloud (more than one value), can't update local.");
        return;
      }

      const val = snap[Object.keys(snapshot.val())[0]];

      if (!val) {
        alert("Couldn't read data from cloud.");
        return;
      }

      //const name = val.uploader;
      const content = val.content;
      const key = Object.keys(snapshot.val())[0];
      const path = readPath();

      if (readLocalKey() != null && readLocalKey() != key && path) {
        // Save data to local file.

        fs.writeFile(path, content, err => {
          if (err) {
            alert("An error ocurred updating the file" + err.message);
            return;
          }

          alert("Local version upldated from cloud.");
        });
      } else {
        alert("You're using the latest version.");
      }
    });
};

const uploadSaveToCloud = () => {
  console.log("uploadSaveToCloud");
  //const file = readFile();

  if (!localStorage.userName) {
    alert("Please enter a user name first.");
    return;
  }

  readFile(readPath(), file => {
    if (!file) {
      alert("No file available");
      return;
    }

    // TODO
    // Check for cloud-data to avoid redundante uploading.
    //
    //const localHash = hashCode(file.toString)
    //const cloudHash =

    var database = firebase.database();
    let newSaveRef = firebase
      .database()
      .ref("saves/")
      .push();

    newSaveRef
      .set({
        content: file.toString(),
        uploader: localStorage.userName
      })
      .then(success => {
        alert("Your save is now global #1.");
        localStorage.setItem("active-key", newSaveRef.key);
      })
      .catch(error => {
        alert("Couldn't upload your save.");
      });
  });
};

function checkEdits() {
  const name = localStorage.userName;

  if (name != null && name != "" && name != placeholder) {
    document.getElementById("userNameEdit").value = localStorage.userName;
  } else document.getElementById("userNameEdit").value = placeholder;
}

function toggleButtonAvailability() {
  let name = localStorage.userName;
  const isDisabled = !readPath() || (name == null || name == "" || name == placeholder);

  console.log("!readPath(): " + !readPath());
  console.log("path: " + readPath());
  console.log("isDisabled: " + isDisabled);

  readPathButton.disabled = isDisabled;
  saveFromCloudButton.disabled = isDisabled;
  saveToCloudButton.disabled = isDisabled;
}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
const hashCode = s => {
  var h = 0,
    l = s.length,
    i = 0;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h;
};
