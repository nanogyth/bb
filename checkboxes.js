// my modification of omuretsu's code
// https://discord.com/channels/415207508303544321/924855855457910855/994082951195263147
export async function main(ns) {
  const { primary: primaryColor = "#f00", secondary: secondaryColor = "#00f" } = ns?.ui.getTheme()
  cbDiv = doc.createElement("div");
  //Stealing a css class from the page to get the right font
  cbDiv.classList.add([...doc.querySelector("p").classList.entries()].pop()[1], "checkboxContainer");
  cbDiv.innerHTML = `<style>
  .checkboxContainer input{
    appearance:none;
    font:inherit;
  }
  .checkboxContainer input::after{
    content:attr(data-unchecked);
    color:${secondaryColor};
  }
  .checkboxContainer input:checked::after{
    content:attr(data-checked);
    color:${primaryColor};
  }</style>`;
  doc.querySelector(".react-draggable").appendChild(cbDiv);
}
export let checkboxes = {}, doc = globalThis["document"], cbDiv = doc.querySelector(".checkboxContainer");
export let addCheckbox = (name, checked = false, uncheckedText = name + " OFF", checkedText = name + " ON") => {
  if (checkboxes[name]) throw `ERROR: a checkbox already exists with name ${name}`;
  let row = cbDiv.appendChild(doc.createElement("div"));
  row.innerHTML = `<input type=checkbox data-unchecked="${uncheckedText}" data-checked="${checkedText}"${checked ? " checked" : ""}>`;
  let checkbox = row.querySelector("input");
  //Overwrite checkbox.remove() with a full cleanup function
  checkbox.remove = () => {
    row.remove();
    delete checkboxes[name]
  };
  checkboxes[name] = checkbox;
  return checkbox;
};
if (!doc.querySelector(".checkboxContainer")) {
  main()
}
