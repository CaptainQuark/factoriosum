document.getElementsByName("userName")[0].addEventListener("change", doThing);

function doThing() {
  const placeholder = "Enter your name";
  const path = localStorage.getItem("save-path");
  const name = this.value
  localStorage.userName = name;

  const isDisabled = !readPath() || (name == null || name == "" || name == placeholder);

  readPathButton.disabled = isDisabled;
  saveFromCloudButton.disabled = isDisabled;
  saveToCloudButton.disabled = isDisabled;
}
